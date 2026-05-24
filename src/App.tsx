import { useEffect, useRef, useState } from 'react';
import CounterAnimation from './components/CounterAnimation';
import Header from './components/Header';
import TotalViews from './components/TotalViews';
import { GTA_6_TRAILER_VIDEO_IDS } from './constants';
import { formatViews } from './helpers';
import type { VideoData } from './types';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const POLL_INTERVAL = 60_000; // 60 seconds

async function fetchYouTubeVideoData(
	videoId: string,
): Promise<{ views: number; title: string | null }> {
	const response = await fetch(
		`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`,
	);

	if (!response.ok) {
		throw new Error(`YouTube API error: ${response.status}`);
	}

	const data = await response.json();

	const item = data.items?.[0];

	if (!item) {
		throw new Error('Video not found');
	}

	return {
		views: Number(item.statistics.viewCount),
		title: item.snippet.title || null,
	};
}

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
				background: active ? '#d883c4' : '#444',
				boxShadow: active ? '0 0 0 0 rgba(255,204,51,0.7)' : 'none',
				animation: active ? 'pulse 1.4s infinite' : 'none',
				marginRight: 8,
				verticalAlign: 'middle',
			}}
		/>
	);
}

export default function App() {
	const [videos, setVideos] = useState<VideoData[]>(
		GTA_6_TRAILER_VIDEO_IDS.map((v) => ({
			...v,
			views: null,
			title: null,
			loading: true,
			error: null,
		})),
	);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [polling, setPolling] = useState(false);
	const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);
	const countdownRef = useRef<number | null>(null);
	const pollRef = useRef<number | null>(null);

	const fetchAll = async () => {
		setPolling(true);
		setVideos((prev) => prev.map((v) => ({ ...v, loading: true, error: null })));

		const results = await Promise.allSettled(
			GTA_6_TRAILER_VIDEO_IDS.map((v) => fetchYouTubeVideoData(v.id)),
		);

		setVideos((prev) =>
			prev.map((v, i) => {
				const result = results[i];
				if (result.status === 'fulfilled') {
					return {
						...v,
						views: result.value.views,
						title: result.value.title,
						loading: false,
						error: null,
					};
				} else {
					return { ...v, loading: false, error: 'Fetch failed' };
				}
			}),
		);

		setLastUpdated(new Date());
		setPolling(false);
		setCountdown(POLL_INTERVAL / 1000);
	};

	// Countdown timer
	useEffect(() => {
		countdownRef.current = window.setInterval(() => {
			setCountdown((c) => {
				if (c <= 1) return POLL_INTERVAL / 1000;
				return c - 1;
			});
		}, 1000);

		return () => {
			if (countdownRef.current !== null) {
				clearInterval(countdownRef.current);
			}
		};
	}, []);

	// Polling
	useEffect(() => {
		const timeout = window.setTimeout(() => {
			fetchAll();
		}, 0);

		pollRef.current = window.setInterval(() => {
			fetchAll();
		}, POLL_INTERVAL);

		return () => {
			clearTimeout(timeout);

			if (pollRef.current !== null) {
				clearInterval(pollRef.current);
			}
		};
	}, []);

	const totalViews = videos.every((v) => v.views !== null)
		? videos.reduce((sum, v) => sum + (v.views || 0), 0)
		: null;

	return (
		<>
			<div className="app">
				<div className="noise" />
				<div className="scanline" />

				<div className="content">
					<Header gameName="GTA 6" />

					<div className="divider" />

					<TotalViews totalViews={totalViews} />

					<div className="videos-grid">
						{videos.map((v) => {
							const href = `https://www.youtube.com/watch?v=${v.id}`;
							const clickable = !v.loading && !v.error;

							return (
								<div className="video-card" key={v.id}>
									{/* ONE SINGLE LINK WRAPS ALL CONTENT */}
									{clickable ? (
										<a
											href={href}
											target="_blank"
											rel="noopener noreferrer"
											style={{
												textDecoration: 'none',
												color: 'inherit',
												display: 'block',
											}}
										>
											{/* TITLE */}
											<div
												className="video-title"
												style={{ color: '#555', fontSize: 10 }}
											>
												{v.title || v.label}
											</div>

											{/* THUMBNAIL */}
											<div className="thumbnail-wrapper">
												<img
													src={`https://img.youtube.com/vi/${v.id}/hqdefault.jpg`}
													alt={v.title || v.label}
													className="video-thumbnail"
												/>
											</div>

											{/* CONTENT */}
											<div className="video-views">
												<CounterAnimation value={v.views} />
											</div>

											<div className="video-views-label">
												views · {formatViews(v.views)}
											</div>
										</a>
									) : (
										<>
											{/* NON-CLICKABLE STATES (loading/error) */}
											<div
												className="video-title"
												style={{ color: '#555', fontSize: 10 }}
											>
												{v.title || v.label}
											</div>

											{v.loading ? (
												<div className="loading-shimmer" />
											) : (
												<div className="error-text">⚠ {v.error}</div>
											)}
										</>
									)}
								</div>
							);
						})}
					</div>

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
		</>
	);
}
