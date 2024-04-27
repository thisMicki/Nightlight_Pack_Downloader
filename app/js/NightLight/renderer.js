const information = document.getElementById('info');
information.innerText = `Chrome (v${versions.chrome()})\nNode.js (v${versions.node()})\nElectron (v${versions.electron()})`;
setWebEmbed();

function setWebEmbed() {
    fixStyling();

    addFilters();
    addNavigation();

    loadPackTiles();
}

function loadPackTiles() {
    createPackTiles(current_page, packs_per_page, sort_by, author, search, '', 'any');
}

function createPackTiles(page, per_page, sort_by, author, search, includes, include_mode) {
    console.log("Creating Pack Tiles...")
    if (author != '') {
        author = `&author=${author}`;
    }
    if (search != '') {
        search = `&search=${search}`;
    }

    window.webFunctions.httpGet(`https://nightlight.gg/api/v1/packs?page=${page}&per_page=${per_page}&sort_by=${sort_by}${author}${search}&includes=${includes}&include_mode=${include_mode}`)
        .then(data => {
            setPackTiles(data);
        })
}