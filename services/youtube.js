const ytDlp = require("yt-dlp-exec");
const path = require("path");
const cache = new Map();
const CACHE_TTL = 60 * 60 * 1000;
async function getVideoInfo(videoId) {
  const cached = cache.get(videoId);
  const now = Date.now();
  if (cached && now - cached.timestamp < CACHE_TTL) {
    console.log("Cache hit:", videoId);
    return cached.info;
  }
  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const data = await ytDlp(url, {
    dumpSingleJson: true,
    noCheckCertificates: true,
    noWarnings: true,
    preferFreeFormats: true,
    simulate: true,
  });

  const videoFormats = data.formats.filter(
    (f) => f.vcodec !== "none" && f.height,
  );

  const bestPerQuality = {};

  videoFormats.forEach((f) => {
    const h = f.height;

    if (!bestPerQuality[h] || (f.tbr || 0) > (bestPerQuality[h].tbr || 0)) {
      bestPerQuality[h] = f;
    }
  });

  const formats = Object.values(bestPerQuality)
    .sort((a, b) => a.height - b.height)
    .map((f) => ({
      quality: `${f.height}p`,
      formatId: f.format_id,
      ext: f.ext,
      videoUrl: f.url,
    }));

  const audio = data.formats
    .filter((f) => f.vcodec === "none" && f.acodec !== "none")
    .sort((a, b) => (b.abr || 0) - (a.abr || 0))[0];
  let info = {
    title: data.title,
    thumbnail: data.thumbnail,
    audio: audio?.url,
    videos: formats,
  };
  cache.set(videoId, { info, timestamp: now });
  return {
    title: data.title,
    thumbnail: data.thumbnail,
    audio: audio?.url,
    videos: formats,
  };
}

module.exports = { getVideoInfo };
