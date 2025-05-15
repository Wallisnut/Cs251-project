<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column">
      <h2 class="fw-bold">Menu</h2>
      <router-link to="/home" class="menu-item active">🏠 Home</router-link>
      <router-link to="/notification" class="menu-item">🔔 Notification</router-link>
      <router-link to="/summary" class="menu-item">📊 Summary</router-link>
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
                  :disabled="!isAttendanceAvailable()"
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
      attendance: [], // Holds attendance data
      todayStr: "", // Holds today's date
    };
  },
  methods: {
    async fetchStudents() {
      try {
        const token = localStorage.getItem("token"); // Admin or lecturer token
        const response = await axios.get("/students", {
          headers: {
            "user-token": token,
          },
        });
        this.attendance = response.data.students.map((student) => ({
          ...student,
          isChecked: false, // Add default isChecked property
        }));
      } catch (error) {
        console.error("Error fetching students:", error);
        alert("ไม่สามารถดึงข้อมูลนักเรียนได้");
      }
    },
    async recordAttendance(index) {
      const row = this.attendance[index];
      const payload = {
        StudentID: row.StudentID,
        CourseID: this.$route.params.courseId,
        Date_Attend: new Date().toISOString().split("T")[0], // Current date in YYYY-MM-DD format
        Status: "Present", // Assuming "Present" is the status for checked attendance
      };

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post("/record-attendance", payload, {
          headers: {
            "user-token": token,
          },
        });
        alert(response.data.message); // Show success message
      } catch (error) {
        console.error("Error recording attendance:", error);
        alert("ไม่สามารถบันทึกการเข้าเรียนได้");
      }
    },
    isAttendanceAvailable(date, startTime, endTime) {
      // Use the parameters to determine if attendance is available
      const currentDate = new Date();
      const courseStart = new Date(`${date}T${startTime}`);
      const courseEnd = new Date(`${date}T${endTime}`);

      // Check if the current time is within the course's start and end time
      return currentDate >= courseStart && currentDate <= courseEnd;
    },
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
  },
  mounted() {
    this.fetchStudents(); // Fetch students when the component is mounted

    // Set today's date
    const today = new Date();
    this.todayStr = today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }); // Format: DD/MM/YYYY
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