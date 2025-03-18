const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const app = express();
app.use(bodyParser.json());

require("dotenv").config();
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

db.connect((err) => {
  if (err) throw err;
  console.log("MySQL Connected HAHA YES!!!");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const apiResponse = await axios.get(
      `https://restapi.tu.ac.th/api/v2/profile/std/info/?id=${password}`,
    );

    if (apiResponse.data.status !== true) {
      return res.status(400).json({ message: "Invalid student ID" });
    }

    var studentInfo = apiResponse.data.data;

    const query = "SELECT * FROM User WHERE Username = ?";
    db.query(query, [username], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(400).json({ message: "User not found" });
      }

      const user = results[0];

      const isMatch = await bcrypt.compare(password, user.Password);

      if (!isMatch) {
        return res.status(400).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign(
        { id: user.UserID, role: user.Role },
        process.env.TU_API,
        { expiresIn: "1h" },
      );

      res.json({ token, role: user.Role });
    });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} `);
});
app.post("/add-student", (req, res) => {
  const {
    firstName,
    lastName,
    email,
    department,
    phoneNo,
    username,
    password,
    faculty,
    year,
  } = req.body;

  const hashedPassword = bcrypt.hashSync(password, 10);

  const userQuery =
    "INSERT INTO User (FirstName, LastName, Email, Department, Phone_No, Username, Password, Role) VALUES (?, ?, ?, ?, ?, ?, ?, 'student')";
  db.query(
    userQuery,
    [firstName, lastName, email, department, phoneNo, username, hashedPassword],
    (err, result) => {
      if (err) throw err;

      const studentQuery =
        "INSERT INTO Student (StudentID, Faculty, Year) VALUES (?, ?, ?)";
      db.query(studentQuery, [result.insertId, faculty, year], (err) => {
        if (err) throw err;
        res.send("Student added successfully");
      });
    },
  );
});

app.delete("/delete-student/:id", (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM User WHERE UserID = ?";
  db.query(query, [id], (err) => {
    if (err) throw err;
    res.send("Student deleted successfully");
  });
});
app.post("/add-course", (req, res) => {
  const { courseName, courseCode, courseHour } = req.body;

  const query =
    "INSERT INTO Course (CourseName, CourseCode, Course_Hour) VALUES (?, ?, ?)";
  db.query(query, [courseName, courseCode, courseHour], (err) => {
    if (err) throw err;
    res.send("Course added successfully");
  });
});
app.post("/join-course", (req, res) => {
  const { studentId, courseId, joinCode } = req.body;

  const query =
    "INSERT INTO Enrollment (StudentID, CourseID, JoinCode, Date_Enroll) VALUES (?, ?, ?, CURDATE())";
  db.query(query, [studentId, courseId, joinCode], (err) => {
    if (err) throw err;
    res.send("Joined course successfully");
  });
});
app.get("/attendance-report/:courseId", (req, res) => {
  const { courseId } = req.params;

  const query = `
    SELECT s.StudentID, u.FirstName, u.LastName, COUNT(a.Status) AS TotalClasses, 
           SUM(a.Status = 'present') AS PresentClasses
    FROM Attendance a
    JOIN Student s ON a.StudentID = s.StudentID
    JOIN User u ON s.StudentID = u.UserID
    WHERE a.CourseID = ?
    GROUP BY s.StudentID
  `;
  db.query(query, [courseId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
app.post("/record-attendance", (req, res) => {
  const { studentId, courseId, dateAttend, status } = req.body;

  const query =
    "INSERT INTO Attendance (StudentID, CourseID, Date_Attend, Status) VALUES (?, ?, ?, ?)";
  db.query(query, [studentId, courseId, dateAttend, status], (err) => {
    if (err) throw err;
    res.send("Attendance recorded successfully");
  });
});
app.post("/cancel-class", (req, res) => {
  const { courseId, date } = req.body;

  const query = "INSERT INTO ClassCancellation (CourseID, Date) VALUES (?, ?)";
  db.query(query, [courseId, date], (err) => {
    if (err) throw err;
    res.send("Class cancellation recorded successfully");
  });
});
app.get("/attendance-history/:courseId", (req, res) => {
  const { courseId } = req.params;

  const query = "SELECT * FROM Attendance WHERE CourseID = ?";
  db.query(query, [courseId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
app.put("/edit-attendance/:id", (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const query = "UPDATE Attendance SET Status = ? WHERE AttendanceID = ?";
  db.query(query, [status, id], (err) => {
    if (err) throw err;
    res.send("Attendance updated successfully");
  });
});
app.get("/student-attendance/:studentId", (req, res) => {
  const { studentId } = req.params;

  const query = "SELECT * FROM Attendance WHERE StudentID = ?";
  db.query(query, [studentId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
app.post("/send-notification", (req, res) => {
  const { userId, message } = req.body;

  const query = "INSERT INTO Notification (UserID, Message) VALUES (?, ?)";
  db.query(query, [userId, message], (err) => {
    if (err) throw err;
    res.send("Notification sent successfully");
  });
});
app.get("/attendance-percentage/:studentId", (req, res) => {
  const { studentId } = req.params;

  const query = `
    SELECT CourseID, 
           COUNT(*) AS TotalClasses, 
           SUM(Status = 'present') AS PresentClasses, 
           (SUM(Status = 'present') / COUNT(*)) * 100 AS Percentage
    FROM Attendance
    WHERE StudentID = ?
    GROUP BY CourseID
  `;
  db.query(query, [studentId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
app.get("/course-attendance-percentage/:courseId", (req, res) => {
  const { courseId } = req.params;

  const query = `
    SELECT StudentID, 
           COUNT(*) AS TotalClasses, 
           SUM(Status = 'present') AS PresentClasses, 
           (SUM(Status = 'present') / COUNT(*)) * 100 AS Percentage
    FROM Attendance
    WHERE CourseID = ?
    GROUP BY StudentID
  `;
  db.query(query, [courseId], (err, results) => {
    if (err) throw err;
    res.json(results);
  });
});
app.post("/submit-absence", (req, res) => {
  const { studentId, courseId, reason } = req.body;

  const query =
    "INSERT INTO AbsentRequest (StudentID, CourseID, Reason) VALUES (?, ?, ?)";
  db.query(query, [studentId, courseId, reason], (err) => {
    if (err) throw err;
    res.send("Absence request submitted successfully");
  });
});
app.post("/request-correction", (req, res) => {
  const { studentId, courseId, reason } = req.body;

  const query =
    "INSERT INTO Correction (StudentID, CourseID, Reason) VALUES (?, ?, ?)";
  db.query(query, [studentId, courseId, reason], (err) => {
    if (err) throw err;
    res.send("Correction request submitted successfully");
  });
});
app.post("/check-in", (req, res) => {
  const { studentId, courseId } = req.body;

  const query =
    "INSERT INTO Attendance (StudentID, CourseID, Date_Attend, Status) VALUES (?, ?, CURDATE(), 'present')";
  db.query(query, [studentId, courseId], (err) => {
    if (err) throw err;
    res.send("Checked in successfully");
  });
});
app.post("/confirm-check-in", (req, res) => {
  const { attendanceId } = req.body;

  const query =
    "UPDATE Attendance SET Status = 'confirmed' WHERE AttendanceID = ?";
  db.query(query, [attendanceId], (err) => {
    if (err) throw err;
    res.send("Check-in confirmed successfully");
  });
});
