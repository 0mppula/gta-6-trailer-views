import React from 'react';
import { GTA_6_ACCENT_COLOR } from '../constants';
import { POLL_INTERVAL, useTrailerViews } from '../hooks/useTrailerViews';
import type { VideoId } from '../types';
import Header from './Header';
import TotalViews from './TotalViews';
import TrailerVideos from './TrailerVideos';

interface PulseRingProps {
	active: boolean;
}

function PulseRing({ active }: PulseRingProps) {
	return (
		<span
			style={{
				display: 'inline-block',
				width: 10,
				height: 10,
				borderRadius: '50%',
				background: active ? 'var(--accent-color)' : '#444',
				boxShadow: active ? '0 0 0 0 rgba(255,204,51,0.7)' : 'none',
				animation: active ? 'pulse 1.4s infinite' : 'none',
				marginRight: 8,
				verticalAlign: 'middle',
			}}
		/>
	);
}

interface GameTrailerViewsProps {
	gameName: string;
	videoIds: VideoId[];
	accentColor?: string;
}

const GameTrailerViews = ({
	gameName,
	videoIds,
	accentColor = GTA_6_ACCENT_COLOR,
}: GameTrailerViewsProps) => {
	const { videos, totalViews, lastUpdated, polling, countdown, fetchAll, formatViews } =
		useTrailerViews(videoIds);

	return (
		<div className="app" style={{ '--accent-color': accentColor } as React.CSSProperties}>
			<div className="noise" />
			<div className="scanline" />

			<div className="content">
				<Header gameName={gameName} />

				<div className="divider" />

				<TotalViews totalViews={totalViews} />

				<TrailerVideos videos={videos} formatViews={formatViews} />

				<div className="status-bar">
					<div className="status-left">
						<PulseRing active={polling} />
						{polling
							? 'Fetching...'
							: lastUpdated
								? `Updated ${lastUpdated.toLocaleTimeString()}`
								: 'Initializing...'}
					</div>
					<div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
						<span>Next refresh: {countdown}s</span>
						<button className="refresh-btn" onClick={fetchAll} disabled={polling}>
							↻ Refresh
						</button>
					</div>
				</div>

				<div className="countdown-bar">
					<div
						className="countdown-fill"
						style={{ width: `${(countdown / (POLL_INTERVAL / 1000)) * 100}%` }}
					/>
				</div>
			</div>
		</div>
	);
};

export default GameTrailerViews;
