export interface VideoData {
	id: string;
	label: string;
	views: number | null;
	title: string | null;
	loading: boolean;
	error: string | null;
}

export type VideoId = Pick<VideoData, 'id' | 'label'>;
