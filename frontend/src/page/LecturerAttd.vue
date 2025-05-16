<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column">
      <h2 class="fw-bold">Menu</h2>
      <router-link to="/lecturer/home" class="menu-item active">🏠 Home</router-link>
      <router-link to="/notificationProf" class="menu-item">🔔 Notification</router-link>
      <router-link to="/course_summary" class="menu-item">📊 Summary</router-link>
      <div class="menu-item mt-auto" @click="logout">⬅️ Log Out</div>
    </div>

    <!-- Content -->
    <div class="content flex-grow-1">
      <div class="container">
        <div class="text-center my-3">
          <button class="btn btn-primary px-5">{{ $route.params.courseId }}</button>
        </div>
        <table class="table table-bordered text-center">
          <thead>
            <tr>
              <th>ชื่อ-นามสกุล</th>
              <th>รหัสนักศึกษา</th>
              <th>{{ todayStr }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="attendance.length === 0">
              <td colspan="3">No attendance data available</td>
            </tr>
            <tr v-for="(row, index) in attendance" :key="index">
              <td>{{ row.FirstName }} {{ row.LastName }}</td>
              <td>{{ row.StudentID }}</td>
              <td>
                <input
                  type="radio"
                  v-model="attendance[index].isChecked"
                  :value="true"
                  @change="recordAttendance(index)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      attendance: [], // Holds enrolled students with attendance info
      todayStr: "", // For display, formatted date (DD/MM/YYYY)
    };
  },
  methods: {
    async fetchEnrolledStudents() {
      try {
        const token = localStorage.getItem("token");
        const courseId = this.$route.params.courseId;

        // Fetch all students (consider optimizing backend to fetch enrolled students directly)
        const allStudentsResponse = await axios.get("/students", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const allStudents = allStudentsResponse.data.students;

        const enrolledStudents = [];
        for (const student of allStudents) {
          try {
            const enrolledRes = await axios.get(`/join-course/${student.StudentID}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            const enrolledCourses = enrolledRes.data;

            const isEnrolled = enrolledCourses.some(
              (course) => course.CourseID === courseId
            );

            if (isEnrolled) {
              enrolledStudents.push({
                ...student,
                isChecked: false, // track checkbox or attendance marking
              });
            }
          } catch (error) {
            console.error(`Error fetching courses for student ${student.StudentID}:`, error);
          }
        }

        this.attendance = enrolledStudents;
      } catch (error) {
        console.error("Error fetching enrolled students:", error);
        alert("ไม่สามารถดึงข้อมูลนักเรียนที่ลงทะเบียนได้");
      }
    },

    async approveAttendance(records) {
  try {
    const response = await axios.post(
      `/attendance-approval/${this.courseId}`,
      { attendanceRecords: records }
    );
    
    this.showSuccess(`${response.data.results.length} records updated`);
    this.refreshAttendanceData();
  } catch (error) {
    this.showError("Approval failed");
  }
}

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post("/record-attendance", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert(response.data.message);
        // Optionally mark this student as checked in UI
        this.attendance[index].isChecked = true;
      } catch (error) {
        console.error("Error recording attendance:", error);
        alert("ไม่สามารถบันทึกการเข้าเรียนได้");
      }
    },

    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
  mounted() {
    this.fetchEnrolledStudents();

    // Format today’s date for display (DD/MM/YYYY)
    const today = new Date();
    this.todayStr = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  },
};
</script>





<style scoped>
.sidebar {
  width: 250px;
  background: #f8f9fa;
  height: 100vh;
  padding: 20px;
}
.menu-item {
  padding: 12px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  color: black;
  display: block;
  background: transparent;
  transition: all 0.2s ease-in-out;
  margin-bottom: 5px;
}

.menu-item:hover,
.active {
  background: #ffc107;
  border-radius: 12px;
}

.active {
  background: #ffc107;
  border-radius: 10px;
}
.menu-item:last-child {
  margin-bottom: 0;
}
.content {
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.container {
  display: block;
}
</style>