module.exports = {
  devServer: {
    before(app, server) {
      require("./server/setup-api")(app)
    },
  },
}
