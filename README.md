# Cs251-project

## Back-end : MySQL

## Front–end : Vue.js , HTML , CSS , Javascript

## Environment : Docker , Docker-compose

## Version Control : Github

## Design : Figma

## Project Management : Trello , Discord

---

# Back-end script

## end-point `register`

> require
>
> > firstName, lastName, email, department, phoneNo, username, role
> > ถ้าเป็น student
> > ต้องใส่ faculty, year, studentId เพิ่ม
> > ถ้าเป็น lecturer
> > lecturerId เพิ่ม
> > ถ้าเป็น admin
> > adminId เพิ่ม
> 
> response
> > "message": "Registration successful"
> > userId
> > 
## end-point `/login`

> require
>
> > ต้องการ Username, password, role
> 
> response
> > "message": "Login successful"
> > "token": "jwt-token" (ใช้ระบุว่าเป็นใคร)

## end-point `/user-info`
> require
>
> > header user-token
> 
> response
> > {
    "FirstName": "soracha",
    "LastName": "bantherngchit",
    "Email": "soracha.ban@dome.tu.ac.th",
    "Department": "Computer Science",
    "Phone_No": "1234567890",
    "Username": "beau",
    "role": "admin",
    "adminDetails": {
        "AdminID": "6609612228"
    }
}
## end-point `/add-student`

> require
>
> > firstName, lastName, email, department, phoneNo, username, password, faculty, year, studentId
> 
>  response
> > "message": "Student added successfully"
> > "studentId": "ST54321"

## end-point `/delete-student/:id`

> require
>
> > StudentID
>  
> response
> > "message": "Student deleted successfully"

## end-point `/students`
> require
>
> > admin or lecturer token
>
> response
> >{
    "students": [
        {
            "UserID": 4,
            "Username": "bell",
            "FirstName": "alisha",
            "LastName": "ngamwongwattana",
            "Email": "alisha.nga@dome.tu.ac.th",
            "StudentID": "6609612319",
            "Faculty": "Science",
            "Year": 2
        },
        {
            "UserID": 2,
            "Username": "sunday",
            "FirstName": "Nuttinee",
            "LastName": "Buaphat",
            "Email": "Nuttinee.bua@dome.tu.ac.th",
            "StudentID": "6609681314",
            "Faculty": "Computer Science",
            "Year": 2
        }
    ]
}

## end-point `/lecturers`
>require
>
>> admin token
>
> response
>
>>[
    {
        "UserID": 3,
        "Username": "fern",
        "FirstName": "nichakarn",
        "LastName": "kulchittipiphat",
        "Email": "nichakarn.kul@dome.tu.ac.th",
        "Department": "Computer Science",
        "LecturerID": "6609611949"
    }
]

## end-point `/delete-lecturer/:id`
> require
>
> > id (lecturerId)

> 
> response
> > "message": "Lecturer deleted successfully"


## end-point `/add-course`

> require
>
> > courseName, courseCode, CourseHour
> > ถ้าเป็น admin
> > เพิ่ม lecturerId
> 
> response
> > "message": "Course added successfully"
> > "courseId": "C202"

## end-point `/join-course`

> require
>
> > StudentID, CourseID
> 
> response
> > "message": "Joined course successfully"

## end-point `/course_and_lecturer/:courseId`
> require
> > courseId (url param)
> response
> > {
  "courseId": "C202",
  "courseName": "Database Systems",
  "courseHour": 3,
  "schedule": {
    "date": "2025-05-12",
    "startTime": "09:00",
    "endTime": "11:00"
  },
  "lecturers": [
    {
      "lecturerId": "L001",
      "firstName": "John",
      "lastName": "Doe"
    },
    {
      "lecturerId": "L002",
      "firstName": "Jane",
      "lastName": "Smith"
    }
  ]
}


## end-point `/all-course`
> response
> >[
  {
    "CourseID": "C202",
    "CourseName": "Database Systems",
    "Course_Hour": 3,
    "StartTime": "09:00",
    "EndTime": "11:00",
    "CourseDate": "2025-05-12",
    "EnrolledStudents": 30
  },
  {
    "CourseID": "C203",
    "CourseName": "Web Development",
    "Course_Hour": 4,
    "StartTime": "13:00",
    "EndTime": "16:00",
    "CourseDate": "2025-05-13",
    "EnrolledStudents": 25
  }
]




## end-point `/record-attendance`

> require
>
> > StudentID, CourseID, Date_Attend, Status
> 
> response 
>> "message": "Attendance recorded successfully"

## end-point `/attendance-report/:courseId`

> require
>
> > courseId
> 
> response
>> courseId": "C202"
>> attendance": [
    {
      "studentId": "111111",
      "date": "2025-05-12",
      "status": "Present" 
    }]

## end-point `/submit-leave-request`

> require
>
> > studentId, courseId, reason
> > เพิ่มเป็น png,jpeg ขนาดไม่เกิน 5mb
> 
> response 
>> "message": "Leave request submitted successfully",
>> "requestId": "2222222"


## end-point `/approve-leave-request/:id`

> require
>
> > AbsentRequestId(id), status(approve,reject)
> 
> response
>> "message": "Leave request approved"


## end-point `/leave-requests`

> no requirment

> response 
>> "requests": [
    {
      "requestId": "2222222",
      "studentId": "1111111",
      "status": "Pending"
    }]

## end-point `/attendance-history/:studentId`

> require
>
> > studentId
> 
> response
>> "attendance": [
    {
      "courseId": "Cs251",
      "date": "2025-05-12",
      "status": "Present"
    }]

## end-point `/edit-attendance/:id`

> require
>
> > AttendanceId(id),status(present,late,absent)
> 
> response
>> "message": "Attendance updated"

## end-point `/lecturer-in-course/:courseId`

> require
>
> > courseId
> 
> response
>> "lecturerId": "L001",
>> "lecturerName": "ja"

## end-point `/send-notification`

> require
>
> > studentId, message
> 
> response
>> "message": "Notification sent"

## end-point `/notifications`

> no requirment
>
> response
>> "notifications": [
    {
      "notificationId": "N001",
      "message": "your leave request is reject",
      "isRead": false
    }]

## end-point `/notifications/:id/mark-read`

> require
>
> > notificationId, userId
> 
> response
>> "message": "Notification marked as read"
## end-point `/update-student/:id`
> require
>
> > id (index of user) 
> 
> response
>> "message": "student updated successfully"

## end-point `/update-lecturer/:id`
> require
>
> > id (index of user) 
> 
> response
>> "message": "Lecturer updated successfully"

## end-point `/update-course/:id`
> require
>
> > id (courseId)
> >  {
        "CourseName": "OS",
        "Course_Hour": 15,
        "StartTime": "15:00",
        "EndTime": "18:00",
        "CourseDate": "2026-03-24",
        "EnrolledStudents": 0
    }
> 
> response
>> "message": "course updated successfully"

## end-point `/delete-course/:id`
> require
>
> > id (courseId)

> 
> response
>> "message": "Course deleted successfully"


---

# port in use

## port 5000
=======
## Back-end : Java with springbootframework , MySQL 
## Front–end : Vue.js , HTML , CSS , Javascript 
## Environment : Docker , Docker-compose 
## Version Control : Github 
## Design : Figma 
## Project Management : Trello , Discord 
>>>>>>> origin/frontend-tompalm
