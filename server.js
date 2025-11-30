const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require("path");

const app = express();

app.use(bodyParser.json());
app.use(cors());

// Serve static files from /public
app.use(express.static(path.join(__dirname, "public")));

// Serve operator-widget.html at homepage
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "operator-widget.html"));
});

// In-memory store
let visitors = [];

// All available slots
let slots = [
  { slot_id: 'c101', time: '2025-12-04T15:00:00+05:30', mentor: 'Cloud Architect', field: 'Cloud', booked: false },
  { slot_id: 'd102', time: '2025-12-05T11:00:00+05:30', mentor: 'DevOps Engineer', field: 'DevOps', booked: false },
  { slot_id: 'da103', time: '2025-12-05T18:00:00+05:30', mentor: 'Data Analyst', field: 'Data', booked: false },
  { slot_id: 'w104', time: '2025-12-06T13:00:00+05:30', mentor: 'Web Developer', field: 'Web', booked: false },
  { slot_id: 'm105', time: '2025-12-06T19:00:00+05:30', mentor: 'ML Engineer', field: 'ML/AI', booked: false },
  { slot_id: 's106', time: '2025-12-07T16:00:00+05:30', mentor: 'Security Analyst', field: 'Cybersecurity', booked: false }
];

// Get free slots
app.get('/slots', (req, res) => {
  const free = slots.filter(s => !s.booked);
  res.json(free);
});

// NEW ENDPOINT: Get slots by field
app.get('/slotByField', (req, res) => {
  const field = req.query.field;
  if (!field) {
    return res.status(400).json({ status: "error", msg: "Field parameter is required" });
  }
  
  const freeSlots = slots.filter(s => !s.booked && s.field === field);
  res.json(freeSlots);
});

// Save visitor record + book slot if needed
app.post('/saveRecord', (req, res) => {
  const data = req.body;

  // Generate visitor_id if not provided
  if (!data.visitor_id) {
    data.visitor_id = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
  }

  if (data.slot_id) {
    const slot = slots.find(s => s.slot_id === data.slot_id);
    if (!slot) return res.status(404).json({ status: "error", msg: "Slot not found" });
    if (slot.booked) return res.status(409).json({ status: "error", msg: "Slot already booked" });
    slot.booked = true;
  }

  // Remove existing visitor if same ID exists
  visitors = visitors.filter(v => v.visitor_id !== data.visitor_id);
  
  visitors.push(data);
  res.json({ 
    status: "ok", 
    saved: true, 
    visitor_id: data.visitor_id,
    message: "Record saved successfully" 
  });
});

// Fetch single visitor
app.get('/visitor/:id', (req, res) => {
  const visitor = visitors.find(v => v.visitor_id === req.params.id);
  if (!visitor) return res.status(404).json({ status: "not_found" });
  res.json(visitor);
});

// Get all visitors (NEW - for operator panel)
app.get('/visitors', (req, res) => {
  res.json(visitors);
});

// CRM mock API - enhanced to accept visitor data
app.post('/pushToCRM', (req, res) => {
  const { visitor_id } = req.body;
  const visitor = visitors.find(v => v.visitor_id === visitor_id);
  
  if (!visitor) {
    return res.status(404).json({ status: "error", msg: "Visitor not found" });
  }
  
  // Mock CRM integration
  console.log('Pushing to CRM:', visitor);
  res.json({ 
    status: "success", 
    message: "Lead synced to CRM successfully",
    visitor_data: visitor
  });
});

// NEW: Reset slots endpoint (for testing)
app.post('/resetSlots', (req, res) => {
  slots.forEach(slot => {
    slot.booked = false;
  });
  res.json({ status: "ok", message: "All slots reset to available" });
});

// NEW: Get slot status
app.get('/slotStatus', (req, res) => {
  const slotStatus = slots.map(slot => ({
    slot_id: slot.slot_id,
    time: slot.time,
    mentor: slot.mentor,
    field: slot.field,
    booked: slot.booked
  }));
  res.json(slotStatus);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server running on port", PORT));
