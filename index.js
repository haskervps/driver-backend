const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB connection
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once('open', () => console.log('✅ Connected to MongoDB'));
db.on('error', console.error);

// Schemas
const attendanceSchema = new mongoose.Schema({
  username: String,
  time: String,
});
const Attendance = mongoose.model('Attendance', attendanceSchema);

const bookingSchema = new mongoose.Schema({
  customer: String,
  pickup: String,
  drop: String,
  time: String,
  status: String,
  driverUsername: String,
});
const Booking = mongoose.model('Booking', bookingSchema);

const driverSchema = new mongoose.Schema({
  username: String,
  password: String, // plaintext for now
});
const Driver = mongoose.model('Driver', driverSchema);

// Routes
app.get('/', (req, res) => {
  res.send('Driver backend running');
});

// Mark attendance
app.post('/mark-attendance', async (req, res) => {
  const { username, time } = req.body;
  console.log('👉 Attendance received:', { username, time });

  try {
    const entry = new Attendance({ username, time });
    const saved = await entry.save();
    console.log('✅ Saved to MongoDB:', saved);
    res.status(200).json({ message: 'Attendance saved' });
  } catch (err) {
    console.error('❌ Failed to save attendance:', err);
    res.status(500).json({ error: 'Failed to save attendance' });
  }
});

// Get bookings
app.get('/bookings', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});
app.get('/bookings/:username', async (req, res) => {
    const { username } = req.params;
    try {
      const bookings = await Booking.find({ driverUsername: username });
      res.json(bookings);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch driver bookings' });
    }
  });
  

// Update booking status
app.put('/bookings/:id', async (req, res) => {
  const { status } = req.body;

  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json({ message: 'Status updated', booking });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// Driver login
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

// Seed sample bookings
app.get('/seed-bookings', async (req, res) => {
    const sampleBookings = [
        {
          customer: 'John Doe',
          pickup: 'Location A',
          drop: 'Location B',
          time: '10:00 AM',
          status: 'Assigned',
          driverUsername: 'driver1',
        },
        {
          customer: 'Jane Smith',
          pickup: 'Location C',
          drop: 'Location D',
          time: '12:30 PM',
          status: 'Assigned',
          driverUsername: 'driver1',
        },
        {
          customer: 'Ali Khan',
          pickup: 'Location E',
          drop: 'Location F',
          time: '2:45 PM',
          status: 'Assigned',
          driverUsername: 'driver2',
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

// Seed sample driver
app.get('/seed-driver', async (req, res) => {
  const sampleDriver = { username: 'driver1', password: '1234' };

  try {
    await Driver.create(sampleDriver);
    res.send('✅ Sample driver created');
  } catch (err) {
    console.error(err);
    res.status(500).send('❌ Failed to seed driver');
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
