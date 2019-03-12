<template>
  <div class="videolist">
    <div class="controls" v-if="showControls">
      <button @click="clearVideos" v-if="!loading">Clear</button>
      <button @click="download" v-if="!loading">💾</button>
      <button @click="cancel" v-else>❌</button>
    </div>
    <VideoElement
      v-for="video in videos"
      :key="video.id"
      v-bind="video"
      :show-controls="showControls"
      @remove="remove"
      @click="$emit('clickVideo', video)"
      @reorder="reorder(video, $event)"
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
    ...mapState(["videos"]),
  },
  methods: {
    remove(id: string) {
      this.$store.commit({
        type: "removeVideo",
        id,
      })
      if (!this.videos.length) this.$emit("empty")
    },
    download() {
      this.loading = true
      const download = (index: number = 0) => {
        if (!this.videos[index]) {
          this.loading = false
          return
        }
        this.$store.dispatch({
          type: "downloadVideo",
          id: this.videos[index].id,
        })
        let unwatch = this.$watch(
          () => this.videos[index].state,
          (val, old) => {
            if (val === "finished") {
              unwatch()
              download(index + 1)
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
  },
})
</script>

<style lang="postcss" scoped>
.controls {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

.videolist {
  overflow-x: hidden;
  overflow-y: auto;
}

.videolist > * {
  margin: 0.5em;
}
</style>
