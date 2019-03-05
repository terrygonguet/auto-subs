<template>
  <div class="home">
    <VideoCandidates class="candidates"/>
    <div class="videolist"></div>
    <div class="settings"></div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VideoCandidates from "../components/VideoCandidates.vue"

export default Vue.extend({
  name: "home",
  components: { VideoCandidates },
})
</script>

<style lang="postcss" scoped>
.home {
  display: grid;
  grid-template-columns: 1fr 20%;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "candidates videolist"
    "settings settings";
  height: 100%;
}

.candidates {
  grid-area: candidates;
}

.videolist {
  grid-area: videolist;
}

.settings {
  grid-area: settings;
}
</style>
