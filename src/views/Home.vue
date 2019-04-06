<template>
  <div class="home">
    <VideoCandidates id="candidates"/>
    <span id="showCookie" @click="showCookie = !showCookie">🍪</span>
    <div id="settings" v-if="!cookie || showCookie">
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
import { mapState, mapMutations } from "vuex"

export default Vue.extend({
  name: "home",
  components: { VideoCandidates },
  data() {
    return {
      showCookie: false,
    }
  },
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
  display: flex;
  flex-direction: column;
  height: 100%;
}

#candidates {
}

#settings {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  padding: 1em;
}

#showCookie {
  position: absolute;
  bottom: 0;
  left: 0;
  font-size: 120%;
  padding: 1em;
  cursor: pointer;
}
</style>
