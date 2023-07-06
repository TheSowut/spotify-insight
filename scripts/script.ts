// Constants
const root   = document.querySelector('#root');
const emojis = [
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

// Variables
let startPos: number      = 0;
let endPos: number        = 0;
let isFetching: boolean   = false;
let accessToken: string   = '';
let data: any[]           = [];
let limitReached: boolean = false;
let trackPosition: number = 0;

/**
* If limit has been reached or a fetch request is being performed, exit.
* Otherwise validate user access token and perform the API call.
* @returns
*/
const fetchData = async () => {
    if (limitReached || isFetching) return;

    if (endPos >= 50) {
        let footer: HTMLElement    = document.createElement('footer');
            footer.style.textAlign = 'center';
            footer.innerHTML       = 'That\'s all folks!';

        root?.appendChild(footer);
        limitReached = true;
        return;
    }

    if (!accessToken.length) setAccessToken();
    if (startPos === endPos) data = [];

    if (!data.length) {
        isFetching = true;
        const response   = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${endPos + 10}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(res => res.json());

        if (response.error) {
            alert(response.error.message);
            localStorage.clear();
            displayLogin();
            return;
        }

        updateWebsiteTitle();
        data       = response.items;
        endPos     = data.length;
        isFetching = false;
    }

    let count: number = 0;
    let trackList     = [];

    while (count < 10) {
        trackList.push(data[startPos++]);
        count++;
    }

    for (const track of trackList) {
        const trackElement           = document.createElement('div');
              trackElement.id        = 'track';
              trackElement.innerHTML = `
            <div>
                <a href = "${track['uri']}" target = "_blank">
                    ${++trackPosition}. ${track['artists'][0]['name']} - ${track['name']}
                </a>
            </div>
        `;
        root?.appendChild(trackElement);
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
    accessToken = document.querySelector('input')!.value;
    const res         = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${endPos + 10}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (res.status !== 200) {
        localStorage.clear();
        alert('Wrong Access Token!');
        return;
    }

    localStorage.setItem('access_token', accessToken);
    setAccessToken();
    root?.removeChild(document.querySelector('#main-container')!);
    fetchData();
}

/**
* Display the access token input field.
*/
const displayLogin = async () => {
    const mainContainer    = document.createElement('div');
          mainContainer.id = 'main-container';

    const container    = document.createElement('div');
          container.id = 'container';

    const input             = document.createElement('input');
          input.placeholder = 'Spotify Access Token';
          input.type = 'password';
          input.inputMode = 'password';
    const btn               = document.createElement('button');
          btn.innerHTML     = 'Submit';
          btn.onclick       = submitToken;

    container.appendChild(input);
    container.appendChild(btn);
    mainContainer.appendChild(container);
    root?.appendChild(mainContainer);
}

/**
 * Pick a random musical emoji and prefix it to the website title.
 */
const updateWebsiteTitle = () => {
    document.title = `${emojis[Math.floor(Math.random() * emojis.length)]} Spotify Insight`;
}

/**
* Check if the user has an access token stored in the local storage.
* If yes, perform the fetch, if not, display the "login" screen.
*/
window.addEventListener('load', () => {
    if (!localStorage.getItem('access_token')) {
        displayLogin();
        return;
    }

    fetchData();
});

/**
* When the users performs a mouse scroll, check his location.
* If he has reached the end of the page and has tracks left, fetch the data.
*/
window.addEventListener('scroll', () => {
    if (isFetching) return;

    const currentPageHeight: number = window.innerHeight + window.scrollY;
    if (currentPageHeight >= document.body.offsetHeight) fetchData();
});
