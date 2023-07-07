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
        displayFooter();
        return;
    }

    if (!accessToken.length) setAccessToken();
    if (startPos === endPos) data = [];

    if (!data.length) {
        isFetching = true;
        toggleSpinner();
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

    toggleSpinner();
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
   const tokenField  = document.querySelector('input');
   accessToken       = tokenField!.value;
   const res         = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${endPos + 10}`, {
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
    root?.removeChild(document.querySelector('.main-container')!);
    fetchData();
}

/**
* Display the access token input field.
*/
const displayLogin = async () => {
    const mainContainer = document.createElement('div');
          mainContainer.classList.add('main-container');

    const container = document.createElement('div');
          container.classList.add('container');

    const obtainToken = document.createElement('a');
    obtainToken.classList.add('obtain-token-link');
    obtainToken.href = 'https://developer.spotify.com/';
    obtainToken.innerHTML = 'Obtain token';
    obtainToken.target = '_blank';

    const input             = document.createElement('input');
          input.placeholder = 'Spotify Access Token';
          input.type = 'password';
          input.inputMode = 'password';
    const btn               = document.createElement('button');
          btn.innerHTML     = 'Submit';
          btn.onclick       = submitToken;

    container.append(obtainToken);
    container.appendChild(input);
    container.appendChild(btn);
    mainContainer.appendChild(container);
    root?.appendChild(mainContainer);
}

const displayFooter = () => {
    let footer: HTMLElement = document.createElement('footer');
    footer.style.textAlign = 'center';
    footer.innerHTML = 'That\'s all folks!';

    root?.appendChild(footer);
    limitReached = true;
}

/**
 * Pick a random musical emoji and prefix it to the website title.
 */
const updateWebsiteTitle = () => {
    document.title = `${emojis[Math.floor(Math.random() * emojis.length)]} Spotify Insight`;
}

const toggleSpinner = () => {
    let spinnerElement = document.querySelector('.spinner');

    console.log(spinnerElement);
    if (!spinnerElement) {
        spinnerElement = document.createElement('div');
        spinnerElement.innerHTML = `
            <div></div>
            <div></div>
            <div></div>
            <div></div>
        `;
        spinnerElement.classList.add('spinner');
        root?.appendChild(spinnerElement);
        return;
    }

    root?.removeChild(spinnerElement!);
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
