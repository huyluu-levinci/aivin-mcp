import { registerAddTool } from './add';
import { registerDocxReaderTool } from './docx-reader';

export const registerAllTool = () => {
  registerAddTool();
  registerDocxReaderTool();
  // Register other tools here
};