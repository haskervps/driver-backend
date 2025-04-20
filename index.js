const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection URI — replace with your real one
const MONGO_URI = 'mongodb+srv://haskervps:Faarh%40123@cluster0.snxxbty.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => console.log('✅ Connected to MongoDB'));
db.on('error', console.error);

// Attendance schema
const attendanceSchema = new mongoose.Schema({
  username: String,
  time: String,
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Driver backend running');
});

app.post('/mark-attendance', async (req, res) => {
  const { username, time } = req.body;
  console.log('👉 Attendance received:', { username, time });

  try {
    const entry = new Attendance({ username, time });
    const saved = await entry.save();
    console.log('✅ Saved to MongoDB:', saved); // Log saved data
    res.status(200).json({ message: 'Attendance saved' });
  } catch (err) {
    console.error('❌ Failed to save attendance:', err);
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});


// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
