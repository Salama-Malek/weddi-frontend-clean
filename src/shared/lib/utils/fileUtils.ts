/**
 * Utility functions for handling file names and extensions
 */

/**
 * Ensures a file name always has the proper extension
 * @param fileName - The file name from the API response
 * @param fileType - The file type/extension from the API response
 * @returns The file name with proper extension
 */
export const ensureFileNameWithExtension = (fileName: string, fileType?: string): string => {
  if (!fileName || fileName === "Unnamed File") {
    return "Unnamed File";
  }

  
  if (fileName.includes('.')) {
    return fileName;
  }

  
  if (fileType) {
    
    const cleanFileType = fileType.startsWith('.') ? fileType.slice(1) : fileType;
    return `${fileName}.${cleanFileType}`;
  }

  
  return fileName;
};

/**
 * Gets the file extension from a file name or file type
 * @param fileName - The file name
 * @param fileType - The file type (optional)
 * @returns The file extension without the dot
 */
export const getFileExtension = (fileName: string, fileType?: string): string => {
  
  if (fileName.includes('.')) {
    return fileName.split('.').pop()?.toLowerCase() || '';
  }
  
  
  if (fileType) {
    return fileType.startsWith('.') ? fileType.slice(1).toLowerCase() : fileType.toLowerCase();
  }
  
  return '';
};

/**
 * Checks if a file name has a specific extension
 * @param fileName - The file name to check
 * @param fileType - The file type to check against
 * @param targetExtension - The target extension to check for
 * @returns True if the file has the target extension
 */
export const hasFileExtension = (fileName: string, fileType?: string, targetExtension?: string): boolean => {
  if (!targetExtension) return false;
  
  const extension = getFileExtension(fileName, fileType);
  return extension === targetExtension.toLowerCase();
};
