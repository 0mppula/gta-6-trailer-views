import { formatTimeAgo } from '../hooks/useTrailerViews';
import type { VideoData } from '../types';
import CounterAnimation from './CounterAnimation';

interface TrailerVideosProps {
	videos: VideoData[];
	formatViews: (views: number | null) => string;
	snapshotTime: number | null;
}

const TrailerVideos = ({ videos, formatViews, snapshotTime }: TrailerVideosProps) => {
	return (
		<div className="videos-grid">
			{videos.map((v, i) => (
				<VideoCard
					key={v.id}
					video={v}
					formatViews={formatViews}
					index={i + 1}
					snapshotTime={snapshotTime}
				/>
			))}
		</div>
	);
};

interface VideoCardProps {
	video: VideoData;
	formatViews: (views: number | null) => string;
	index: number;
	snapshotTime: number | null;
}

const VideoCard = ({ video: v, formatViews, index, snapshotTime }: VideoCardProps) => {
	const href = `https://www.youtube.com/watch?v=${v.id}`;
	const isClickable = !v.loading && !v.error;

	return (
		<div className="video-card">
			{isClickable ? (
				<ClickableContent
					v={v}
					href={href}
					formatViews={formatViews}
					index={index}
					snapshotTime={snapshotTime}
				/>
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
	index: number;
	snapshotTime: number | null;
}

const ClickableContent = ({ v, href, formatViews, index, snapshotTime }: ClickableContentProps) => {
	const viewDiff =
		v.previousViews !== null && v.views !== null ? v.views - v.previousViews : null;

	return (
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
				<div className="video-index">#{index}</div>
			</div>

			<div className="video-views">
				<CounterAnimation value={v.views} />
			</div>

			<div className="video-views-label">
				{formatViews(v.views)} Views ·{' '}
				{v.publishedAt && new Date(v.publishedAt).toLocaleDateString('en-GB')}
			</div>

			{viewDiff !== null && snapshotTime !== null && (
				<div className="video-views-label" style={{ color: '#555' }}>
					+{formatViews(viewDiff)} · {formatTimeAgo(snapshotTime)}
				</div>
			)}
		</a>
	);
};

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
