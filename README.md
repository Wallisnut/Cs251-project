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
> response
> > "message": "Registration successful"
> > userId
> > 
## end-point `/login`

> require
>
> > ต้องการ Username, password, role
> response
> > "message": "Login successful"
> > "token": "jwt-token" (ใช้ระบุว่าเป็นใคร)

## end-point `/add-student`

> require
>
> > firstName, lastName, email, department, phoneNo, username, password, faculty, year, studentId
> > response
> > "message": "Student added successfully"
> > "studentId": "ST54321"

## end-point `/delete-student/:id`

> require
>
> > StudentID
> > response
> > "message": "Student deleted successfully"

## end-point `/add-course`

> require
>
> > courseName, courseCode, CourseHour
> > ถ้าเป็น admin
> > เพิ่ม lecturerId
> response
> > "message": "Course added successfully"
> > "courseId": "C202"

## end-point `/join-course`

> require
>
> > StudentID, CourseID
> response
> > "message": "Joined course successfully"


## end-point `/record-attendance`

> require
>
> > StudentID, CourseID, Date_Attend, Status

## end-point `/attendance-report/:courseId`

> require
>
> > courseId

## end-point `/submit-leave-request`

> require
>
> > studentId, courseId, reason
> > เพิ่มเป็น png,jpeg ขนาดไม่เกิน 5mb

## end-point `/approve-leave-request/:id`

> require
>
> > AbsentRequestId(id), status(approve,reject)

## end-point `/leave-requests`

> no requirment

## end-point `/attendance-history/:studentId`

> require
>
> > studentId

## end-point `/edit-attendance/:id`

> require
>
> > AttendanceId(id),status(present,late,absent)

## end-point `/lecturer-in-course/:courseId`

> require
>
> > courseId

## end-point `/send-notification`

> require
>
> > studentId, message

## end-point `/notifications`

> no requirment

## end-point `/notifications/:id/mark-read`

> require
>
> > notificationId, userId

---

# port in use

## port 5000
