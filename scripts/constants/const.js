export const ROOT = document.querySelector('#root');
export const FETCH_URL = 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10&offset=';
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
export const MAX_AMOUNT_OF_TRACKS = 50;
export const CLIENT_ID = '0edc943739304bb8bb3521dddd210510';
export const IS_PRODUCTION = window.location.href.includes('github');
export const DEV_URL = 'http://localhost:5500';
export const PROD_URL = 'https://thesowut.github.io/spotify-insight';
