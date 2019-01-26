"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const node_fetch_1 = require("node-fetch");
const cheerio_1 = require("cheerio");
const ytdl = require("ytdl-core");
class YT {
    constructor() {
        this.videos = {};
        this.cookie = "";
        this.filepath = "state.json";
        let data = JSON.parse(fs_1.readFileSync(this.filepath).toString());
        this.videos = data.videos;
        this.cookie = data.cookie;
    }
    update() {
        return node_fetch_1.default("https://www.youtube.com/playlist?list=WL&disable_polymer=true", {
            headers: {
                cookie: this.cookie
            }
        })
            .then(res => res.text())
            .then(html => {
            let $ = cheerio_1.load(html);
            let urls = $(".pl-video-title-link")
                .toArray()
                .map(el => el.attribs.href)
                .map(href => "https://youtube.com/" + href);
            if (!urls.length)
                throw "No vids to dl or invalid cookies";
            let fns = urls.map(url => {
                return () => {
                    return this.dlOne(url);
                };
            });
            let first = fns.shift();
            if (first) {
                let dlChain = first();
                for (const fn of fns)
                    dlChain = dlChain.then(fn);
                return dlChain;
            }
            else
                return "suce";
        });
    }
    remove(id) {
        if (id === "all") {
            let files = fs_1.readdirSync("static/videos");
            for (const file of files) {
                fs_1.unlinkSync("static/videos/" + file);
            }
            this.videos = {};
        }
        else {
            delete this.videos[id];
            fs_1.unlinkSync(`static/videos/${id}.webm`);
        }
        return this.videos;
    }
    dlOne(url) {
        return ytdl.getBasicInfo(url).then(info => {
            return new Promise((resolve, reject) => {
                if (this.videos[info.video_id] && this.videos[info.video_id].downloaded)
                    return resolve();
                else
                    this.videos[info.video_id] = {
                        name: info.title,
                        downloaded: false,
                        progress: 0
                    };
                let video = this.videos[info.video_id];
                let stream = fs_1.createWriteStream(`static/videos/${info.video_id}.webm`);
                ytdl(url)
                    .on("progress", (chunk, cur, total) => {
                    let progress = Math.round((cur / total) * 100);
                    if (progress != video.progress) {
                        video.progress = progress;
                    }
                })
                    .pipe(stream)
                    .on("error", reject)
                    .on("close", () => {
                    video.progress = 100;
                    video.downloaded = true;
                    this.saveState();
                    resolve();
                });
            });
        }).catch(console.error);
    }
    saveState() {
        let data = {
            videos: this.videos,
            cookie: this.cookie
        };
        fs_1.writeFileSync(this.filepath, JSON.stringify(data, undefined, 2));
    }
}
exports.default = YT;
//# sourceMappingURL=yt.js.map