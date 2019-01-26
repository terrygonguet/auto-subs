import {
  readFileSync,
  writeFileSync,
  createWriteStream,
  unlinkSync,
  readdirSync
} from "fs";
import fetch from "node-fetch";
import { load } from "cheerio";
import * as ytdl from "ytdl-core";
import * as filenamify from "filenamify";
import * as readline from "readline";

type State = {
  videos: { [id: string]: Video };
  cookie: string;
};

type Video = {
  name: string;
  downloaded: boolean;
  progress: number;
};

export default class YT {
  videos: { [id: string]: Video } = {};
  cookie: string = "";
  filepath: string = "state.json";

  constructor() {
    let data: State = JSON.parse(readFileSync(this.filepath).toString());
    this.videos = data.videos;
    this.cookie = data.cookie;
  }

  update() {
    return fetch(
      "https://www.youtube.com/playlist?list=WL&disable_polymer=true",
      {
        headers: {
          cookie: this.cookie
        }
      }
    )
      .then(res => res.text())
      .then(html => {
        let $ = load(html);
        let urls = $(".pl-video-title-link")
          .toArray()
          .map(el => el.attribs.href)
          .map(href => "https://youtube.com/" + href);
        if (!urls.length) throw "No vids to dl or invalid cookies";

        let fns = urls.map(url => {
          return () => {
            return this.dlOne(url);
          };
        });
        let first = fns.shift();
        if (first) {
          let dlChain = first();
          for (const fn of fns) dlChain = dlChain.then(fn);
          return dlChain;
        } else return "suce";
      });
  }

  remove(id: string) {
    if (id === "all") {
      let files = readdirSync("static/videos");
      for (const file of files) {
        unlinkSync("static/videos/" + file);
      }
      this.videos = {};
    } else {
      delete this.videos[id];
      unlinkSync(`static/videos/${id}.webm`);
    }
    return this.videos;
  }

  dlOne(url: string) {
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

        let stream = createWriteStream(`static/videos/${info.video_id}.webm`);
        ytdl(url)
          .on("progress", (chunk: number, cur: number, total: number) => {
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
    let data: State = {
      videos: this.videos,
      cookie: this.cookie
    };
    writeFileSync(this.filepath, JSON.stringify(data, undefined, 2));
  }
}
