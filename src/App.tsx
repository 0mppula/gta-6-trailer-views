import { useState, useEffect, useRef } from 'react';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;

const VIDEO_IDS = [
	{
		id: 'QdBZY2fkU-0',
		label: 'Video 1',
	},
	{
		id: 'VQRLujxTm3c',
		label: 'Video 2',
	},
];

interface VideoData {
	id: string;
	label: string;
	views: number | null;
	title: string | null;
	loading: boolean;
	error: string | null;
}

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
		VIDEO_IDS.map((v) => ({
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

		const results = await Promise.allSettled(VIDEO_IDS.map((v) => fetchYouTubeVideoData(v.id)));

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

	console.log('RENDER');

	return (
		<>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #0a0a0a;
          color: #f0ede6;
          font-family: 'DM Mono', monospace;
          min-height: 100vh;
        }

        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(255,204,51,0.7); }
          70% { box-shadow: 0 0 0 10px rgba(255,204,51,0); }
          100% { box-shadow: 0 0 0 0 rgba(255,204,51,0); }
        }

        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.8; }
          94% { opacity: 1; }
          96% { opacity: 0.85; }
          97% { opacity: 1; }
        }

        .app {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 40px 20px;
          position: relative;
          overflow: hidden;
        }

        .noise {
          position: fixed;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 0;
          opacity: 0.5;
        }

        .scanline {
          position: fixed;
          left: 0; right: 0;
          height: 2px;
          background: rgba(255,204,51,0.03);
          animation: scanline 8s linear infinite;
          pointer-events: none;
          z-index: 1;
        }

        .content {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 680px;
          animation: fadeSlideIn 0.7s ease both;
        }

        .header {
          text-align: center;
          margin-bottom: 16px;
        }

        .channel-tag {
          font-family: 'DM Mono', monospace;
          font-size: 11px;
          letter-spacing: 0.25em;
          color: #d883c4;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .title {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(52px, 10vw, 88px);
          letter-spacing: 0.04em;
          line-height: 0.9;
          color: #f0ede6;
          animation: flicker 8s ease-in-out infinite;
        }

        .title span {
          color: #d883c4;
        }

        .subtitle {
          font-size: 11px;
          letter-spacing: 0.2em;
          color: #555;
          text-transform: uppercase;
          margin-top: 14px;
        }

        .total-block {
          background: #111;
          border: 1px solid #222;
          border-top: 2px solid #d883c4;
          padding: 24px;
          margin-bottom: 24px;
          position: relative;
          overflow: hidden;
        }

        .total-block::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 50% -20%, rgba(255,204,51,0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .total-label {
          font-size: 10px;
          letter-spacing: 0.3em;
          color: #555;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .total-value {
          font-family: 'Bebas Neue', sans-serif;
          font-size: clamp(48px, 12vw, 80px);
          color: #d883c4;
          letter-spacing: 0.02em;
          line-height: 1;
        }

        .total-formatted {
          font-size: 14px;
          color: #666;
          margin-top: 6px;
          letter-spacing: 0.1em;
        }

        .videos-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 500px) {
          .videos-grid { grid-template-columns: 1fr; }
        }

        .video-card {
          background: #0f0f0f;
          border: 1px solid #1e1e1e;
          padding: 16px;
          position: relative;
          transition: border-color 0.2s;
        }

        .video-card:hover {
          border-color: #333;
        }

        .video-card::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, #d883c4, transparent);
          opacity: 0;
          transition: opacity 0.3s;
        }

        .video-card:hover::after { opacity: 0.4; }

        .video-index {
          font-size: 10px;
          letter-spacing: 0.25em;
          color: #333;
          text-transform: uppercase;
          margin-bottom: 10px;
        }

        .video-title {
          font-size: 11px;
          color: #888;
          margin-bottom: 12px;
          line-height: 1.5;
          min-height: 32px;
        }

        .video-views {
          font-family: 'Bebas Neue', sans-serif;
          font-size: 32px;
          letter-spacing: 0.03em;
          color: #f0ede6;
        }

        .video-views-label {
          font-size: 10px;
          color: #444;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-top: 2px;
        }

        .loading-shimmer {
          height: 32px;
          width: 120px;
          background: linear-gradient(90deg, #1a1a1a 25%, #252525 50%, #1a1a1a 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
          border-radius: 2px;
        }

        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .thumbnail-wrapper {
          width: 100%;
          aspect-ratio: 16 / 9;
          overflow: hidden;
          border-radius: 6px;
          margin-top: 6px;
	        margin-bottom: 12px;
        }

        .video-thumbnail {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .status-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 16px;
          border: 1px solid #1a1a1a;
          background: #080808;
          font-size: 10px;
          letter-spacing: 0.15em;
          color: #444;
          text-transform: uppercase;
        }

        .status-left {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .refresh-btn {
          background: none;
          border: 1px solid #222;
          color: #555;
          font-family: 'DM Mono', monospace;
          font-size: 10px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 6px 14px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .refresh-btn:hover {
          border-color: #d883c4;
          color: #d883c4;
        }

        .refresh-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .countdown-bar {
          height: 2px;
          background: #111;
          margin-top: 12px;
          overflow: hidden;
        }

        .countdown-fill {
          height: 100%;
          background: #d883c4;
          transition: width 1s linear;
        }

        .error-text {
          font-size: 11px;
          color: #c33;
          letter-spacing: 0.1em;
        }

        .divider {
          width: 40px;
          height: 1px;
          background: #222;
          margin: 0 auto 16px;
        }
      `}</style>

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
