const { getPathFromDialog, fileExists } = require('./fileFunctions');
const fs = require('fs');
const { app } = require('electron');

let dbd_game_path = '';

let currentDirectory = __dirname;
currentDirectory = currentDirectory.replace('resources/app.asar', '');
currentDirectory += '/data'
console.log('Dir: ' + currentDirectory);

loadOptions();

function loadOptions() {
    if (fileExists(`${currentDirectory}/options.json`)) {
        let options = JSON.parse(fs.readFileSync(`${currentDirectory}/options.json`, 'utf8'));
        dbd_game_path = options.dbd_game_path;
    }
}

async function getDBDPath() {
    return new Promise((resolve, reject) => {
        resolve(dbd_game_path);
    })
}

async function setDBDPathFromDialog() {
    console.log(`Setting DBD Path...`);
    const path = await getPathFromDialog();
    if (path) {
        dbd_game_path = path;
        console.log(`DBD Game Path: ${dbd_game_path}`);
        const json_string = {
            "dbd_game_path": dbd_game_path
        }
        fs.writeFileSync(`${currentDirectory}/options.json`, JSON.stringify(json_string));
    }
}

async function setDBDPath(event, value) {
    console.log(`Setting DBD Path...`);
    if(fileExists(value)) {
        dbd_game_path = value;
        console.log(`DBD Game Path: ${dbd_game_path}`);
        const json_string = {
            "dbd_game_path": dbd_game_path
        }
        fs.writeFileSync(`${currentDirectory}/options.json`, JSON.stringify(json_string));
    }
}

module.exports = {
    setDBDPath,
    setDBDPathFromDialog,
    getDBDPath,
    dbd_game_path,
    currentDirectory
}