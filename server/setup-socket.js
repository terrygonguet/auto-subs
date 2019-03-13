const sockjs = require("sockjs")
const ytdl = require("ytdl-core")
const fs = require("fs")

module.exports = function(server) {
  const io = sockjs.createServer({
    prefix: "/sockjs-node",
    sockjs_url: "http://cdn.jsdelivr.net/sockjs/1.1.1/sockjs.min.js",
  })
  io.on("connection", socket => {
    console.log("Socket connected: " + socket.id)
    socket.on("close", () => console.log("Socket disconnected: " + socket.id))
    socket.on("data", message => {
      let data = JSON.parse(message)
      try {
        switch (data.type) {
          case "download":
            download.call(socket, data)
            break
          case "cancel":
            cancel.apply(socket)
            break
          default:
            console.error("Unknown command : " + message)
        }
      } catch (error) {
        socket.write(JSON.stringify({ error }))
        currentStream && currentStream.destroy(error)
        fs.unlink(videoName(currentStream.id), () => {})
        currentStream = null
      }
    })
  })
  io.installHandlers(server)
}

let currentStream = null

function download(info) {
  let id = info.id
  if (fs.existsSync(videoName(id))) {
    let data = { type: "videodownloaded", id }
    this.write(JSON.stringify(data))
  } else if (currentStream) {
    let data = { error: "Already downloading" }
    this.write(JSON.stringify(data))
  } else {
    console.log("Downloading " + id)
    let progress = 0
    currentStream = ytdl("http://www.youtube.com/watch?v=" + id)
      .on("progress", (chunk, cur, total) => {
        let curProgress = Math.round((cur / total) * 100)
        if (progress != curProgress) {
          progress = curProgress
          let data = { type: "videoprogress", id, progress }
          this.write(JSON.stringify(data))
        }
      })
      .pipe(fs.createWriteStream(videoName(id)))
      .on("error", error => {
        console.log("Error " + id)
        currentStream = null
        this.write(JSON.stringify({ error }))
      })
      .on("close", () => {
        console.log("Finished " + id)
        currentStream = null
        let data = { type: "videodownloaded", id }
        this.write(JSON.stringify(data))
      })
    currentStream.id = id
  }
}
function cancel() {
  if (currentStream) {
    currentStream.close("canceled")
    fs.unlink(videoName(currentStream.id), () => {})
    currentStream = null
  }
}

function videoName(id) {
  return `./dist/videos/${id}.webm`
}
