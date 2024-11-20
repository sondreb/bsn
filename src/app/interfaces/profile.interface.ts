export interface Profile {
  Name?: string[];
  About?: string[];
  Website?: string[];
  [key: string]: string[] | undefined;
}
