const express = require("express");
const bodyParser = require("body-parser");
const mysql = require("mysql2");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const cors = require('cors');

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: 'http://localhost:8080',  
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  const authHeader = req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).send("Access denied");
  }

  const token = authHeader.replace("Bearer ", "");

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!roles.includes(decoded.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    req.user = decoded;
    next();
  } catch (err) {
    console.error("JWT error:", err);
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
    faculty,
    year,
    studentId,
    lecturerId,
    adminId,
  } = req.body;

  if (!firstName || !lastName || !email || !username || !password || !role) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const userQuery =
    "INSERT INTO User (FirstName, LastName, Email, Department, Phone_No, Username, Password, Role) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
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
      role,
    ],
    (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Failed to register user", error: err.message });
      }

      const userId = result.insertId;

      if (role === "student") {
        if (!faculty || !year || !studentId) {
          return res.status(400).json({
            message: "Faculty, year, and student ID are required for student",
          });
        }

        const studentQuery =
          "INSERT INTO Student (studentID, Faculty, Year, UserID) values(?,?,?,?)";
        pool.query(studentQuery, [studentId, faculty, year, userId], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              message: "Failed to add student details",
              error: err.message,
            });
          }
          res.status(201).json({ message: "Student registered successfully" });
        });
      } else if (role == "lecturer") {
        if (!lecturerId) {
          return res
            .status(400)
            .json({ message: "Lecturer ID are required for lecturers" });
        }

        const lecturerQuery =
          "INSERT INTO Lecturer (LecturerID,UserID) values(?,?)";
        pool.query(lecturerQuery, [lecturerId, userId], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              message: "Failed to add lecturer details",
              error: err.message,
            });
          }

          res.status(201).json({ message: "Lecturer registered successfully" });
        });
      } else if (role === "admin") {
        if (!adminId) {
          return res
            .status(400)
            .json({ message: "Admin ID are required for admin" });
        }

        const adminQuery = "INSERT INTO Admin (AdminID,UserID) values(?,?)";
        pool.query(adminQuery, [adminId, userId], (err) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              message: "Failed to add admin details",
              error: err.message,
            });
          }
          res.status(201).json({ message: "Admin registered successfully" });
        });
      }
    },
  );
});

