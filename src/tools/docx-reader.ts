import { server } from '../server';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

export function registerDocxReaderTool() {
  server.registerTool(
    'docx-reader',
    {
      title: 'DOCX Reader Tool',
      description: 'Read and find relevant sections from a DOCX file in src/documents directory',
      inputSchema: { query: z.string() },
      outputSchema: { relevantSections: z.array(z.object({ title: z.string(), content: z.string(), embedding: z.string(), parent: z.string().optional(), neighbors: z.array(z.string()) })) }
    },
    async (args) => {
      const filename = '[AIVIN] - BRD.docx';
      const query = args.query;
      console.log('Input query:', query);
      const filePath = path.join(process.cwd(), 'src', 'documents', filename);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`File ${filename} not found in src/documents`);
      }

      const buffer = fs.readFileSync(filePath);
      const htmlResult = await mammoth.convertToHtml({ buffer });
      const html = htmlResult.value;
      const $ = cheerio.load(html);

      const sections: { level: number, title: string, content: string, index: number }[] = [];
      let currentIndex = 0;

      $('h1, h2, h3, h4, h5, h6').each((i, el) => {
        const tagName = $(el).get(0)?.tagName;
        if (!tagName) return;
        const level = parseInt(tagName.slice(1));
        const title = $(el).text().trim();
        let content = '';
        let next = $(el).next();
        while (next.length && !next.is('h1,h2,h3,h4,h5,h6')) {
          content += next.text().trim() + '\n';
          next = next.next();
        }
        sections.push({ level, title, content: content.trim(), index: currentIndex++ });
      });

      if (sections.length === 0) {
        const content = $('body').text().trim();
        sections.push({ level: 1, title: 'Document', content, index: 0 });
      }

      // Score all sections based on word overlap
      const queryWords = query.toLowerCase().split(/\s+/);
      const scoredSections = sections.map(section => {
        const text = (section.title + ' ' + section.content).toLowerCase();
        const score = queryWords.filter(word => text.includes(word)).length;
        return { ...section, score };
      }).sort((a, b) => b.score - a.score);

      // Take top 5 relevant sections
      const topSections = scoredSections.slice(0, 5);

      const relevantSections = topSections.map(section => {
        const neighbors = sections.filter(s => s.level === section.level && s.index !== section.index).slice(0, 4).map(s => s.title);
        const parent = sections.filter(s => s.level === section.level - 1 && s.index < section.index).pop()?.title;
        const embedding = 'placeholder';
        return {
          title: section.title,
          content: section.content,
          embedding,
          parent,
          neighbors
        };
      });

      console.log('Relevant sections:', JSON.stringify(relevantSections, null, 2));

      console.log('Most relevant title:', relevantSections[0]?.title);

      return {
        content: relevantSections.map(s => ({
          type: "text",
          text: `Title: ${s.title}\nContent: ${s.content}`
        })),
        structuredContent: { relevantSections }
      };
    }
  );
}
