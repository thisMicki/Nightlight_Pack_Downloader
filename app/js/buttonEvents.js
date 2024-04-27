const webviewPage = document.getElementById('webview-container-page');
const managePacksPage = document.getElementById('manage-packs-page');
const optionsPage = document.getElementById('options-page');

let buttons = document.getElementsByClassName("button_page_nav");

let packs_per_page = 12;
let current_page = 1;
let total_pages = -1;
let total_packs = -1;

/* Filter varaibles */
const sort_by_default = 'downloads';
let sort_by = 'downloads';

let author = '';
let includes = '';
let search = '';

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', function (event) {
        if (event.target.classList.contains('download-pack')) {
            if (event.target.innerText != 'Download') {
                return;
            }
            console.log(`Downloading Pack: ${event.target.value}`);
            const value = event.target.value;
            event.target.innerText = 'Downloading...';
            window.packFunctions.downloadPack(value, packData)
                .then(() => {
                    event.target.innerText = 'Download finished!';
                    createPackTiles_Manage();
                })
        }

        else if (event.target.classList.contains('delete-pack')) {
            const value = event.target.value;
            console.log(`Deleting Pack: ${value}`);
            window.packFunctions.deletePack(value)
                .then(() => {
                    createPackTiles_Manage();
                })
        }

        else if (event.target.classList.contains('toggle-pack')) {
            const value = event.target.value;
            console.log(`Activating Pack: ${value}`);
            window.packFunctions.activatePack(value);

            const buttons = document.getElementsByClassName('manage-button-pack-active');
            for(let i = 0; i < buttons.length; i++) {
                buttons[i].innerText = 'Activate Pack';
                buttons[i].classList.remove('manage-button-pack-active');
            }

            if (!event.target.classList.contains('manage-button-pack-active')) {
                event.target.classList.add('manage-button-pack-active');
                event.target.innerText = 'Pack Active';
            }
        }

        else if(event.target.id.includes('reset-all-packs')) {
            console.log(`Resetting All Packs...`);
            window.packFunctions.resetAllPacks()

            const buttons = document.getElementsByClassName('manage-button-pack-active');
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].innerText = 'Activate Pack';
                buttons[i].classList.remove('manage-button-pack-active');
            }
        }

        else if(event.target.classList.contains('set-dbd-path')) {
            console.log(`Setting DBD Path...`);
            window.options.setDBDPathFromDialog()
                .then(() => {
                    console.log(`DBD Path set!`);
                    setOptionValuesToElements();
                })
        }

        else if (event.target.id.includes('button_page_nav')) {
            console.log(`Prev Page: ${current_page}`);
            if (event.target.id.includes('button_page_nav_0')) { // First page Button
                current_page = 1;
                enablePageNavButtons();
                disablePageNavButtonsPrev();
            }
            else if (event.target.id.includes('button_page_nav_1')) { // Previous Page Button
                current_page--;
                enablePageNavButtons();
                if (current_page <= 1) {
                    disablePageNavButtonsPrev();
                }
            }
            else if (event.target.id.includes('button_page_nav_2')) { // Next Page Button
                enablePageNavButtons();
                if (current_page < total_pages) {
                    current_page++;
                }
                if (current_page >= total_pages) {
                    disablePageNavButtonsNext();
                }
            }
            else if (event.target.id.includes('button_page_nav_3')) { // Last Page Button
                current_page = total_pages;
                enablePageNavButtons();
                disablePageNavButtonsNext();
            }

            console.log(`Page: ${current_page}`);

            loadPackTiles();
            scrollToTop();
        }

        else if (event.target.id.includes('button_filter_reset')) {
            disableFilterResetButton();
            disableFilterApplyButton();

            sort_by = sort_by_default;
            document.getElementById('filter_sort_by').value = sort_by_default;

            author = '';
            document.getElementById('filter_authors').value = '';

            search = '';
            document.getElementById('filter_search').value = '';

            includes = '';
            clearFilterShortcuts();

            loadPackTiles();
        }

        else if (event.target.id.includes('button_filter_apply')) {
            current_page = 1;
            disableFilterApplyButton();
            loadPackTiles();
        }

        else if (event.target.id.includes('button_filter_reload')) {
            loadPackTiles();
        }

        else if(event.target.id.includes('button_filter_shortcut_portraits')) {
            clearFilterShortcuts();
            enableFilterApplyButton();

            includes = 'portraits';
            event.target.classList.add('filter_shortcut_active');

            enableFilterResetButton();
        }

        else if(event.target.id.includes('button_filter_shortcut_perks')) {
            clearFilterShortcuts();
            enableFilterApplyButton();

            includes = 'perks';
            event.target.classList.add('filter_shortcut_active');

            enableFilterResetButton();
        }

        else if(event.target.id.includes('button_filter_shortcut_equippable')) {
            clearFilterShortcuts();
            enableFilterApplyButton();

            includes = 'perks,portraits,items,offerings,powers,addons';
            event.target.classList.add('filter_shortcut_active');

            enableFilterResetButton();
        }
    });

    document.addEventListener('change', function (event) {
        if (event.target.id == "packs_per_page") {
            const value = event.target.value;
            packs_per_page = value;

            if (current_page > getTotalPageNum(value, total_packs)) {
                current_page = getTotalPageNum(value, total_packs);
            }
            loadPackTiles();
        }

        else if (event.target.id == "input_page_nav") {
            const value = event.target.value;
            current_page = value;

            if (current_page <= 1) {
                current_page = 1;
            }
            if (current_page >= total_pages) {
                current_page = total_pages;
            }

            enablePageNavButtons();
            if (current_page == 1) {
                disablePageNavButtonsPrev();
            }
            if (current_page == total_pages) {
                disablePageNavButtonsNext();
            }

            loadPackTiles();
            scrollToTop();
        }

        else if (event.target.id == "filter_sort_by") {
            const value = event.target.value;
            sort_by = value;
            enableFilterResetButton();
            enableFilterApplyButton();
        }

        else if (event.target.id == "filter_authors") {
            const value = event.target.value;
            author = value;
            enableFilterResetButton();
            enableFilterApplyButton();
        }

        else if(event.target.id == "dbd-path") {
            const value = event.target.value;
            window.options.setDBDPath(value);
        }
    });
    document.addEventListener('input', function (event) {
        if (event.target.id == "filter_search") {
            const value = event.target.value;
            search = value;
            enableFilterResetButton();
            enableFilterApplyButton();
        }
    })
    document.addEventListener('submit', function (event) {
        event.preventDefault(); // no forms needed
    })
});

