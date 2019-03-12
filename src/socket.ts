import SockJS from "sockjs-client"

const socket = new SockJS(location.origin + "/sockjs-node")

socket.onmessage = e => {
  console.log(e)
  let json = JSON.parse(e.data)
  if (json.error && events.onError) events.onError(json.error)
  else if (json.type == "videodownloaded" && events.onVideoDownloaded)
    events.onVideoDownloaded(json.id)
}

type SocketEvents = {
  onError?: (id: string) => void
  onVideoDownloaded?: (error: any) => void
}

export const events: SocketEvents = {}
export default socket
