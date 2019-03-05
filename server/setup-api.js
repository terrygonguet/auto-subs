const fetch = require("node-fetch")
const ytdl = require("ytdl-core")
const fs = require("fs")

module.exports = function(app) {
  app.get("/api/proxy", async (req, res) => {
    let url = req.query.url
    let Cookie = req.query.cookie
    let result = await fetch(url, { headers: { Cookie } })
    res.send(await result.text())
  })

  app.get("/api/download", (req, res) => {
    let id = req.query.id
    try {
      fs.mkdirSync("./dist/videos")
    } catch (err) {}

    try {
      if (fs.existsSync(`./dist/videos/${id}.flv`)) res.json({ error: false })
      else {
        ytdl("http://www.youtube.com/watch?v=" + id)
          .pipe(fs.createWriteStream(`./dist/videos/${id}.flv`))
          .on("error", err => {
            console.error(err)
            res.json({ error: true })
          })
          .on("close", () => res.json({ error: false }))
      }
    } catch (err) {
      console.error(err)
      res.json({ error: true })
    }
  })

  app.get("/api/remove", (req, res) => {
    let id = req.query.id
    try {
      fs.unlinkSync(`./dist/videos/${id}.flv`)
    } catch (err) {
      console.error(err)
      res.json({ error: true })
    }
    res.json({ error: false })
  })
}
