const express = require("express");
const cors = require("cors");

const { getVideoInfo } = require("./services/youtube");
const app = express();
app.use(cors());
app.use(express.static("public"));
const ffmpeg = require("fluent-ffmpeg");
const ffmpegStatic = require("ffmpeg-static");

// Tell fluent-ffmpeg where the binary is
ffmpeg.setFfmpegPath(ffmpegStatic);

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

app.get("/stream", async (req, res) => {
  try{
    const {id}=req.query;
   const data = await getVideoInfo(id);

  if (!data.audio) {
    return res.status(400).send("videoUrl and audioUrl required");
  }

  res.setHeader("Content-Type", "video/mp4");
   ffmpeg()
      .input(data.videos[3].videoUrl)
      .input(data.audio)
      .outputOptions([
        "-c:v copy",
        "-c:a aac",
        "-movflags frag_keyframe+empty_moov+faststart",
      ])
      .format("mp4")
      .on("error", (err) => {
        console.error("FFmpeg error:", err.message);
        if (!res.headersSent) {
          res.status(500).json({ error: "Streaming failed" });
        }
      })
      .pipe(res, { end: true });
    } catch (error) {
    console.error("Stream error:", error.message);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
