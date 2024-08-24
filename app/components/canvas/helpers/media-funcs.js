export function findHighlightPositions(doc, highlights) {
    const regex = highlights?.length > 0 
      ? new RegExp(highlights.map(item => item.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/['"]/g, '["\'“”]')).join('|'), 'gi') 
      : new RegExp('a^', 'gi'); // This regex will never match anything
  
    let textContent = '';
    let positions = [];
  
    doc.descendants((node, position) => {
      if (node.isText) {
        textContent += node.text;
        positions.push({ node, position, length: node.text.length });
      }
    });
  
    const highlightPositions = [];
  
    Array.from(textContent.matchAll(regex)).forEach(match => {
      const index = match.index || 0;
      const length = match[0].length;
      let from = 0, to = 0, accumulatedLength = 0;
  
      for (const { node, position, length: nodeLength } of positions) {
        if (accumulatedLength + nodeLength > index && from === 0) {
          from = position + (index - accumulatedLength);
        }
        if (accumulatedLength + nodeLength >= index + length) {
          to = position + (index + length - accumulatedLength);
          break;
        }
        accumulatedLength += nodeLength;
      }
  
      highlightPositions.push({ from, to });
    });
  
    return highlightPositions;
  }