const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection URI — replace with your real one
const MONGO_URI = process.env.MONGO_URI;

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
// Booking schema
const bookingSchema = new mongoose.Schema({
    customer: String,
    pickup: String,
    drop: String,
    time: String,
    status: String,
  });
  
  const Booking = mongoose.model('Booking', bookingSchema);
  
// Driver schema
const driverSchema = new mongoose.Schema({
    username: String,
    password: String, // For now, store in plain text (can hash later)
  });
  const Driver = mongoose.model('Driver', driverSchema);


  
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

app.get('/seed-bookings', async (req, res) => {
    const sampleBookings = [
      {
        customer: 'John Doe',
        pickup: 'Location A',
        drop: 'Location B',
        time: '10:00 AM',
        status: 'Assigned',
      },
      {
        customer: 'Jane Smith',
        pickup: 'Location C',
        drop: 'Location D',
        time: '12:30 PM',
        status: 'Assigned',
      },
      {
        customer: 'Ali Khan',
        pickup: 'Location E',
        drop: 'Location F',
        time: '2:45 PM',
        status: 'Assigned',
      },
    ];
  
    try {
      await Booking.insertMany(sampleBookings);
      res.send('✅ Sample bookings added to MongoDB!');
    } catch (err) {
      console.error(err);
      res.status(500).send('❌ Failed to insert sample bookings.');
    }
  });

  app.get('/bookings', async (req, res) => {
    try {
      const bookings = await Booking.find();
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch bookings' });
    }
  });

app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const driver = await Driver.findOne({ username, password });

    if (!driver) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    res.json({ message: 'Login successful', username: driver.username });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

  

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
