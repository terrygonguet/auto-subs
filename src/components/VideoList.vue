<template>
  <div class="videolist" v-show="show">
    <div class="controls" v-if="showControls">
      <button @click="download" v-if="!loading">💾</button>
      <button @click="cancel" v-else>❌</button>
      <span>{{ nbDownloaded }} / {{ nbVideos }} saved</span>
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
  computed: {
    videos(): VideoData[] {
      return this.$store.state.videos
    },
    show(): boolean {
      return (
        !(this.$route.name == "player" && this.$store.state.fullwidth) &&
        this.nbVideos >= 1
      )
    },
    loading(): boolean {
      return this.$store.state.isDownloading
    },
    nbDownloaded(): number {
      return this.$store.state.videos.filter(
        (v: VideoData) => v.state == "finished"
      ).length
    },
    nbVideos(): number {
      return this.$store.state.videos.length
    },
  },
  methods: {
    remove(id: string) {
      this.$store.commit("removeVideo", id)
      if (!this.videos.length) this.$emit("empty")
    },
    download() {
      this.$store.dispatch("downloadVideos")
    },
    clearVideos() {
      this.$store.dispatch("clearVideos").then(() => {
        if (!this.videos.length) this.$emit("empty")
      })
    },
    cancel() {
      this.$store.dispatch("cancelDownload")
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
  flex-direction: column;
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
}

.videolist > * {
  padding: 0.5em;
}
</style>
