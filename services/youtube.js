const ytDlp = require("yt-dlp-exec");

async function getVideoInfo(videoId) {

  const url = `https://www.youtube.com/watch?v=${videoId}`;

  const data = await ytDlp(url, {
    dumpSingleJson: true,
    noWarnings: true,
    cookies: './cookies.txt'
  });

  const videoFormats = data.formats.filter(
    f => f.vcodec !== "none" && f.height
  );

  const bestPerQuality = {};

  videoFormats.forEach(f => {

    const h = f.height;

    if (!bestPerQuality[h] || (f.tbr || 0) > (bestPerQuality[h].tbr || 0)) {
      bestPerQuality[h] = f;
    }

  });

  const formats = Object.values(bestPerQuality)
    .sort((a,b)=>a.height-b.height)
    .map(f => ({
      quality: `${f.height}p`,
      formatId: f.format_id,
      ext: f.ext,
      videoUrl: f.url
    }));


  const audio = data.formats
    .filter(f => f.vcodec === "none" && f.acodec !== "none")
    .sort((a,b)=>(b.abr || 0)-(a.abr || 0))[0];


  return {
    title: data.title,
    thumbnail: data.thumbnail,
    audio: audio?.url,
    videos: formats
  };

}

module.exports = { getVideoInfo };
