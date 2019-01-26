import * as express from "express";
import * as logger from "morgan";
import YT from "./yt";

if (!process.env.PORT) process.env.PORT = "8080";

const app = express();
const yt = new YT();

app.use(logger("dev"));
app.use(express.static("static"));

app.get("/api/videos", (req, res) => {
  res.json(yt.videos);
});

app.get("/api/update", (req, res) => {
  yt.update().then(() => yt.saveState());
  res.json("ok");
});

app.get("/api/removevideo/:index", (req, res) => {
  let index = req.params.index;
  res.json(yt.remove(index));
  yt.saveState();
});

app.get("/api/setcookie/:cookie", (req, res) => {
  let cookie = req.params.cookie;
  yt.cookie = cookie;
  res.json("ok");
  yt.saveState();
});

app.listen(process.env.PORT, () =>
  console.log("Listening on port " + process.env.PORT)
);