app.post("/login", async (req, res) => {
  const { username, password, role } = req.body;

  if (!username || !password || !role) {
    return res
      .status(400)
      .json({ message: "Username, password, and role are required" });
  }

  const query = "SELECT * FROM User WHERE Username = ? AND Role = ?";
  pool.query(query, [username, role], async (err, results) => {
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
app.get(
  "/user-info",
  authenticate(["student", "lecturer", "admin"]),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const role = req.user.role;

      const [userRows] = await pool
        .promise()
        .query(
          "SELECT FirstName, LastName, Email, Department, Phone_No, Username FROM User WHERE UserID = ?",
          [userId],
        );

      if (userRows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      const userInfo = {
        ...userRows[0],
        role: role,
      };

      if (role === "student") {
        const [studentRows] = await pool
          .promise()
          .query(
            "SELECT StudentID, Faculty, Year FROM Student WHERE UserID = ?",
            [userId],
          );
        userInfo.studentDetails = studentRows[0];
      } else if (role === "lecturer") {
        const [lecturerRows] = await pool
          .promise()
          .query("SELECT LecturerID FROM Lecturer WHERE UserID = ?", [userId]);
        userInfo.lecturerDetails = lecturerRows[0];
      } else if (role === "admin") {
        const [adminRows] = await pool
          .promise()
          .query("SELECT AdminID FROM Admin WHERE UserID = ?", [userId]);
        userInfo.adminDetails = adminRows[0];
      }

      res.json(userInfo);
    } catch (error) {
      console.error("Error fetching user info:", error);
      res.status(500).json({
        message: "Failed to fetch user information",
        error: error.message,
      });
    }
  },
);

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

function generateJoinCode(length = 6) {
  return Math.random().toString(36).substring(2, 2 + length).toUpperCase();
}
app.post(
  "/add-course",
  authenticate(["lecturer", "admin"]),
  async (req, res) => {
    const { courseName, courseId, courseHour, startTime, endTime, courseDate } =
      req.body;
    const lecturerId =
      req.user.role === "lecturer" ? req.user.id : req.body.lecturerId;

    if (
      !courseName ||
      !courseId ||
      !courseHour ||
      !startTime ||
      !endTime ||
      !courseDate
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    let connection;
    try {
      connection = await pool.promise().getConnection();
      await connection.beginTransaction();
    
      const joinCode = generateJoinCode();
      const [courseResult] = await connection.query(
        "INSERT INTO Course (CourseID, CourseName, Course_Hour, StartTime, EndTime, CourseDate,JoinCode) VALUES (? , ? , ? ,?, ?, ?, ?)",
        [courseId, courseName, courseHour, startTime, endTime, courseDate, joinCode],
      );
      console.log("Course insert result:", courseResult);

      let actualLecturerId;
      if (req.user.role === "admin" && lecturerId) {
        const [lecturer] = await connection.query(
          "SELECT LecturerID FROM Lecturer WHERE LecturerID = ?",
          [lecturerId],
        );
        if (!lecturer.length) {
          throw new Error("Lecturer not found");
        }
        actualLecturerId = lecturerId;
      } else if (req.user.role === "lecturer") {
        const [lecturer] = await connection.query(
          "SELECT LecturerID FROM Lecturer WHERE UserID = ?",
          [req.user.id],
        );
        if (!lecturer.length) {
          throw new Error("Lecturer record not found");
        }
        actualLecturerId = lecturer[0].LecturerID;
      }

      const [teachInResult] = await connection.query(
        "INSERT INTO Teach_IN (LecturerID, CourseID) VALUES (?, ?)",
        [actualLecturerId, courseId],
      );
      console.log("Teach_IN insert result:", teachInResult);

      await connection.commit();
      res.status(201).json({
        message: "Course added successfully",
        lecturerAssigned: actualLecturerId,
      });
    } catch (error) {
      if (connection) {
        await connection.rollback();
      }
      console.error("Error in /add-course:", error);
      res.status(500).json({
        message: "Failed to add course",
        error: error.message,
        stack: error.stack,
      });
    } finally {
      if (connection) {
        connection.release();
      }
    }
  },
);

app.post("/join-course", authenticate(["student"]), (req, res) => {
  const { studentId, joinCode } = req.body;

  if (!studentId || !joinCode) {
    return res
      .status(400)
      .json({ message: "Student ID and join code are required" });
  }

  pool.query(
    "SELECT CourseID FROM Course WHERE JoinCode = ?",
    [joinCode],
    (err, courseResults) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Database error checking join code",
          error: err.message,
        });
      }

      if (courseResults.length === 0) {
        return res.status(404).json({ message: "Invalid join code" });
      }

      const courseId = courseResults[0].CourseID;

      pool.query(
        "SELECT 1 FROM Student WHERE StudentID = ?",
        [studentId],
        (err, studentResults) => {
          if (err) {
            console.error("Database error:", err);
            return res.status(500).json({
              message: "Database error checking student",
              error: err.message,
            });
          }

          if (studentResults.length === 0) {
            return res.status(404).json({ message: "Student not found" });
          }

          pool.query(
            "SELECT 1 FROM Enrollment WHERE StudentID = ? AND CourseID = ?",
            [studentId, courseId],
            (err, existing) => {
              if (err) {
                console.error("Database error:", err);
                return res.status(500).json({
                  message: "Database error checking enrollment",
                  error: err.message,
                });
              }

              if (existing.length > 0) {
                return res
                  .status(409)
                  .json({ message: "Already enrolled in this course" });
              }

              const query =
                "INSERT INTO Enrollment (StudentID, CourseID, Date_Enroll) VALUES (?, ?, CURDATE())";
              pool.query(query, [studentId, courseId], (err) => {
                if (err) {
                  console.error("Database error:", err);
                  return res.status(500).json({
                    message: "Failed to join course",
                    error: err.message,
                  });
                }

                res.status(201).json({ message: "Joined course successfully", courseId });
              });
            }
          );
        }
      );
    }
  );
});

