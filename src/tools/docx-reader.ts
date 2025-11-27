import { server } from '../server';
import { z } from 'zod';
import * as fs from 'fs';
import * as path from 'path';
import mammoth from 'mammoth';
import * as cheerio from 'cheerio';

// Types for better code organization
interface DocumentSection {
  level: number;
  title: string;
  content: string;
  index: number;
}

interface ScoredSection extends DocumentSection {
  score: number;
}

interface RelevantSection {
  title: string;
  content: string;
  embedding: string;
  parent?: string;
  neighbors: string[];
}

// Simple language detection function
function detectLanguage(text: string): string {
  // Check for Vietnamese characters (expanded to include all common diacritics)
  const vietnameseChars = /[àáâãăằắẵẳặèéêìíòóôõŏỏọùúûũưừứựỳỹđÀÁÂÃĂẰẮẴẲẶÈÉÊÌÍÒÓÔÕŎỎỌÙÚÛŨƯỪỨỰỲỸĐ]/;
  if (vietnameseChars.test(text)) {
    return "Vietnamese";
  }
  // Could add more checks for other languages
  return "English";
}

// Optimized scoring function with caching
function calculateRelevanceScore(text: string, queryWords: string[], sectionTitle: string): number {
  const lowerText = text.toLowerCase();
  let score = 0;

  for (const word of queryWords) {
    // Special handling for whole numbers - ONLY use section matching, skip regular text search
    const numberMatch = word.match(/^(\d+)$/);
    if (numberMatch) {
      const targetNumber = numberMatch[1];
      // Check if section title starts with this number as the main section
      const titleMatch = sectionTitle.match(new RegExp(`^${targetNumber}(\\D|$)`));
      if (titleMatch) {
        score += 3; // Give high score for direct main section number matches
        console.log(`Main section match: "${word}" matches main section "${sectionTitle}"`);
        continue; // Skip regular text matching for pure numbers
      }
    }

    // Regular text matching for all words (numbers and non-numbers)
    // Bonus for title matches
    if (sectionTitle.toLowerCase().includes(word)) {
      score += 3;
    }
    // Content match
    if (lowerText.includes(word)) {
      score += 1;
      continue;
    }

    // Check word stems (pre-compute common variations) in content
    const stems = [
      word.replace(/s$/, ''),     // Remove plural 's'
      word.replace(/es$/, ''),    // Remove plural 'es'
      word.replace(/ing$/, ''),   // Remove gerund 'ing'
      word.replace(/ed$/, ''),    // Remove past tense 'ed'
      word.replace(/ly$/, ''),    // Remove adverb 'ly'
      word.replace(/er$/, ''),    // Remove comparative 'er'
      word.replace(/est$/, '')    // Remove superlative 'est'
    ];

    for (const stem of stems) {
      if (stem !== word && lowerText.includes(stem)) {
        score += 1;
        break;
      }
    }
  }

  return score;
}

// Extract sections from HTML more efficiently
function extractSections($: cheerio.CheerioAPI): DocumentSection[] {
  const sections: DocumentSection[] = [];

  $('h1, h2, h3, h4, h5, h6').each((i, el) => {
    const tagName = $(el).get(0)?.tagName;
    if (!tagName) return;

    const level = parseInt(tagName.slice(1));
    const title = $(el).text().trim();

    // Extract content more efficiently, including sub-sections
    let content = '';
    let next = $(el).next();
    while (next.length) {
      if (next.is('h1,h2,h3,h4,h5,h6')) {
        const nextLevel = parseInt(next.get(0)?.tagName.slice(1) || '0');
        if (nextLevel <= level) break;
      }
      content += next.text().trim() + '\n';
      next = next.next();
    }

    sections.push({
      level,
      title,
      content: content.trim(),
      index: sections.length
    });
  });

  return sections;
}

// Pre-compute neighbors and parents for better performance
function buildSectionRelationships(sections: DocumentSection[]): Map<number, { parent?: string; neighbors: string[] }> {
  const relationships = new Map<number, { parent?: string; neighbors: string[] }>();

  for (const section of sections) {
    // Find neighbors (same level, different index)
    const neighbors = sections
      .filter(s => s.level === section.level && s.index !== section.index)
      .slice(0, 4)
      .map(s => s.title);

    // Find parent (previous level)
    const parent = sections
      .filter(s => s.level === section.level - 1 && s.index < section.index)
      .pop()?.title;

    relationships.set(section.index, { parent, neighbors });
  }

  return relationships;
}

// Helper function to score sections based on query
function scoreSections(sections: DocumentSection[], queryWords: string[]): ScoredSection[] {
  return sections
    .map(section => ({
      ...section,
      score: calculateRelevanceScore(`${section.title} ${section.content}`, queryWords, section.title)
    }))
    .sort((a, b) => b.score - a.score);
}

