export function formatViews(n: number | null | undefined): string {
	if (n === null || n === undefined) return '—';
	if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(2) + 'B';
	if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M';
	if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
	return n.toLocaleString();
}

export function formatNumber(n: number | null | undefined): string {
	if (n === null || n === undefined) return '—';
	return n.toLocaleString();
}
