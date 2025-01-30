export interface Content {
    title: string;
    started: string;
    finished?: string;
    progress: number;
    id: string;
}
export type ContentList = Content[];
