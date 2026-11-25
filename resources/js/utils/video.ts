const YOUTUBE_HOSTS = new Set([
    'youtube.com',
    'm.youtube.com',
    'music.youtube.com',
    'youtube-nocookie.com',
]);

const YOUTUBE_PATH_PREFIXES = new Set(['embed', 'shorts', 'live', 'v']);

const YOUTUBE_VIDEO_ID_PATTERN = /^[a-zA-Z0-9_-]+$/;

/**
 * Parse a YouTube timestamp query parameter (e.g. "90", "90s", "1m30s", "1h2m3s") into seconds.
 */
function parseYoutubeStartSeconds(rawValue: string | null): number | null {
    if (!rawValue) {
        return null;
    }

    const value = rawValue.trim();
    if (/^\d+$/.test(value)) {
        const seconds = Number.parseInt(value, 10);
        return seconds > 0 ? seconds : null;
    }

    const match = value.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/i);
    if (!match || (!match[1] && !match[2] && !match[3])) {
        return null;
    }

    const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
    const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
    const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;
    const totalSeconds = hours * 3600 + minutes * 60 + seconds;

    return totalSeconds > 0 ? totalSeconds : null;
}

/**
 * Convert a video URL into a single-video iframe-safe embed URL.
 *
 * Supported YouTube formats:
 * - https://youtu.be/<id>?si=...
 * - https://www.youtube.com/watch?v=<id>&list=...&index=...
 * - https://m.youtube.com/watch?v=<id>
 * - https://www.youtube.com/embed/<id>
 * - https://www.youtube.com/shorts/<id>
 * - https://www.youtube.com/live/<id>
 *
 * Playlist parameters (list, index) are stripped so the player embeds only the single video.
 * Non-YouTube URLs are returned unchanged.
 */
export function toEmbedVideoUrl(rawUrl: string): string {
    const trimmed = rawUrl.trim();
    if (!trimmed) {
        return '';
    }

    let parsed: URL;
    try {
        parsed = new URL(trimmed);
    } catch {
        return trimmed;
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return trimmed;
    }

    const host = parsed.hostname.toLowerCase().replace(/^www\./, '');
    const segments = parsed.pathname.split('/').filter(Boolean);

    let videoId: string | null = null;

    if (host === 'youtu.be') {
        videoId = segments[0] ?? null;
    } else if (YOUTUBE_HOSTS.has(host)) {
        if (segments[0] === 'watch') {
            videoId = parsed.searchParams.get('v');
        } else if (segments[0] && YOUTUBE_PATH_PREFIXES.has(segments[0])) {
            videoId = segments[1] ?? null;
        } else {
            videoId = parsed.searchParams.get('v');
        }
    } else {
        return trimmed;
    }

    if (!videoId || !YOUTUBE_VIDEO_ID_PATTERN.test(videoId)) {
        return trimmed;
    }

    const embedHost = host === 'youtube-nocookie.com'
        ? 'https://www.youtube-nocookie.com'
        : 'https://www.youtube.com';

    const embedUrl = new URL(`${embedHost}/embed/${videoId}`);
    const startSeconds = parseYoutubeStartSeconds(
        parsed.searchParams.get('start') ?? parsed.searchParams.get('t'),
    );

    if (startSeconds !== null) {
        embedUrl.searchParams.set('start', startSeconds.toString());
    }

    return embedUrl.toString();
}
