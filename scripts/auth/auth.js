var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Custom implementation of the PKCE Authorization Flow.
 * 1. Generate Random String.
 * 2. Hash it.
 * 3. Base 64 encode the hash to be used as code challenge.
 */
export class CustomPKCEAuthorization {
    constructor() {
        /**
         * Generate a code verifier and challenge to be used during the authorization.
         * @returns
         */
        this.obtainCodeChallenge = () => __awaiter(this, void 0, void 0, function* () {
            const codeVerifier = this.generateRandomString(64);
            window.localStorage.setItem('code_verifier', codeVerifier);
            const hashed = yield this.sha256(codeVerifier);
            return this.base64encode(hashed);
        });
        /**
         * Use the refresh token to obtain a new access token once it has expired.
         * @param CLIENT_ID
         * @param refreshToken
         * @returns
         */
        this.refreshAccessToken = (CLIENT_ID, refreshToken) => __awaiter(this, void 0, void 0, function* () {
            const payload = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                })
            };
            const url = 'https://accounts.spotify.com/api/token';
            return yield fetch(url, payload)
                .then(res => res.json());
        });
        /**
         * Generate a random string to be used as code verifier.
         * @param length
         * @returns
         */
        this.generateRandomString = (length = 64) => {
            const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            const values = crypto.getRandomValues(new Uint8Array(length));
            return values.reduce((acc, x) => acc + possible[x % possible.length], '');
        };
        /**
         * Hash the code verifier to be as used as code challenge.
         * @param plain
         * @returns
         */
        this.sha256 = (plain) => {
            const encoder = new TextEncoder();
            const data = encoder.encode(plain);
            return window.crypto.subtle.digest('SHA-256', data);
        };
        /**
         * Base64 encode the sha256 hashed random string value.
         * @param input
         * @returns
         */
        this.base64encode = (input) => {
            return btoa(String.fromCharCode(...new Uint8Array(input)))
                .replace(/=/g, '')
                .replace(/\+/g, '-')
                .replace(/\//g, '_');
        };
    }
}
