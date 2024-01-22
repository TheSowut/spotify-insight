// Constants
const ROOT = document.querySelector('#root');
const FETCH_URL: string = 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10&offset=';
const EMOJIS = [
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
const MAX_AMOUNT_OF_TRACKS: number = 50;
enum SCREEN {
    LOGIN,
    SHOWCASE
}

// Variables
let totalCount: number = 0;
let isFetching: boolean = false;
let accessToken: string = '';
let data: any[] = [];
let limitReached: boolean = false;
let trackPosition: number = 0;
let activeScreen: SCREEN;

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

    if (!accessToken.length) setAccessToken();

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

const setAccessToken = () => {
    accessToken = localStorage.getItem('access_token')!;
}

/**
* After the user has submitted his access token, try to perform an API call
* to fetch his top tracks. If it fails, display an error message.
* @returns
*/
const submitToken = async () => {
    const tokenField = document.querySelector('input');
    accessToken = tokenField!.value;
    const res = await fetch(`${FETCH_URL}${totalCount}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (res.status !== 200) {
        localStorage.clear();
        alert('Invalid access token!');
        tokenField!.value = "";
        return;
    }

    localStorage.setItem('access_token', accessToken);
    setAccessToken();
    ROOT?.removeChild(document.querySelector('.column-container')!);
    await renderTracksView();
    await renderLogoutButton();
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
    const playButton = document.createElement('img');
    playButton.classList.add('play-button');
    playButton.src = './images/play.png'
    playButton.onclick = await submitToken;

    // container.append(obtainToken);
    container.appendChild(input);
    container.appendChild(playButton);
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
    document.title = `${EMOJIS[Math.floor(Math.random() * EMOJIS.length)]} Spotify Insight`;
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
            Authorization: `Bearer ${accessToken}`
        }
    }).then(res => res.json());

    if (response.error) {
        alert(response.error.message);
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

    totalCount = 0;
    accessToken = '';
    data = [];
    limitReached = false;
    trackPosition = 0;
}

/**
* Check if the user has an access token stored in the local storage.
* If yes, perform the fetch, if not, display the "login" screen.
*/
window.addEventListener('load', async () => {
    if (!localStorage.getItem('access_token')) {
        await displayLogin();

        const searchParams = new URLSearchParams(window.location.search);
        const authorizationCode = searchParams.get('code');
        alert(authorizationCode);

        // if (authorizationCode) {
        //     // Do something with the authorization code, such as making a request to exchange it for an access token
        //     console.log('Authorization Code:', authorizationCode);
        // } else {
        //     console.error('Authorization code not found in the URL');
        // }
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
