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
      attendance: [], // Each item: { date, startTime, endTime, canCheckIn, status, selectedFile }
      attendanceHistory: [], // fetched attendance records
      course: {
        schedule: {},
        lecturers: [],
      },
      showPopup: false,
      pendingAttendanceIndex: null,
    };
  },
  mounted() {
    this.fetchUserInfo();
    this.fetchCourseData();
  },
  methods: {
    async fetchUserInfo() {
      try {
        const response = await axios.get("/user-info", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.studentId = response.data.studentDetails.StudentID;
        await this.fetchAttendanceHistory();
      } catch (error) {
        console.error("Error fetching user info:", error);
      }
    },

    recordAttendance(index) {
      this.pendingAttendanceIndex = index;
      this.showPopup = true;
    },

    async confirmAttendance() {
  const index = this.pendingAttendanceIndex;
  if (index === null) return;

  try {
    const response = await axios.post(
      `/attendance-approval/${this.courseId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    const approvalResults = response.data.results || [];
    const attendanceDate = this.attendance[index].date;

    const result = approvalResults.find(
      (res) =>
        res.studentId === this.studentId &&
        res.dateAttend === attendanceDate // ✅ ควรเช็คว่า backend ส่ง `dateAttend` มาด้วยจริงมั้ย
    );

    if (result) {
      const status = result.recordedStatus || result.approvalStatus || "approved";
      this.attendance[index].approvalStatus = status;
      this.attendance[index].status = status;
      alert("เช็คชื่อสำเร็จ!");
    } else {
      alert("ไม่พบข้อมูลการอนุมัติสำหรับวันนั้น");
    }
  } catch (error) {
    console.error("Error approving attendance:", error);
    alert("ไม่สามารถเช็คชื่อได้");
  } finally {
    this.showPopup = false;
    this.pendingAttendanceIndex = null;
  }
},

    async fetchCourseData() {
      try {
        const response = await axios.get(`/course_and_lecturer/${this.courseId}`);
        this.course = response.data;
        this.generateAttendanceRows();
      } catch (error) {
        console.error("Failed to fetch course:", error);
      }
    },

    isAttendanceAvailable(courseDate, startTime, endTime) {
      const now = new Date();
      const start = new Date(`${courseDate}T${startTime}:00`);
      const end = new Date(`${courseDate}T${endTime}:00`);
      // Check if current time is within course start/end time and on the same day
      return now >= start && now <= end && now.toISOString().slice(0, 10) === courseDate;
    },

    async fetchAttendanceHistory() {
      try {
        const res = await axios.get(`/attendance-history/${this.studentId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        this.attendanceHistory = res.data.attendance || [];
        this.generateAttendanceRows();
      } catch (err) {
        console.error("Failed to fetch attendance history:", err);
      }
    },

    generateAttendanceRows() {
      if (!this.course.schedule.date) return;

      const startDate = new Date(this.course.schedule.date);
      const today = new Date();
      const rows = [];

      let loopDate = new Date(startDate);

      while (loopDate <= today) {
        const dateStr = loopDate.toISOString().slice(0, 10);

        // Match attendanceHistory by CourseID and Date_Attend
        const matchedHistory = this.attendanceHistory.find(
          (record) =>
            record.CourseID === this.courseId && record.Date_Attend === dateStr
        );

        rows.push({
          date: dateStr,
          startTime: this.course.schedule.startTime,
          endTime: this.course.schedule.endTime,
          canCheckIn: this.isAttendanceAvailable(
            dateStr,
            this.course.schedule.startTime,
            this.course.schedule.endTime
          ),
          status: matchedHistory ? matchedHistory.Status : "unchecked", // Use proper property names
          approvalStatus: matchedHistory ? matchedHistory.recordedStatus || null : null,
          selectedFile: null,
        });

        loopDate.setDate(loopDate.getDate() + 7);
      }

      this.attendance = rows;
    },

    handleFileUpload(index, event) {
      const file = event.target.files[0];
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg"];

      if (file && allowedTypes.includes(file.type)) {
        this.attendance[index].selectedFile = file;
        console.log("File selected:", file.name);
      } else {
        alert("กรุณาอัปโหลดไฟล์ PDF หรือ รูปภาพ (.png, .jpg)");
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
      formData.append("reason", "ขอลาด้วยเหตุผล...");
      formData.append("file", file);

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