<template>
  <div class="container">
    <div class="loading" v-if="loading">
      <LoadingSpinner/>
    </div>
    <div class="controls">
      <button @click="refresh">Refresh</button>
      <select v-model="source" @change="setSource">
        <option value="subs">Subscriptions</option>
        <option value="wl">Watch Later</option>
        <option value="playlist">A Playlist</option>
      </select>
      <button @click="gotoPlayer">🎦Player</button>
      <button @click="addAll" v-if="source != 'subs'">Add all</button>
      <input
        type="text"
        v-model="playlist"
        v-if="source == 'playlist'"
        placeholder="Playlist link or ID"
      >
    </div>
    <div class="candidates">
      <VideoElement
        class="video"
        v-for="video in videos"
        :key="video.id"
        v-bind="video"
        @click="addToList(video)"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { mapState } from "vuex"
import VideoElement from "./VideoElement.vue"
import LoadingSpinner from "./LoadingSpinner.vue"
import { VideoData, Source, VideoState } from "@/store"

export default Vue.extend({
  name: "VideoCandidates",
  components: { VideoElement, LoadingSpinner },
  data() {
    return {
      videos: [] as VideoData[],
      loading: false,
      playlist: "",
    }
  },
  computed: {
    history(): string[] {
      return this.$store.state.history
    },
    cookie(): string {
      return this.$store.state.cookie
    },
    source(): Source {
      return this.$store.state.source
    },
    subsURL(): string {
      return `/api/proxy?url=${encodeURIComponent(
        "https://www.youtube.com/feed/subscriptions"
      )}&cookie=${encodeURIComponent(this.cookie)}`
    },
    playlistURL(): string {
      return `/api/proxy?url=${encodeURIComponent(
        `https://www.youtube.com/playlist?list=${
          this.playlistID
        }&disable_polymer=true`
      )}&cookie=${encodeURIComponent(this.cookie)}`
    },
    playlistID(): string {
      let res = /(?:https:\/\/www\.youtube\.com\/playlist\?list=)?(.+?)(?:&disable_polymer=true)?$/.exec(
        this.playlist
      )
      return res ? res[1] : ""
    },
    debouncedRefresh(): Function {
      let timeout: number
      return () => {
        timeout && clearTimeout(timeout)
        timeout = setTimeout(this.refresh, 500)
      }
    },
  },
  methods: {
    async getSubs() {
      this.loading = true
      let res = await fetch(this.subsURL)
      let html = await res.text()
      let el = document.createElement("div")
      el.innerHTML = html
      process.env.NODE_ENV == "development" && console.log(el)
      this.videos = Array.from(el.querySelectorAll(".yt-lockup-video")).map(
        vEl => {
          let titleEl = vEl.querySelector(".yt-lockup-title > a")
          let thumbEl = vEl.querySelector(
            ".yt-thumb-simple > img"
          ) as HTMLImageElement
          let durationEl = vEl.querySelector(".video-time")
          let id = (vEl as HTMLElement).dataset.contextItemId || ""
          let isPremiere = !!vEl.querySelector(
            ".yt-uix-livereminder-main-button"
          )
          return {
            title: titleEl ? titleEl.textContent || "" : "",
            thumbnail: thumbEl ? thumbEl.src : "",
            duration: durationEl ? durationEl.textContent || "" : "0:00",
            id,
            state: (isPremiere ? "premiere" : "queued") as VideoState,
            progress: 0,
            watched:
              !!vEl.querySelector(".watched-badge") ||
              this.history.indexOf(id) !== -1,
            live: !!vEl.querySelector(".yt-badge-live"),
          }
        }
      )
      this.loading = false
    },
    async getWL() {
      this.playlist = "WL"
      await this.getPlaylist()
    },
    async getPlaylist() {
      if (!this.playlistID) return
      this.loading = true
      let res = await fetch(this.playlistURL)
      let html = await res.text()
      let el = document.createElement("div")
      el.innerHTML = html
      // console.log(el)
      this.videos = Array.from(el.querySelectorAll(".pl-video")).map(vEl => {
        let titleEl = vEl.querySelector(".pl-video-title-link")
        let durationEl = vEl.querySelector(".timestamp")
        let id = (vEl as HTMLElement).dataset.videoId || ""
        return {
          title: titleEl ? titleEl.textContent || "" : "",
          duration: durationEl ? durationEl.textContent || "" : "",
          thumbnail: "",
          id,
          state: "queued" as VideoState,
          progress: 0,
          watched:
            !!vEl.querySelector(".resume-playback-background") ||
            this.history.indexOf(id) !== -1,
          live: !vEl.querySelector(".timestamp"), // only one !
        }
      })
      this.loading = false
    },
    refresh() {
      if (this.source === "subs") this.getSubs()
      else if (this.source === "wl") this.getWL()
      else if (this.source === "playlist") this.getPlaylist()
      else throw "wat"
    },
    addToList(video: any) {
      // TODO: better
      let data = Object.assign({ state: "queued" }, video)
      delete data.watched
      this.$store.commit("addVideo", data)
    },
    addAll() {
      this.videos.forEach(this.addToList)
    },
    gotoPlayer() {
      this.$router.push("/player")
    },
    setSource(e: Event) {
      this.$store.commit("setSource", (e.target as HTMLSelectElement).value)
    },
  },
  watch: {
    playlist(val, old) {
      this.debouncedRefresh()
    },
    source(val, old) {
      this.videos = []
      this.playlist = ""
      this.debouncedRefresh()
    },
  },
  mounted() {
    this.refresh()
  },
})
</script>


<style lang="postcss" scoped>
.container {
  overflow-x: auto;
}

.candidates {
  display: grid;
  grid-gap: 0.2em;
  margin: 1em;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  justify-items: center;
}

.controls {
  padding: 1em;
  position: sticky;
  top: 0;
  background: #333;
  z-index: 100;
}

.loading {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: rgba(50, 50, 50, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 99;
  font-size: 200%;
}
</style>
