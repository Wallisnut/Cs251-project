# Cs251-project

## Back-end : MySQL

## Front–end : Vue.js , HTML , CSS , Javascript

## Environment : Docker , Docker-compose

## Version Control : Github

## Design : Figma

## Project Management : Trello , Discord

---

# Back-end script

## end-point `/login/student`

> require
>
> > ต้องการ Username, password
> > Username และ password เป็น tรหัสเดียวกับ u reg

## end-point `/login/lecturer`

> require
>
> > Username, password (ได้จาการลงทะเบียน)

## end-point `/login/admin`

> require
>
> > Username, passwor (ได้จากการลงทะเบียน)

## end-point `/add-student`

> require
>
> > firstName, lastName, email, department, phoneNo, username, password, faculty, your

## end-point `/delete-student/:id`

> require
>
> > StudentID

## end-point `/add-course`

> require
>
> > courseName, courseCode, CourseHour

## end-point `/join-course`

> require
>
> > StudentID, CourseID, joinCode, Date_Enroll

## end-point `/record-attendance`

> require
>
> > StudentID, CourseID, Date_Attend, Status

## end-point `/attendance-report/:courseId`

> require
>
> > courseId

# port in use

## port 5000
