import { CustomPKCEAuthorization } from "./auth/auth.js";
import { CLIENT_ID, DEV_URL, EMOJIS, FETCH_URL, IS_PRODUCTION, MAX_AMOUNT_OF_TRACKS, PROD_URL, ROOT } from "./constants/const.js";
import { MESSAGE } from "./enums/message.js";
import { SCREEN } from "./enums/screen.js";

// Variables
let totalCount: number = 0;
let isFetching: boolean = false;
let data: any[] = [];
let limitReached: boolean = false;
let trackPosition: number = 0;
let activeScreen: SCREEN;
let PKCEClient = new CustomPKCEAuthorization();
let redirectUri: string = '';

/**
* If limit has been reached or a fetch request is being performed, exit.
* Otherwise validate user access token and perform the API call.
* @returns
*/
const renderTracksView = async () => {
    activeScreen = SCREEN.SHOWCASE;
    if (limitReached || isFetching) return;

    if (totalCount >= MAX_AMOUNT_OF_TRACKS) {
        displayFooter();
        return;
    }

    let trackList = await fetchData();
    totalCount += trackList.length;

    for (const track of trackList) {
        const trackElement = document.createElement('div');
        trackElement.classList.add('track');
        trackElement.innerHTML = `
            <div>
                <a href = "${track['uri']}" target = "_blank">
                    ${++trackPosition}. ${track['artists'][0]['name']} - ${track['name']}
                </a>
            </div>
        `;
        ROOT?.appendChild(trackElement);
    }
}

/**
* After the user has submitted his access token, try to perform an API call
* to fetch his top tracks. If it fails, display an error message.
* @returns
*/
const submitToken = async () => {
    const tokenField = document.querySelector('input');
    localStorage.setItem('access_token', tokenField!.value);
    initiateLogin();
}

/**
 * Start the login procedure.
 * @returns
 */
const initiateLogin = async () => {
    const res = await fetch(`${FETCH_URL}${totalCount}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`

        }
    });

    if (res.status !== 200) {
        alert(MESSAGE.INVALID_ACCESS_TOKEN);
        const isLoginDisplayed = document.querySelector('.container');

        // If the code_verifier has been modified during spotify authorization
        // login will not be displayed due to the reroute.
        if (!isLoginDisplayed) {
            await displayLogin();
        }

        return resetState();
    }

    const columnContainer = document.querySelector('.column-container');
    if (columnContainer) ROOT?.removeChild(columnContainer);

    await renderTracksView();
    await renderLogoutButton();
}

/**
 * Authotize with spotify account to receive an authotization code,
 * which is used to obtain an acess token.
 */
const connectWithSpotify = async () => {
    // BUG only on the first login with spotify the users gets a "Invalid Access TOken"
    // error, not permitting him to use the app!
    const scope = 'user-top-read user-read-private user-read-email';
    const codeChallenge = await PKCEClient.obtainCodeChallenge();
    const authUri = new URL("https://accounts.spotify.com/authorize");
    alert(redirectUri);

    const params = {
        response_type: 'code',
        client_id: CLIENT_ID,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    }

    authUri.search = new URLSearchParams(params).toString();
    window.location.href = authUri.toString();
}

/**
 * If 'code' provided as a URL-encoded parameter, try to verify it.
 * If it's correct, load list of tracks.
 * If not, return error.
 *
 * @param code
 */
const authorizeWithSpotify = async (code: string) => {
    const codeVerifier: string | null = localStorage.getItem('code_verifier');
    const url = 'https://accounts.spotify.com/api/token';

    if (!codeVerifier) {
        alert(MESSAGE.INVALID_ACCESS_TOKEN);
        resetState();

        return await displayLogin();
    }
    alert(redirectUri);

    const payload: RequestInit = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            code_verifier: codeVerifier
        })
    }

    await fetch(url, payload)
        .then(res => res.json())
        .then(res => {
            localStorage.setItem('access_token', res.access_token);
            localStorage.setItem('refresh_token', res.refresh_token);
            initiateLogin();
        });
}

/**
* Display the access token input field.
*/
const displayLogin = async () => {
    activeScreen = SCREEN.LOGIN;
    const rowContainer = document.createElement('div');
    rowContainer.classList.add('row-container');

    const columnContainer = document.createElement('div');
    columnContainer.classList.add('column-container');

    const container = document.createElement('div');
    container.classList.add('container');

    // Input element.
    const input = document.createElement('input');
    input.placeholder = 'Spotify Access Token';
    input.type = 'password';
    input.inputMode = 'password';

    // Image element.
    const playButton = new Image();
    playButton.classList.add('play-button');
    playButton.src = 'spotify-insight/images/play.png';
    playButton.src = IS_PRODUCTION ? 'spotify-insight/images/play.png' : 'images/play.png';
    playButton.onclick = await submitToken;

    // Spotify button container.
    const spotifyButtonContainer = document.createElement('div');
    spotifyButtonContainer.classList.add('spotify-image-container');

    // Connect with spotify button.
    const connectWithSpotifyButton = new Image();
    connectWithSpotifyButton.classList.add('connect-with-spotify-button');
    connectWithSpotifyButton.src = IS_PRODUCTION ? 'spotify-insight/images/spotify_logo.svg' : 'images/spotify_logo.svg';
    connectWithSpotifyButton.onclick = await connectWithSpotify;

    spotifyButtonContainer.appendChild(connectWithSpotifyButton);
    container.appendChild(input);
    container.appendChild(playButton);
    container.appendChild(spotifyButtonContainer);
    rowContainer.appendChild(container);
    columnContainer.appendChild(rowContainer);
    ROOT?.appendChild(columnContainer);
}

