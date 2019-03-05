import Vue from "vue"
import App from "./App.vue"
import router from "./router"
import store from "./store"
import "@/assets/styles.css"

Vue.config.productionTip = false

store.commit("restoreFromLocal")

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount("#app")

setInterval(() => store.commit("saveToLocal"), 60000)
window.addEventListener("beforeunload", e => store.commit("saveToLocal"))
