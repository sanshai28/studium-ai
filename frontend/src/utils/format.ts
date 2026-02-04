/**
 * Format file size in bytes to human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

/**
 * Get an emoji icon based on file MIME type
 */
export const getFileIcon = (fileType: string): string => {
  if (fileType === 'application/pdf') return '📄';
  if (fileType.includes('word')) return '📝';
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType === 'text/plain' || fileType === 'text/markdown') return '📃';
  return '📎';
};

/**
 * Get preview text from content with truncation
 */
export const getPreviewText = (text: string, maxLength = 120): string => {
  if (!text) return 'No notes yet';
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

/**
 * Generate a color from a string (for notebook card headers)
 */
export const getColorFromString = (str: string): string => {
  const colors = [
    '#4285f4', // blue
    '#ea4335', // red
    '#fbbc04', // yellow
    '#34a853', // green
    '#ff6d01', // orange
    '#46bdc6', // teal
    '#7baaf7', // light blue
    '#f07b72', // light red
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};
