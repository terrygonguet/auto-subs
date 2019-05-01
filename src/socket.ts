import SockJS from "sockjs-client"

const socket = new SockJS(location.origin + "/sockjs-node")

socket.onmessage = e => {
  let json = JSON.parse(e.data)
  if (json.error && events.onError) events.onError(json.error)
  else if (json.type == "videodownloaded" && events.onVideoDownloaded)
    events.onVideoDownloaded(json.id)
  else if (json.type == "videoprogress" && events.onVideoProgress)
    events.onVideoProgress(json.id, json.progress)
  else if (json.type == "downloadfinished" && events.onDownloadFinished)
    events.onDownloadFinished()
}

type SocketEvents = {
  onError?: (id: string) => void
  onVideoDownloaded?: (error: any) => void
  onVideoProgress?: (id: string, progress: number) => void
  onDownloadFinished?: () => void
}

export const events: SocketEvents = {}
export default socket
