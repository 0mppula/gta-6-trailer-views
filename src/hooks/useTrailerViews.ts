import { formatDistanceToNow } from 'date-fns';
import { useCallback, useEffect, useRef, useState } from 'react';
import { formatViews } from '../helpers';
import type { VideoData, VideoId } from '../types';

const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
export const POLL_INTERVAL = 60_000;

async function fetchYouTubeVideoData(
	videoId: string,
): Promise<{ views: number; title: string | null; publishedAt: string | null }> {
	const response = await fetch(
		`https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${videoId}&key=${API_KEY}`,
	);

	if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);

	const data = await response.json();
	const item = data.items?.[0];

	if (!item) throw new Error('Video not found');

	return {
		views: Number(item.statistics.viewCount),
		title: item.snippet.title || null,
		publishedAt: item.snippet.publishedAt || null,
	};
}

function loadSnapshot(): Record<string, number> {
	try {
		return JSON.parse(localStorage.getItem('views-snapshot') || '{}');
	} catch {
		return {};
	}
}

function loadSnapshotTime(): number | null {
	const t = localStorage.getItem('views-snapshot-time');
	return t ? Number(t) : null;
}

function saveSnapshot(
	videoIds: VideoId[],
	results: PromiseSettledResult<{
		views: number;
		title: string | null;
		publishedAt: string | null;
	}>[],
) {
	const snapshot: Record<string, number> = {};
	results.forEach((result, i) => {
		if (result.status === 'fulfilled') {
			snapshot[videoIds[i].id] = result.value.views;
		}
	});
	localStorage.setItem('views-snapshot', JSON.stringify(snapshot));
	localStorage.setItem('views-snapshot-time', Date.now().toString());
}

export function formatTimeAgo(timestamp: number): string {
	return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export interface UseTrailerViewsResult {
	videos: VideoData[];
	totalViews: number | null;
	lastUpdated: Date | null;
	polling: boolean;
	countdown: number;
	fetchAll: () => Promise<void>;
	formatViews: (views: number | null) => string;
	snapshotTime: number | null;
}

export function useTrailerViews(videoIds: VideoId[]): UseTrailerViewsResult {
	const snapshot = loadSnapshot();

	const [videos, setVideos] = useState<VideoData[]>(
		videoIds.map((v) => ({
			...v,
			views: null,
			previousViews: snapshot[v.id] ?? null,
			title: null,
			publishedAt: null,
			loading: true,
			error: null,
		})),
	);
	const [prevVideoIds, setPrevVideoIds] = useState(videoIds);
	const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
	const [polling, setPolling] = useState(false);
	const [countdown, setCountdown] = useState(POLL_INTERVAL / 1000);
	const [snapshotTime] = useState<number | null>(loadSnapshotTime);
	const countdownRef = useRef<number | null>(null);
	const pollRef = useRef<number | null>(null);

	if (prevVideoIds !== videoIds) {
		const newSnapshot = loadSnapshot();
		setPrevVideoIds(videoIds);
		setVideos(
			videoIds.map((v) => ({
				...v,
				views: null,
				previousViews: newSnapshot[v.id] ?? null,
				title: null,
				publishedAt: null,
				loading: true,
				error: null,
			})),
		);
	}

	const fetchAll = useCallback(async () => {
		setPolling(true);
		setVideos((prev) => prev.map((v) => ({ ...v, loading: true, error: null })));

		// Load old snapshot before fetching
		const oldSnapshot = loadSnapshot();

		const results = await Promise.allSettled(videoIds.map((v) => fetchYouTubeVideoData(v.id)));

		// Save new snapshot after fetching
		saveSnapshot(videoIds, results);

		setVideos((prev) =>
			prev.map((v, i) => {
				const result = results[i];
				if (!result) return v;

				if (result.status === 'fulfilled') {
					return {
						...v,
						views: result.value.views,
						previousViews: oldSnapshot[v.id] ?? null, // ← use old snapshot
						title: result.value.title,
						publishedAt: result.value.publishedAt,
						loading: false,
						error: null,
					};
				}

				return { ...v, loading: false, error: 'Fetch failed' };
			}),
		);

		setLastUpdated(new Date());
		setPolling(false);
		setCountdown(POLL_INTERVAL / 1000);
	}, [videoIds]);

	// Countdown timer
	useEffect(() => {
		countdownRef.current = window.setInterval(() => {
			setCountdown((c) => (c <= 1 ? POLL_INTERVAL / 1000 : c - 1));
		}, 1000);
		return () => {
			if (countdownRef.current !== null) clearInterval(countdownRef.current);
		};
	}, []);

	// Polling
	useEffect(() => {
		const timeout = window.setTimeout(fetchAll, 0);
		pollRef.current = window.setInterval(fetchAll, POLL_INTERVAL);
		return () => {
			clearTimeout(timeout);
			if (pollRef.current !== null) clearInterval(pollRef.current);
		};
	}, [fetchAll]);

	const totalViews = videos.every((v) => v.views !== null)
		? videos.reduce((sum, v) => sum + (v.views || 0), 0)
		: null;

	const sortedVideos = [...videos].sort((a, b) => (b.views ?? -1) - (a.views ?? -1));

	return {
		videos: sortedVideos,
		totalViews,
		lastUpdated,
		polling,
		countdown,
		fetchAll,
		formatViews,
		snapshotTime,
	};
}
