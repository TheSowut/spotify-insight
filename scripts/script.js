var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CustomPKCEAuthorization } from "./auth/auth.js";
import { CLIENT_ID, EMOJIS, FETCH_URL, MAX_AMOUNT_OF_TRACKS, ROOT } from "./constants/const.js";
import { MESSAGE } from "./enums/message.js";
import { SCREEN } from "./enums/screen.js";
// Variables
let totalCount = 0;
let isFetching = false;
let accessToken = '';
let data = [];
let limitReached = false;
let trackPosition = 0;
let activeScreen;
/**
* If limit has been reached or a fetch request is being performed, exit.
* Otherwise validate user access token and perform the API call.
* @returns
*/
const renderTracksView = () => __awaiter(void 0, void 0, void 0, function* () {
    activeScreen = SCREEN.SHOWCASE;
    if (limitReached || isFetching)
        return;
    if (totalCount >= MAX_AMOUNT_OF_TRACKS) {
        displayFooter();
        return;
    }
    if (!accessToken.length)
        setAccessToken();
    let trackList = yield fetchData();
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
        ROOT === null || ROOT === void 0 ? void 0 : ROOT.appendChild(trackElement);
    }
});
/**
 * Fetch the access_token from the local storage and save it as a variable for further usage.
 */
const setAccessToken = () => {
    accessToken = localStorage.getItem('access_token');
};
/**
* After the user has submitted his access token, try to perform an API call
* to fetch his top tracks. If it fails, display an error message.
* @returns
*/
const submitToken = () => __awaiter(void 0, void 0, void 0, function* () {
    const tokenField = document.querySelector('input');
    accessToken = tokenField.value;
    initiateLogin();
});
/**
 * Start the login procedure.
 * @returns
 */
const initiateLogin = () => __awaiter(void 0, void 0, void 0, function* () {
    const res = yield fetch(`${FETCH_URL}${totalCount}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });
    if (res.status !== 200) {
        alert(MESSAGE.INVALID_ACCESS_TOKEN);
        return resetState();
    }
    const columnContainer = document.querySelector('.column-container');
    if (columnContainer)
        ROOT === null || ROOT === void 0 ? void 0 : ROOT.removeChild(columnContainer);
    yield renderTracksView();
    yield renderLogoutButton();
});
/**
 * step 1
 */
const connectWithSpotify = () => __awaiter(void 0, void 0, void 0, function* () {
    const scope = 'user-top-read user-read-private user-read-email';
    // const redirectUri = 'https://thesowut.github.io/spotify-insight/';
    const redirectUri = 'http://localhost:5500';
    const test = new CustomPKCEAuthorization();
    const codeChallenge = yield test.obtainCodeChallenge();
    const authUri = new URL("https://accounts.spotify.com/authorize");
    const params = {
        response_type: 'code',
        client_id: CLIENT_ID,
        scope,
        code_challenge_method: 'S256',
        code_challenge: codeChallenge,
        redirect_uri: redirectUri,
    };
    authUri.search = new URLSearchParams(params).toString();
    window.location.href = authUri.toString();
});
/**
 * If 'code' provided as a URL-encoded parameter, try to verify it.
 * If it's correct, load list of tracks.
 * If not, return error.
 *
 * @param code
 */
const authorizeWithSpotify = (code) => __awaiter(void 0, void 0, void 0, function* () {
    const codeVerifier = localStorage.getItem('code_verifier');
    // const redirectUri = 'https://thesowut.github.io/spotify-insight/';
    const redirectUri = 'http://localhost:5500';
    const url = 'https://accounts.spotify.com/api/token';
    if (!codeVerifier) {
        alert(MESSAGE.INVALID_ACCESS_TOKEN);
        resetState();
        return displayLogin();
    }
    const payload = {
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
    };
    yield fetch(url, payload)
        .then(res => res.json())
        .then(res => {
        accessToken = res.access_token;
        localStorage.setItem('access_token', res.access_token);
        localStorage.setItem('refresh_token', res.refresh_token);
        initiateLogin();
    });
});
/**
* Display the access token input field.
*/
const displayLogin = () => __awaiter(void 0, void 0, void 0, function* () {
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
    const playButton = document.createElement('img');
    playButton.classList.add('play-button');
    playButton.src = './images/play.png';
    playButton.onclick = yield submitToken;
    // Spotify button container.
    const spotifyButtonContainer = document.createElement('div');
    spotifyButtonContainer.classList.add('spotify-image-container');
    // Connect with spotify button.
    const connectWithSpotifyButton = document.createElement('img');
    connectWithSpotifyButton.classList.add('connect-with-spotify-button');
    connectWithSpotifyButton.src = './images/spotify_logo.svg';
    connectWithSpotifyButton.onclick = yield connectWithSpotify;
    spotifyButtonContainer.appendChild(connectWithSpotifyButton);
    container.appendChild(input);
    container.appendChild(playButton);
    container.appendChild(spotifyButtonContainer);
    rowContainer.appendChild(container);
    columnContainer.appendChild(rowContainer);
    ROOT === null || ROOT === void 0 ? void 0 : ROOT.appendChild(columnContainer);
});
/**
 * If the user has reached the 50th record,
 * display a footer instead of new tracks.
 */
const displayFooter = () => {
    let footer = document.createElement('footer');
    footer.style.textAlign = 'center';
    footer.innerHTML = 'That\'s all folks!';
    footer.onclick = returnToTop;
    ROOT === null || ROOT === void 0 ? void 0 : ROOT.appendChild(footer);
    limitReached = true;
};
/**
 * Pick a random musical emoji and prefix it to the website title.
 */
const updateWebsiteTitle = () => {
    history.pushState({}, `${EMOJIS[Math.floor(Math.random() * EMOJIS.length)]} Spotify Insight`, '/');
};
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
        ROOT === null || ROOT === void 0 ? void 0 : ROOT.appendChild(spinnerElement);
        return;
    }
    isFetching = false;
    if (spinnerElement)
        ROOT === null || ROOT === void 0 ? void 0 : ROOT.removeChild(spinnerElement);
};
/**
 * Fetch a list of paginated tracks.
 * @returns list of tracks
 */
const fetchData = () => __awaiter(void 0, void 0, void 0, function* () {
    toggleSpinner();
    const response = yield fetch(`${FETCH_URL}${totalCount}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    }).then(res => res.json());
    if (response.error) {
        alert(response.error.message);
        localStorage.clear();
        toggleSpinner();
        yield displayLogin();
        return;
    }
    updateWebsiteTitle();
    data = [...data, response.items];
    isFetching = false;
    toggleSpinner();
    return response.items;
});
/**
 * If the user has reached the end of the page and has tracks left,
 * fetch the records and render them in the view.
 * @returns
 */
