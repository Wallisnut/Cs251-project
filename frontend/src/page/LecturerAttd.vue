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
      courseId: this.$route.params.courseId,
      students: [],
      attendanceDate: new Date().toISOString().split('T')[0]
    };
  },
  methods: {
    async fetchClassAttendance() {
      try {
        // Get attendance report for the whole class
        const report = await axios.get(
          `/attendance-report/${this.courseId}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        
        // Get detailed records for the selected date
        const records = await axios.get(
          `/attendance-by-date/${this.courseId}/${this.attendanceDate}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        );
        
        this.students = report.data.map(student => {
          const record = records.data.find(r => r.StudentID === student.StudentID);
          return {
            ...student,
            status: record?.Status || 'absent',
            recordId: record?.AttendanceID
          };
        });
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    },

    async updateAttendance(studentId, status) {
      try {
        // For existing records
        await axios.put(
          `/edit-attendance/${student.recordId}`,
          { status },
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        );
        
        // For new records
        // await axios.post("/record-attendance", { ... });
        
        alert("Attendance updated!");
        this.fetchClassAttendance(); // Refresh data
      } catch (error) {
        console.error("Error updating attendance:", error);
        alert("Failed to update attendance");
      }
    },

    async approveAllAttendance() {
      try {
        const response = await axios.post(
          `/attendance-approval/${this.courseId}`,
          {},
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        );
        
        alert("Attendance approved for the whole class!");
        this.fetchClassAttendance();
      } catch (error) {
        console.error("Approval error:", error);
        alert("Failed to approve attendance");
      }
    }
  },
  mounted() {
    this.fetchClassAttendance();
  }
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