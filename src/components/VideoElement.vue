<template>
  <div class="video" :class="{ watched }" @click="click">
    <img :src="thumbnail" class="thumbnail">
    <span class="title">{{ title }}</span>
    <span class="duration">{{ duration }}</span>
    <div class="remove" v-if="showControls" @click="remove" :style="stateStyle">❌</div>
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
  },
  computed: {
    stateStyle(): object {
      switch (this.state) {
        case "queued":
        case "none":
          return {}
        case "downloading":
          return {
            "background-color": "green",
          }
        case "finished":
          return {
            "background-color": "blue",
          }
        default:
          return {}
      }
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
  width: 5px;
  height: 5px;
  border-radius: 100em;
  position: absolute;
  top: 0;
  right: 0;
  margin: 5px;
}

.remove {
  position: absolute;
  font-size: 80%;
  display: flex;
  flex-direction: row;
  padding: 5px;
  background-color: darkgrey;
  border: 1px solid #eee;
  margin: 5px;
  border-radius: 3px;
}
</style>
