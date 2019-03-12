import Vue from "vue"
import Vuex from "vuex"
import socket, { events as socketEvents } from "./socket"

Vue.use(Vuex)

export type VideoData = {
  title: string
  state: "queued" | "downloading" | "finished"
  progress: number
  id: string
  thumbnail: string
  duration: string
  live?: boolean
}

export type Source = "subs" | "wl" | "playlist"

const store = new Vuex.Store({
  state: {
    cookie: "",
    videos: [] as VideoData[],
    playbackSpeed: 1,
    history: [] as string[],
    volume: 1,
    autoplay: true,
    source: "subs" as Source,
  },
  mutations: {
    setCookie(state, cookie: string) {
      state.cookie = cookie
    },
    addVideo(state, { video }: { video: VideoData }) {
      if (!state.videos.find(v => v.id === video.id)) state.videos.push(video)
    },
    removeVideo(state, { id }: { id: string }) {
      let i = state.videos.findIndex(v => v.id === id)
      if (i !== -1) state.videos.splice(i, 1)
    },
    setVideoState(
      state,
      {
        id,
        state: videoState,
      }: { id: string; state: "downloading" | "finished" }
    ) {
      let video = state.videos.find(v => v.id === id)
      if (video) video.state = videoState
      if (videoState == "finished" && state.history.indexOf(id) === -1)
        state.history.push(id)
    },
    setSource(state, { source }: { source: Source }) {
      state.source = source
    },
    restoreFromLocal(state) {
      let data = JSON.parse(localStorage.getItem("autoSubs") || "{}")
      for (const key in data) {
        Vue.set(state, key, data[key])
      }
    },
    saveToLocal(state) {
      localStorage.setItem("autoSubs", JSON.stringify(state))
    },
    setPlaybackSpeed(state, speed: number) {
      state.playbackSpeed = parseFloat(speed.toPrecision(2))
    },
    setVolume(state, val: number) {
      state.volume = val < 0 ? 0 : val > 1 ? 1 : val
    },
    setAutoplay(state, autoplay: boolean) {
      state.autoplay = autoplay
    },
    reorderVideo(state, { id, delta }: { id: string; delta: 1 | -1 }) {
      let i = state.videos.findIndex(v => v.id === id)
      let l = state.videos.length
      if (i !== -1) {
        let video = state.videos.splice(i, 1)
        i += delta
        i = i < 0 ? 0 : i >= l ? l - 1 : i
        state.videos.splice(i, 0, ...video)
      }
    },
  },
  actions: {
    downloadVideo({ state, commit }, { id }: { id: string }) {
      let video = state.videos.find(v => v.id === id)
      if (video) {
        commit({ type: "setVideoState", id, state: "downloading" })
        let data = { type: "download", id }
        socket.send(JSON.stringify(data))
      } else throw new Error("No video with id " + id)
    },
    clearVideos({ state, commit }) {
      for (const id of state.videos.map(v => v.id)) {
        commit({ type: "removeVideo", id })
      }
    },
    cancelDownload({ state, commit }) {
      for (const video of state.videos) {
        if (video.state === "downloading")
          commit({ type: "setVideoState", id: video.id, state: "queued" })
      }
      let data = { type: "cancel" }
      socket.send(JSON.stringify(data))
    },
  },
})

socketEvents.onVideoDownloaded = (id: string) => {
  store.commit({ type: "setVideoState", id, state: "finished" })
}
socketEvents.onError = console.error

export default store
