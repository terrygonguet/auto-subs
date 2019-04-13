<template>
  <div class="videolist" v-show="show">
    <div class="controls" v-if="showControls">
      <button @click="download" v-if="!loading">💾</button>
      <button @click="cancel" v-else>❌</button>
    </div>
    <VideoElement
      v-for="video in videos"
      :key="video.id"
      v-bind="video"
      :show-controls="showControls"
      @remove="remove"
      @click="play(video.id)"
      @reorder="reorder(video, $event)"
      :watched="false"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VideoElement from "@/components/VideoElement.vue"
import { mapState, mapActions } from "vuex"
import { VideoData } from "@/store"

export default Vue.extend({
  name: "VideoList",
  components: { VideoElement },
  props: {
    showControls: {
      type: Boolean,
      default: true,
    },
  },
  data() {
    return {
      loading: false,
    }
  },
  computed: {
    videos(): VideoData[] {
      return this.$store.state.videos
    },
    show(): boolean {
      return this.$route.name != "player" || !this.$store.state.fullwidth
    },
  },
  methods: {
    remove(id: string) {
      this.$store.commit("removeVideo", id)
      if (!this.videos.length) this.$emit("empty")
    },
    download() {
      this.loading = true
      const download = (index: number = 0) => {
        if (!this.videos[index]) {
          this.loading = false
          return
        }

        let unwatch: () => void
        this.$store
          .dispatch("downloadVideo", this.videos[index].id)
          .catch(() => {
            unwatch()
            download(index + 1)
          })
        unwatch = this.$watch(
          () => this.videos[index].state,
          (val, old) => {
            if (val === "finished") {
              unwatch()
              this.$nextTick(() => download(index + 1))
            }
          }
        )
      }
      download()
    },
    clearVideos() {
      this.$store.dispatch("clearVideos").then(() => {
        if (!this.videos.length) this.$emit("empty")
      })
    },
    cancel() {
      this.$store.dispatch("cancelDownload").then(() => {
        this.loading = false
      })
    },
    reorder(video: VideoData, delta: number) {
      this.$store.commit({ type: "reorderVideo", id: video.id, delta })
    },
    play(id: string) {
      if (this.$route.name != "player") this.$router.push("/player")
      this.$store.commit("play", id)
    },
  },
})
</script>

<style lang="postcss" scoped>
.controls {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  position: sticky;
  top: 0;
  background: #333;
  z-index: 100;
}

.videolist {
  overflow-x: hidden;
  overflow-y: auto;
  width: 25%;
}

.videolist > * {
  padding: 0.5em;
}
</style>
