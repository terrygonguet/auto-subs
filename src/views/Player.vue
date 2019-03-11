<template>
  <div class="player">
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
    <div class="controls">
      <router-link to="/">Back</router-link>
      <div>
        <span @click="changeSpeed(-0.1)">⏪</span>
        <span>{{ this.playbackSpeed }}x</span>
        <span @click="changeSpeed(0.1)">⏩</span>
      </div>
      <label>
        Autoplay
        <input type="checkbox" v-model="autoplay">
      </label>
    </div>
    <VideoList @clickVideo="play($event.id)" class="videolist" @empty="$router.push('/')"/>
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
  data() {
    return {
      currentlyPlaying: "",
    }
  },
  computed: {
    src(): string {
      if (this.currentlyPlaying)
        return (
          (process.env.NODE_ENV === "development"
            ? "http://localhost:7382"
            : "") + `/videos/${this.currentlyPlaying}.webm`
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
  },
  methods: {
    play(id: string) {
      this.currentlyPlaying = id
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
      if (this.autoplay && this.videos[i++]) {
        this.currentlyPlaying = this.videos[i].id
      }
    },
    scroll(e: WheelEvent) {
      let player = this.$refs.player as HTMLVideoElement
      let volume = this.volume - Math.sign(e.deltaY) * 0.02
      player.volume = volume > 1 ? 1 : volume < 0 ? 0 : volume
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
    this.currentlyPlaying = this.videos[0].id
  },
})
</script>

<style lang="postcss" scoped>
.player {
  display: grid;
  grid-template-columns: 1fr 350px;
  grid-template-rows: auto 1fr;
  grid-template-areas:
    "player videolist"
    "controls videolist";
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
</style>


