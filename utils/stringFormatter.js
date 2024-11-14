// utils/stringFormatter.js

/**
 * Converts condensed text into a well-formatted string with proper spacing
 * @param {string} text - The input text
 * @returns {string} - Formatted string with proper spacing and structure
 */
export function formatText(text) {
    if (!text) return '';
    
    // Step 1: Split sections and add proper spacing
    let formatted = text
      // Add newlines before section markers
      .replace(/([a-zA-Z_]+):/g, '\n\n$1:')
      // Convert section names to uppercase
      .replace(/([a-zA-Z_]+):/g, (match) => match.toUpperCase())
      
      // Step 2: Format lists
      // Handle numbered lists
      .replace(/(\d+)\.\s*/g, '\n$1. ')
      // Handle bullet points
      .replace(/•\s*/g, '\n• ')
      // Handle lettered lists
      .replace(/([a-z])\)\s*/g, '\n    $1) ')
      
      // Step 3: Format nested content
      // Add indentation after bullet points
      .replace(/(\n•[^\n]+)/g, '$1\n    ')
      // Add indentation after numbers
      .replace(/(\n\d+\.[^\n]+)/g, '$1\n    ')
      
      // Step 4: Clean up spacing
      // Remove extra spaces at line ends
      .replace(/\s+$/gm, '')
      // Remove multiple spaces
      .replace(/[ \t]+/g, ' ')
      // Remove multiple consecutive blank lines
      .replace(/\n{3,}/g, '\n\n')
      // Ensure consistent indentation
      .replace(/\n\s+/g, '\n    ')
      // Add extra newline after each section header
      .replace(/(MAIN_ANSWER|DFSA_RULES|SIMILAR_CASES|RECOMMENDATIONS):\s*/g, '$1:\n\n');
  
    // Final cleanup
    return formatted
      .trim()
      // Ensure sections are well separated
      .split('\n\n')
      .map(section => section.trim())
      .join('\n\n');
  }
  
  // Example usage:
  const text = `main_answer: The compliance requirements analyzed for the XYZ account previously included several regulations from the DFSA rulebook primarily focusing on financial reporting, customer due diligence, and enhanced controls for high-risk jurisdictions.
  dfsa_rules: Specific DFSA rules relevant to the compliance aspects of the XYZ account include: • The requirement for financial statements to meet at least two of the following thresholds: a) balance sheet total of $20 million b) net annual turnover of $40 million • Under DFSA regulations, firms must maintain accounting records.
  similar_cases: Historical cases where compliance with DFSA regulations was scrutinized.
  recommendations: Moving forward, it is recommended that: 1. Ensuring all financial statements 2. Keeping meticulous records 3. Conducting regular training`;
  
  const formatted = formatText(text);
  console.log(formatted);
  
  /* Output will look like:
  
  MAIN_ANSWER:
  
  The compliance requirements analyzed for the XYZ account previously included several regulations from the DFSA rulebook primarily focusing on financial reporting, customer due diligence, and enhanced controls for high-risk jurisdictions.
  
  DFSA_RULES:
  
  Specific DFSA rules relevant to the compliance aspects of the XYZ account include:
  • The requirement for financial statements to meet at least two of the following thresholds:
      a) balance sheet total of $20 million
      b) net annual turnover of $40 million
  • Under DFSA regulations, firms must maintain accounting records.
  
  SIMILAR_CASES:
  
  Historical cases where compliance with DFSA regulations was scrutinized.
  
  RECOMMENDATIONS:
  
  Moving forward, it is recommended that:
  1. Ensuring all financial statements
  2. Keeping meticulous records
  3. Conducting regular training
  */