const information = document.getElementById('info');
information.innerText = `App (v${versions.app()})\nChrome (v${versions.chrome()})\nNode.js (v${versions.node()})\nElectron (v${versions.electron()})`;

/* Nightlight Page Setup */
const webview = document.getElementById('webview-container-page');
webview.style.display = 'block';
setWebEmbed();

/* Manage Packs Page Setup */
// removeManageNavigation();
createPackTiles_Manage();
createPackOrderTiles_Manage();

window.options.getCheckForPackUpdateOnStartup()
    .then((check) => {
        console.log(`Check for Pack Updates? ${check}`)
        if (check) {
            checkForPackUpdates();
        }
    });

/* Options Page Setup */
setOptionValuesToElements();

function setWebEmbed() {
    fixStyling();

    addFilters();
    addNavigation();

    loadPackTiles();
}

function loadPackTiles() {
    console.log("Loading Pack Tiles...");
    createPackTiles(current_page, packs_per_page, sort_by, search, author, dbd_version, includes, include_mode);
}

function createPackTiles(page, per_page, sort_by, search, author, dbd_version, includes, include_mode) {
    console.log("Creating Pack Tiles...")
    if(page <= 0) {
        page = 1;
    }
    if (author != '') {
        author = `&author=${author}`;
    }
    if (search != '') {
        search = `&search=${search}`;
    }
    if (dbd_version != '') {
        dbd_version = `&version=${dbd_version}`
    }

    console.log(`${search}, ${dbd_version}`);

    window.webFunctions.httpGet(`https://nightlight.gg/api/v1/packs?page=${page}&per_page=${per_page}&sort_by=${sort_by}${author}${search}${dbd_version}&includes=${includes}&include_mode=${include_mode}`)
        .then(data => {
            setPackTiles(data);
        })
}