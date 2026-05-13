# CodeCraftHub API

Project: CodeCraftHub is a lightweight REST API for tracking learning courses. Built with Node.js and Express, it stores data in a JSON file (`courses.json`) on disk. It demonstrates basic CRUD operations, input validation, and simple error handling without authentication.

## Features

- Create, Read (all and by id), Update, and Delete (CRUD) for courses
- Data persisted in a JSON file named `courses.json` (auto-created if missing)
- Auto-incrementing numeric id starting from 1
- Each course fields:
	- `id` (auto-generated)
	- `name` (required)
	- `description` (required)
	- `target_date` (required, format `YYYY-MM-DD`)
	- `status` (required, one of: `Not Started`, `In Progress`, `Completed`)
	- `created_at` (auto-generated timestamp)
- Basic error handling for:
	- Missing or invalid fields
	- Course not found
	- Invalid status values
	- File read/write errors

## Tech stack

- Node.js
- Express

## Prerequisites

- Node.js (14.x or newer recommended)

## Installation

1. Clone or download the project.
2. Open a terminal in the project root.
3. Install dependencies:

```bash
npm install
```

No separate database is required; the app will manage the JSON file itself.

## How to run the application

Start the server:

```bash
npm start
```

By default, the server runs on port 5000.

API base URL: `http://localhost:5000/api`

## API documentation and examples

Base path: `/api/courses`

### Create a new course

Endpoint: `POST /api/courses`

Description: Add a new course

Required body fields: `name`, `description`, `target_date` (`YYYY-MM-DD`), `status`

Status values: `Not Started`, `In Progress`, `Completed`

Example request:

```bash
curl curl -X POST -H "Content-Type: application/json" -d '{"name":"Learn Node.js","description":"Understand Node.js basics","target_date":"2026-12-31","status":"Not Started"}' http://localhost:5000/api/courses
```

Example successful response (201):

```json
{ "id": 1, "name": "Learn Node.js", "description": "Understand Node.js basics", "target_date": "2026-12-31", "status": "Not Started", "created_at": "2026-05-13T12:34:56.789Z" }
```

Error examples:

- Missing fields or invalid data -> `400` with `{ "error": "…" }`
- Example: missing name

```bash
curl -X POST -H "Content-Type: application/json" -d '{"description":"Desc","target_date":"2026-12-31","status":"Not Started"}' http://localhost:5000/api/courses
```

### Get all courses

Endpoint: `GET /api/courses`

Description: Retrieve all courses

Response: `200` with an array of course objects

Example:

```bash
curl curl http://localhost:5000/api/courses
```

Response:

```json
[ { "id": 1, "name": "Learn Node.js", "description": "Understand Node.js basics", "target_date": "2026-12-31", "status": "Not Started", "created_at": "2026-05-13T12:34:56.789Z" }, ... ]
```

### Get a specific course by id

Endpoint: `GET /api/courses/:id`

Description: Retrieve a single course by its id

Response: `200` with the course object or `404` if not found

Example:

```bash
curl curl http://localhost:5000/api/courses/1
```

Response (200) example:

```json
{ "id": 1, "name": "Learn Node.js", "description": "Understand Node.js basics", "target_date": "2026-12-31", "status": "Not Started", "created_at": "2026-05-13T12:34:56.789Z" }
```

### Update a course

Endpoint: `PUT /api/courses/:id`

Description: Update an existing course (all fields required in payload)

Required body fields: `name`, `description`, `target_date` (`YYYY-MM-DD`), `status`

Status values: `Not Started`, `In Progress`, `Completed`

Example request:

```bash
curl curl -X PUT -H "Content-Type: application/json" -d '{"name":"Learn Node.js","description":"Updated description","target_date":"2027-01-31","status":"In Progress"}' http://localhost:5000/api/courses/1
```

Example successful response (200):

```json
{ "id": 1, "name": "Learn Node.js", "description": "Updated description", "target_date": "2027-01-31", "status": "In Progress", "created_at": "2026-05-13T12:34:56.789Z" }
```

### Delete a course

Endpoint: `DELETE /api/courses/:id`

Description: Remove a course

Response: `204 No Content` on success, `404` if not found

Example:

```bash
curl curl -X DELETE http://localhost:5000/api/courses/1
```

Notes:

- After deletion, the response will have status `204` with no body.
- If a course with the given id does not exist, you’ll receive `404` with `{ "error": "Course not found" }`.

## Data storage details

- Data is stored in a JSON file named `courses.json` in the project root.
- The server automatically creates `courses.json` with an empty array `[]` if it doesn’t exist.
- Each new course gets an auto-incremented id (starting from 1).
- The `created_at` timestamp is generated at the moment of creation.
- `target_date` must be a valid date in the format `YYYY-MM-DD`.

## Error handling overview

`400 Bad Request` for:

- Missing required fields
- Invalid `target_date` format
- Invalid status value
- Invalid payload structure

`404 Not Found` for:

- Non-existent course id during GET, PUT, or DELETE

`500 Internal Server Error` for:

- File read/write errors or unexpected server errors

All error responses follow the pattern: `{ "error": "<description>" }`

## Troubleshooting

### Server not starting on port 5000

- Ensure no other process is using port 5000
- Check that Node.js is installed (`node -v`)
- Verify that `npm install` completed successfully

### Data file issues

- If `courses.json` is corrupted, the app may reset to an empty array
- The app will auto-create the file if it’s missing

### Validation failures

- Ensure `target_date` is in `YYYY-MM-DD` format (e.g., `2026-12-31`)
- Ensure `status` is one of: `Not Started`, `In Progress`, `Completed`

### Permission errors

- Ensure the project directory is writable by the user running Node

### Debugging tips

- Check server logs in the console for stack traces
- Use `curl` or Postman to verify endpoints and payloads
- Start the server in a terminal to observe startup messages

If you’d like, I can tailor the README to include additional examples (e.g., partial updates with PATCH, or more detailed error codes).