app.get(
  "/course_and_lecturer/:courseId",
  authenticate(["student", "lecturer", "admin"]),
  async (req, res) => {
    const { courseId } = req.params;

    try {
      const [course] = await pool.promise().query(
        `SELECT 
          c.CourseID,
          c.CourseName,
          c.Course_Hour,
          TIME_FORMAT(c.StartTime, '%H:%i') AS StartTime,
          TIME_FORMAT(c.EndTime, '%H:%i') AS EndTime,
          DATE_FORMAT(c.CourseDate, '%Y-%m-%d') AS CourseDate,
          l.LecturerID,
          u.FirstName AS LecturerFirstName,
          u.LastName AS LecturerLastName
         FROM Course c
         LEFT JOIN Teach_IN t ON c.CourseID = t.CourseID
         LEFT JOIN Lecturer l ON t.LecturerID = l.LecturerID
         LEFT JOIN User u ON l.UserID = u.UserID
         WHERE c.CourseID = ?`,
        [courseId],
      );

      if (course.length === 0) {
        return res.status(404).json({ message: "Course not found" });
      }

      const response = {
        courseId: course[0].CourseID,
        courseName: course[0].CourseName,
        courseHour: course[0].Course_Hour,
        schedule: {
          date: course[0].CourseDate,
          startTime: course[0].StartTime,
          endTime: course[0].EndTime,
        },
        lecturers: course
          .map((c) => ({
            lecturerId: c.LecturerID,
            firstName: c.LecturerFirstName,
            lastName: c.LecturerLastName,
          }))
          .filter((l) => l.lecturerId), // Remove null entries if no lecturer
      };

      res.json(response);
    } catch (error) {
      console.error("Error fetching course:", error);
      res.status(500).json({
        message: "Failed to fetch course",
        error: error.message,
      });
    }
  },
);

app.get(
  "/all-courses",
  authenticate(["student", "lecturer", "admin"]),
  async (req, res) => {
    try {
      const [courses] = await pool.promise().query(
        `SELECT 
          c.CourseID,
          c.CourseName,
          c.Course_Hour,
          TIME_FORMAT(c.StartTime, '%H:%i') AS StartTime,
          TIME_FORMAT(c.EndTime, '%H:%i') AS EndTime,
          DATE_FORMAT(c.CourseDate, '%Y-%m-%d') AS CourseDate,
          COUNT(e.StudentID) AS EnrolledStudents
         FROM Course c
        LEFT JOIN Enrollment e ON c.CourseID = e.CourseID
         GROUP BY c.CourseID
         ORDER BY c.CourseDate, c.StartTime`,
      );

      res.json({ courses });
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({
        message: "Failed to fetch courses",
        error: error.message,
      });
    }
  },
);

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
      SELECT 
        s.StudentID, 
        u.FirstName AS StudentFirstName, 
        u.LastName AS StudentLastName, 
        COUNT(a.Status) AS TotalClasses, 
        SUM(a.Status = 'present') AS PresentClasses,
        SUM(a.Status = 'absent') AS AbsentClasses,
        SUM(a.Status = 'late') AS LateClasses
      FROM Attendance a
      JOIN Student s ON a.StudentID = s.StudentID
      JOIN User u ON s.UserID = u.UserID
      WHERE a.CourseID = ?
      GROUP BY s.StudentID;
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

