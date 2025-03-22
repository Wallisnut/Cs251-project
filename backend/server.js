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

const JWT_SECRET = process.env.TOKEN_JWT;

const authenticate = (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

app.post("/register", async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    department,
    phoneNo,
    username,
    password,
    role,
  } = req.body;

  // Validate input
  if (!firstName || !lastName || !email || !username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert into User table
  const query =
    "INSERT INTO User (FirstName, LastName, Email, Department, Phone_No, Username, Password, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  db.query(
    query,
    [
      firstName,
      lastName,
      email,
      department,
      phoneNo,
      username,
      hashedPassword,
      role,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({ message: "Internal server error" });
      }

      res.status(201).json({ message: "User registered successfully" });
    },
  );
});

app.post("/login/student", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  try {
    const apiResponse = await axios.post(
      "https://restapi.tu.ac.th/api/v1/auth/Ad/verify2",
      { UserName: username, PassWord: password },
      {
        headers: {
          "Application-Key": process.env.TU_API,
          "Content-Type": "application/json",
        },
      },
    );

    if (apiResponse.data.status !== true) {
      return res.status(400).json({ message: "Invalid student ID or token" });
    }

    const studentInfo = apiResponse.data.data;

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

      const token = jwt.sign({ id: user.UserID, role: user.Role }, JWT_SECRET, {
        expiresIn: "1h",
      });

      res.json({ token, role: user.Role });
    });
  } catch (error) {
    console.error("API Error:", error.response?.data || error.message);
    res.status(500).json({ message: "Failed to verify student ID" });
  }
});

app.post("/login/lecturer", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const query = "SELECT * FROM User WHERE Username = ? AND Role = 'lecturer'";
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

    const token = jwt.sign({ id: user.UserID, role: user.Role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, role: user.Role });
  });
});

app.post("/login/admin", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  const query = "SELECT * FROM User WHERE Username = ? AND Role = 'Admin'";
  db.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length === 0) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const admin = results[0];
    const isMatch = await bcrypt.compare(password, admin.Password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin.UserID, role: admin.Role }, JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token, role: admin.Role });
  });
});

app.post("/add-student", authenticate, (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }

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

  const checkEmailQuery = "SELECT * FROM User WHERE Email = ?";
  db.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const userQuery =
      "INSERT INTO User (FirstName, LastName, Email, Department, Phone_No, Username, Password, Role) VALUES (?, ?, ?, ?, ?, ?, ?, 'student')";
    db.query(
      userQuery,
      [
        firstName,
        lastName,
        email,
        department,
        phoneNo,
        username,
        hashedPassword,
      ],
      (err, result) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Internal server error" });
        }

        const studentQuery =
          "INSERT INTO Student (StudentID, Faculty, Year) VALUES (?, ?, ?)";
        db.query(studentQuery, [result.insertId, faculty, year], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Internal server error" });
          }

          res.status(201).json({ message: "Student added successfully" });
        });
      },
    );
  });
});

app.delete("/delete-student/:id", authenticate, (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { id } = req.params;

  const query = "DELETE FROM User WHERE UserID = ?";
  db.query(query, [id], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.json({ message: "Student deleted successfully" });
  });
});

app.post("/add-course", authenticate, (req, res) => {
  if (req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { courseName, courseCode, courseHour } = req.body;

  const query =
    "INSERT INTO Course (CourseName, CourseCode, Course_Hour) VALUES (?, ?, ?)";
  db.query(query, [courseName, courseCode, courseHour], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(201).json({ message: "Course added successfully" });
  });
});

app.post("/join-course", authenticate, (req, res) => {
  if (req.user.role !== "Student") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { studentId, courseId } = req.body;

  const query =
    "INSERT INTO Enrollment (StudentID, CourseID, Date_Enroll) VALUES (?, ?, CURDATE())";
  db.query(query, [studentId, courseId], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(201).json({ message: "Joined course successfully" });
  });
});

app.post("/record-attendance", authenticate, (req, res) => {
  if (req.user.role !== "Lecturer") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { studentId, courseId, dateAttend, status } = req.body;

  const query =
    "INSERT INTO Attendance (StudentID, CourseID, Date_Attend, Status) VALUES (?, ?, ?, ?)";
  db.query(query, [studentId, courseId, dateAttend, status], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.status(201).json({ message: "Attendance recorded successfully" });
  });
});

app.get("/attendance-report/:courseId", authenticate, (req, res) => {
  if (req.user.role !== "Lecturer" && req.user.role !== "Admin") {
    return res.status(403).json({ message: "Access denied" });
  }

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
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Internal server error" });
    }

    res.json(results);
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
