const express = require("express");
const cors = require("cors");
const { getVideoInfo } = require("./services/youtube");
const app = express();
app.use(cors());



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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
