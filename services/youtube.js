const ytDlp = require("yt-dlp-exec");

async function getFormats(videoId) {

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const data = await ytDlp(url, {
    dumpSingleJson: true,
    noWarnings: true
  });

  const videos = data.formats
    .filter(f => f.vcodec !== "none" && f.height)
    .map(f => ({
      height: f.height,
      url: f.url
    }));

  const audio = data.formats
    .filter(f => f.vcodec === "none" && f.acodec !== "none")
    .sort((a,b) => b.abr - a.abr)[0];

  return {
    title: data.title,
    audio: audio.url,
    videos
  };
}

module.exports = { getFormats };