const app = new Vue({
  el: "#app",
  data: {
    videos: {},
    speed: parseFloat(localStorage.getItem("speed")) || 1,
    playing: null,
    autoplay: false
  },
  computed: {
    src() {
      return this.playing ? "videos/" + this.playing + ".webm" : "";
    }
  },
  methods: {
    async refresh() {
      let res = await fetch("/api/videos");
      this.videos = await res.json();
      let keys = Object.keys(this.videos);
      if (!this.playing && keys.length) this.playing = keys[0];
    },
    async update() {
      await fetch("/api/update");
    },
    play(id) {
      this.autoplay = true;
      this.playing = id;
      this.$nextTick(() => (this.$refs.video.playbackRate = this.speed));
    },
    playNext() {
      let keys = Object.keys(this.videos);
      let index = keys.indexOf(this.playing);
      let next = keys[index + 1];
      if (next) this.play(next);
      else this.playing = null;
    },
    async remove(id) {
      let res = await fetch("/api/removevideo/" + id);
      this.videos = await res.json();
    }
  },
  watch: {
    speed(val, old) {
      if (val < 0.1) this.speed = 0.1;
      else if (typeof val !== "number") this.speed = 1;
      else this.speed = parseFloat(val.toPrecision(2));
      this.$refs.video.playbackRate = this.speed;
      localStorage.setItem("speed", this.speed);
    }
  },
  mounted() {
    let ticker = async () => {
      await this.refresh();
      let isDownloading = Object.values(this.videos).some(
        vid => !vid.downloaded
      );
      setTimeout(ticker, isDownloading ? 500 : 5000);
    };
    ticker();
  }
});
console.log(app);
