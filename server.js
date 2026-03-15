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

app.get("/stream/:id", async(req, res) => {
  const data = await getVideoInfo(req.params.id);

  // Important for streaming
  res.setHeader("Content-Type", "video/mp4");
  res.setHeader("Transfer-Encoding", "chunked");
  res.setHeader("Cache-Control", "no-cache");
  res.flushHeaders();
  const ffmpeg = spawn(ffmpegPath, [
      "-i", data.videos[4].videoUrl,
      "-i", data.audio,,
      "-c:v", "copy",
      "-c:a", "aac",
      "-f", "hls",
      "-hls_time", "4",
      "-hls_list_size", "0",
      path.join(outputDir, "stream.m3u8")
    ]);

  ffmpeg.stdout.pipe(res);

ffmpeg.stdout.on("error", (err) => {
  console.error("FFmpeg stdout error:", err);
});

ffmpeg.stderr.on("data", (data) => {
  console.error("FFmpeg stderr:", data.toString());
});

ffmpeg.on("error", (err) => {
  console.error("FFmpeg process error:", err);
});

ffmpeg.on("close", (code, signal) => {
  console.log("FFmpeg closed with code:", code, "signal:", signal);
  res.end();
});
});


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
