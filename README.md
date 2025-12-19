# Rest API Job Finder

A custom-made REST API for job finding and management. Built with Node.js, Express, and MongoDB.

## Features

- **CRUD Operations**: Create, Read, Update, and Delete job listings
- **Search & Filter**: Search jobs by keywords and filter by location, company, and job type
- **In-Memory Mode**: Works without MongoDB for quick testing and development
- **RESTful Design**: Clean and intuitive API endpoints
- **Soft Delete**: Jobs are marked as inactive rather than permanently deleted

## Technologies Used

- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database (optional)
- **Mongoose**: ODM for MongoDB
- **CORS**: Cross-Origin Resource Sharing enabled
- **dotenv**: Environment variable management

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Renkaslana/Rest-API_Job_Finder.git
cd Rest-API_Job_Finder
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, for MongoDB):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env` (optional):
```
PORT=3000
MONGODB_URI=mongodb://localhost:27017/jobfinder
```

## Usage

### Start the server:

```bash
npm start
```

The server will run on `http://localhost:3000` by default.

### Development mode (with auto-reload):

```bash
npm run dev
```

## API Endpoints

### Base URL
```
http://localhost:3000/api/jobs
```

### 1. Get All Jobs
```
GET /api/jobs
```
Returns all active job listings.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "Jakarta, Indonesia",
    "description": "We are looking for a talented software engineer...",
    "salary": "Rp 10,000,000 - Rp 15,000,000",
    "type": "Full-time",
    "requirements": ["JavaScript", "Node.js", "React"],
    "postedDate": "2024-01-15T00:00:00.000Z",
    "isActive": true
  }
]
```

### 2. Get Job by ID
```
GET /api/jobs/:id
```
Returns a specific job by ID.

**Response:**
```json
{
  "id": 1,
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Jakarta, Indonesia",
  "description": "We are looking for a talented software engineer...",
  "salary": "Rp 10,000,000 - Rp 15,000,000",
  "type": "Full-time",
  "requirements": ["JavaScript", "Node.js", "React"],
  "postedDate": "2024-01-15T00:00:00.000Z",
  "isActive": true
}
```

### 3. Create New Job
```
POST /api/jobs
```
Creates a new job listing.

**Request Body:**
```json
{
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Jakarta, Indonesia",
  "description": "We are looking for a talented software engineer...",
  "salary": "Rp 10,000,000 - Rp 15,000,000",
  "type": "Full-time",
  "requirements": ["JavaScript", "Node.js", "React"]
}
```

**Required Fields:**
- `title` (string)
- `company` (string)
- `location` (string)
- `description` (string)

**Optional Fields:**
- `salary` (string, default: "Not specified")
- `type` (string, options: "Full-time", "Part-time", "Contract", "Internship", "Freelance", default: "Full-time")
- `requirements` (array of strings, default: [])

**Response:**
```json
{
  "id": 1,
  "title": "Software Engineer",
  "company": "Tech Corp",
  "location": "Jakarta, Indonesia",
  "description": "We are looking for a talented software engineer...",
  "salary": "Rp 10,000,000 - Rp 15,000,000",
  "type": "Full-time",
  "requirements": ["JavaScript", "Node.js", "React"],
  "postedDate": "2024-01-15T00:00:00.000Z",
  "isActive": true,
  "createdAt": "2024-01-15T00:00:00.000Z",
  "updatedAt": "2024-01-15T00:00:00.000Z"
}
```

### 4. Update Job
```
PUT /api/jobs/:id
```
Updates an existing job listing.

**Request Body:** (all fields optional)
```json
{
  "title": "Senior Software Engineer",
  "salary": "Rp 15,000,000 - Rp 20,000,000"
}
```

**Response:**
```json
{
  "id": 1,
  "title": "Senior Software Engineer",
  "company": "Tech Corp",
  "location": "Jakarta, Indonesia",
  "description": "We are looking for a talented software engineer...",
  "salary": "Rp 15,000,000 - Rp 20,000,000",
  "type": "Full-time",
  "requirements": ["JavaScript", "Node.js", "React"],
  "postedDate": "2024-01-15T00:00:00.000Z",
  "isActive": true,
  "updatedAt": "2024-01-16T00:00:00.000Z"
}
```

### 5. Delete Job
```
DELETE /api/jobs/:id
```
Soft deletes a job (marks as inactive).

**Response:**
```json
{
  "message": "Job deleted successfully",
  "job": {
    "id": 1,
    "title": "Software Engineer",
    "isActive": false,
    ...
  }
}
```

### 6. Search Jobs
```
GET /api/jobs/search/query
```
Search and filter job listings.

**Query Parameters:**
- `q` (string): Search keyword (searches in title, company, description, location)
- `location` (string): Filter by location
- `type` (string): Filter by job type
- `company` (string): Filter by company name

**Example:**
```
GET /api/jobs/search/query?q=engineer&location=Jakarta&type=Full-time
```

**Response:**
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "company": "Tech Corp",
    "location": "Jakarta, Indonesia",
    ...
  }
]
```

## Example Usage with cURL

### Get all jobs:
```bash
curl http://localhost:3000/api/jobs
```

### Create a new job:
```bash
curl -X POST http://localhost:3000/api/jobs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Frontend Developer",
    "company": "StartupXYZ",
    "location": "Bandung, Indonesia",
    "description": "Looking for a creative frontend developer",
    "salary": "Rp 8,000,000 - Rp 12,000,000",
    "type": "Full-time",
    "requirements": ["HTML", "CSS", "JavaScript", "React"]
  }'
```

### Search for jobs:
```bash
curl "http://localhost:3000/api/jobs/search/query?q=developer&location=Jakarta"
```

### Update a job:
```bash
curl -X PUT http://localhost:3000/api/jobs/1 \
  -H "Content-Type: application/json" \
  -d '{"salary": "Rp 10,000,000 - Rp 15,000,000"}'
```

### Delete a job:
```bash
curl -X DELETE http://localhost:3000/api/jobs/1
```

## Project Structure

```
Rest-API_Job_Finder/
├── models/
│   └── Job.js          # Job data model
├── routes/
│   └── jobs.js         # Job routes/endpoints
├── .env.example        # Example environment variables
├── .gitignore         # Git ignore file
├── package.json       # Dependencies and scripts
├── server.js          # Main server file
└── README.md          # Documentation
```

## Running Without MongoDB

The API works without MongoDB using in-memory storage. This is perfect for:
- Quick testing and development
- Demonstrations
- Learning and experimentation

Simply start the server without setting the `MONGODB_URI` in your `.env` file.

## Error Handling

The API includes error handling for:
- Invalid requests (400 Bad Request)
- Resources not found (404 Not Found)
- Server errors (500 Internal Server Error)

All errors return a JSON response with an error message:
```json
{
  "error": "Error message here"
}
```

## License

ISC

## Contributing

Feel free to submit issues and enhancement requests!
