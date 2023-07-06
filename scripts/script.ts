// Constants
const root = document.querySelector('#root');

// Variables
let currentPage: number = 1;
let isFetching: boolean = false;
let hasMore: boolean = true;

// Functions
const fetchData = async () => {
    isFetching = true;

    const response = await fetch(`https://jsonplaceholder.typicode.com/posts?_page=${currentPage}`)
        .then(res => res.json());

    isFetching = false;
    if (!response.length) {
        hasMore = false;
        return;
    }

    for (const x of response) {
        const post = document.createElement('div');
        post.innerHTML = `
            <h2>${x.title}</h2>
            <p>${x.body}</p>
        `;

        root?.appendChild(post);
    }

    currentPage++;
}

// Event Listeners
window.addEventListener('load', () => fetchData());

window.addEventListener('scroll', () => {
    if (isFetching || !hasMore) return;

    const currentPageHeight: number = window.innerHeight + window.scrollY;
    if (currentPageHeight >= document.body.offsetHeight) fetchData();
});
