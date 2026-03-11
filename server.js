const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const ffmpeg = require("fluent-ffmpeg");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;

ffmpeg.setFfmpegPath(ffmpegPath);
const { getFormats } = require("./services/youtube");

const app = express();
app.use(cors());

const CACHE = path.join(__dirname,"cache/videos");

if(!fs.existsSync(CACHE)){
  fs.mkdirSync(CACHE,{recursive:true});
}

app.get("/api/video/:id", async (req,res)=>{

  const info = await getFormats(req.params.id);

  res.json({
    title: info.title,
    qualities: info.videos.map(v => v.height)
  });

});

app.get("/stream/:id/:quality", async (req,res)=>{

  const {id,quality} = req.params;

//   const filePath = path.join(CACHE,`${id}-${quality}.mp4`);

//   if(fs.existsSync(filePath)){
//     return res.sendFile(filePath);
//   }

  const info = await getFormats(id);

  const video = info.videos.find(v => v.height == quality);

  if(!video){
    return res.status(404).send("Quality not found");
  }

  ffmpeg()
    .input(video.url)
    .input(info.audio)
    .videoCodec("copy")
    .audioCodec("aac")
    .outputOptions("-movflags frag_keyframe+empty_moov")
    .save(filePath)
    .on("end",()=>{

      res.sendFile(filePath);

    })
    .on("error",(err)=>{
      res.status(500).send(err.message);
    });

});

app.listen(3000,()=>{
  console.log("Server running http://localhost:3000");
});