/**
 * If the user has reached the 50th record,
 * display a footer instead of new tracks.
 */
const displayFooter = () => {
    let footer: HTMLElement = document.createElement('footer');
    footer.style.textAlign = 'center';
    footer.innerHTML = 'That\'s all folks!';
    footer.onclick = returnToTop;

    ROOT?.appendChild(footer);
    limitReached = true;
}

/**
 * Pick a random musical emoji and prefix it to the website title.
 */
const updateWebsiteTitle = () => {
    history.pushState({}, `${EMOJIS[Math.floor(Math.random() * EMOJIS.length)]} Spotify Insight`, '/spotify-insight');
}

/**
 * If an API call is being made display a spinner.
 * @returns
 */
const toggleSpinner = () => {
    let spinnerElement = document.querySelector('.spinner');

    if (!spinnerElement) {
        isFetching = true;
        spinnerElement = document.createElement('div');
        spinnerElement.innerHTML = `
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        `;
        spinnerElement.classList.add('spinner');
        ROOT?.appendChild(spinnerElement);
        return;
    }

    isFetching = false;
    if (spinnerElement) ROOT?.removeChild(spinnerElement);
}

/**
 * Fetch a list of paginated tracks.
 * @returns list of tracks
 */
const fetchData = async () => {
    toggleSpinner();

    const response = await fetch(`${FETCH_URL}${totalCount}`, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`
        }
    }).then(res => res.json());

    if (response.error) {
        // TODO extract in separate fn - refreshAccessToken
        const refreshToken: string | null = localStorage.getItem('refresh_token');
        if (refreshToken) {
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
            const res = await fetch(url, payload)
                .then(res => res.json());

            toggleSpinner();
            if (res.error) {
                localStorage.clear();
                return await displayLogin();
            }

            localStorage.setItem('access_token', res.access_token);
            await renderTracksView();
            return await renderLogoutButton();
        }

        localStorage.clear();
        toggleSpinner();
        await displayLogin();
        return;
    }

    updateWebsiteTitle();
    data = [...data, response.items];
    isFetching = false;
    toggleSpinner();

    return response.items;
}

/**
 * If the user has reached the end of the page and has tracks left,
 * fetch the records and render them in the view.
 * @returns
 */
const onScroll = async () => {
    if (isFetching) return;

    const currentPageHeight: number = window.innerHeight + window.scrollY;
    if (currentPageHeight >= document.body.offsetHeight) await renderTracksView();
}

/**
 * Create and display a logout button.
 */
const renderLogoutButton = async () => {
    const logoutBtn = document.createElement('button');
    logoutBtn.classList.add('logout-button');
    logoutBtn.onclick = await logout;
    logoutBtn.innerHTML = `❌`;
    ROOT?.appendChild(logoutBtn);
}

/**
 * Wipe the user's local storage and navigate him
 * to the login page.
 */
const logout = async () => {
    const tracks = document.querySelectorAll('.track');
    const logoutBtn = document.querySelector('.logout-button');
    const footer = document.querySelector('footer');
    for (const track of Array.from(tracks)) {
        ROOT?.removeChild(track)
    }
    if (logoutBtn) ROOT?.removeChild(logoutBtn);
    if (footer) ROOT?.removeChild(footer);
    resetState();
    await displayLogin();
}

/**
 * Return the user to the top of the page.
 * Invoked on footer click.
 */
const returnToTop = () => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
}

/**
 * Wipe the app cached data.
 * Invoked by logout.
 */
const resetState = () => {
    localStorage.clear();
    updateWebsiteTitle();

    const inputField = document.querySelector('input');
    if (inputField) inputField.value = '';

    totalCount = 0;
    data = [];
    limitReached = false;
    trackPosition = 0;
}

/**
 * Set the redirect url based on whether we're running DEV or PROD mode.
 */
const setRedirectUri = () => {
    redirectUri = IS_PRODUCTION ? PROD_URL : DEV_URL;
}

/**
* Check if the user has an access token stored in the local storage.
* If yes, perform the fetch, if not, display the "login" screen.
*/
window.addEventListener('load', async () => {
    setRedirectUri();
    const searchParams = new URLSearchParams(window.location.search);
    const authorizationCode = searchParams.get('code');

    if (authorizationCode) {
        return await authorizeWithSpotify(authorizationCode);
    }

    if (!localStorage.getItem('access_token')) {
        return await displayLogin();
    }

    await renderTracksView();
    await renderLogoutButton();
});

/**
* When the users performs a mouse scroll, check his location.
*/
window.addEventListener('scroll', async () => {
    if (activeScreen !== SCREEN.SHOWCASE) return;
    await onScroll();
});

/**
 * If the user is logged from a mobile device, listen for touchmove instead of scroll.
 */
window.addEventListener('touchmove', async () => {
    if (activeScreen !== SCREEN.SHOWCASE) return;
    await onScroll();
});

window.addEventListener('keydown', async (e) => {
    if (activeScreen !== SCREEN.LOGIN) return;
    if (e.code === 'Enter') await submitToken();
});
