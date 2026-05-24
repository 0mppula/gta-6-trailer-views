import { useEffect, useRef, useState } from 'react';
import { GTA_6_TRAILER_VIDEO_IDS } from './constants';
import type { VideoData } from './types';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const POLL_INTERVAL = 60_000; // 60 seconds

function formatViews(n: number | null | undefined): string {
	if (n === null || n === undefined) return '—';
	if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
	if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
	if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
	return n.toLocaleString();
}

function formatNumber(n: number | null | undefined): string {
	if (n === null || n === undefined) return '—';
	return n.toLocaleString();
}

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

interface CounterAnimationProps {
	value: number | null;
}

function CounterAnimation({ value }: CounterAnimationProps) {
	const [display, setDisplay] = useState(value);
	const prevRef = useRef(value);

	useEffect(() => {
		if (value === null) return;
		const start = prevRef.current || 0;
		const end = value;
		const duration = 1200;
		const steps = 40;
		const increment = (end - start) / steps;
		let current = start;
		let step = 0;

		const timer = setInterval(() => {
			step++;
			current += increment;
			if (step >= steps) {
				setDisplay(end);
				clearInterval(timer);
			} else {
				setDisplay(Math.round(current));
			}
		}, duration / steps);

		prevRef.current = end;
		return () => clearInterval(timer);
	}, [value]);

	return <span>{formatNumber(display)}</span>;
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
					<div className="header">
						<div className="channel-tag">⊞ Rockstar Games · YouTube</div>
						<h1 className="title">
							GTA 6
							<br />
							<span>Trailer</span>
							<br />
							Views
						</h1>
						<p className="subtitle">Combined video performance dashboard</p>
					</div>

					<div className="divider" />

					<div className="total-block">
						<div className="total-label">◈ Total Combined Views</div>
						<div className="total-value">
							{totalViews !== null ? (
								<CounterAnimation value={totalViews} />
							) : (
								<div
									className="loading-shimmer"
									style={{ height: 60, width: 260 }}
								/>
							)}
						</div>
						{totalViews !== null && (
							<div className="total-formatted">
								{formatViews(totalViews)} views combined
							</div>
						)}
					</div>

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
