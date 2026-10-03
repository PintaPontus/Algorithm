export interface WorkspaceInfo {
  id: string;
  title: string;
  description: string;
  lastUpdated: number;
  state: {[key: string]: any;} | undefined;
}
