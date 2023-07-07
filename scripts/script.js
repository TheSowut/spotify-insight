var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var _this = this;
// Constants
var root = document.querySelector('#root');
var fetchUrl = 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=50';
var emojis = [
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
var startPos = 0;
var totalCount = 0;
var isFetching = false;
var accessToken = '';
var data = [];
var limitReached = false;
var trackPosition = 0;
/**
* If limit has been reached or a fetch request is being performed, exit.
* Otherwise validate user access token and perform the API call.
* @returns
*/
var renderTracksView = function () { return __awaiter(_this, void 0, void 0, function () {
    var trackList, _i, trackList_1, track, trackElement;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (limitReached || isFetching)
                    return [2 /*return*/];
                if (totalCount >= 50) {
                    displayFooter();
                    return [2 /*return*/];
                }
                if (!accessToken.length)
                    setAccessToken();
                if (!!data.length) return [3 /*break*/, 2];
                return [4 /*yield*/, fetchData()];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2:
                trackList = data.slice(startPos, startPos + 10);
                startPos += trackList.length;
                console.log({ startPos: startPos });
                console.log({ trackList: trackList });
                totalCount += trackList.length;
                for (_i = 0, trackList_1 = trackList; _i < trackList_1.length; _i++) {
                    track = trackList_1[_i];
                    trackElement = document.createElement('div');
                    trackElement.classList.add('track');
                    trackElement.innerHTML = "\n            <div>\n                <a href = \"" + track['uri'] + "\" target = \"_blank\">\n                    " + ++trackPosition + ". " + track['artists'][0]['name'] + " - " + track['name'] + "\n                </a>\n            </div>\n        ";
                    root === null || root === void 0 ? void 0 : root.appendChild(trackElement);
                }
                return [2 /*return*/];
        }
    });
}); };
var setAccessToken = function () {
    accessToken = localStorage.getItem('access_token');
};
/**
* After the user has submitted his access token, try to perform an API call
* to fetch his top tracks. If it fails, display an error message.
* @returns
*/
var submitToken = function () { return __awaiter(_this, void 0, void 0, function () {
    var tokenField, res;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                tokenField = document.querySelector('input');
                accessToken = tokenField.value;
                return [4 /*yield*/, fetch(fetchUrl, {
                        headers: {
                            Authorization: "Bearer " + accessToken
                        }
                    })];
            case 1:
                res = _a.sent();
                if (res.status !== 200) {
                    localStorage.clear();
                    alert('Invalid access token!');
                    tokenField.value = "";
                    return [2 /*return*/];
                }
                localStorage.setItem('access_token', accessToken);
                setAccessToken();
                root === null || root === void 0 ? void 0 : root.removeChild(document.querySelector('.main-container'));
                return [4 /*yield*/, renderTracksView()];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
* Display the access token input field.
*/
var displayLogin = function () { return __awaiter(_this, void 0, void 0, function () {
    var mainContainer, container, obtainToken, input, btn, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                mainContainer = document.createElement('div');
                mainContainer.classList.add('main-container');
                container = document.createElement('div');
                container.classList.add('container');
                obtainToken = document.createElement('a');
                obtainToken.classList.add('obtain-token-link');
                obtainToken.href = 'https://developer.spotify.com/';
                obtainToken.innerHTML = 'Obtain token';
                obtainToken.target = '_blank';
                input = document.createElement('input');
                input.placeholder = 'Spotify Access Token';
                input.type = 'password';
                input.inputMode = 'password';
                btn = document.createElement('button');
                btn.innerHTML = 'Submit';
                _a = btn;
                return [4 /*yield*/, submitToken];
            case 1:
                _a.onclick = _b.sent();
                container.append(obtainToken);
                container.appendChild(input);
                container.appendChild(btn);
                mainContainer.appendChild(container);
                root === null || root === void 0 ? void 0 : root.appendChild(mainContainer);
                return [2 /*return*/];
        }
    });
}); };
/**
 * If the user has reached the 50th record,
 * display a footer instead of new tracks.
 */
var displayFooter = function () {
    var footer = document.createElement('footer');
    footer.style.textAlign = 'center';
    footer.innerHTML = 'That\'s all folks!';
    root === null || root === void 0 ? void 0 : root.appendChild(footer);
    limitReached = true;
};
/**
 * Pick a random musical emoji and prefix it to the website title.
 */
var updateWebsiteTitle = function () {
    document.title = emojis[Math.floor(Math.random() * emojis.length)] + " Spotify Insight";
};
/**
 * If an API call is being made display a spinner.
 * @returns
 */
var toggleSpinner = function () {
    var spinnerElement = document.querySelector('.spinner');
    if (!spinnerElement) {
        isFetching = true;
        spinnerElement = document.createElement('div');
        spinnerElement.innerHTML = "\n            <div></div>\n            <div></div>\n            <div></div>\n            <div></div>\n        ";
        spinnerElement.classList.add('spinner');
        root === null || root === void 0 ? void 0 : root.appendChild(spinnerElement);
        return;
    }
    isFetching = false;
    root === null || root === void 0 ? void 0 : root.removeChild(spinnerElement);
};
/**
 * Fetch a list of top 50 tracks for the user.
 * @returns
 */
var fetchData = function () { return __awaiter(_this, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                toggleSpinner();
                return [4 /*yield*/, fetch(fetchUrl, {
                        headers: {
                            Authorization: "Bearer " + accessToken
                        }
                    }).then(function (res) { return res.json(); })];
            case 1:
                response = _a.sent();
                if (!response.error) return [3 /*break*/, 3];
                alert(response.error.message);
                localStorage.clear();
                toggleSpinner();
                return [4 /*yield*/, displayLogin()];
            case 2:
                _a.sent();
                return [2 /*return*/];
            case 3:
                updateWebsiteTitle();
                data = response.items;
                isFetching = false;
                toggleSpinner();
                return [2 /*return*/];
        }
    });
}); };
/**
 * If the user has reached the end of the page and has tracks left,
 * fetch the records and render them in the view.
 * @returns
 */
var onScroll = function () { return __awaiter(_this, void 0, void 0, function () {
    var currentPageHeight;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (isFetching)
                    return [2 /*return*/];
                currentPageHeight = window.innerHeight + window.scrollY;
                if (!(currentPageHeight >= document.body.offsetHeight)) return [3 /*break*/, 2];
                return [4 /*yield*/, renderTracksView()];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); };
/**
* Check if the user has an access token stored in the local storage.
* If yes, perform the fetch, if not, display the "login" screen.
*/
window.addEventListener('load', function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!!localStorage.getItem('access_token')) return [3 /*break*/, 2];
                return [4 /*yield*/, displayLogin()];
            case 1:
                _a.sent();
                return [2 /*return*/];
            case 2: return [4 /*yield*/, renderTracksView()];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
* When the users performs a mouse scroll, check his location.
*/
window.addEventListener('scroll', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, onScroll()];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); });
/**
 * If the user is logged from a mobile device, listen for touchmove instead of scroll.
 */
window.addEventListener('touchmove', function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
    switch (_a.label) {
        case 0: return [4 /*yield*/, onScroll()];
        case 1: return [2 /*return*/, _a.sent()];
    }
}); }); });
