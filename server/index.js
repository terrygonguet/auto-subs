const express = require("express")
const setupApi = require("./setup-api")
const setupSocket = require("./setup-socket")
const CronJob = require("cron").CronJob
const fs = require("fs")
const http = require("http")

const MAX_AGE = process.env.MAX_AGE || 630000000
const app = express()
const server = http.createServer(app)
setupApi(app)
setupSocket(server)
app.use(express.static("dist"))

app.get("/*", (req, res) => {
  res.redirect("/")
})

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
      stats.forEach(s => {
        if (Date.now() - s.birthtimeMs > MAX_AGE) {
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
