import { 
  FileSpreadsheet, 
  FileText, 
  FileImage, 
  FileVideo, 
  FileAudio,
  File,
  type LucideIcon
} from 'lucide-react'

export interface FileTypeInfo {
  icon: LucideIcon
  bgColor: string
  textColor: string
  borderColor: string
}

export const getFileTypeInfo = (fileName: string, mimeType?: string): FileTypeInfo => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  // Excel files
  if (extension === 'xlsx' || extension === 'xls' || extension === 'xlsm' || 
      mimeType?.includes('spreadsheet')) {
    return {
      icon: FileSpreadsheet,
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-600 dark:text-green-400',
      borderColor: 'border-green-500/30'
    }
  }
  
  // CSV files
  if (extension === 'csv') {
    return {
      icon: FileSpreadsheet,
      bgColor: 'bg-emerald-500/10',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      borderColor: 'border-emerald-500/30'
    }
  }
  
  // PDF files
  if (extension === 'pdf' || mimeType?.includes('pdf')) {
    return {
      icon: FileText,
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-600 dark:text-red-400',
      borderColor: 'border-red-500/30'
    }
  }
  
  // Text files
  if (extension === 'txt' || extension === 'md' || extension === 'doc' || 
      extension === 'docx' || mimeType?.includes('text')) {
    return {
      icon: FileText,
      bgColor: 'bg-blue-500/10',
      textColor: 'text-blue-600 dark:text-blue-400',
      borderColor: 'border-blue-500/30'
    }
  }
  
  // Image files
  if (extension === 'png' || extension === 'jpg' || extension === 'jpeg' || 
      extension === 'gif' || extension === 'svg' || extension === 'webp' ||
      mimeType?.includes('image')) {
    return {
      icon: FileImage,
      bgColor: 'bg-purple-500/10',
      textColor: 'text-purple-600 dark:text-purple-400',
      borderColor: 'border-purple-500/30'
    }
  }
  
  // Video files
  if (extension === 'mp4' || extension === 'avi' || extension === 'mov' || 
      extension === 'mkv' || extension === 'webm' || mimeType?.includes('video')) {
    return {
      icon: FileVideo,
      bgColor: 'bg-orange-500/10',
      textColor: 'text-orange-600 dark:text-orange-400',
      borderColor: 'border-orange-500/30'
    }
  }
  
  // Audio files
  if (extension === 'mp3' || extension === 'wav' || extension === 'ogg' || 
      extension === 'flac' || mimeType?.includes('audio')) {
    return {
      icon: FileAudio,
      bgColor: 'bg-pink-500/10',
      textColor: 'text-pink-600 dark:text-pink-400',
      borderColor: 'border-pink-500/30'
    }
  }
  
  // Default for unknown file types
  return {
    icon: File,
    bgColor: 'bg-gray-500/10',
    textColor: 'text-gray-600 dark:text-gray-400',
    borderColor: 'border-gray-500/30'
  }
}

export const truncateFileName = (fileName: string, maxLength: number = 30): string => {
  if (fileName.length <= maxLength) return fileName
  
  const extension = fileName.split('.').pop() || ''
  const nameWithoutExt = fileName.substring(0, fileName.length - extension.length - 1)
  const truncatedName = nameWithoutExt.substring(0, maxLength - extension.length - 4)
  
  return `${truncatedName}...${extension}`
}
