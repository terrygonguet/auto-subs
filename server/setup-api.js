const fetch = require("node-fetch")

module.exports = function(app) {
  app.get("/api/proxy", async (req, res) => {
    let url = req.query.url
    let Cookie = req.query.cookie
    let result = await fetch(url, { headers: { Cookie } })
    res.send(await result.text())
  })
}
