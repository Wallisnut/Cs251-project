<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column">
      <h2 class="fw-bold">Menu</h2>
      <router-link to="/home" class="menu-item active">🏠 Home</router-link>
      <router-link to="/notification" class="menu-item">🔔 Notification</router-link>
      <router-link to="/personal_summary" class="menu-item">📊 Summary</router-link>
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
              <th>วันที่</th>
              <th>เช็คชื่อ</th>
              <th>ลา</th>
              <th>สถานะ</th> <!-- Approval Status Column -->
            </tr>
          </thead>
          <tbody>
            <tr v-if="attendance.length === 0">
              <td colspan="4">No attendance data available</td>
            </tr>
            <tr v-for="(row, index) in attendance" :key="index">
              <td>{{ row.date }}</td>
              <td>
                <input
                  type="radio"
                  v-model="attendance[index].isChecked"
                  :value="true"
                  :disabled="!isAttendanceAvailable(row.date, row.startTime, row.endTime)"
                  @change="recordAttendance(index)"
                />
              </td>
              <td>
                <template v-if="!attendance[index].isChecked">
                  <div v-if="!attendance[index].selectedFile">
                    <input
                      type="file"
                      class="file-input"
                      @change="handleFileUpload(index, $event)"
                      accept=".pdf, .png, .jpg, .jpeg"
                    />
                  </div>
                  <div v-else class="d-flex flex-column align-items-center">
                    <span class="mb-2 text-success">
                      {{ attendance[index].selectedFile.name }}
                    </span>
                    <div class="d-flex gap-2">
                      <button
                        class="btn btn-sm btn-success"
                        @click="submitSingleLeave(index)"
                      >
                        ส่งคำขอลา
                      </button>
                      <button
                        class="btn btn-sm btn-danger"
                        @click="changeFile(index)"
                      >
                        ลบไฟล์
                      </button>
                    </div>
                  </div>
                </template>
              </td>
              <td>
                {{ row.approvalStatus || "Pending" }} <!-- Display approval status -->
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-if="showPopup" class="modal-backdrop">
  <div class="modal-box">
    <h5>ยืนยันการเข้าร่วมคลาส</h5>
    <p>คุณแน่ใจหรือไม่ว่าต้องการเช็คชื่อในวันนี้?</p>
    <div class="d-flex justify-content-end gap-2 mt-3">
      <button class="btn btn-secondary" @click="showPopup = false">ยกเลิก</button>
      <button class="btn btn-success" @click="confirmAttendance">ยืนยัน</button>
    </div>
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
      studentId: null,
      attendanceRecords: [],
      today: new Date().toISOString().split('T')[0]
    };
  },
  methods: {
    async fetchMyAttendance() {
      try {
        const response = await axios.get(`/attendance-history/${this.studentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        
        // Filter for current course
        this.attendanceRecords = response.data.filter(
          record => record.CourseID === this.courseId
        );
      } catch (error) {
        console.error("Error fetching attendance:", error);
      }
    },

    async recordAttendance() {
      try {
        const response = await axios.post(
          "/record-attendance",
          {
            studentId: this.studentId,
            courseId: this.courseId,
            date: this.today
          },
          {
            headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
          }
        );
        
        alert("Attendance recorded!");
        this.fetchMyAttendance(); // Refresh data
      } catch (error) {
        console.error("Error recording attendance:", error);
        alert("Failed to record attendance");
      }
    }
  },
  mounted() {
    // Get student ID from user info
    this.studentId = /* your logic to get student ID */;
    this.fetchMyAttendance();
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
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-box {
  background: white;
  padding: 20px 30px;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  width: 400px;
  text-align: center;
}
</style>