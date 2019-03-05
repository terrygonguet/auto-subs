<template>
  <div class="candidates">
    <VideoElement class="video" v-for="video in videos" :key="video.id" v-bind="video"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import { mapState } from "vuex"
import VideoElement from "./VideoElement.vue"

export default Vue.extend({
  name: "VideoCandidates",
  components: { VideoElement },
  data() {
    return {
      videos: [],
    }
  },
  computed: {
    ...mapState(["cookie"]),
  },
  mounted() {
    return fetch(
      `/api/proxy?url=${encodeURIComponent(
        "https://www.youtube.com/feed/subscriptions"
      )}&cookie=${encodeURIComponent(this.cookie)}`
    )
      .then(result => result.text())
      .then(html => {
        let el = document.createElement("div")
        el.innerHTML = html
        console.log(el)
        this.videos = Array.from(el.querySelectorAll(".yt-lockup-video")).map(
          vEl => {
            let titleEl = vEl.querySelector(".yt-lockup-title > a")
            let thumbEl = vEl.querySelector(
              ".yt-thumb-simple > img"
            ) as HTMLImageElement
            let durationEl = vEl.querySelector(".video-time")
            return {
              title: titleEl ? titleEl.textContent : null,
              thumbnail: thumbEl ? thumbEl.src : null,
              duration: durationEl ? durationEl.textContent : null,
              id: (vEl as HTMLElement).dataset["context-item-id"],
              watched: !!vEl.querySelector(".watched-badge"),
            }
          }
        )
      })
  },
})
</script>


<style lang="postcss" scoped>
.candidates {
  display: grid;
  grid-gap: 1em;
  padding: 1em;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  overflow-x: auto;
}

.video {
  border: 1px solid #eee;
}

.video > div {
  margin: 0.5em;
}
</style>
