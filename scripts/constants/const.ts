export const ROOT = document.querySelector('#root');
export const FETCH_URL: string = 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10&offset=';
export const EMOJIS = [
    '🎼',
    '🎵',
    '🎶',
    '🎧',
    '🎸',
    '🎹',
    '🎷',
    '🎺',
    '🎻'
];
export const MAX_AMOUNT_OF_TRACKS: number = 50;
export const CLIENT_ID: string = '0edc943739304bb8bb3521dddd210510';
export const IS_PRODUCTION: boolean = window.location.href.includes('github');
export const DEV_URL: string = 'http://localhost:5500';
export const PROD_URL: string = 'https://thesowut.github.io/spotify-insight';
