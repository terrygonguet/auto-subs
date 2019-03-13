<template>
  <div class="video" :class="{ watched }" @click="click">
    <img :src="thumbnailSrc" class="thumbnail">
    <span class="title">{{ title }}</span>
    <span class="duration">{{ duration }}</span>
    <div class="controls" v-if="showControls">
      <div class="remove" @click.stop="remove" :style="stateStyle">
        <div class="progressbar" :style="{ width: progress + '%' }" v-if="state == 'downloading'"></div>
        <span style="position:absolute;z-index:99">❌</span>❌
      </div>
      <div class="reorder">
        <span @click.stop="$emit('reorder', -1)">⏫</span>
        <span @click.stop="$emit('reorder', 1)">⏬</span>
      </div>
    </div>
    <div class="live" v-if="live"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
export default Vue.extend({
  name: "VideoElement",
  props: {
    title: {
      type: String,
      default: "No title",
    },
    thumbnail: String,
    duration: {
      type: String,
      default: "0:00",
    },
    watched: {
      type: Boolean,
      default: false,
    },
    live: {
      type: Boolean,
      default: false,
    },
    id: {
      type: String,
      required: true,
    },
    showControls: {
      type: Boolean,
      default: false,
    },
    state: {
      type: String,
      default: "none",
    },
    progress: {
      type: Number,
      default: 0,
    },
  },
  computed: {
    stateStyle(): object {
      switch (this.state) {
        case "queued":
        case "none":
        case "downloading":
          return {}
        case "finished":
          return {
            "background-color": "#5B5",
          }
        default:
          return {}
      }
    },
    thumbnailSrc(): string {
      return this.thumbnail || `https://i.ytimg.com/vi/${this.id}/hqdefault.jpg`
    },
  },
  methods: {
    click(e: Event) {
      this.$emit("click", this)
    },
    remove(e: Event) {
      this.$emit("remove", this.id)
    },
    download(e: Event) {
      this.$emit("download", this.id)
    },
  },
})
</script>

<style lang="postcss" scoped>
.video {
  display: grid;
  grid-template-columns: auto auto;
  grid-template-rows: auto auto;
  grid-template-areas:
    "thumbnail title"
    "thumbnail duration";
  grid-gap: 0.5em;
  cursor: pointer;
  position: relative;
}

.watched {
  opacity: 0.5;
}

.title {
  grid-area: title;
}

.thumbnail {
  grid-area: thumbnail;
  width: 175px;
}

.duration {
  grid-area: duration;
  color: darkgray;
  font-size: 0.8rem;
}

.live {
  width: 15px;
  height: 15px;
  border-radius: 100em;
  position: absolute;
  bottom: 0;
  left: 0;
  margin: 5px;
  background-color: red;
  border: 1px solid #eee;
}

.controls {
  position: absolute;
  font-size: 80%;
  display: flex;
  flex-direction: row;
}

.remove {
  margin: 5px;
  padding: 5px;
  border: 1px solid #eee;
  background-color: lightgrey;
  border-radius: 3px;
  position: relative;
}

.progressbar {
  position: absolute;
  height: 100%;
  background-color: #5b5;
  top: 0;
  left: 0;
}

.reorder {
  margin: 5px;
  border-radius: 5px;
  border: 1px solid #eee;
  padding: 5px;
  background-color: lightgrey;
}
</style>
