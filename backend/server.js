// server.js
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// MySQL Connection
require("dotenv").config();
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected");
});

// API to Add Student
app.post("/add-student", (req, res) => {
  const {
    username,
    password,
    first_name,
    last_name,
    department,
    faculty,
    year,
  } = req.body;

  // Insert into users table
  const userQuery =
    'INSERT INTO users (username, password, role) VALUES (?, ?, "student")';
  db.query(userQuery, [username, password], (err, result) => {
    if (err) throw err;

    const userId = result.insertId;

    // Insert into students table
    const studentQuery =
      "INSERT INTO students (user_id, first_name, last_name, department, faculty, year) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(
      studentQuery,
      [userId, first_name, last_name, department, faculty, year],
      (err, result) => {
        if (err) throw err;
        res.send("Student added successfully");
      },
    );
  });
});

// API to Record Attendance
app.post("/record-attendance", (req, res) => {
  const { student_id, course_id, date_attend, state } = req.body;

  const query =
    "INSERT INTO attendance (student_id, course_id, date_attend, state) VALUES (?, ?, ?, ?)";
  db.query(
    query,
    [student_id, course_id, date_attend, state],
    (err, result) => {
      if (err) throw err;
      res.send("Attendance recorded successfully");
    },
  );
});

// API to Get Attendance Report
app.get("/attendance-report/:student_id", (req, res) => {
  const studentId = req.params.student_id;

  const query = "SELECT * FROM attendance WHERE student_id = ?";
  db.query(query, [studentId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