app.get(
  "/lecturer-in-course/:courseId",
  authenticate(["lecturer", "admin"]),
  (req, res) => {
    const { courseId } = req.params;

    const query = `
      SELECT 
        l.LecturerID,
        u.FirstName,
        u.LastName,
        u.Email,
        u.Department
      FROM Teach_IN t
      JOIN Lecturer l ON t.LecturerID = l.LecturerID
      JOIN User u ON l.UserID = u.UserID
      WHERE t.CourseID = ?;
    `;
    console.log("Query:", query);
    console.log("Course ID:", courseId);

    pool.query(query, [courseId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Failed to fetch attendance report",
          error: err.message,
        });
      }

      if (results.length === 0) {
        return res
          .status(404)
          .json({ message: "No attendance records found for this course" });
      }

      res.json(results);
    });
  },
);

app.post("/send-notification", authenticate(["lecturer"]), (req, res) => {
  const { studentId, message } = req.body;

  if (!studentId || !message) {
    return res
      .status(400)
      .json({ message: "Student ID and message are required" });
  }

  const getUserQuery = "SELECT UserID FROM Student WHERE StudentID = ?";
  pool.query(getUserQuery, [studentId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({
        message: "Failed to fetch student details",
        error: err.message,
      });
    }

    if (results.length === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    const userId = results[0].UserID;

    const insertNotificationQuery = `
        INSERT INTO Notification (UserID, Message) VALUES (?, ?)
      `;
    pool.query(insertNotificationQuery, [userId, message], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Failed to send notification",
          error: err.message,
        });
      }

      res.status(201).json({ message: "Notification sent successfully" });
    });
  });
});

app.get("/notifications", authenticate(["student"]), (req, res) => {
  const userId = req.user.id;

  const query = `
      SELECT NotificationID, Message, Status, Notification_date
      FROM Notification
      WHERE UserID = ?
      ORDER BY Notification_date DESC;
    `;

  pool.query(query, [userId], (err, results) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Failed to fetch notifications", error: err.message });
    }

    res.json(results);
  });
});

app.put(
  "/notifications/:id/mark-read",
  authenticate(["student"]),
  (req, res) => {
    const notificationId = req.params.id;
    const userId = req.user.id;

    const query = `
      UPDATE Notification
      SET Status = 'read'
      WHERE NotificationID = ? AND UserID = ?;
    `;

    pool.query(query, [notificationId, userId], (err, results) => {
      if (err) {
        console.error("Database error:", err);
        return res.status(500).json({
          message: "Failed to mark notification as read",
          error: err.message,
        });
      }

      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Notification not found" });
      }

      res.json({ message: "Notification marked as read" });
    });
  },
);
app.put(
  "/update-student/:id",
  authenticate(["admin", "lecturer"]),
  async (req, res) => {
    const { id } = req.params;
    const { FirstName, LastName, Email, Faculty, Year } = req.body;

    if (!id || isNaN(id)) {
      return res.status(400).json({ message: "Invalid ID format" });
    }

    try {
      await pool.promise().query(
        `UPDATE User u
       JOIN Student s ON u.UserID = s.UserID
       SET u.FirstName = ?, u.LastName = ?, u.Email = ?, s.Faculty = ?, s.Year = ?
       WHERE u.UserID = ?`,
        [FirstName, LastName, Email, Faculty, Year, id],
      );
      res.json({ message: "Student updated successfully" });
    } catch (error) {
      console.error("Update student error:", error);
      res.status(500).json({ message: "Failed to update student", error });
    }
  },
);
app.put(
  "/update-lecturer/:id",
  authenticate(["admin", "lecturer"]),
  async (req, res) => {
    const { id } = req.params;
    const { FirstName, LastName, Email, Department } = req.body;

    try {
      await pool.promise().query(
        `UPDATE User u
       JOIN Lecturer l ON u.UserID = l.UserID
       SET u.FirstName = ?, u.LastName = ?, u.Email = ?, u.Department = ?
       WHERE u.UserID = ?`,
        [FirstName, LastName, Email, Department, id],
      );
      res.json({ message: "Lecturer updated successfully" });
    } catch (error) {
      console.error("Update lecturer error:", error);
      res.status(500).json({ message: "Failed to update lecturer", error });
    }
  },
);
app.put(
  "/update-course/:id",
  authenticate(["admin", "lecturer"]),
  async (req, res) => {
    const { id } = req.params;
    const { CourseName, Course_Hour, StartTime, EndTime, CourseDate } =
      req.body;

    try {
      await pool.promise().query(
        `UPDATE Course
       SET CourseName = ?, Course_Hour = ?, StartTime = ?, EndTime = ?, CourseDate = ?
       WHERE CourseID = ?`,
        [CourseName, Course_Hour, StartTime, EndTime, CourseDate, id],
      );
      res.json({ message: "Course updated successfully" });
    } catch (error) {
      console.error("Update course error:", error);
      res.status(500).json({ message: "Failed to update course", error });
    }
  },
);

