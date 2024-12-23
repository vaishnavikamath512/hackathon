const express = require('express');
const router = express.Router();

let events = [];

router.get('/', (req, res) => res.json(events));

router.post('/', (req, res) => {
  const event = { id: Date.now(), ...req.body };
  events.push(event);
  res.json(event);
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const index = events.findIndex((event) => event.id == id);
  events[index] = { ...events[index], ...req.body };
  res.json(events[index]);
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  events = events.filter((event) => event.id != id);
  res.json({ success: true });
});

module.exports = router;
