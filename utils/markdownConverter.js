// utils/markdownFormatter.js

/**
 * Converts markdown text to plain text with proper line breaks
 * @param {string} markdown - The markdown formatted text
 * @returns {string} - Formatted text with proper line breaks
 */
export function markdownToPlainText(markdown) {
    if (!markdown) return '';
  
    let text = markdown;
  
    // Step 1: Convert section headers
    text = text.replace(/###\s*([^\n]+)/g, (_, title) => {
      const cleanTitle = title.replace(/\*\*/g, '').toUpperCase();
      return `\n${cleanTitle}:\n`;
    });
  
    // Step 2: Remove bold formatting
    text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  
    // Step 3: Process text section by section
    text = text
      .split('\n')
      .map(line => {
        line = line.trim();
        
        // Skip empty lines
        if (!line) return '';
  
        // Handle numbered lists (ensure blank line before and after)
        if (line.match(/^\d+\./)) {
          return `\n${line}\n`;
        }
  
        // Handle bullet points (ensure blank line before and after)
        if (line.match(/^[-•]/)) {
          return `\n${line.replace(/^[-]/, '•')}\n`;
        }
  
        return line;
      })
      .join('\n');
  
    // Step 4: Final formatting
    text = text
      // Clean up multiple consecutive blank lines
      .replace(/\n{3,}/g, '\n\n')
      // Ensure proper spacing after section headers
      .replace(/([A-Z\s]+):\n/g, '$1:\n\n')
      // Clean up any trailing/leading spaces
      .replace(/[ \t]+$/gm, '')
      .replace(/^[ \t]+/gm, '')
      // Ensure each list item has proper spacing
      .replace(/(\d+\..+?)\n([^\n])/g, '$1\n\n$2')
      .replace(/(•.+?)\n([^\n])/g, '$1\n\n$2');
  
    return text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line) // Remove empty lines
      .join('\n\n') // Join with double newlines
      .trim();
  }
  
  // Example usage
  const markdown = `### Main Answer
  The compliance requirements for the xyz account.
  
  ### DFSA Rules
  1. **Accounting Records**: According to DFSA
  2. **Customer Due Diligence**: DFSA Rule 7
  3. **Tax Crime Risk**: Assessment required
  
  ### Recommendations
  - **Record Keeping**: Ensure all records
  - **Training**: Regular staff training
  - **Monitoring**: Continuous oversight`;
  
  
  /* Output will look like:
  
  MAIN ANSWER:
  
  The compliance requirements for the xyz account.
  
  DFSA RULES:
  
  1. Accounting Records: According to DFSA
  
  2. Customer Due Diligence: DFSA Rule 7
  
  3. Tax Crime Risk: Assessment required
  
  RECOMMENDATIONS:
  
  • Record Keeping: Ensure all records
  
  • Training: Regular staff training
  
  • Monitoring: Continuous oversight
  
  */