const { Buffer } = window.electron;

function downloadPack(url, button) {
    const downloadURL = `https://nightlight.gg/packs/${url}/download`;
    const directoryPath = `${directory.currentPath()}/packfiles/${url}`;
    const fileName = `${url}.zip`
    downloadFileProgress(downloadURL, directoryPath, fileName, button)
        .then(() => {

            /* Copy data from cache to pack path */
            let id;
            let current_version;

            let username = [];
            let user_id = [];
            let avatar_id = [];
            let avatar_path = [];

            packData.forEach(pack => {
                if (pack.url == url) {
                    id = pack.id;
                    current_version = pack.current_version;

                    const creators = pack.creators;
                    creators.forEach(creator => {

                        if (creator.user != null) {
                            user_id.push(creator.user.user_id);
                            avatar_id.push(creator.user.avatar_id);
                            username.push(creator.username);

                            let creatorAvatar = `${directory.currentPath()}/cached_images/placeholder/avatar.png`;
                            if (fileExists(`${directory.currentPath()}/cached_images/${creator.user.user_id}_${creator.user.avatar_id}/avatar.png`)) {
                                creatorAvatar = `${directory.currentPath()}/cached_images/${creator.user.user_id}_${creator.user.avatar_id}/avatar.png`;
                            }
                            fs.copyFile(`${creatorAvatar}`, `${directoryPath}/${creator.user.user_id}_avatar.png`, (err) => {
                                console.log(`Copied ${creatorAvatar} to ${directoryPath}/${creator.user.user_id}_avatar.png`);
                                if (err) {
                                    console.warn("Error copying file:", err);
                                }
                            })
                            avatar_path.push(creatorAvatar);
                        }
                        else {
                            user_id.push(null);
                            avatar_id.push(null);
                            username.push(creator.username);
                        }
                    });
                }
            });

            const users = [];
            for (let i = 0; i < user_id.length; i++) {
                users.push({
                    user_id: user_id[i],
                    username: username[i],
                    avatar_id: avatar_id[i]
                });
            }

            const jsonData = {
                id: id,
                current_version: current_version,
                user: users
            }

            fs.writeFileSync(`${directoryPath}/metadata.json`, JSON.stringify(jsonData));

            const cachePath = `${directory.currentPath()}/cached_images/${id}_${current_version}`;
            fs.copyFile(`${cachePath}/banner.png`, `${directoryPath}/banner.png`, (err) => {
                if (err) {
                    console.warn("Error copying file:", err);
                }
            })

        });
}

function fileExists(filePath) {
    try {
        fs.accessSync(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        return false;
    }
}

function httpGet(url, callback) {
    console.log(`Requesting ${url}`);
    var xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", url, true);
    xmlHttp.setRequestHeader(`Content-Security-Policy`, `connect-src 'https://nightlight.gg/*';`);

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            callback(xmlHttp.responseText);
        }
    };

    xmlHttp.send(null);
}

async function downloadFile(downloadURL, directoryPath, fileName) {
    console.log(`Downloading ${fileName}`);
    try {
        const response = await fetch(downloadURL);
        const arrayBuffer = await response.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);
        const buffer = new Buffer(uint8Array);

        if (!fs.existsSync(`${directoryPath}/`)) {
            console.log(`Directory "${directoryPath}" does not exist. Creating...`);
            fs.mkdirSync(`${directoryPath}/`, { recursive: true });
        }

        const filePath = `${directoryPath}/${fileName}`;
        fs.writeFileSync(filePath, buffer);

        console.log(`File "${fileName}" downloaded successfully into ${directoryPath}`);
        return filePath;
    } catch (error) {
        console.error('Error downloading file:', error);
        return null;
    }
}

async function downloadFileProgress(downloadURL, directoryPath, fileName, button) {
    console.log(`Downloading ${fileName}`);
    try {
        const response = await fetch(downloadURL);
        const contentLength = parseInt(response.headers.get('Content-Length'), 10);
        let downloadedBytes = 0;

        const buffers = [];

        const reader = response.body.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffers.push(value);
            downloadedBytes += value.length;

            // Calculate progress percentage
            const progress = Math.floor((downloadedBytes / contentLength) * 100);

            // Update progress bar (if available)
            updateProgressBar(progress, button);
        }

        // Concatenate all the buffers into a single buffer
        const concatenatedBuffer = concatBuffers(buffers);

        // Create the directory if it doesn't exist
        if (!fs.existsSync(`${directoryPath}/`)) {
            console.log(`Directory "${directoryPath}" does not exist. Creating...`);
            fs.mkdirSync(`${directoryPath}/`, { recursive: true });
        }

        // Write the concatenated buffer to the file
        fs.writeFileSync(`${directoryPath}/${fileName}`, concatenatedBuffer);

        console.log(`File "${fileName}" downloaded successfully into ${directoryPath}`);
    } catch (error) {
        console.error('Error downloading file:', error);
    }
}

// Function to concatenate an array of buffers into a single buffer
function concatBuffers(buffers) {
    // Calculate the total length of all buffers
    const totalLength = buffers.reduce((acc, buffer) => acc + buffer.length, 0);

    // Create a new Uint8Array with the combined length
    const concatenatedBuffer = new Uint8Array(totalLength);

    // Copy the contents of each buffer into the new buffer
    let offset = 0;
    for (const buffer of buffers) {
        concatenatedBuffer.set(buffer, offset);
        offset += buffer.length;
    }

    return concatenatedBuffer;
}

function updateProgressBar(progress, button) {
    // Update the progress bar element
    button.innerText = `${progress}%`;
    if (progress === 100) {
        button.innerText = `Done!`;
    }
}