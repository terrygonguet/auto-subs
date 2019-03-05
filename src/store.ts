import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

export type VideoData = {
  title: string
  state: "queued" | "downloading" | "finished"
  progress: number
  id: string
  thumbnail: string
  duration: string
}

export default new Vuex.Store({
  state: {
    cookie: "",
    videos: [] as VideoData[],
    playbackSpeed: 1,
    history: [] as string[],
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
    restoreFromLocal(state) {
      let { cookie = "", videos = [], playbackSpeed = 1 } = JSON.parse(
        localStorage.getItem("autoSubs") || "{}"
      )
      state.cookie = cookie
      state.videos = videos
      state.playbackSpeed = playbackSpeed
    },
    saveToLocal(state) {
      localStorage.setItem("autoSubs", JSON.stringify(state))
    },
  },
  actions: {
    async downloadVideo({ state, commit }, { id }: { id: string }) {
      let video = state.videos.find(v => v.id === id)
      if (video) {
        commit({ type: "setVideoState", id, state: "downloading" })
        let res = await fetch("/api/download?id=" + id)
        let json = await res.json()
        if (!json.error)
          commit({ type: "setVideoState", id, state: "finished" })
        else throw new Error("Problem downloading " + video.title)
      } else throw new Error("No video with id " + id)
    },
    async removeVideo({ state, commit }, { id }: { id: string }) {
      let video = state.videos.find(v => v.id === id)
      if (video) {
        if (video.state === "downloading")
          throw new Error("Can't remove while downloading")
        else if (video.state === "finished") await fetch("/api/remove?id=" + id)
        commit({ type: "removeVideo", id })
      }
    },
    async clearVideos({ state, dispatch }) {
      for (const id of state.videos.map(v => v.id)) {
        await dispatch({ type: "removeVideo", id })
      }
    },
  },
})
