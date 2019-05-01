"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require("fs");
const ytdl = require("ytdl-core");
const path_1 = require("path");
async function download(ids, socket) {
    if (isDownloading)
        throw new Error("Already downloading");
    if (!ids.length)
        return;
    do {
        if (canceled) {
            canceled = false;
            break;
        }
        let id = ids.shift();
        currentID = id;
        if (fs.existsSync(getVideoPath(id))) {
            socket.write(JSON.stringify({ type: "videodownloaded", id }));
        }
        else {
            try {
                await downloadOne(id, socket);
                socket.write(JSON.stringify({ type: "videodownloaded", id }));
            }
            catch (error) {
                console.error(error);
                socket.write(JSON.stringify({ error }));
            }
        }
    } while (ids.length);
    socket.write(JSON.stringify({ type: "downloadfinished" }));
}
exports.download = download;
function cancel(socket) {
    try {
        if (currentStream) {
            currentStream.destroy(new Error("Canceled"));
            fs.unlinkSync(getVideoPath(currentID));
            currentStream = null;
            isDownloading = false;
            canceled = true;
        }
    }
    catch (error) {
        console.error(error);
        socket.write(JSON.stringify({ error }));
    }
}
exports.cancel = cancel;
var currentStream = null;
var currentID = null;
var isDownloading = false;
var canceled = false;
function getVideoPath(id) {
    return path_1.join(__dirname, `../dist/videos/${id}.webm`);
}
async function downloadOne(id, socket) {
    return new Promise((resolve, reject) => {
        console.log("Started " + id);
        isDownloading = true;
        let progress = 0;
        currentStream = ytdl("http://www.youtube.com/watch?v=" + id)
            .on("progress", (chunk, cur, total) => {
            let curProgress = Math.round((cur / total) * 100);
            if (progress != curProgress) {
                progress = curProgress;
                socket.write(JSON.stringify({ type: "videoprogress", id, progress }));
            }
        })
            .pipe(fs.createWriteStream(getVideoPath(id)))
            .on("error", error => {
            console.log("Error " + id);
            currentStream = null;
            isDownloading = false;
            reject(error);
        })
            .on("close", () => {
            console.log("Finished " + id);
            currentStream = null;
            isDownloading = false;
            resolve();
        });
    });
}
