<template>
  <div class="player">
    <video
      :src="src"
      ref="player"
      class="video"
      @ended="next"
      @volumechange="changeVolume($event.target)"
      controls
    ></video>
    <div class="controls">
      <router-link to="/">Back</router-link>
      <div>
        <button @click="changeSpeed(-0.1)">⏪</button>
        <span>{{ this.playbackSpeed }}x</span>
        <button @click="changeSpeed(0.1)">⏩</button>
      </div>
      <label>
        Autoplay
        <input type="checkbox" v-model="autoplay">
      </label>
    </div>
    <VideoList @clickVideo="play($event.id)" class="videolist"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VideoList from "@/components/VideoList.vue"
import { mapState } from "vuex"
import { VideoData } from "@/store"

export default Vue.extend({
  name: "Player",
  components: { VideoList },
  data() {
    return {
      autoplay: true,
      index: 0,
    }
  },
  computed: {
    src(): string {
      return `/videos/${this.videos[this.index].id}.webm`
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
  },
  methods: {
    play(id: string) {
      this.index = this.videos.findIndex(v => v.id === id)
    },
    changeSpeed(delta: number) {
      this.$store.commit("setPlaybackSpeed", this.playbackSpeed + delta)
    },
    changeVolume(player: HTMLVideoElement) {
      this.$store.commit("setVolume", player.volume)
    },
    next() {
      if (this.autoplay) this.index++
    },
  },
  watch: {
    playbackSpeed(val, old) {
      let player = this.$refs.player as HTMLVideoElement
      player.playbackRate = val
    },
  },
  mounted() {
    let player = this.$refs.player as HTMLVideoElement
    player.playbackRate = this.playbackSpeed
    player.volume = this.volume
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


