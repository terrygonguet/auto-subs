<template>
  <span>{{ frames[i] }}</span>
</template>

<script lang="ts">
import Vue from "vue"
// 🕧🕜🕝🕞🕟🕠🕡🕢🕣🕤🕥🕦

export default Vue.extend({
  name: "LoadingSpinner",
  data() {
    return {
      frames: [
        "🕛",
        "🕐",
        "🕑",
        "🕒",
        "🕓",
        "🕔",
        "🕕",
        "🕖",
        "🕗",
        "🕘",
        "🕙",
        "🕚",
      ],
      i: 0,
      interval: 0,
    }
  },
  mounted() {
    this.interval = setInterval(() => {
      if (++this.i >= this.frames.length) this.i = 0
    }, 100)
  },
  destroyed() {
    clearInterval(this.interval)
  },
})
</script>