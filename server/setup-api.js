const fetch = require("node-fetch")
const ytdl = require("ytdl-core")
const fs = require("fs")

let currentStream = null

module.exports = function(app) {
  app.get("/api/proxy", async (req, res) => {
    try {
      let url = req.query.url
      let Cookie = req.query.cookie
      let result = await fetch(url, { headers: { Cookie } })
      res.send(await result.text())
    } catch (err) {
      console.error(err)
      res.status(500).end()
    }
  })

  app.get("/api/download", (req, res) => {
    let id = req.query.id
    try {
      fs.mkdirSync("./dist/videos")
    } catch (err) {}

    try {
      if (fs.existsSync(`./dist/videos/${id}.webm`)) res.json({ error: false })
      else if (currentStream) {
        res.json({ error: true, err: "Already downloading" })
      } else {
        console.log("Downloading " + id)
        currentStream = ytdl("http://www.youtube.com/watch?v=" + id)
          .pipe(fs.createWriteStream(`./dist/videos/${id}.webm`))
          .on("error", err => {
            console.log("Error " + id)
            !res.headersSent && res.json({ error: true, err })
            currentStream = null
          })
          .on("close", () => {
            console.log("Finished " + id)
            !res.headersSent && res.json({ error: false })
            currentStream = null
          })
        currentStream.id = id
      }
    } catch (err) {
      !res.headersSent && res.json({ error: true, err })
      currentStream && currentStream.destroy(err)
      fs.unlink("./dist/videos/" + currentStream.id + ".webm")
      currentStream = null
    }
  })

  app.get("/api/remove", (req, res) => {
    let id = req.query.id
    try {
      fs.unlinkSync(`./dist/videos/${id}.webm`)
    } catch (err) {
      res.json({ error: true, err })
    }
    res.json({ error: false })
  })

  app.get("/api/cancel", (req, res) => {
    try {
      currentStream && currentStream.destroy("Canceled")
      fs.unlinkSync("./dist/videos/" + currentStream.id + ".webm")
      currentStream = null
      res.json({ error: false })
    } catch (err) {
      res.json({ error: true, err })
    }
  })
}
