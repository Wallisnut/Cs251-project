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
                      accept=".pdf"
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
  </div>
</template>

<script>
import axios from "axios";

export default {
  mounted() {
    this.fetchUserInfo();
    this.fetchCourseData();
    this.fetchAttendanceHistory();
  },
  data() {
    return {
      courseId: this.$route.params.courseId,
      studentId: null,
      attendance: [], // Holds attendance data
      attendanceHistory: [],
      selectedFile: null,
      checkedDate: null,
      course: {
        schedule: {},
        lecturers: [],
      },
    };
  },
  methods: {
    fetchUserInfo() {
      axios
        .get("/user-info", {
          headers: {
            "user-token": localStorage.getItem("token"),
          },
        })
        .then((response) => {
          this.studentId = response.data.adminDetails.AdminID;
        })
        .catch((error) => {
          console.error("Error fetching user info:", error);
        });
    },

    recordAttendance(index) {
      const courseId = this.courseId; // Get the courseId from the current route

      axios
        .post(
          `/attendance-approval/${courseId}`,
          {},
          {
            headers: {
              "user-token": localStorage.getItem("token"), // Include the token for authentication
            },
          }
        )
        .then((response) => {
          // Handle the response
          const approvalResults = response.data.results;
          console.log("Approval Results:", approvalResults);

          // Update the specific row in the attendance array
          const result = approvalResults.find(
            (res) => res.date === this.attendance[index].date
          );
          if (result) {
            this.attendance[index].approvalStatus = result.approvalStatus;
          }

          // Optionally, display a success message
          alert("Attendance approval processed successfully!");
        })
        .catch((error) => {
          console.error("Error approving attendance:", error);
          alert("Failed to process attendance approval.");
        });
    },

    async fetchCourseData() {
      try {
        const courseId = this.$route.params.courseId;
        const response = await axios.get(`/course_and_lecturer/${courseId}`);
        this.course = response.data;
        this.generateAttendanceRows();
      } catch (error) {
        console.error("Failed to fetch course:", error);
      }
    },

    isAttendanceAvailable(courseDate, startTime, endTime) {
      const currentDate = new Date();
      const courseDateTimeStart = new Date(`${courseDate}T${startTime}:00`);
      const courseDateTimeEnd = new Date(`${courseDate}T${endTime}:00`);

      // Check if current time is within course start and end time
      return (
        currentDate >= courseDateTimeStart &&
        currentDate <= courseDateTimeEnd &&
        currentDate.getDate() === courseDateTimeStart.getDate()
      );
    },

    async fetchAttendanceHistory() {
      try {
        const res = await axios.get(`/attendance-history/${this.studentId}`, {
          headers: {
            "user-token": localStorage.getItem("token"),
          },
        });
        this.attendanceHistory = res.data.attendance;
      } catch (err) {
        console.error("Failed to fetch attendance history:", err);
      }
    },

    generateAttendanceRows() {
      const startDate = new Date(this.course.schedule.date);
      const today = new Date();
      const rows = [];

      let loopDate = new Date(startDate);

      while (loopDate <= today) {
        const dateStr = loopDate.toISOString().slice(0, 10);

        const matchedHistory = this.attendanceHistory.find(
          (record) =>
            record.courseId === this.courseId && record.date === dateStr
        );

        rows.push({
          date: dateStr,
          canCheckIn: this.isAttendanceAvailable(
            dateStr,
            this.course.schedule.startTime,
            this.course.schedule.endTime
          ),
          teacher: matchedHistory ? matchedHistory.status : "unchecked",
        });

        loopDate.setDate(loopDate.getDate() + 7);
      }

      this.attendance = rows;
    },

    handleFileUpload(index, event) {
      const file = event.target.files[0]; // Get the selected file
      if (file && file.type === "application/pdf") {
        this.attendance[index].selectedFile = file; // Store file at the specific row index
        console.log("File selected:", file.name);
      } else {
        alert("Please upload a valid PDF file");
        this.attendance[index].selectedFile = null;
      }
    },

    submitSingleLeave(index) {
      const row = this.attendance[index];
      const file = row.selectedFile;

      if (!file || file.size > 5 * 1024 * 1024) {
        alert("กรุณาเลือกไฟล์ PDF ไม่เกิน 5MB");
        return;
      }

      const formData = new FormData();
      formData.append("studentId", this.studentId);
      formData.append("courseId", this.courseId);
      formData.append("reason", file);

      axios
        .post("/submit-leave-request", formData)
        .then((res) => {
          alert(`ส่งคำขอลาสำเร็จ! รหัสคำขอ: ${res.data.requestId}`);
        })
        .catch((err) => {
          console.error("Error submitting leave:", err);
          alert("เกิดข้อผิดพลาดในการส่งคำขอลา");
        });
    },

    changeFile(index) {
      // Clear the previously selected file
      this.attendance[index].selectedFile = null;
    },

    logout() {
      alert("Logging out...");
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
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