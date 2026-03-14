const express = require("express");
const cors = require("cors");

const { getVideoInfo } = require("./services/youtube");
const app = express();
app.use(cors());
app.use(express.static("public"));
const { spawn } = require("child_process");
const ffmpegPath = require("ffmpeg-static");


const PORT = process.env.PORT || 3000;

app.get("/api/video/:id", async (req, res) => {
  try {
    const data = await getVideoInfo(req.params.id);

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

app.get("/stream", (req, res) => {
  const { videoUrl, audioUrl } = req.query;

  if (!videoUrl || !audioUrl) {
    return res.status(400).send("videoUrl and audioUrl required");
  }

  res.setHeader("Content-Type", "video/mp4");

  const ffmpeg = spawn(ffmpegPath, [
    "-i", videoUrl,
    "-i", audioUrl,
    "-c:v", "copy",
    "-c:a", "aac",
    "-movflags", "frag_keyframe+empty_moov",
    "-f", "mp4",
    "pipe:1"
  ]);

  ffmpeg.stdout.pipe(res);
  
  ffmpeg.on("close", () => {
    res.end();
  });

  req.on("close", () => {
    ffmpeg.kill("SIGINT");
  });
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
