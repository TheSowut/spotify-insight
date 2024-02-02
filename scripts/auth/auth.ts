/**
 * Custom implementation of the PKCE Authorization Flow.
 * 1. Generate Random String.
 * 2. Hash it.
 * 3. Base 64 encode the hash to be used as code challenge.
 */
export class CustomPKCEAuthorization {

    /**
     * Generate a code verifier and challenge to be used during the authorization.
     * @returns
     */
    public obtainCodeChallenge = async () => {
        const codeVerifier = this.generateRandomString(64);
        window.localStorage.setItem('code_verifier', codeVerifier);

        const hashed = await this.sha256(codeVerifier);
        return this.base64encode(hashed);
    }

    /**
     * Use the refresh token to obtain a new access token once it has expired.
     * @param CLIENT_ID
     * @param refreshToken
     * @returns
     */
    public refreshAccessToken = async (CLIENT_ID: string, refreshToken: string) => {
        const payload: RequestInit = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            })
        }

        const url = 'https://accounts.spotify.com/api/token';
        return await fetch(url, payload)
            .then(res => res.json());
    }

    /**
     * Generate a random string to be used as code verifier.
     * @param length
     * @returns
     */
    private generateRandomString = (length: number = 64): string => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));

        return values.reduce((acc, x) => acc + possible[x % possible.length], '');
    }

    /**
     * Hash the code verifier to be as used as code challenge.
     * @param plain
     * @returns
     */
    private sha256 = (plain: string): Promise<ArrayBuffer> => {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);

        return window.crypto.subtle.digest('SHA-256', data);
    }

    /**
     * Base64 encode the sha256 hashed random string value.
     * @param input
     * @returns
     */
    private base64encode = (input: ArrayBuffer): string => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
    }
}
