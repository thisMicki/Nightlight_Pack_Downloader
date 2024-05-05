function createPackOrderTiles_Manage() {
    const manage_pack_order_view = document.getElementById('pack-order-container-outer');
    manage_pack_order_view.innerHTML = '';
    window.packFunctions.getActivePacks()
        .then(data => {
            let installed_packs = data;
            console.log("Creating Pack Order Tiles for Manage Packs...");
            console.log(installed_packs);
            installed_packs.forEach(url => {
                setPackOrderTiles_Manage(url);
            });
        });
}

function addPackOrderTile_Manage(url) {
    setPackOrderTiles_Manage(url);
}

function removePackOrderTile_Manage(url) {
    const manage_pack_order_view = document.getElementById('pack-order-container-outer');
    const pack_order_tiles = manage_pack_order_view.childNodes;

    console.log(pack_order_tiles);

    for (let i = 0; i < pack_order_tiles.length; i++) {
        if (pack_order_tiles[i].id === `order-tile-${url}`) {
            manage_pack_order_view.removeChild(pack_order_tiles[i]);
            break;
        }
    }

    setOrderTileDropdown();
}

function setPackOrderTiles_Manage(url) {
    const manage_pack_order_view = document.getElementById('pack-order-container-outer');

    let pack_data;
    window.packFunctions.getPackMetaData(url)
        .then(data => {
            pack_data = data;

            let packContent = "";
            for (let i = 0; i < pack_data.has.length; i++) {
                if (packContent == "")
                    packContent += `${formatText(pack_data.has[i])}`;
                else
                    packContent += `, ${formatText(pack_data.has[i])}`
            }

            const tile = `
                <div class="pack-order"">
                    <div class="pack-order-grab">
                        <svg clip-rule="evenodd" fill-rule="evenodd" stroke-linejoin="round" stroke-miterlimit="2"
                        viewBox="0 0 24 24" width="24px" height="28px" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="m21 15.75c0-.414-.336-.75-.75-.75h-16.5c-.414 0-.75.336-.75.75s.336.75.75.75h16.5c.414 0 .75-.336.75-.75zm0-4c0-.414-.336-.75-.75-.75h-16.5c-.414 0-.75.336-.75.75s.336.75.75.75h16.5c.414 0 .75-.336.75-.75zm0-4c0-.414-.336-.75-.75-.75h-16.5c-.414 0-.75.336-.75.75s.336.75.75.75h16.5c.414 0 .75-.336.75-.75z"
                            fill-rule="nonzero" />
                        </svg>
                    </div>
                    <div class="pack-order-image-container">
                        <img class="pack-order-image"
                        src="${window.directory.currentPath()}/packfiles/${pack_data.url}/banner.png"
                        alt="Pack Banner for ${pack_data.url}">
                    </div>
                    <div class="pack-order-info">
                        <h2>${pack_data.title}</h2>
                        <div class="pack-order-info-content">
                        <svg class="pack-order-info-content-icon" focusable="false" data-prefix="fas" data-icon="box-open"
                            role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" width="18px" height="18px"
                            class="svg-inline--fa fa-box-open">
                            <path fill="currentColor"
                            d="M58.9 42.1c3-6.1 9.6-9.6 16.3-8.7L320 64 564.8 33.4c6.7-.8 13.3 2.7 16.3 8.7l41.7 83.4c9 17.9-.6 39.6-19.8 45.1L439.6 217.3c-13.9 4-28.8-1.9-36.2-14.3L320 64 236.6 203c-7.4 12.4-22.3 18.3-36.2 14.3L37.1 170.6c-19.3-5.5-28.8-27.2-19.8-45.1L58.9 42.1zM321.1 128l54.9 91.4c14.9 24.8 44.6 36.6 72.5 28.6L576 211.6v167c0 22-15 41.2-36.4 46.6l-204.1 51c-10.2 2.6-20.9 2.6-31 0l-204.1-51C79 419.7 64 400.5 64 378.5v-167L191.6 248c27.8 8 57.6-3.8 72.5-28.6L318.9 128h2.2z">
                            </path>
                        </svg>
                        <label class="pack-order-info-content-label">${packContent}</label>
                        </div>
                    </div>
                    <div class="pack-order-dropdown-container">
                        <select class="pack-order-dropdown" name="a" id="a"></select>
                    </div>
                </div>`;

            const packTile = document.createElement('div');
            packTile.innerHTML = tile;
            packTile.classList.add('pack-order-container');
            packTile.id = `order-tile-${url}`;
            packTile.draggable = true;

            manage_pack_order_view.appendChild(packTile);
            console.log(`Added ordering tile for ${pack_data.url}`);

            setOrderTileDropdown();
        });
}

function setOrderTileDropdown() {
    const elements = document.getElementsByClassName('pack-order-container');

    let dropdown_options = '';
    for (let i = 0; i < elements.length; i++) {
        dropdown_options += `<option value="${i}">${i + 1}</option>`;
    }

    for (let i = 0; i < elements.length; i++) {
        const dropdown = elements[i].getElementsByClassName('pack-order-dropdown')[0];
        dropdown.innerHTML = dropdown_options;
        dropdown.value = i;
    }
}