const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.static('public'));
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data', 'events.json');

function readEvents() {
  const rawData = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(rawData);
}

function writeEvents(events) {
  const jsonString = JSON.stringify(events, null, 2);
  fs.writeFileSync(DATA_FILE, jsonString);
}

app.get('/api/events', (req, res) => {
  const events = readEvents();
  res.json(events);
});

app.get('/api/events/:id', (req, res) => {
  const events = readEvents();
  const event = events.find(e => String(e.id) === req.params.id);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  res.json(event);
});

app.post('/api/events', (req, res) => {
  const { title, description, date, location, capacity } = req.body;

  if (!title || !date || !location) {
    return res.status(400).json({ error: 'Title, date, and location are required' });
  }

  const events = readEvents();

  const newEvent = {
    id: Date.now(),
    title,
    description: description || '',
    date,
    location,
    capacity: capacity ? parseInt(capacity) : null,
    attendees: []
  };

  events.push(newEvent);
  writeEvents(events);

  res.status(201).json(newEvent);
});

app.put('/api/events/:id', (req, res) => {
  const events = readEvents();
  const event = events.find(e => String(e.id) === req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const { title, description, date, location, capacity } = req.body;
  if (!title || !date || !location) {
    return res.status(400).json({ error: 'Title, date, and location are required' });
  }

  event.title = title;
  event.description = description || '';
  event.date = date;
  event.location = location;
  event.capacity = capacity ? parseInt(capacity) : null;

  writeEvents(events);
  res.json(event);
});

app.delete('/api/events/:id', (req, res) => {
  const events = readEvents();
  const index = events.findIndex(e => String(e.id) === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Event not found' });
  }

  const deleted = events.splice(index, 1);
  writeEvents(events);

  res.json({ message: 'Event deleted', event: deleted[0] });
});

app.post('/api/events/:id/rsvp', (req, res) => {
  const { name } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required to RSVP' });
  }

  const events = readEvents();
  const event = events.find(e => String(e.id) === req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  if (event.capacity !== null && event.attendees.length >= event.capacity) {
    return res.status(400).json({ error: 'Event is full' });
  }

  event.attendees.push({ name, rsvpAt: new Date().toISOString() });
  writeEvents(events);

  res.status(201).json(event);
});

app.delete('/api/events/:id/rsvp', (req, res) => {
  const { name } = req.body;
  const events = readEvents();
  const event = events.find(e => String(e.id) === req.params.id);

  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }

  event.attendees = event.attendees.filter(a => a.name !== name);
  writeEvents(events);

  res.json(event);
});

app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});