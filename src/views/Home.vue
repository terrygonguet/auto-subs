<template>
  <div class="home">
    <VideoCandidates id="candidates"/>
    <VideoList id="videolist"/>
    <div id="settings" v-if="!cookie">
      <label>
        YT Cookie:
        <input type="text" :value="cookie" @input="setCookie($event.target.value)">
      </label>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VideoCandidates from "../components/VideoCandidates.vue"
import VideoList from "../components/VideoList.vue"
import { mapState, mapMutations } from "vuex"

export default Vue.extend({
  name: "home",
  components: { VideoCandidates, VideoList },
  computed: {
    ...mapState(["cookie"]),
  },
  methods: {
    ...mapMutations(["setCookie"]),
  },
})
</script>

<style lang="postcss" scoped>
.home {
  display: grid;
  grid-template-columns: 1fr 350px;
  grid-template-rows: 1fr auto;
  grid-template-areas:
    "candidates videolist"
    "settings settings";
  height: 100%;
}

#candidates {
  grid-area: candidates;
}

#videolist {
  grid-area: videolist;
}

#settings {
  grid-area: settings;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 1em;
}
</style>
