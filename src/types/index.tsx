export interface VideoData {
	id: string;
	label: string;
	views: number | null;
	previousViews: number | null;
	title: string | null;
	publishedAt: string | null;
	loading: boolean;
	error: string | null;
}

export type VideoId = Pick<VideoData, 'id' | 'label'>;
