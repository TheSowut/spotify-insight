// Constants
const root = document.querySelector('#root');

// Variables
let i: number = 0;
let j: number = 0;
let isFetching: boolean = false;
let accessToken = '';
let data: any[] = [];
let limitReached: boolean = false;
let trackPosition: number = 0;

// Functions
const fetchData = async () => {
    if (limitReached || isFetching) return;

    if (j >= 50) {
        let h1 = document.createElement('h1');
        h1.style.textAlign = 'center';
        h1.innerHTML = 'That\s all folks!';
        root?.appendChild(h1);
        limitReached = true;
        return;
    }

    if (!accessToken.length) {
        setAccessToken();
    }

    if (i === j) data = [];

    if (!data.length) {
        isFetching = true;
        const response = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${j + 10}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        }).then(res => res.json());

        data = response.items;
        j = data.length;
        isFetching = false;
    }

    let count = 0;
    let res = [];

    while (count < 10) {
        res.push(data[i++]);
        count++;
    }

    for (const el of res) {
        const track = document.createElement('div');
        track.style.marginTop = '5%';
        track.style.padding = '2%;';
        track.style.textAlign = 'center';
        track.style.fontSize = '2.5em';
        track.style.background = '#191414';
        track.style.width = '90%';
        track.style.display = 'flex';
        track.style.flexDirection = 'row';
        track.style.justifyContent = 'center';
        track.innerHTML = `
            <div>${++trackPosition} - ${el['artists'][0]['name']}: ${el['name']}</div>
        `;
        root?.appendChild(track);
    }
}

const setAccessToken = () => {
    accessToken = localStorage.getItem('access_token')!;
}

const submitToken = async () => {
    accessToken = document.querySelector('input')!.value;
    const res = await fetch(`https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=${j + 10}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`
        }
    });

    if (res.status !== 200) {
        alert('Wrong Access Token!');
        return;
    }

    localStorage.setItem('access_token', accessToken);
    setAccessToken();
    root?.removeChild(document.querySelector('#main-container')!);
    fetchData();
}

// Event Listeners
window.addEventListener('load', () => {
    if (!localStorage.getItem('access_token')) {
        const mainContainer = document.createElement('div');
        mainContainer.id = 'main-container';

        const container = document.createElement('div');
        container.id = 'container';

        const input = document.createElement('input');
        input.placeholder = 'Spotify Access Token';
        const btn = document.createElement('button');
        btn.innerHTML = 'Submit';
        btn.onclick = submitToken;

        container.appendChild(input);
        container.appendChild(btn);
        mainContainer.appendChild(container);
        root?.appendChild(mainContainer);
        return;
    }

    fetchData();
});

window.addEventListener('scroll', () => {
    if (isFetching) return;

    const currentPageHeight: number = window.innerHeight + window.scrollY;
    if (currentPageHeight >= document.body.offsetHeight) fetchData();
});
