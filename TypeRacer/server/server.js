const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log(error.message);
  });

// Define the models
const Word = mongoose.model("Word", { word: String });
const Score = mongoose.model("Score", { score: Number, wpm: Number });

// Define the routes
app.get("/api/words", async (req, res) => {
  // Get 10 random words from the database
  try {
    const words = await Word.aggregate([{ $sample: { size: 10 } }]);
    res.json(words.map((word) => word.word));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get("/api/scores", async (req, res) => {
  // Get all scores from the database, sorted by wpm in descending order
  try {
    const scores = await Score.find().sort({ wpm: -1 });
    res.json(scores);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post("/api/scores", async (req, res) => {
  // Add a new score to the database
  try {
    const { score } = req.body;
    const wpm = Math.round((score / 60) * 60);
    const newScore = new Score({ score, wpm });
    await newScore.save();
    res.json({ message: "Score added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server started at port ${PORT}`);
});