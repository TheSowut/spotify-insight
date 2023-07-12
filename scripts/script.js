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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var _this = this;
// Constants
var ROOT = document.querySelector('#root');
var FETCH_URL = 'https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=10&offset=';
var EMOJIS = [
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
var MAX_AMOUNT_OF_TRACKS = 50;
var SCREEN;
(function (SCREEN) {
    SCREEN[SCREEN["LOGIN"] = 0] = "LOGIN";
    SCREEN[SCREEN["SHOWCASE"] = 1] = "SHOWCASE";
})(SCREEN || (SCREEN = {}));
// Variables
var totalCount = 0;
var isFetching = false;
var accessToken = '';
var data = [];
var limitReached = false;
var trackPosition = 0;
var activeScreen;
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
                activeScreen = SCREEN.SHOWCASE;
                if (limitReached || isFetching)
                    return [2 /*return*/];
                if (totalCount >= MAX_AMOUNT_OF_TRACKS) {
                    displayFooter();
                    return [2 /*return*/];
                }
                if (!accessToken.length)
                    setAccessToken();
                return [4 /*yield*/, fetchData()];
            case 1:
                trackList = _a.sent();
                totalCount += trackList.length;
                for (_i = 0, trackList_1 = trackList; _i < trackList_1.length; _i++) {
                    track = trackList_1[_i];
                    trackElement = document.createElement('div');
                    trackElement.classList.add('track');
                    trackElement.innerHTML = "\n            <div>\n                <a href = \"" + track['uri'] + "\" target = \"_blank\">\n                    " + ++trackPosition + ". " + track['artists'][0]['name'] + " - " + track['name'] + "\n                </a>\n            </div>\n        ";
                    ROOT === null || ROOT === void 0 ? void 0 : ROOT.appendChild(trackElement);
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
                return [4 /*yield*/, fetch("" + FETCH_URL + totalCount, {
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
                ROOT === null || ROOT === void 0 ? void 0 : ROOT.removeChild(document.querySelector('.column-container'));
                return [4 /*yield*/, renderTracksView()];
            case 2:
                _a.sent();
                return [4 /*yield*/, renderLogoutButton()];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); };
/**
* Display the access token input field.
*/
var displayLogin = function () { return __awaiter(_this, void 0, void 0, function () {
    var rowContainer, columnContainer, container, input, playButton, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                activeScreen = SCREEN.LOGIN;
                rowContainer = document.createElement('div');
                rowContainer.classList.add('row-container');
                columnContainer = document.createElement('div');
                columnContainer.classList.add('column-container');
                container = document.createElement('div');
                container.classList.add('container');
                input = document.createElement('input');
                input.placeholder = 'Spotify Access Token';
                input.type = 'password';
                input.inputMode = 'password';
                playButton = document.createElement('img');
                playButton.classList.add('play-button');
                playButton.src = './images/play.png';
                _a = playButton;
                return [4 /*yield*/, submitToken];
            case 1:
                _a.onclick = _b.sent();
                // container.append(obtainToken);
                container.appendChild(input);
                container.appendChild(playButton);
                rowContainer.appendChild(container);
                columnContainer.appendChild(rowContainer);
                ROOT === null || ROOT === void 0 ? void 0 : ROOT.appendChild(columnContainer);
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
    footer.onclick = returnToTop;
    ROOT === null || ROOT === void 0 ? void 0 : ROOT.appendChild(footer);
    limitReached = true;
};
/**
 * Pick a random musical emoji and prefix it to the website title.
 */
var updateWebsiteTitle = function () {
    document.title = EMOJIS[Math.floor(Math.random() * EMOJIS.length)] + " Spotify Insight";
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
var fetchData = function () { return __awaiter(_this, void 0, void 0, function () {
    var response;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                toggleSpinner();
                return [4 /*yield*/, fetch("" + FETCH_URL + totalCount, {
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
                data = __spreadArray(__spreadArray([], data, true), [response.items], false);
                isFetching = false;
                toggleSpinner();
                return [2 /*return*/, response.items];
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
                return [4 /*yield*/, renderLogoutButton()];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
var renderLogoutButton = function () { return __awaiter(_this, void 0, void 0, function () {
    var logoutBtn, _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                logoutBtn = document.createElement('button');
                logoutBtn.classList.add('logout-button');
                _a = logoutBtn;
                return [4 /*yield*/, logout];
            case 1:
                _a.onclick = _b.sent();
                logoutBtn.innerHTML = "\u274C";
                ROOT === null || ROOT === void 0 ? void 0 : ROOT.appendChild(logoutBtn);
                return [2 /*return*/];
        }
    });
}); };
var logout = function () { return __awaiter(_this, void 0, void 0, function () {
    var tracks, logoutBtn, footer, _i, _a, track;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                tracks = document.querySelectorAll('.track');
                logoutBtn = document.querySelector('.logout-button');
                footer = document.querySelector('footer');
                for (_i = 0, _a = Array.from(tracks); _i < _a.length; _i++) {
                    track = _a[_i];
                    ROOT === null || ROOT === void 0 ? void 0 : ROOT.removeChild(track);
                }
                if (logoutBtn)
                    ROOT === null || ROOT === void 0 ? void 0 : ROOT.removeChild(logoutBtn);
                if (footer)
                    ROOT === null || ROOT === void 0 ? void 0 : ROOT.removeChild(footer);
                localStorage.clear();
                return [4 /*yield*/, displayLogin()];
            case 1:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); };
var returnToTop = function () {
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
};
/**
* When the users performs a mouse scroll, check his location.
*/
window.addEventListener('scroll', function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (activeScreen !== SCREEN.SHOWCASE)
                    return [2 /*return*/];
                return [4 /*yield*/, onScroll()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
/**
 * If the user is logged from a mobile device, listen for touchmove instead of scroll.
 */
window.addEventListener('touchmove', function () { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (activeScreen !== SCREEN.SHOWCASE)
                    return [2 /*return*/];
                return [4 /*yield*/, onScroll()];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
window.addEventListener('keydown', function (e) { return __awaiter(_this, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (activeScreen !== SCREEN.LOGIN)
                    return [2 /*return*/];
                if (!(e.code === 'Enter')) return [3 /*break*/, 2];
                return [4 /*yield*/, submitToken()];
            case 1:
                _a.sent();
                _a.label = 2;
            case 2: return [2 /*return*/];
        }
    });
}); });
