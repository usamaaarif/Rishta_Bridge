import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
    return twMerge(clsx(inputs));
}

export function getImageUrl(path) {
    if (!path) return '';
    if (path.startsWith('http://') || path.startsWith('https://')) {
        return path;
    }
    const apiBase = import.meta.env.VITE_API_URL;
    if (apiBase && apiBase.startsWith('http')) {
        const cleanBase = apiBase.replace(/\/api\/?$/, '');
        return `${cleanBase}${path.startsWith('/') ? '' : '/'}${path}`;
    }
    // In local dev without full URL, default to http://localhost:8000
    if (import.meta.env.DEV) {
        return `http://localhost:8000${path.startsWith('/') ? '' : '/'}${path}`;
    }
    // In production with reverse proxy, relative path works directly
    return path.startsWith('/') ? path : `/${path}`;
}

