<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <nav class="w-25 bg-warning text-white d-flex flex-column p-4">
      <h2 class="mb-5">AttendEase</h2>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item mb-2"><router-link to="/admin/home" class="nav-link text-white">Home</router-link></li>
        <li class="nav-item mb-2"><router-link to="/admin/notifications" class="nav-link text-white">Notification</router-link></li>
        <li class="nav-item mb-2"><router-link to="/admin/summary" class="nav-link text-white">Summary</router-link></li>
      </ul>
      <div class="mt-auto">
        <button @click="logout" class="btn btn-light text-warning w-100">Log Out</button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="flex-grow-1 bg-light p-5">
      <h1 class="mb-4">Admin Dashboard</h1>

      <!-- Advisors Section -->
      <section class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3>Advisors</h3>
          <button class="btn btn-sm btn-primary" @click="showLecturerForm()">+ Add Advisor</button>
        </div>
        <table class="table table-bordered bg-white">
          <thead>
            <tr><th>ID</th><th>Username</th><th>Name</th><th>Email</th><th>Department</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="lec in lecturers" :key="lec.UserID">
              <td>{{ lec.UserID }}</td>
              <td>{{ lec.Username }}</td>
              <td>{{ lec.FirstName }} {{ lec.LastName }}</td>
              <td>{{ lec.Email }}</td>
              <td>{{ lec.Department }}</td>
              <td>
                <button class="btn btn-sm btn-warning me-1" @click="() => showLecturerForm(lec)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="() => deleteLecturer(lec.UserID)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Students Section -->
      <section class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3>Students</h3>
          <button class="btn btn-sm btn-primary" @click="showStudentForm()">+ Add Student</button>
        </div>
        <table class="table table-bordered bg-white">
          <thead>
            <tr><th>ID</th><th>Username</th><th>Name</th><th>Email</th><th>Faculty</th><th>Year</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="stu in students" :key="stu.UserID">
              <td>{{ stu.UserID }}</td>
              <td>{{ stu.Username }}</td>
              <td>{{ stu.FirstName }} {{ stu.LastName }}</td>
              <td>{{ stu.Email }}</td>
              <td>{{ stu.Faculty }}</td>
              <td>{{ stu.Year }}</td>
              <td>
                <button class="btn btn-sm btn-warning me-1" @click="() => showStudentForm(stu)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="() => deleteStudent(stu.UserID)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Courses Section -->
      <section>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3>All Courses</h3>
          <button class="btn btn-sm btn-primary" @click="showCourseForm()">+ Add Course</button>
        </div>
        <table class="table table-bordered bg-white">
          <thead>
            <tr><th>Course ID</th><th>Name</th><th>Date</th><th>Time</th><th>Actions</th></tr>
          </thead>
          <tbody>
            <tr v-for="c in courses" :key="c.CourseID">
              <td>{{ c.CourseID }}</td>
              <td>{{ c.CourseName }}</td>
              <td>{{ c.CourseDate }}</td>
              <td>{{ c.StartTime }} - {{ c.EndTime }}</td>
              <td>
                <button class="btn btn-sm btn-warning me-1" @click="() => showCourseForm(c)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="() => deleteCourse(c.CourseID)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
axios.defaults.headers.common['Authorization'] = localStorage.getItem('token');

export default {
  name: 'AdminHome',
  data() {
    return {
      lecturers: [],
      students: [],
      courses: []
    }
  },
  methods: {
    fetchAll() {
      axios.get('/lecturers')
        .then(res => this.lecturers = res.data)
        .catch(() => alert("Failed to fetch lecturers"))

      axios.get('/students')
        .then(res => this.students = res.data)
        .catch(() => alert("Failed to fetch students"))

      axios.get('/all-courses')
        .then(res => this.courses = res.data)
        .catch(() => alert("Failed to fetch courses"))
    },
    showLecturerForm() {},
    deleteLecturer(id) {
      axios.delete(`/remove-user/${id}`).then(this.fetchAll)
    },
    showStudentForm() {},
    deleteStudent(id) {
      axios.delete(`/remove-user/${id}`).then(this.fetchAll)
    },
    showCourseForm() {},
    deleteCourse(id) {
      axios.delete(`/delete-course/${id}`).then(this.fetchAll)
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  },
  mounted() {
    this.fetchAll();
  }
}
</script>

<style scoped>
.nav-link.router-link-active {
  font-weight: bold;
  text-decoration: underline;
}
</style>
