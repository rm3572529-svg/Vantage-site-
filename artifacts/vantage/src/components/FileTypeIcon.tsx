import { File, FileText, Film, Image as ImageIcon, Music, Smartphone, Table, Archive } from "lucide-react";

export function FileTypeIcon({ fileName, className = "" }: { fileName: string; className?: string }) {
  const extension = fileName.split('.').pop()?.toLowerCase() || '';

  switch (extension) {
    case 'apk':
      return <Smartphone className={`text-green-500 ${className}`} />;
    case 'zip':
    case 'rar':
    case '7z':
      return <Archive className={`text-amber-500 ${className}`} />;
    case 'mp4':
    case 'mkv':
    case 'avi':
      return <Film className={`text-purple-500 ${className}`} />;
    case 'mp3':
    case 'wav':
    case 'flac':
      return <Music className={`text-pink-500 ${className}`} />;
    case 'pdf':
      return <FileText className={`text-red-500 ${className}`} />;
    case 'doc':
    case 'docx':
      return <FileText className={`text-blue-500 ${className}`} />;
    case 'xls':
    case 'xlsx':
      return <Table className={`text-green-500 ${className}`} />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
      return <ImageIcon className={`text-teal-500 ${className}`} />;
    default:
      return <File className={`text-gray-500 ${className}`} />;
  }
}