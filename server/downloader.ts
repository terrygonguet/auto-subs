import fs = require("fs")
import { Connection } from "sockjs"
import ytdl = require("ytdl-core")
import { join } from "path"

export async function download(ids: string[], socket: Connection) {
  if (isDownloading) throw new Error("Already downloading")
  if (!ids.length) return

  do {
    if (canceled) {
      canceled = false
      break
    }

    let id = ids.shift() as string
    currentID = id
    if (fs.existsSync(getVideoPath(id))) {
      socket.write(JSON.stringify({ type: "videodownloaded", id }))
    } else {
      try {
        await downloadOne(id, socket)
        socket.write(JSON.stringify({ type: "videodownloaded", id }))
      } catch (error) {
        console.error(error)
        socket.write(JSON.stringify({ error }))
      }
    }
  } while (ids.length)

  socket.write(JSON.stringify({ type: "downloadfinished" }))
}

export function cancel(socket: Connection) {
  try {
    if (currentStream) {
      currentStream.destroy(new Error("Canceled"))
      fs.unlinkSync(getVideoPath(currentID as string))
      currentStream = null
      isDownloading = false
      canceled = true
    }
  } catch (error) {
    console.error(error)
    socket.write(JSON.stringify({ error }))
  }
}

var currentStream: fs.WriteStream | null = null
var currentID: string | null = null
var isDownloading = false
var canceled = false

function getVideoPath(id: string) {
  return join(__dirname, `../dist/videos/${id}.webm`)
}

async function downloadOne(id: string, socket: Connection) {
  return new Promise((resolve, reject) => {
    console.log("Started " + id)
    isDownloading = true
    let progress = 0
    currentStream = ytdl("http://www.youtube.com/watch?v=" + id)
      .on("progress", (chunk, cur, total) => {
        let curProgress = Math.round((cur / total) * 100)
        if (progress != curProgress) {
          progress = curProgress
          socket.write(JSON.stringify({ type: "videoprogress", id, progress }))
        }
      })
      .pipe(fs.createWriteStream(getVideoPath(id)))
      .on("error", error => {
        console.log("Error " + id)
        currentStream = null
        isDownloading = false
        reject(error)
      })
      .on("close", () => {
        console.log("Finished " + id)
        currentStream = null
        isDownloading = false
        resolve()
      })
  })
}
