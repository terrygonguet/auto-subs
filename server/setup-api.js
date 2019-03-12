const fetch = require("node-fetch")

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
}
