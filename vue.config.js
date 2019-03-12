module.exports = {
  devServer: {
    before(app, server) {
      require("./server/setup-api")(app)
      // require("./server/setup-socket")(app)
    },
  },
}