document.getElementById("nightlight").addEventListener("click", () => {
    webviewPage.style.display = "block";
    managePacksPage.style.display = "none";
    optionsPage.style.display = "none";
});

document.getElementById("manage-packs").addEventListener("click", () => {
    webviewPage.style.display = "none";
    managePacksPage.style.display = "block";
    optionsPage.style.display = "none";
});

document.getElementById("options").addEventListener("click", () => {
    webviewPage.style.display = "none";
    managePacksPage.style.display = "none";
    optionsPage.style.display = "block";
});

function disablePageNavButtonsPrev() {
    buttons[0].disabled = true;
    buttons[1].disabled = true;
}

function disablePageNavButtonsNext() {
    buttons[2].disabled = true;
    buttons[3].disabled = true;
}

function enablePageNavButtons() {
    buttons[0].disabled = false;
    buttons[1].disabled = false;
    buttons[2].disabled = false;
    buttons[3].disabled = false;
}

function enableFilterResetButton() {
    const button = document.getElementById('button_filter_reset');
    button.className = button.className.replace("disabled", "");
}

function disableFilterResetButton() {
    const button = document.getElementById('button_filter_reset');
    button.className += " disabled";
}

function enableFilterApplyButton() {
    const button = document.getElementById('button_filter_apply');
    button.className = button.className.replace("disabled", "");
}

function disableFilterApplyButton() {
    const button = document.getElementById('button_filter_apply');
    button.className += " disabled";
}

function clearFilterShortcuts() {
    document.getElementById('button_filter_shortcut_portraits').classList.remove('filter_shortcut_active');
    document.getElementById('button_filter_shortcut_perks').classList.remove('filter_shortcut_active');
    document.getElementById('button_filter_shortcut_equippable').classList.remove('filter_shortcut_active');
}

function scrollToTop() {
    webviewPage.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}