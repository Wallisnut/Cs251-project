<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <nav class="w-20 bg-warning text-white d-flex flex-column p-4">
      <h2 class="mb-5">AttendEase</h2>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item mb-2"><router-link to="/admin/home" class="nav-link text-white">Home</router-link></li>
      </ul>
      <div class="mt-auto">
        <button @click="logout" class="btn btn-light text-warning w-100">Log Out</button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="flex-grow-1 bg-light p-5">
      <h1 class="mb-4">Admin Dashboard</h1>

      <!-- Lecturers Section -->
      <section class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3>Lecturers</h3>
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
                <button class="btn btn-sm btn-danger" @click="deleteLecturer(lec.UserID)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Students Section -->
      <section class="mb-5">
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3>Students</h3>
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
                <button class="btn btn-sm btn-danger" @click="deleteStudent(stu.UserID)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </section>

      <!-- Courses Section -->
      <section>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3>All Courses</h3>
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
                <button class="btn btn-sm btn-warning me-1" @click="editCourse(c)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteCourse(c.CourseID)">Delete</button>
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
      courses: [],
      role: localStorage.getItem('role')
    };
  },
  methods: {
    editLecturer(lec) {
      alert(`Edit Lecturer: ${lec.FirstName} ${lec.LastName} (ID: ${lec.UserID})`);
    },
    editStudent(stu) {
      alert(`Edit Student: ${stu.FirstName} ${stu.LastName} (ID: ${stu.UserID})`);
    },
    editCourse(course) {
      alert(`Edit Course: ${course.CourseName} (ID: ${course.CourseID})`);
    },
    fetchAll() {
      axios.get('/lecturers')
        .then(res => this.lecturers = res.data)
        .catch(() => alert("Failed to fetch lecturers"));

      axios.get('/students')
        .then(res => this.students = res.data)
        .catch(() => alert("Failed to fetch students"));

      axios.get('/all-courses')
        .then(res => this.courses = res.data)
        .catch(() => alert("Failed to fetch courses"));
    },
    deleteLecturer(id) {
      if (confirm("Are you sure you want to delete this lecturer?")) {
        axios.delete(`/delete-student/${id}`).then(this.fetchAll)
          .catch(() => alert("Failed to delete lecturer"));
      }
    },
    deleteStudent(id) {
      if (confirm("Are you sure you want to delete this student?")) {
        axios.delete(`/delete-student/${id}`).then(this.fetchAll)
          .catch(() => alert("Failed to delete student"));
      }
    },
    deleteCourse(id) {
      if (confirm("Are you sure you want to delete this course?")) {
        axios.delete(`/delete-course/${id}`).then(this.fetchAll)
          .catch(() => alert("Failed to delete course"));
      }
    },
    logout() {
      localStorage.removeItem('token');
      this.$router.push('/login');
    }
  },
  mounted() {
    this.fetchAll();
  }
};
</script>

<style scoped>
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-content {
  width: 100%;
  max-width: 500px;
}
</style>
