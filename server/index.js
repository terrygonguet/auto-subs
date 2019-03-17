const express = require("express")
const setupApi = require("./setup-api")
const setupSocket = require("./setup-socket")
const CronJob = require("cron").CronJob
const fs = require("fs")
const http = require("http")

const MAX_SIZE = process.env.MAX_SIZE || 10 * 1024 ** 3
const MAX_NB_VIDS = process.env.MAX_NB_VIDS || 50

const app = express()
const server = http.createServer(app)
setupApi(app)
setupSocket(server)
app.use(express.static("dist"))

server.listen(process.env.PORT, () =>
  console.log("Server started on port " + process.env.PORT)
)

new CronJob(
  "0 */5 * * * *",
  () => {
    try {
      fs.mkdirSync("./dist/videos")
    } catch (e) {}

    try {
      let videos = fs.readdirSync("./dist/videos")
      let stats = videos.map(v => ({
        ...fs.statSync("./dist/videos/" + v),
        name: v,
      }))
      let size = stats.reduce((acc, cur) => acc + cur.size, 0)
      stats.sort((a, b) => (a.atimeMs < b.atimeMs ? -1 : 1))
      while (size > MAX_SIZE || videos.length > MAX_NB_VIDS) {
        let last = stats[0]
        fs.unlinkSync("./dist/videos/" + last.name)
        stats.splice(0, 1)
        videos.splice(videos.indexOf(last.name), 1)
        size = stats.reduce((acc, cur) => acc + cur.size, 0)
      }
      stats.forEach(s => {
        if (s.size < 1024 * 1024) {
          fs.unlinkSync("./dist/videos/" + s.name)
        }
      })
    } catch (err) {
      console.error(err)
    }
  },
  null,
  true,
  null,
  null,
  true
)
