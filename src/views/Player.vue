<template>
  <div class="player">
    <div class="fullwidth" @click="toggleFullwidth">📺</div>
    <video
      :src="src"
      ref="player"
      class="video"
      @ended="next"
      @volumechange="changeVolume"
      controls
      :autoplay="autoplay"
      @wheel="scroll"
    ></video>
    <div class="controls" v-if="!fullwidth">
      <router-link to="/">Back</router-link>
      <div>
        <span @click="changeSpeed(-0.1)">⏪</span>
        <span>{{ this.playbackSpeed }}x</span>
        <span @click="changeSpeed(0.1)">⏩</span>
      </div>
      <label>
        Autoplay
        <input type="checkbox" :checked="autoplay" @change="setAutoplay">
      </label>
      <label>
        Remove when watched
        <input
          type="checkbox"
          :checked="removeAfterView"
          @change="setRemoveAfterView"
        >
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VideoList from "@/components/VideoList.vue"
import { mapState } from "vuex"
import { VideoData } from "@/store"
declare var process: any

export default Vue.extend({
  name: "Player",
  components: { VideoList },
  computed: {
    currentlyPlaying(): string {
      return this.$store.state.currentlyPlaying
    },
    src(): string {
      if (this.currentlyPlaying)
        return (
          (process.env.NODE_ENV === "development"
            ? "http://localhost:7382"
            : location.origin) + `/videos/${this.currentlyPlaying}.webm`
        )
      else return ""
    },
    videos(): VideoData[] {
      return this.$store.state.videos
    },
    playbackSpeed(): number {
      return this.$store.state.playbackSpeed
    },
    volume(): number {
      return this.$store.state.volume
    },
    autoplay(): number {
      return this.$store.state.autoplay
    },
    removeAfterView(): boolean {
      return this.$store.state.removeAfterView
    },
    fullwidth(): boolean {
      return this.$store.state.fullwidth
    },
  },
  methods: {
    play(id: string) {
      this.$store.commit("play", id)
    },
    changeSpeed(delta: number) {
      this.$store.commit("setPlaybackSpeed", this.playbackSpeed + delta)
    },
    changeVolume() {
      let player = this.$refs.player as HTMLVideoElement
      this.$store.commit("setVolume", player.volume)
    },
    next() {
      let i = this.videos.findIndex(v => v.id === this.currentlyPlaying)
      if (this.removeAfterView)
        this.$store.commit("removeVideo", this.currentlyPlaying)
      else i++
      if (this.videos[i]) this.$store.commit("play", this.videos[i].id)
      else this.$router.go(-1)
    },
    scroll(e: WheelEvent) {
      let player = this.$refs.player as HTMLVideoElement
      let volume = this.volume - Math.sign(e.deltaY) * 0.02
      player.volume = volume > 1 ? 1 : volume < 0 ? 0 : volume
    },
    setAutoplay(e: Event) {
      let value = (e.target as HTMLInputElement).checked
      this.$store.commit("setAutoplay", value)
    },
    setRemoveAfterView(e: Event) {
      let value = (e.target as HTMLInputElement).checked
      this.$store.commit("setRemoveAfterView", value)
    },
    toggleFullwidth() {
      this.$store.commit("setFullwidth", !this.fullwidth)
    },
  },
  watch: {
    playbackSpeed(val, old) {
      let player = this.$refs.player as HTMLVideoElement
      player.playbackRate = val
    },
    src(val, old) {
      this.$nextTick(() => {
        let player = this.$refs.player as HTMLVideoElement
        player.playbackRate = this.playbackSpeed
      })
    },
  },
  mounted() {
    let player = this.$refs.player as HTMLVideoElement
    player.playbackRate = this.playbackSpeed
    player.volume = this.volume
    if (!this.videos.find(v => v.id == this.currentlyPlaying))
      this.$store.commit("play", this.videos[0].id)
  },
})
</script>

<style lang="postcss" scoped>
.player {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.video {
  grid-area: player;
  width: 100%;
}

.videolist {
  grid-area: videolist;
}

.controls {
  grid-area: controls;
  padding: 1em;
  display: flex;
  flex-direction: row;
  justify-content: space-evenly;
  align-items: flex-start;
}

a {
  color: #eee;
  font-weight: bold;
}

.fullwidth {
  position: absolute;
  top: 1rem;
  left: 1rem;
  padding: 0.5rem;
  opacity: 0.1;
  cursor: pointer;
}

.fullwidth:hover {
  opacity: 1;
}
</style>


