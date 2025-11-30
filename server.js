
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();

app.use(bodyParser.json());
app.use(cors());
const path = require("path");

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "operator-widget.html"));
});



let visitors = [];

app.get('/slots', (req, res) => {
  const free = slots.filter(s => !s.booked);
  res.json(free);
});
let slots = [
  { slot_id: 'c101', time: '2025-12-04T15:00:00+05:30', mentor: 'Cloud Architect', field: 'Cloud', booked: false },
  { slot_id: 'd102', time: '2025-12-05T11:00:00+05:30', mentor: 'DevOps Engineer', field: 'DevOps', booked: false },
  { slot_id: 'da103', time: '2025-12-05T18:00:00+05:30', mentor: 'Data Analyst', field: 'Data', booked: false },
  { slot_id: 'w104', time: '2025-12-06T13:00:00+05:30', mentor: 'Web Developer', field: 'Web', booked: false },
  { slot_id: 'm105', time: '2025-12-06T19:00:00+05:30', mentor: 'ML Engineer', field: 'ML/AI', booked: false },
  { slot_id: 's106', time: '2025-12-07T16:00:00+05:30', mentor: 'Security Analyst', field: 'Cybersecurity', booked: false }
];
app.post('/saveRecord', (req, res) => {
  const data = req.body;

  if (!data.visitor_id) {
    return res.status(400).json({ status: "error", msg: "Missing visitor ID" });
  }

  if (data.slot_id) {
    const slot = slots.find(s => s.slot_id === data.slot_id);
    if (!slot) return res.status(404).json({ status: "error", msg: "Slot not found" });
    if (slot.booked) return res.status(409).json({ status: "error", msg: "Slot already booked" });
    slot.booked = true;
  }

  visitors.push(data);
  res.json({ status: "ok", saved: true });
});

app.get('/visitor/:id', (req, res) => {
  const visitor = visitors.find(v => v.visitor_id === req.params.id);
  if (!visitor) return res.status(404).json({ status: "not_found" });
  res.json(visitor);
});

app.post('/pushToCRM', (req, res) => {
  res.json({ status: "pushed_to_crm_mock" });
});

app.get("/", (req, res) => {
  res.send("SkillSculptor API is running!");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log("Server running on port", PORT));
