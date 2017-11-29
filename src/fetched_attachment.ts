export interface FetchedAttachmentFile {
  bytes: number;
  lastModified: number;
  name: string;
}

interface FetchedAttachment {
  file: FetchedAttachmentFile;
  link: string;
  ttl: number;
}

export default FetchedAttachment;