app.delete(
  "/delete-course/:id",
  authenticate(["admin", "lecturer"]),
  async (req, res) => {
    const { id } = req.params;
    try {
      const connection = await pool.promise().getConnection();
      await connection.beginTransaction();

      await connection.query("DELETE FROM Teach_IN WHERE CourseID = ?", [id]);
      await connection.query("DELETE FROM Enrollment WHERE CourseID = ?", [id]);
      await connection.query("DELETE FROM Attendance WHERE CourseID = ?", [id]);
      await connection.query("DELETE FROM AbsentRequest WHERE CourseID = ?", [
        id,
      ]);
      await connection.query("DELETE FROM Correction WHERE CourseID = ?", [id]);

      await connection.query("DELETE FROM Course WHERE CourseID = ?", [id]);

      await connection.commit();
      res.json({ message: "Course deleted successfully" });
    } catch (err) {
      console.error("Delete course error:", err);
      res.status(500).json({ message: "Failed to delete course" });
    }
  },
);
app.get("/students", authenticate(["admin", "lecturer"]), async (req, res) => {
  try {
    const [students] = await pool.promise().query(`
      SELECT 
        u.UserID, u.Username, u.FirstName, u.LastName, u.Email,
        s.StudentID, s.Faculty, s.Year
      FROM Student s
      JOIN User u ON s.UserID = u.UserID
    `);

    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    res.json({ students });
  } catch (err) {
    console.error("Error fetching students:", err);
    res
      .status(500)
      .json({ message: "Error fetching students", error: err.message });
  }
});

app.get("/lecturers", authenticate(["admin"]), async (req, res) => {
  try {
    const [lecturers] = await pool.promise().query(`
      SELECT 
        u.UserID, u.Username, u.FirstName, u.LastName, u.Email, u.Department,
        l.LecturerID
      FROM Lecturer l
      JOIN User u ON l.UserID = u.UserID
    `);

    if (lecturers.length === 0) {
      return res.status(404).json({ message: "No lecturers found" });
    }

    res.json({ lecturers });
  } catch (err) {
    console.error("Error fetching lecturers:", err);
    res
      .status(500)
      .json({ message: "Error fetching lecturers", error: err.message });
  }
});
app.delete(
  "/delete-lecturer/:id",
  authenticate(["admin"]),
  async (req, res) => {
    const { id } = req.params;
    let connection;

    try {
      connection = await pool.promise().getConnection();
      await connection.beginTransaction();

      await connection.query("DELETE FROM Teach_IN WHERE LecturerID = ?", [id]);
      await connection.query("DELETE FROM Lecturer WHERE LecturerID = ?", [id]);

      await connection.query(
        `DELETE FROM User 
       WHERE UserID = (SELECT UserID FROM (SELECT UserID FROM Lecturer WHERE LecturerID = ?) AS subquery)`,
        [id],
      );

      await connection.commit();
      res.json({ message: "Lecturer deleted successfully" });
    } catch (err) {
      if (connection) await connection.rollback();
      console.error("Error deleting lecturer:", err);
      res
        .status(500)
        .json({ message: "Failed to delete lecturer", error: err.message });
    } finally {
      if (connection) {
        try {
          connection.release();
        } catch (releaseError) {
          console.error("Error releasing connection:", releaseError);
        }
      }
    }
  },
);
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});