import Vue from "vue"
import Vuex from "vuex"
import socket, { events as socketEvents } from "./socket"

Vue.use(Vuex)

export type VideoData = {
  title: string
  state: VideoState
  progress: number
  id: string
  thumbnail: string
  duration: string
  live?: boolean
}

export type Source = "subs" | "wl" | "playlist"

export type VideoState = "queued" | "downloading" | "finished" | "premiere"

const store = new Vuex.Store({
  state: {
    cookie: "",
    videos: [] as VideoData[],
    playbackSpeed: 1,
    history: [] as string[],
    volume: 1,
    autoplay: true,
    source: "subs" as Source,
    removeAfterView: true,
    fullwidth: false,
    currentlyPlaying: "",
    isDownloading: false,
  },
  mutations: {
    addVideo(state, video: VideoData) {
      if (!state.videos.find(v => v.id === video.id)) state.videos.push(video)
    },
    removeVideo(state, id: string) {
      let i = state.videos.findIndex(v => v.id === id)
      if (i !== -1) state.videos.splice(i, 1)
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

    restoreFromLocal(state) {
      let data = JSON.parse(localStorage.getItem("autoSubs") || "{}")
      for (const key in data) {
        Vue.set(state, key, data[key])
      }
    },
    saveToLocal(state) {
      localStorage.setItem("autoSubs", JSON.stringify(state))
    },

    setCookie(state, cookie: string) {
      state.cookie = cookie
    },
    setVideoState(
      state,
      { id, state: videoState }: { id: string; state: VideoState }
    ) {
      let video = state.videos.find(v => v.id === id)
      if (video) {
        video.state = videoState
        if (videoState == "downloading") video.progress = 0
      }
      if (videoState == "finished" && state.history.indexOf(id) === -1)
        state.history.push(id)
    },
    setVideoProgress(
      state,
      { id, progress }: { id: string; progress: number }
    ) {
      let video = state.videos.find(v => v.id === id)
      if (video) video.progress = progress
    },
    setSource(state, source: Source) {
      state.source = source
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
    setRemoveAfterView(state, remove: boolean) {
      state.removeAfterView = remove
    },
    setFullwidth(state, fullwidth: boolean) {
      state.fullwidth = fullwidth
    },

    play(state, id: string) {
      state.currentlyPlaying = id
    },
  },
  actions: {
    async downloadVideos({ state, commit }) {
      state.videos.forEach(v => {
        commit({ type: "setVideoState", id: v.id, state: "downloading" })
        if (v.state === "premiere" || v.live)
          throw new Error("Can't download premières and livestreams")
      })
      socket.send(
        JSON.stringify({ type: "download", ids: state.videos.map(v => v.id) })
      )
      state.isDownloading = true
    },
    clearVideos({ state, commit, dispatch }) {
      dispatch("cancelDownload")
      for (const id of state.videos.map(v => v.id)) {
        commit("removeVideo", id)
      }
    },
    cancelDownload({ state, commit }) {
      for (const video of state.videos) {
        if (video.state === "downloading")
          commit({ type: "setVideoState", id: video.id, state: "queued" })
      }
      socket.send(JSON.stringify({ type: "cancel" }))
      state.isDownloading = false
    },
  },
})

socketEvents.onVideoDownloaded = (id: string) => {
  store.commit({ type: "setVideoState", id, state: "finished" })
}
socketEvents.onVideoProgress = (id: string, progress: number) => {
  store.commit({ type: "setVideoProgress", id, progress })
}
socketEvents.onDownloadFinished = () => {
  store.state.isDownloading = false
}
socketEvents.onError = console.error

export default store
