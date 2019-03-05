const express = require("express")
const setupApi = require("./setup-api")

const app = express()
setupApi(app)
app.use(express.static("dist"))

app.listen(process.env.PORT, () =>
  console.log("Server started on port " + process.env.PORT)
)
