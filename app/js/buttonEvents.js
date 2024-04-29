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
        if (event.target.classList.contains('open_link')) {
            let url = event.target.value;
            if (url == null) {
                if (event.target.innerText.toLowerCase().includes('nightlight')) {
                    url = 'https://nightlight.gg';
                }
                else if (event.target.innerText.toLowerCase().includes('boop')) {
                    url = 'https://boop.pro';
                }
            }

            console.log(`Opening Link: ${url}`);
            window.webFunctions.openLink(url);
        }
        else if (event.target.classList.contains('download-pack')) {
            if (event.target.innerText != 'Download') {
                return;
            }

            const variant_container_top = event.target.parentNode.getElementsByClassName('variants')[0];
            console.log(variant_container_top);
            const variant_container = variant_container_top.getElementsByClassName('container_varaiants')[0].getElementsByClassName('active')[0];
            const value = variant_container.childNodes[0].id.replace('variant-', '');

            console.log(`Downloading Pack: ${value}`);

            let data = packData;
            if (event.target.value != value) {
                data = variants_data
            }

            event.target.innerText = 'Downloading...';
            window.packFunctions.downloadPack(value, data)
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
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].innerText = 'Activate Pack';
                buttons[i].classList.remove('manage-button-pack-active');
            }

            if (!event.target.classList.contains('manage-button-pack-active')) {
                event.target.classList.add('manage-button-pack-active');
                event.target.innerText = 'Pack Active';
            }
        }

        else if (event.target.id.includes('reset-all-packs')) {
            console.log(`Resetting All Packs...`);
            window.packFunctions.resetAllPacks()

            const buttons = document.getElementsByClassName('manage-button-pack-active');
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].innerText = 'Activate Pack';
                buttons[i].classList.remove('manage-button-pack-active');
            }
        }

        else if (event.target.classList.contains('set-dbd-path')) {
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

        else if (event.target.id.includes('button_filter_shortcut_portraits')) {
            clearFilterShortcuts();
            enableFilterApplyButton();

            includes = 'portraits';
            event.target.classList.add('filter_shortcut_active');

            enableFilterResetButton();
        }

        else if (event.target.id.includes('button_filter_shortcut_perks')) {
            clearFilterShortcuts();
            enableFilterApplyButton();

            includes = 'perks';
            event.target.classList.add('filter_shortcut_active');

            enableFilterResetButton();
        }

        else if (event.target.id.includes('button_filter_shortcut_equippable')) {
            clearFilterShortcuts();
            enableFilterApplyButton();

            includes = 'perks,portraits,items,offerings,powers,addons';
            event.target.classList.add('filter_shortcut_active');

            enableFilterResetButton();
        }

        else if (event.target.classList.contains('button_variant')) {
            const button = event.target;
            const stats = event.target.parentNode.parentNode.getElementsByClassName('pack_stats')[0];
            const pack_content_display = event.target.parentNode.parentNode.getElementsByClassName('pack_content')[0];
            const pack_version_display = event.target.parentNode.parentNode.parentNode.getElementsByClassName('pack_version')[0];
            const variant_display = button.parentNode.getElementsByClassName('container_varaiants')[0];
            const variant_titles = variant_display.children;

            let index = variant_display.classList[2];
            const lenght = variant_display.children.length;


            if (button.classList.contains('button_variant_next')) {
                if (index >= (lenght - 1)) return;

                index++;

                variant_titles[index].classList.add('active');
                variant_titles[index - 1].classList.remove('active');

                variant_titles[index].childNodes[0].classList.add('description_variant_active');
                variant_titles[index - 1].childNodes[0].classList.remove('description_variant_active');


                if (index >= 2) {
                    variant_titles[index - 2].childNodes[0].classList.remove('description_variant_visible');
                }

                if (index < lenght - 1) {
                    variant_titles[index + 1].childNodes[0].classList.add('description_variant_visible');
                }

                variant_display.classList.remove(`${index - 1}`);
                variant_display.classList.add(`${index}`);
            }
            else {
                if (index <= 0) return;

                index--;

                variant_titles[index].classList.add('active');
                variant_titles[index + 1].classList.remove('active');

                variant_titles[index].childNodes[0].classList.add('description_variant_active');
                variant_titles[index + 1].childNodes[0].classList.remove('description_variant_active');


                if (index < lenght - 2) {
                    variant_titles[index + 2].childNodes[0].classList.remove('description_variant_visible');
                }

                if (index > 0) {
                    variant_titles[index - 1].childNodes[0].classList.add('description_variant_visible');
                }

                variant_display.classList.remove(`${index + 1}`);
                variant_display.classList.add(`${index}`);
            }

            const banner_element = variant_display.parentNode.parentNode.parentNode.childNodes[0];
            let id = '';
            let current_version = '';

            let game_version = '';
            let pack_version = '';
            let last_update = 'Today';
            let downloads = '';
            let has = '';

            const url = variant_titles[index].childNodes[0].id.replace('variant-', '');

            variants_data.forEach(variant => {
                if (variant.url == url) {
                    id = variant.id;
                    current_version = variant.current_version;
                    pack_version = variant.version;
                    game_version = variant.dbd_version;
                    last_update = variant.updated_at;
                    downloads = variant.downloads;

                    for (let i = 0; i < variant.has.length; i++) {
                        if (has == "")
                            has += `${formatText(variant.has[i])}`;
                        else
                            has += `, ${formatText(variant.has[i])}`
                    }
                }
            });

            if (id == '') {
                packData.forEach(pack => {
                    if (pack.url == url) {
                        id = pack.id;
                        current_version = pack.current_version;
                        pack_version = pack.version;
                        game_version = pack.dbd_version;
                        last_update = pack.updated_at;
                        downloads = pack.downloads;

                        for (let i = 0; i < pack.has.length; i++) {
                            if (has == "")
                                has += `${formatText(pack.has[i])}`;
                            else
                                has += `, ${formatText(pack.has[i])}`
                        }
                    }
                });
            }

            banner_element.src = `${window.directory.currentPath()}/cached_images/${id}_${current_version}/banner.png`;

            const count_days = formatRelativeTime(last_update);
            if (count_days > 0) {
                last_update = `${count_days} Days Ago`;
            }



            stats.getElementsByClassName('dbd_version')[0].innerHTML = game_version;
            stats.getElementsByClassName('last_updated')[0].innerHTML = last_update;
            stats.getElementsByClassName('downloads')[0].innerHTML = downloads;

            pack_content_display.innerText = has;
            pack_content_display.parentNode.title = has;
            pack_version_display.innerText = `v${pack_version}`
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

        else if (event.target.id == "dbd-path") {
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