const onScroll = () => __awaiter(void 0, void 0, void 0, function* () {
    if (isFetching)
        return;
    const currentPageHeight = window.innerHeight + window.scrollY;
    if (currentPageHeight >= document.body.offsetHeight)
        yield renderTracksView();
});
/**
 * Create and display a logout button.
 */
const renderLogoutButton = () => __awaiter(void 0, void 0, void 0, function* () {
    const logoutBtn = document.createElement('button');
    logoutBtn.classList.add('logout-button');
    logoutBtn.onclick = yield logout;
    logoutBtn.innerHTML = `❌`;
    ROOT === null || ROOT === void 0 ? void 0 : ROOT.appendChild(logoutBtn);
});
/**
 * Wipe the user's local storage and navigate him
 * to the login page.
 */
const logout = () => __awaiter(void 0, void 0, void 0, function* () {
    const tracks = document.querySelectorAll('.track');
    const logoutBtn = document.querySelector('.logout-button');
    const footer = document.querySelector('footer');
    for (const track of Array.from(tracks)) {
        ROOT === null || ROOT === void 0 ? void 0 : ROOT.removeChild(track);
    }
    if (logoutBtn)
        ROOT === null || ROOT === void 0 ? void 0 : ROOT.removeChild(logoutBtn);
    if (footer)
        ROOT === null || ROOT === void 0 ? void 0 : ROOT.removeChild(footer);
    resetState();
    yield displayLogin();
});
/**
 * Return the user to the top of the page.
 * Invoked on footer click.
 */
const returnToTop = () => {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
};
/**
 * Wipe the app cached data.
 * Invoked by logout.
 */
const resetState = () => {
    localStorage.clear();
    updateWebsiteTitle();
    const inputField = document.querySelector('input');
    if (inputField)
        inputField.value = '';
    totalCount = 0;
    accessToken = '';
    data = [];
    limitReached = false;
    trackPosition = 0;
};
/**
* Check if the user has an access token stored in the local storage.
* If yes, perform the fetch, if not, display the "login" screen.
*/
window.addEventListener('load', () => __awaiter(void 0, void 0, void 0, function* () {
    const searchParams = new URLSearchParams(window.location.search);
    const authorizationCode = searchParams.get('code');
    if (authorizationCode) {
        return yield authorizeWithSpotify(authorizationCode);
    }
    if (!localStorage.getItem('access_token')) {
        return yield displayLogin();
    }
    yield renderTracksView();
    yield renderLogoutButton();
}));
/**
* When the users performs a mouse scroll, check his location.
*/
window.addEventListener('scroll', () => __awaiter(void 0, void 0, void 0, function* () {
    if (activeScreen !== SCREEN.SHOWCASE)
        return;
    yield onScroll();
}));
/**
 * If the user is logged from a mobile device, listen for touchmove instead of scroll.
 */
window.addEventListener('touchmove', () => __awaiter(void 0, void 0, void 0, function* () {
    if (activeScreen !== SCREEN.SHOWCASE)
        return;
    yield onScroll();
}));
window.addEventListener('keydown', (e) => __awaiter(void 0, void 0, void 0, function* () {
    if (activeScreen !== SCREEN.LOGIN)
        return;
    if (e.code === 'Enter')
        yield submitToken();
}));
