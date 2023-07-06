// Constants
const root = document.querySelector('#root');

// Variables
let i: number = 0;
let j: number = 0;
let isFetching: boolean = false;
let accessToken = '';
let data: any[] = [];
let limitReached: boolean = false

// Functions
const fetchData = async () => {
    if (limitReached || isFetching) return;

    if (j >= 50) {
        let h1 = document.createElement('h1');
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

    while (count < 5) {
        res.push(data[i++]);
        count++;
    }

    for (const el of res) {
        const track = document.createElement('div');
        track.innerHTML = `
            <div style='height: 20em;'>${el['artists'][0]['name']}: ${el['name']}</div>
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
    root?.removeChild(document.querySelector('#mainContainer')!);
    fetchData();
}

// Event Listeners
window.addEventListener('load', () => {
    if (!localStorage.getItem('access_token')) {
        const mainContainer = document.createElement('div');
        mainContainer.style.display = 'flex';
        mainContainer.style.flexDirection = 'row';
        mainContainer.style.justifyContent = 'center';
        mainContainer.style.height = '80vh';
        mainContainer.id = 'mainContainer';

        const container = document.createElement('div');
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.width = '15%';
        container.style.justifyContent = 'center';

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
