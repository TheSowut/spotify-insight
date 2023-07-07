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

// Variables
let totalCount: number = 0;
let isFetching: boolean = false;
let accessToken: string = '';
let data: any[] = [];
let limitReached: boolean = false;
let trackPosition: number = 0;

/**
* If limit has been reached or a fetch request is being performed, exit.
* Otherwise validate user access token and perform the API call.
* @returns
*/
const renderTracksView = async () => {
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
    ROOT?.removeChild(document.querySelector('.main-container')!);
    await renderTracksView();
}

/**
* Display the access token input field.
*/
const displayLogin = async () => {
    const mainContainer = document.createElement('div');
    mainContainer.classList.add('main-container');

    const container = document.createElement('div');
    container.classList.add('container');

    // Anchor element.
    const obtainToken = document.createElement('a');
    obtainToken.classList.add('obtain-token-link');
    obtainToken.href = 'https://developer.spotify.com/';
    obtainToken.innerHTML = 'Obtain token';
    obtainToken.target = '_blank';

    // Input element.
    const input = document.createElement('input');
    input.placeholder = 'Spotify Access Token';
    input.type = 'password';
    input.inputMode = 'password';

    // Button element.
    const btn = document.createElement('button');
    btn.innerHTML = 'Submit';
    btn.onclick = await submitToken;

    container.append(obtainToken);
    container.appendChild(input);
    container.appendChild(btn);
    mainContainer.appendChild(container);
    ROOT?.appendChild(mainContainer);
}

/**
 * If the user has reached the 50th record,
 * display a footer instead of new tracks.
 */
const displayFooter = () => {
    let footer: HTMLElement = document.createElement('footer');
    footer.style.textAlign = 'center';
    footer.innerHTML = 'That\'s all folks!';

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
    ROOT?.removeChild(spinnerElement!);
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
* Check if the user has an access token stored in the local storage.
* If yes, perform the fetch, if not, display the "login" screen.
*/
window.addEventListener('load', async () => {
    if (!localStorage.getItem('access_token')) {
        await displayLogin();
        return;
    }

    await renderTracksView();
});

/**
* When the users performs a mouse scroll, check his location.
*/
window.addEventListener('scroll', async () => await onScroll());

/**
 * If the user is logged from a mobile device, listen for touchmove instead of scroll.
 */
window.addEventListener('touchmove', async () => await onScroll());
