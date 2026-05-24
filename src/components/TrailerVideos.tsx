import type { VideoData } from '../types';
import CounterAnimation from './CounterAnimation';

interface TrailerVideosProps {
	videos: VideoData[];
	formatViews: (views: number | null) => string;
}

const TrailerVideos = ({ videos, formatViews }: TrailerVideosProps) => {
	return (
		<div className="videos-grid">
			{videos.map((v) => (
				<VideoCard key={v.id} video={v} formatViews={formatViews} />
			))}
		</div>
	);
};

interface VideoCardProps {
	video: VideoData;
	formatViews: (views: number | null) => string;
}

const VideoCard = ({ video: v, formatViews }: VideoCardProps) => {
	const href = `https://www.youtube.com/watch?v=${v.id}`;
	const isClickable = !v.loading && !v.error;

	return (
		<div className="video-card">
			{isClickable ? (
				<ClickableContent v={v} href={href} formatViews={formatViews} />
			) : (
				<NonClickableContent v={v} />
			)}
		</div>
	);
};

interface ClickableContentProps {
	v: VideoData;
	href: string;
	formatViews: (views: number | null) => string;
}

const ClickableContent = ({ v, href, formatViews }: ClickableContentProps) => (
	<a
		href={href}
		target="_blank"
		rel="noopener noreferrer"
		style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
	>
		<VideoTitle title={v.title || v.label} />

		<div className="thumbnail-wrapper">
			<img
				src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
				alt={v.title || v.label}
				className="video-thumbnail"
			/>
		</div>

		<div className="video-views">
			<CounterAnimation value={v.views} />
		</div>

		<div className="video-views-label">views · {formatViews(v.views)}</div>
	</a>
);

interface NonClickableContentProps {
	v: VideoData;
}

const NonClickableContent = ({ v }: NonClickableContentProps) => (
	<>
		<VideoTitle title={v.title || v.label} />
		{v.loading ? (
			<div className="loading-shimmer" />
		) : (
			<div className="error-text">⚠ {v.error}</div>
		)}
	</>
);

interface VideoTitleProps {
	title: string;
}

const VideoTitle = ({ title }: VideoTitleProps) => (
	<div className="video-title" style={{ color: '#555', fontSize: 10 }}>
		{title}
	</div>
);

export default TrailerVideos;
