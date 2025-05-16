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
      courseId: this.$route.params.courseId, // Save courseId for reuse
    };
  },
  methods: {
    async fetchEnrolledStudents() {
  try {
    const token = localStorage.getItem("token");

    // 1. ดึงนักเรียนทั้งหมด
    const response = await axios.get("/students", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const allStudents = response.data.students;

    // 2. สำหรับแต่ละคน ยิง GET /attendance-history/:studentId
    const enrolled = [];

    for (const student of allStudents) {
      try {
        const history = await axios.get(`/attendance-history/${student.StudentID}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // ถ้ามีประวัติการเข้าเรียนในคอร์สนี้ -> ถือว่าเคยลงทะเบียน
        const hasThisCourse = history.data.some(
          (record) => record.CourseID === this.courseId
        );

        if (hasThisCourse) {
          enrolled.push({ ...student, isChecked: false });
        }
      } catch (e) {
        console.error(`Error loading attendance for ${student.StudentID}`);
      }
    }

    this.attendance = enrolled;
  } catch (error) {
    console.error("Error fetching students:", error);
  }
},

    async recordAttendance(index) {
      const student = this.attendance[index];
      const payload = {
        studentId: student.StudentID,
        courseId: this.courseId,
        dateAttend: new Date().toISOString().split("T")[0],
        status: "present",
      };

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post("/record-attendance", payload, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        alert(response.data.message);

        // Mark this student as checked in UI
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