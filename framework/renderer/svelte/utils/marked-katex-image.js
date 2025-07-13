/**
 * Custom marked extension to handle LaTeX formulas in image alt text
 * When an image has LaTeX formula as alt text, only show the image, not the rendered LaTeX
 */

export function markedKatexImage() {
  return {
    extensions: [{
      name: 'katex-image',
      level: 'inline',
      start(src) {
        // Look for image syntax that might contain LaTeX
        const match = src.match(/!\[[$\\]/);
        return match ? match.index : -1;
      },
      tokenizer(src, tokens) {
        // Match images with LaTeX alt text
        // This regex matches ![LaTeX formula](image.png) where LaTeX formula contains $ or \
        const match = src.match(/^!\[([\s\S]*?)\]\(([^)]+)\)/);
        
        if (match && match[1] && (match[1].includes('$') || match[1].includes('\\'))) {
          // Check if the alt text looks like LaTeX
          const altText = match[1];
          const imagePath = match[2];
          
          // Return a token that will be rendered as just the image
          return {
            type: 'katex-image',
            raw: match[0],
            altText: altText,
            imagePath: imagePath
          };
        }
        
        return false;
      },
      renderer(token) {
        // For LaTeX images, just render the image without processing the alt text
        // Use a simplified alt text to avoid LaTeX rendering
        const simpleAlt = 'Formula';
        return `<img src="${token.imagePath}" alt="${simpleAlt}">`;
      }
    }]
  };
}