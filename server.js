// Directory structure:
// - frontend (React.js)
// - backend (Node.js + Express)
// - database (MongoDB)

// --- Backend Code (Node.js) ---

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/eventDashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Connected to MongoDB')).catch(err => console.error('MongoDB connection error:', err));

// Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

const EventSchema = new mongoose.Schema({
  name: String,
  description: String,
  location: String,
  date: Date,
  attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Attendee' }],
});

const AttendeeSchema = new mongoose.Schema({
  name: String,
  email: String,
});

const TaskSchema = new mongoose.Schema({
  name: String,
  deadline: Date,
  status: { type: String, enum: ['Pending', 'Completed'], default: 'Pending' },
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Attendee' },
});

const User = mongoose.model('User', UserSchema);
const Event = mongoose.model('Event', EventSchema);
const Attendee = mongoose.model('Attendee', AttendeeSchema);
const Task = mongoose.model('Task', TaskSchema);

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) return res.status(401).json({ error: 'Access denied' });

  jwt.verify(token, 'secretKey', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// Routes
// Authentication APIs
app.post('/api/register', async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const user = new User({ username: req.body.username, password: hashedPassword });
    await user.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.body.username });
    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user._id }, 'secretKey', { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Event APIs
app.post('/api/events', authenticateToken, async (req, res) => {
  try {
    const event = new Event(req.body);
    await event.save();
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/events', authenticateToken, async (req, res) => {
  const events = await Event.find().populate('attendees');
  res.json(events);
});

app.put('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(event);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/events/:id', authenticateToken, async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Attendee APIs
app.post('/api/attendees', authenticateToken, async (req, res) => {
  try {
    const attendee = new Attendee(req.body);
    await attendee.save();
    res.status(201).json(attendee);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/attendees', authenticateToken, async (req, res) => {
  const attendees = await Attendee.find();
  res.json(attendees);
});

app.delete('/api/attendees/:id', authenticateToken, async (req, res) => {
  try {
    await Attendee.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Task APIs
app.post('/api/tasks', authenticateToken, async (req, res) => {
  try {
    const task = new Task(req.body);
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/events/:eventId/tasks', authenticateToken, async (req, res) => {
  const tasks = await Task.find({ event: req.params.eventId }).populate('assignedTo');
  res.json(tasks);
});

app.put('/api/tasks/:id', authenticateToken, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(task);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
