<template>
  <div class="videolist">
    <div class="controls" v-if="showControls">
      <button @click="clearVideos">Clear</button>
      <button @click="download">💾</button>
    </div>
    <VideoElement
      v-for="video in videos"
      :key="video.id"
      v-bind="video"
      :show-controls="showControls"
      @remove="remove"
      @click="$emit('clickVideo', video)"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VideoElement from "@/components/VideoElement.vue"
import { mapState, mapActions } from "vuex"

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
    ...mapState(["videos"]),
  },
  methods: {
    remove(id: string) {
      this.$store
        .dispatch({
          type: "removeVideo",
          id,
        })
        .catch(console.error)
    },
    download() {
      let prom = Promise.resolve()
      for (const video of this.videos) {
        prom = prom.then(() =>
          this.$store.dispatch({
            type: "downloadVideo",
            id: video.id,
          })
        )
      }
      prom.catch(console.error)
    },
    ...mapActions(["clearVideos"]),
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
  overflow-x: auto;
}

.videolist > * {
  margin: 0.5em;
}
</style>
