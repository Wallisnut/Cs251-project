<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->

    <!-- Top Right Logout -->
    <div class="position-absolute top-0 end-0 p-3">
      <button @click="logout" class="btn btn-danger">Log Out</button>
    </div>

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
                <button class="btn btn-sm btn-warning me-1" @click="startEditLecturer(lec)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteLecturer(lec.LecturerID)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Edit Lecturer Modal -->
        <div v-if="showEditLecturerModal" class="modal d-block bg-dark bg-opacity-50">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Edit Lecturer</h5>
                <button type="button" class="btn-close" @click="showEditLecturerModal = false"></button>
              </div>
              <div class="modal-body">
                <input v-model="editLecturerData.FirstName" class="form-control mb-2" placeholder="First Name" />
                <input v-model="editLecturerData.LastName" class="form-control mb-2" placeholder="Last Name" />
                <input v-model="editLecturerData.Email" class="form-control mb-2" placeholder="Email" />
                <input v-model="editLecturerData.Department" class="form-control mb-2" placeholder="Department" />
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="showEditLecturerModal = false">Cancel</button>
                <button class="btn btn-success" @click="updateLecturer">Save</button>
              </div>
            </div>
          </div>
        </div>
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
                <button class="btn btn-sm btn-warning me-1" @click="startEditStudent(stu)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteStudent(stu.UserID)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Edit Student Modal -->
        <div v-if="showEditStudentModal" class="modal d-block bg-dark bg-opacity-50">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Edit Student</h5>
                <button type="button" class="btn-close" @click="showEditStudentModal = false"></button>
              </div>
              <div class="modal-body">
                <input v-model="editStudentData.FirstName" class="form-control mb-2" placeholder="First Name" />
                <input v-model="editStudentData.LastName" class="form-control mb-2" placeholder="Last Name" />
                <input v-model="editStudentData.Email" class="form-control mb-2" placeholder="Email" />
                <input v-model="editStudentData.Faculty" class="form-control mb-2" placeholder="Faculty" />
                <input v-model="editStudentData.Year" class="form-control mb-2" placeholder="Year" />
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="showEditStudentModal = false">Cancel</button>
                <button class="btn btn-success" @click="updateStudent">Save</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Courses Section -->
      <section>
        <div class="d-flex justify-content-between align-items-center mb-2">
          <h3>All Courses</h3>
          <button class="btn btn-sm btn-primary" @click="showAddCourseModal = true">+ Add Course</button>
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
                <button class="btn btn-sm btn-warning me-1" @click="startEditCourse(c)">Edit</button>
                <button class="btn btn-sm btn-danger" @click="deleteCourse(c.CourseID)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Edit Course Modal -->
        <div v-if="showEditCourseModal" class="modal d-block bg-dark bg-opacity-50">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title">Edit Course</h5>
                <button type="button" class="btn-close" @click="showEditCourseModal = false"></button>
              </div>
              <div class="modal-body">
                <input v-model="editCourseData.CourseName" class="form-control mb-2" placeholder="Course Name" />
                <input v-model="editCourseData.Course_Hour" class="form-control mb-2" placeholder="Course Hour" />
                <input v-model="editCourseData.StartTime" class="form-control mb-2" placeholder="Start Time" type="time" />
                <input v-model="editCourseData.EndTime" class="form-control mb-2" placeholder="End Time" type="time" />
                <input v-model="editCourseData.CourseDate" class="form-control mb-2" placeholder="Course Date" type="date" />
              </div>
              <div class="modal-footer">
                <button class="btn btn-secondary" @click="showEditCourseModal = false">Cancel</button>
                <button class="btn btn-success" @click="updateCourse">Save</button>
              </div>
            </div>
          </div>
        </div>
      </section>
    
      <!-- Add Course Modal -->
      <div v-if="showAddCourseModal" class="modal d-block bg-dark bg-opacity-50">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Add New Course</h5>
              <button type="button" class="btn-close" @click="showAddCourseModal = false"></button>
            </div>
            <div class="modal-body">
              <input v-model="newCourse.courseName" type="text" class="form-control mb-2" placeholder="Course Name">
              <input v-model="newCourse.courseCode" type="text" class="form-control mb-2" placeholder="Course Code">
              <input v-model="newCourse.courseHour" type="number" step="0.1" class="form-control mb-2" placeholder="Course Hour">
              <input v-model="newCourse.startTime" type="time" class="form-control mb-2">
              <input v-model="newCourse.endTime" type="time" class="form-control mb-2">
              <input v-model="newCourse.courseDate" type="date" class="form-control mb-2">
              <select v-model="newCourse.lecturerId" class="form-control mb-2">
                <option disabled value="">Select Lecturer</option>
                <option v-for="lec in lecturers" :key="lec.LecturerID" :value="lec.LecturerID">
                  {{ lec.FirstName }} {{ lec.LastName }} ({{ lec.LecturerID }})
                </option>
              </select>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" @click="showAddCourseModal = false">Cancel</button>
              <button class="btn btn-success" @click="addCourse">Add Course</button>
            </div>
          </div>
        </div>
      </div>

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
      showAddCourseModal: false,
      newCourse: {
        courseName: '',
        courseCode: '',
        courseHour: '',
        startTime: '',
        endTime: '',
        courseDate: '',
        lecturerId: ''
      },
      editLecturerData: null,
      showEditLecturerModal: false,
      editStudentData: null,
      showEditStudentModal: false,
      editCourseData: null,
      showEditCourseModal: false,
      students: [],
      lecturers: [],
      courses: [],
    };
  },
  methods: {
    addCourse() {
      const { courseName, courseCode, courseHour, startTime, endTime, courseDate, lecturerId } = this.newCourse;
      if (!courseName || !courseCode || !courseHour || !startTime || !endTime || !courseDate || !lecturerId) {
        alert("Please fill in all required fields.");
        return;
      }
      const payload = {
        courseName,
        courseId: courseCode,
        courseHour,
        startTime,
        endTime,
        courseDate,
        lecturerId
      };
      axios.post('/add-course', payload)
        .then(res => {
          alert(res.data.message || "Course added successfully");
          this.newCourse = { courseName: '', courseCode: '', courseHour: '', startTime: '', endTime: '', courseDate: '', lecturerId: '' };
          this.showAddCourseModal = false;
          this.fetchAll();
        })
        .catch(err => {
          alert(err.response?.data?.message || "Failed to add course");
        });
    },

    startEditLecturer(lecturer) {
      this.editLecturerData = { ...lecturer };
      this.showEditLecturerModal = true;
    },
    updateLecturer() {
      const { UserID, FirstName, LastName, Email, Department } = this.editLecturerData;
      axios.put(`/update-lecturer/${UserID}`, { FirstName, LastName, Email, Department })
        .then(() => {
          this.showEditLecturerModal = false;
          this.editLecturerData = null;
          this.fetchAll();
        })
        .catch(() => alert("Failed to update lecturer"));
    },
    startEditStudent(student) {
      this.editStudentData = { ...student };
      this.showEditStudentModal = true;
    },
    updateStudent() {
      const { UserID, FirstName, LastName, Email, Faculty, Year } = this.editStudentData;
      axios.put(`/update-student/${UserID}`, { FirstName, LastName, Email, Faculty, Year })
        .then(() => {
          this.showEditStudentModal = false;
          this.editStudentData = null;
          this.fetchAll();
        })
        .catch(() => alert("Failed to update student"));
    },
    startEditCourse(course) {
      this.editCourseData = { ...course };
      this.showEditCourseModal = true;
    },
    updateCourse() {
      const { CourseID, CourseName, Course_Hour, StartTime, EndTime, CourseDate } = this.editCourseData;
      axios.put(`/update-course/${CourseID}`, { CourseName, Course_Hour, StartTime, EndTime, CourseDate })
        .then(() => {
          this.showEditCourseModal = false;
          this.editCourseData = null;
          this.fetchAll();
        })
        .catch(() => alert("Failed to update course"));
    },
    deleteLecturer(id) {
      if (confirm("Are you sure you want to delete this lecturer?")) {
        axios.delete(`/delete-lecturer/${id}`)
          .then(() => this.fetchAll())
          .catch(() => alert("Failed to delete lecturer"));
      }
    },
    deleteStudent(id) {
      if (confirm("Are you sure you want to delete this student?")) {
        axios.delete(`/delete-student/${id}`)
          .then(() => this.fetchAll())
          .catch(() => alert("Failed to delete student"));
      }
    },
    deleteCourse(id) {
      if (confirm("Are you sure you want to delete this course?")) {
        axios.delete(`/delete-course/${id}`)
          .then(() => this.fetchAll())
          .catch(() => alert("Failed to delete course"));
      }
    },
    fetchAll() {
      axios.get('/lecturers')
        .then(res => this.lecturers = res.data.lecturers)
        .catch(err => console.error('Fetch lecturers error:', err.response?.data || err.message));

      axios.get('/students')
        .then(res => this.students = res.data.students)
        .catch(err => console.error('Fetch students error:', err.response?.data || err.message));

      axios.get('/all-courses')
        .then(res => this.courses = res.data.courses)
        .catch(err => console.error('Fetch courses error:', err.response?.data || err.message));
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