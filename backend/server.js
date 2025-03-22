const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
app.use(bodyParser.json());

require("dotenv").config();

const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const JWT_SECRET = process.env.TOKEN_JWT;

const authenticate = (roles) => (req, res, next) => {
  const token = req.header("Authorization");
  if (!token) return res.status(401).send("Access denied");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).send("Invalid token");
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png" || file.mimetype === "image/jpeg") {
      cb(null, true);
    } else {
      cb(new Error("Only PNG and JPEG files are allowed"));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

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

  if (!firstName || !lastName || !email || !username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const query =
    "INSERT INTO User (FirstName, LastName, Email, Department, Phone_No, Username, Password, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
  pool.query(
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
        return res
          .status(500)
          .json({ message: "Failed to register user", error: err.message });
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

    const query = "SELECT * FROM User WHERE Username = ?";
    pool.query(query, [username], async (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Internal server error", error: err.message });
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
    res
      .status(500)
      .json({ message: "Failed to verify student ID", error: error.message });
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
  pool.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
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

  const query = "SELECT * FROM User WHERE Username = ? AND Role = 'admin'";
  pool.query(query, [username], async (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Internal server error", error: err.message });
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

app.post("/add-student", authenticate(["admin"]), (req, res) => {
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
    studentId,
  } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !username ||
    !password ||
    !faculty ||
    !year ||
    !studentId
  ) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 10);

  const checkEmailQuery = "SELECT * FROM User WHERE Email = ?";
  pool.query(checkEmailQuery, [email], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Failed to check email", error: err.message });
    }

    if (results.length > 0) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const userQuery =
      "INSERT INTO User (FirstName, LastName, Email, Department, Phone_No, Username, Password, Role) VALUES (?, ?, ?, ?, ?, ?, ?, 'student')";
    pool.query(
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
          return res
            .status(500)
            .json({ message: "Failed to add user", error: err.message });
        }

        const studentQuery =
          "INSERT INTO Student (StudentID, Faculty, Year, UserID) VALUES (?, ?, ?, ?)";
        pool.query(
          studentQuery,
          [studentId, faculty, year, result.insertId],
          (err) => {
            if (err) {
              console.error("Database error:", err);
              return res
                .status(500)
                .json({ message: "Failed to add student", error: err.message });
            }

            res.status(201).json({ message: "Student added successfully" });
          },
        );
      },
    );
  });
});

app.delete("/delete-student/:id", authenticate(["admin"]), (req, res) => {
  const { id } = req.params;

  const query = "DELETE FROM User WHERE UserID = ?";
  pool.query(query, [id], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Failed to delete student", error: err.message });
    }

    res.json({ message: "Student deleted successfully" });
  });
});

app.post("/add-course", authenticate(["admin"]), (req, res) => {
  const { courseName, courseCode, courseHour } = req.body;

  if (!courseName || !courseCode || !courseHour) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query =
    "INSERT INTO Course (CourseName, CourseCode, Course_Hour) VALUES (?, ?, ?)";
  pool.query(query, [courseName, courseCode, courseHour], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Failed to add course", error: err.message });
    }

    res.status(201).json({ message: "Course added successfully" });
  });
});

app.post("/join-course", authenticate(["student"]), (req, res) => {
  const { studentId, courseId } = req.body;

  if (!studentId || !courseId) {
    return res
      .status(400)
      .json({ message: "Student ID and course ID are required" });
  }

  const query =
    "INSERT INTO Enrollment (StudentID, CourseID, Date_Enroll) VALUES (?, ?, CURDATE())";
  pool.query(query, [studentId, courseId], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Failed to join course", error: err.message });
    }

    res.status(201).json({ message: "Joined course successfully" });
  });
});

app.post(
  "/submit-leave-request",
  upload.single("file"),
  authenticate(["student"]),
  (req, res) => {
    const { studentId, courseId, reason } = req.body;
    const file = req.file;

    if (!studentId || !courseId || !reason) {
      return res
        .status(400)
        .json({ message: "Student ID, course ID, and reason are required" });
    }

    const query =
      "INSERT INTO AbsentRequest (StudentID, CourseID, Reason, FilePath) VALUES (?, ?, ?, ?)";
    pool.query(
      query,
      [studentId, courseId, reason, file ? file.path : null],
      (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({
            message: "Failed to submit leave request",
            error: err.message,
          });
        }

        res
          .status(201)
          .json({ message: "Leave request submitted successfully" });
      },
    );
  },
);

app.put(
  "/approve-leave-request/:id",
  authenticate(["lecturer", "admin"]),
  (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["approve", "reject"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const query =
      "UPDATE AbsentRequest SET Status = ? WHERE AbsentRequestID = ?";
    pool.query(query, [status, id], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Failed to update leave request",
          error: err.message,
        });
      }

      res.json({ message: "Leave request updated successfully" });
    });
  },
);

app.get("/leave-requests", authenticate(["lecturer", "admin"]), (req, res) => {
  const query = `
    SELECT AbsentRequest.*, Student.StudentID, User.FirstName, User.LastName, Course.CourseName
    FROM AbsentRequest
    JOIN Student ON AbsentRequest.StudentID = Student.StudentID
    JOIN User ON Student.UserID = User.UserID
    JOIN Course ON AbsentRequest.CourseID = Course.CourseID
  `;
  pool.query(query, (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        message: "Failed to fetch leave requests",
        error: err.message,
      });
    }

    res.json(results);
  });
});

app.post("/record-attendance", authenticate(["lecturer"]), (req, res) => {
  const { studentId, courseId, dateAttend, status } = req.body;

  if (!studentId || !courseId || !dateAttend || !status) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const query =
    "INSERT INTO Attendance (StudentID, CourseID, Date_Attend, Status) VALUES (?, ?, ?, ?)";
  pool.query(query, [studentId, courseId, dateAttend, status], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Failed to record attendance", error: err.message });
    }

    res.status(201).json({ message: "Attendance recorded successfully" });
  });
});

app.get(
  "/attendance-report/:courseId",
  authenticate(["lecturer", "admin"]),
  (req, res) => {
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
    pool.query(query, [courseId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Failed to fetch attendance report",
          error: err.message,
        });
      }

      res.json(results);
    });
  },
);

app.get(
  "/attendance-history/:studentId",
  authenticate(["student", "lecturer", "admin"]),
  (req, res) => {
    const { studentId } = req.params;

    const query = "SELECT * FROM Attendance WHERE StudentID = ?";
    pool.query(query, [studentId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Failed to fetch attendance history",
          error: err.message,
        });
      }

      res.json(results);
    });
  },
);

app.put(
  "/edit-attendance/:id",
  authenticate(["lecturer", "admin"]),
  (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!status || !["present", "late", "absent"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const query = "UPDATE Attendance SET Status = ? WHERE AttendanceID = ?";
    pool.query(query, [status, id], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Failed to update attendance", error: err.message });
      }

      res.json({ message: "Attendance updated successfully" });
    });
  },
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
