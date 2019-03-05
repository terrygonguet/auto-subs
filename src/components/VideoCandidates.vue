<template>
  <div class="container">
    <div class="controls">
      <button @click="refresh">Refresh</button>
      <select v-model="source">
        <option value="subs">Subscriptions</option>
        <option value="wl">Watch Later</option>
      </select>
    </div>
    <div class="candidates">
      <VideoElement
        class="video"
        v-for="video in videos"
        :key="video.id"
        v-bind="video"
        @click="addToList"
      />
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { mapState } from "vuex"
import VideoElement from "./VideoElement.vue"

type VideoElement = {
  title: string
  id: string
  duration: string
  thumbnail: string
} & Vue

export default Vue.extend({
  name: "VideoCandidates",
  components: { VideoElement },
  data() {
    return {
      videos: [] as object,
      source: "subs",
    }
  },
  computed: {
    ...mapState(["cookie", "history"]),
  },
  methods: {
    async getSubs() {
      let res = await fetch(
        `/api/proxy?url=${encodeURIComponent(
          "https://www.youtube.com/feed/subscriptions"
        )}&cookie=${encodeURIComponent(this.cookie)}`
      )
      let html = await res.text()
      let el = document.createElement("div")
      el.innerHTML = html
      // console.log(el)
      this.videos = Array.from(el.querySelectorAll(".yt-lockup-video")).map(
        vEl => {
          let titleEl = vEl.querySelector(".yt-lockup-title > a")
          let thumbEl = vEl.querySelector(
            ".yt-thumb-simple > img"
          ) as HTMLImageElement
          let durationEl = vEl.querySelector(".video-time")
          let id = (vEl as HTMLElement).dataset.contextItemId
          return {
            title: titleEl ? titleEl.textContent : null,
            thumbnail: thumbEl ? thumbEl.src : null,
            duration: durationEl ? durationEl.textContent : null,
            id,
            watched:
              !!vEl.querySelector(".watched-badge") ||
              this.history.indexOf(id) !== -1,
            live: !!vEl.querySelector(".yt-badge-live"),
          }
        }
      )
    },
    refresh() {
      if (this.source === "subs") this.getSubs()
      else if (this.source === "wl") throw "WIP"
      else throw "wat"
    },
    addToList(e: VideoElement) {
      let videoData = {
        title: e.title,
        id: e.id,
        duration: e.duration,
        thumbnail: e.thumbnail,
        state: "queued",
      }
      this.$store.commit({
        type: "addVideo",
        video: videoData,
      })
    },
  },
  mounted() {
    this.getSubs()
  },
})
</script>


<style lang="postcss" scoped>
.container {
  overflow-x: auto;
}

.candidates {
  display: grid;
  grid-gap: 1em;
  margin: 1em;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
}

.controls {
  margin: 1em;
}

.video {
  border: 1px solid #eee;
}
</style>
