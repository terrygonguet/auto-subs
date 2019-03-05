import Vue from "vue"
import Vuex from "vuex"

Vue.use(Vuex)

export type VideoData = {
  title: string
  state: "queued" | "downloading" | "finished"
  progress: number
}

export default new Vuex.Store({
  state: {
    cookie: "",
    videos: [] as VideoData[],
    playbackSpeed: 1,
  },
  mutations: {
    setCookie(state, { cookie }: { cookie: string }) {
      state.cookie = cookie
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
  actions: {},
})
