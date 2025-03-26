DROP DATABASE IF EXISTS CS251_project;
CREATE DATABASE CS251_project;
USE CS251_project;

-- Entities
CREATE TABLE User (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    FirstName VARCHAR(50) NOT NULL,
    LastName VARCHAR(50) NOT NULL,
    Email VARCHAR(100) UNIQUE NOT NULL,
    Department VARCHAR(100),
    Phone_No VARCHAR(15),
    Username VARCHAR(50) UNIQUE NOT NULL,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('student', 'lecturer', 'admin') NOT NULL
);

CREATE TABLE Student (
    StudentID VARCHAR(10) PRIMARY KEY,
    Faculty VARCHAR(100),
    Year INT,
    UserID INT UNIQUE NOT NULL, -- Link to User table
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

CREATE TABLE Lecturer (
    LecturerID VARCHAR(10) PRIMARY KEY,
    UserID INT UNIQUE NOT NULL, -- Link to User table
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

CREATE TABLE Admin(
	AdminID VARCHAR(10) PRIMARY KEY,
    UserID INT UNIQUE NOT NULL,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

CREATE TABLE Course (
    CourseID VARCHAR(20) PRIMARY KEY,
    CourseName VARCHAR(255) NOT NULL,
    Course_Hour INT NOT NULL,
    StartTime TIME NOT NULL,
    CourseDate DATE NOT NULL,
    EndTime TIME NOT NULL
);

CREATE TABLE Enrollment (
    EnrollmentID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(10) NOT NULL,
    CourseID varchar(20) not null,
    Date_Enroll DATE,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
	FOREIGN KEY (CourseID) REFERENCES  Course(CourseID) ON DELETE CASCADE
);

CREATE TABLE Attendance (
    AttendanceID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(10) NOT NULL,
    CourseID VARCHAR(20) NOT NULL,
    Date_Attend DATE NOT NULL,
    Status ENUM('present', 'late', 'absent') NOT NULL,
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE
);

CREATE TABLE AttendanceReport (
    ReportID INT AUTO_INCREMENT PRIMARY KEY,
    CourseID VARCHAR(20) NOT NULL,
    GeneratedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Summary TEXT,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE
);

CREATE TABLE AttendanceConfirm (
    ConfirmID INT AUTO_INCREMENT PRIMARY KEY,
    LecturerID VARCHAR(10) NOT NULL,
    CourseID VARCHAR(20) NOT NULL,
    ConfirmTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    Status ENUM('approve', 'reject', 'pending') DEFAULT 'pending',
    FOREIGN KEY (LecturerID) REFERENCES Lecturer(LecturerID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE
);

CREATE TABLE AbsentRequest (
    AbsentRequestID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(10) NOT NULL,
    CourseID VARCHAR(20) NOT NULL,
    FilePath VARCHAR(500),
    Reason TEXT NOT NULL,
    Status ENUM('approve', 'pending', 'reject') DEFAULT 'pending',
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE
);

CREATE TABLE Correction (
    CorrectionID INT AUTO_INCREMENT PRIMARY KEY,
    StudentID VARCHAR(10) NOT NULL,
    CourseID VARCHAR(20) NOT NULL,
    Reason TEXT NOT NULL,
    Status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    FOREIGN KEY (StudentID) REFERENCES Student(StudentID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE
);

CREATE TABLE Notification (
    NotificationID INT AUTO_INCREMENT PRIMARY KEY,
    UserID INT NOT NULL,
    Message TEXT NOT NULL,
    Status ENUM('read', 'unread') DEFAULT 'unread',
    Notification_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (UserID) REFERENCES User(UserID) ON DELETE CASCADE
);

CREATE TABLE Teach_IN (
    LecturerID VARCHAR(10) NOT NULL,
    CourseID VARCHAR(20) NOT NULL,
    PRIMARY KEY (LecturerID, CourseID),
    FOREIGN KEY (LecturerID) REFERENCES Lecturer(LecturerID) ON DELETE CASCADE,
    FOREIGN KEY (CourseID) REFERENCES Course(CourseID) ON DELETE CASCADE
);