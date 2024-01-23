/**
 * Custom implementation of the PKCE Authorization Flow.
 * 1. Generate Random String.
 * 2. Hash it.
 * 3. Base 64 encode the hash to be used as code challenge.
 */
export class CustomPKCEAuthorization {

    /**
     * Generate a random string to be used as code verifier.
     * @param length
     * @returns
     */
    private generateRandomString = (length: number = 64) => {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        const values = crypto.getRandomValues(new Uint8Array(length));

        return values.reduce((acc, x) => acc + possible[x % possible.length], '');
    }

    /**
     * Hash the code verifier to be as used as code challenge.
     * @param plain
     * @returns
     */
    private sha256 = async (plain: string) => {
        const encoder = new TextEncoder();
        const data = encoder.encode(plain);

        return window.crypto.subtle.digest('SHA-256', data);
    }

    /**
     * Base64 encode the sha256 hashed random string value.
     * @param input
     * @returns
     */
    private base64encode = (input: any) => {
        return btoa(String.fromCharCode(...new Uint8Array(input)))
            .replace(/=/g, '')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
    }

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
}
