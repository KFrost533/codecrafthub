// app.js
// Simple CodeCraftHub REST API for managing courses using a JSON file as storage.
// Requirements satisfied:
// - Express REST API with CRUD for courses
// - Data stored in courses.json (auto-created if missing)
// - Endpoints: POST /api/courses, GET /api/courses, GET /api/courses/:id, PUT /api/courses/:id, DELETE /api/courses/:id
// - Course fields: id (auto-increment starting at 1), name, description, target_date (YYYY-MM-DD),
//   status (Not Started, In Progress, Completed), created_at (timestamp)
// - Proper error handling and helpful comments
// - Server runs on port 5000

'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

// Create the Express app
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Path to the data file (courses.json) stored in the project root
const DATA_FILE = path.join(__dirname, 'courses.json');

// Allowed status values
const ALLOWED_STATUS = new Set(['Not Started', 'In Progress', 'Completed']);

// Ensure the data file exists; create it with an empty array if missing
async function ensureDataFile() {
  try {
    await fs.promises.access(DATA_FILE, fs.constants.F_OK);
  } catch {
    // If file doesn't exist, create it with an empty array
    await fs.promises.writeFile(DATA_FILE, JSON.stringify([]), 'utf8');
  }
}

// Read all courses from the JSON file
async function readAllCourses() {
  await ensureDataFile();
  const content = await fs.promises.readFile(DATA_FILE, 'utf8');
  try {
    const data = JSON.parse(content);
    if (Array.isArray(data)) return data;
    // If JSON is not an array, reset to empty array
    await fs.promises.writeFile(DATA_FILE, JSON.stringify([]), 'utf8');
    return [];
  } catch {
    // If JSON is corrupted, reset to empty array
    await fs.promises.writeFile(DATA_FILE, JSON.stringify([]), 'utf8');
    return [];
  }
}

// Write all courses to the JSON file
async function writeAllCourses(courses) {
  await ensureDataFile();
  await fs.promises.writeFile(DATA_FILE, JSON.stringify(courses, null, 2), 'utf8');
}

// Validate that a date string is in YYYY-MM-DD and represents a real date
function isValidDateYYYYMMDD(dateStr) {
  if (typeof dateStr !== 'string') return false;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return false;

  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;

  // Extra check to ensure components match (e.g., 2023-02-31 would become 2023-03-03)
  const [year, month, day] = dateStr.split('-').map(Number);
  return d.getUTCFullYear() === year && (d.getUTCMonth() + 1) === month && d.getUTCDate() === day;
}

// Validate payload for create/update
function validatePayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { ok: false, error: 'Invalid payload' };
  }

  const { name, description, target_date, status } = payload;

  if (!name || typeof name !== 'string') return { ok: false, error: 'name is required' };
  if (!description || typeof description !== 'string') return { ok: false, error: 'description is required' };
  if (!target_date || !isValidDateYYYYMMDD(target_date)) {
    return { ok: false, error: 'target_date is required and must be in YYYY-MM-DD format' };
  }
  if (!status || !ALLOWED_STATUS.has(status)) {
    return {
      ok: false,
      error: `status must be one of ${Array.from(ALLOWED_STATUS).join(', ')}`
    };
  }

  return { ok: true };
}

// Create a new course with auto-incremented id and created_at timestamp
async function createCourse(payload) {
  const courses = await readAllCourses();

  // Determine next id (max existing id + 1, or 1 if none)
  const maxId = courses.reduce((max, c) => Math.max(max, typeof c.id === 'number' ? c.id : 0), 0);
  const newId = maxId + 1;

  const newCourse = {
    id: newId,
    name: payload.name,
    description: payload.description,
    target_date: payload.target_date,
    status: payload.status,
    created_at: new Date().toISOString()
  };

  courses.push(newCourse);
  await writeAllCourses(courses);
  return newCourse;
}

// Update an existing course by id
async function updateCourse(id, payload) {
  const courses = await readAllCourses();
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) return null;

  // Preserve id and created_at; update other fields
  const existing = courses[idx];
  const updatedCourse = {
    ...existing,
    name: payload.name,
    description: payload.description,
    target_date: payload.target_date,
    status: payload.status
  };

  courses[idx] = updatedCourse;
  await writeAllCourses(courses);
  return updatedCourse;
}

// Delete a course by id
async function deleteCourse(id) {
  const courses = await readAllCourses();
  const idx = courses.findIndex(c => c.id === id);
  if (idx === -1) return false;

  courses.splice(idx, 1);
  await writeAllCourses(courses);
  return true;
}

// ----------------------
// Routes (API endpoints)
// ----------------------

// Create a new course
// POST /api/courses
app.post('/api/courses', async (req, res) => {
  try {
    const payload = req.body;
    const validation = validatePayload(payload);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    const newCourse = await createCourse(payload);
    res.status(201).json(newCourse);
  } catch (err) {
    console.error('Error creating course:', err);
    res.status(500).json({ error: 'Failed to create course due to server error' });
  }
});

// Get all courses
// GET /api/courses
app.get('/api/courses', async (req, res) => {
  try {
    const courses = await readAllCourses();
    res.json(courses);
  } catch (err) {
    console.error('Error reading courses:', err);
    res.status(500).json({ error: 'Failed to read courses' });
  }
});

// Get a specific course by id
// GET /api/courses/:id
app.get('/api/courses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const courses = await readAllCourses();
    const course = courses.find(c => c.id === id);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(course);
  } catch (err) {
    console.error('Error reading course:', err);
    res.status(500).json({ error: 'Failed to read course' });
  }
});

// Update a course by id
// PUT /api/courses/:id
app.put('/api/courses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const payload = req.body;
    const validation = validatePayload(payload);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }

    const updated = await updateCourse(id, payload);
    if (!updated) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.json(updated);
  } catch (err) {
    console.error('Error updating course:', err);
    res.status(500).json({ error: 'Failed to update course' });
  }
});

// Delete a course by id
// DELETE /api/courses/:id
app.delete('/api/courses/:id', async (req, res) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isFinite(id)) {
      return res.status(400).json({ error: 'Invalid course id' });
    }

    const deleted = await deleteCourse(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Course not found' });
    }

    res.status(204).end();
  } catch (err) {
    console.error('Error deleting course:', err);
    res.status(500).json({ error: 'Failed to delete course' });
  }
});

// ----------------------
// Start the server
// ----------------------

// Port 5000 as requested
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`CodeCraftHub API is running on http://localhost:${PORT}/api`);
  // Optional: ensure the data file exists on startup
  ensureDataFile().catch((err) => console.error('Failed to ensure data file on startup:', err));
});