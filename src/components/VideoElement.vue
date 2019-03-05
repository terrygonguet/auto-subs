<template>
  <div class="video" :class="{ watched }">
    <img :src="thumbnail" class="thumbnail">
    <span class="title">{{ title }}</span>
    <span class="duration">{{ duration }}</span>
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
    id: {
      type: String,
      required: true,
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
</style>
