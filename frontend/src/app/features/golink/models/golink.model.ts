export interface GoLink {
  id: string;
  name: string;
  targetUrl: string;
  description?: string;
  tags: string[];
  createdAt: string;
  lockUuid: string;
}