// Helper function to expand relevant parents to their children
function expandParentsToChildren(sections: DocumentSection[], scoredSections: ScoredSection[], queryWords: string[]): ScoredSection[] {
  const finalSections: ScoredSection[] = [];
  const initialTop5 = scoredSections.slice(0, 5);

  let expandedSection: ScoredSection | null = null;
  for (const section of initialTop5) {
    if (!expandedSection && section.score > 0) {
      // Check if the section's title contains any query word
      const titleMatchesQuery = queryWords.some(word => section.title.toLowerCase().includes(word.toLowerCase()));
      if (titleMatchesQuery) {
        // Find all children of this section based on title numbering
        const parentPrefix = section.title.split(' ')[0]; // e.g., "4." from "4. Yêu cầu kỹ thuật"
        // Only expand if the parent is a whole number section (e.g., "3.", not "3.1.")
        if (parentPrefix.match(/^\d+\.$/)) {
          const children = sections.filter(s =>
            s.title.match(new RegExp(`^${parentPrefix}\\d+`)) && // Matches "4.1", "4.2", etc.
            s.index > section.index // Appears after this section
          );

          if (children.length > 0) {
            console.log(`Appending parent "${section.title}" with ${children.length} children`);

            finalSections.push(section); // Include the parent

            // Add children with inherited relevance score
            const childSections: ScoredSection[] = children.map(child => ({
              ...child,
              score: Math.max(section.score - 0.1, 0.1) // Slightly lower score than parent
            }));

            finalSections.push(...childSections);
            expandedSection = section; // Mark this as expanded
          }
        }
      }
    }
  }

  // Add the other top 5 sections that were not expanded
  for (const section of initialTop5) {
    if (section !== expandedSection && !finalSections.some(fs => fs.index === section.index)) {
      finalSections.push(section);
    }
  }

  // Sort finalSections by score descending to maintain order
  finalSections.sort((a, b) => b.score - a.score);

  // If we still have less than 5, fill with remaining top sections
  if (finalSections.length < 5) {
    const remaining = scoredSections.slice(5).filter(s =>
      !finalSections.some(fs => fs.index === s.index)
    );
    finalSections.push(...remaining.slice(0, 5 - finalSections.length));
  }

  return finalSections;
}

// Helper function to build the response summary and content
function buildResponse(filename: string, query: string, topSections: ScoredSection[], relationships: Map<number, { parent?: string; neighbors: string[] }>, lang?: string): { content: Array<{ type: "text"; text: string }>; structuredContent: { relevantSections: RelevantSection[] } } {
  // Build relevant sections with relationships
  const relevantSections: RelevantSection[] = topSections.map(section => {
    const rels = relationships.get(section.index)!;
    return {
      title: section.title,
      content: section.content,
      embedding: 'placeholder',
      parent: rels.parent,
      neighbors: rels.neighbors
    };
  });

  console.log(`Top scores:`, topSections.map(s => `${s.title}: ${s.score}`));
  // Create comprehensive response
  const combinedContent = topSections
    .filter(section => section.content.trim().length > 0)
    .map((section, index) => {
      const relevance = index === 0 ? 'Most Relevant' :
        index === 1 ? 'Highly Relevant' :
          index === 2 ? 'Relevant' : 'Related';
      return `## ${relevance}: ${section.title}\n\n${section.content}\n\n---`;
    })
    .join('\n\n');

  const summary = `Found ${relevantSections.length} relevant sections in the document "${filename}" (may include child sections of relevant parents).
Top matches for "${query}":
${topSections.map(s => `- ${s.title} (relevance score: ${s.score})`).join('\n')}

${combinedContent}`;

  const fullSummary = lang ? `Respond in ${lang}\n\n${summary}` : summary;

  if (lang) {
    console.log(`Responding in language: ${lang}`);
  }

  console.log(`Returning combined response with ${relevantSections.length} sections (${fullSummary.length} chars) - may exceed 5 due to parent expansion`);

  return {
    content: [{ type: "text" as const, text: fullSummary }],
    structuredContent: { relevantSections }
  };
}

export function registerDocxReaderTool() {
  server.registerTool(
    'docx-reader',
    {
      title: 'DOCX Reader Tool',
      description: 'Read and find relevant sections from a DOCX file in src/documents directory. Provide user_input as the original text and query as the keyword search text in vietnamese. Language is auto-detected from user_input.',
      inputSchema: {
        user_input: z.string(),
        query: z.string()
      },
      outputSchema: {
        relevantSections: z.array(z.object({
          title: z.string(),
          content: z.string(),
          embedding: z.string(),
          parent: z.string().optional(),
          neighbors: z.array(z.string())
        }))
      }
    },
    async (args, extra) => {
      const filename = '[AIVIN] - BRD.docx';
      const user_input = args.user_input;
      const query = args.query.trim();
      const lang = detectLanguage(user_input);

      if (!query) {
        throw new Error('Query cannot be empty');
      }

      console.log('user_input:', user_input);
      console.log('Translated query:', query);
      console.log('Language:', lang);

      // Validate file exists
      const filePath = path.join(process.cwd(), 'src', 'documents', filename);
      if (!fs.existsSync(filePath)) {
        throw new Error(`File ${filename} not found in src/documents`);
      }

      // Parse document
      const buffer = fs.readFileSync(filePath);
      const htmlResult = await mammoth.convertToHtml({ buffer });
      const $ = cheerio.load(htmlResult.value);

      // Extract sections
      const sections = extractSections($);

      // Fallback for documents without headers
      if (sections.length === 0) {
        const content = $('body').text().trim();
        sections.push({ level: 1, title: 'Document', content, index: 0 });
      }

      // Pre-compute relationships for better performance
      const relationships = buildSectionRelationships(sections);

      // Process query and score sections
      const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
      console.log('Query words:', queryWords);

      const scoredSections = scoreSections(sections, queryWords);

      // Expand parents to children
      const topSections = expandParentsToChildren(sections, scoredSections, queryWords);

      // Build response
      return buildResponse(filename, query, topSections, relationships, lang);
    }
  );
}