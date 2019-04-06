<template>
  <div id="app">
    <router-view/>
    <VideoList id="videolist" @empty="onListEmpty"/>
  </div>
</template>

<script lang="ts">
import Vue from "vue"
import VideoList from "@/components/VideoList.vue"

export default Vue.extend({
  components: {
    VideoList,
  },
  methods: {
    onListEmpty() {
      if (this.$route.name == "player") this.$router.go(-1)
    },
  },
})
</script>


<style lang="postcss" scoped>
#app {
  height: 100%;
  width: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: row;
}

#app > :first-child {
  flex-grow: 1;
}
</style>
