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
          <button class="btn btn-primary px-5">CS251</button>
        </div>
        <table class="table table-bordered text-center">
          <thead>
            <tr>
              <th>วันที่</th>
              <th>เช็คชื่อ</th>
              <th>ลา</th>
              <th>อาจารย์</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in attendance" :key="index">
              <td>{{ row.date }}</td>
              <td>
                <input type="radio" v-model="attendance[index].isChecked" :value="true" :disabled="!isAttendanceAvailable(row.date, row.startTime, row.endTime)" @change="recordAttendance(index)" />
              </td>  
              <td>
                <template v-if="!attendance[index].isChecked">
                  <div v-if="!attendance[index].selectedFile">
                    <input type="file" class="file-input" @change="handleFileUpload(index, $event)" accept=".pdf">
                  </div>
                  <div v-else class="d-flex flex-column align-items-center">
                    <span class="mb-2 text-success">{{ attendance[index].selectedFile.name }}</span>

                    <div class="d-flex gap-2">
                      <button class="btn btn-sm btn-success" @click="submitSingleLeave(index)">ส่งคำขอลา</button>
                      <button class="btn btn-sm btn-danger" @click="changeFile(index)">ลบไฟล์</button>
                    </div>
                  </div>
                </template>
              </td>
              <td>{{ row.teacher }}</td>
            </tr>
          </tbody>
        </table>
        </div>
      </div>
    </div>
</template>

<script>
import axios from 'axios';

export default {
  async mounted() {
    this.fetchUserInfo();
    this.fetchAttendanceData(); 
    this.fetchCourseData(); 
  },
  data() {
    return {
      studentId: null,
      attendance: [], // Holds attendance data
      selectedFile: null,
    };
  },
  methods: {
    fetchUserInfo() {
      axios.get('/user-info', {
        headers: {
          'user-token': localStorage.getItem('token'),
        }
      })
      .then(response => {
        this.studentId = response.data.adminDetails.AdminID;
      })
      .catch(error => {
        console.error('Error fetching user info:', error);
      });
    },
    
    fetchAttendanceData() {
      // Simulating fetching attendance data
      this.attendance = [
        { date: '2025-05-15', teacher: 'อาจารย์สมชาย', isChecked: false },
        { date: '2025-05-16', teacher: 'อาจารย์สมศักดิ์', isChecked: false },
        // Add more attendance data here
      ];
    },

    recordAttendance(index) {
    const row = this.attendance[index];
    
    // Prevent duplicate sends
    if (!row.isChecked) return;

    const payload = {
      StudentID: this.studentId,
      CourseID: this.courseId, 
      Date_Attend: row.date,
      Status: 'present',
    };

    axios.post('/record-attendance', payload)
      .then(res => {
        console.log(res.data.message);
      })
      .catch(err => {
        console.error('Error recording attendance:', err);
        alert('ไม่สามารถบันทึกการเข้าเรียนได้');
      });
  },

      fetchCourseData() {
      axios.get(`/course_and_lecturer/${this.courseId}`)
        .then(response => {
          const courseData = response.data;
          this.courseName = courseData.courseName;
          this.schedule = courseData.schedule;
          this.lecturers = courseData.lecturers;

          // Prepare attendance rows based on the schedule
          this.attendance = [{
            date: this.schedule.date,
            startTime: this.schedule.startTime,
            endTime: this.schedule.endTime,
            lecturer: this.lecturers.map(lecturer => `${lecturer.firstName} ${lecturer.lastName}`).join(', '),
            isChecked: false,
            selectedFile: null,
          }];
        })
        .catch(error => {
          console.error('Error fetching course data:', error);
        });
    },

        isAttendanceAvailable(courseDate, startTime, endTime) {
      const currentDate = new Date();
      const courseDateTimeStart = new Date(`${courseDate}T${startTime}:00`);
      const courseDateTimeEnd = new Date(`${courseDate}T${endTime}:00`);

      // Check if current time is within course start and end time
      return currentDate >= courseDateTimeStart && currentDate <= courseDateTimeEnd && currentDate.getDate() === courseDateTimeStart.getDate();
    }
  },

    handleFileUpload(index, event) {
      const file = event.target.files[0]; // Get the selected file
      if (file && file.type === 'application/pdf') {
        this.attendance[index].selectedFile = file; // Store file at the specific row index
        console.log('File selected:', file.name);
      } else {
        alert('Please upload a valid PDF file');
        this.attendance[index].selectedFile = null;
      }
    },

    submitSingleLeave(index) {
    const row = this.attendance[index];
    const file = row.selectedFile;

    if (!file || file.size > 5 * 1024 * 1024) {
      alert('กรุณาเลือกไฟล์ PDF ไม่เกิน 5MB');
      return;
    }

    const formData = new FormData();
    formData.append('studentId', this.studentId);
    formData.append('courseId', this.courseId); 
    formData.append('reason', file);

    axios.post('/submit-leave-request', formData)
      .then(res => {
        alert(`ส่งคำขอลาสำเร็จ! รหัสคำขอ: ${res.data.requestId}`);
        // Optionally reset the row's file
        // this.attendance[index].selectedFile = null;
      })
      .catch(err => {
        console.error('Error submitting leave:', err);
        alert('เกิดข้อผิดพลาดในการส่งคำขอลา');
      });
  },

    changeFile(index) {
    // Clear the previously selected file
    this.attendance[index].selectedFile = null;
  },

    logout() {
      alert("Logging out...");
      localStorage.removeItem('token'); 
      this.$router.push('/login');
    }
  }
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
  padding: 20px;
}
</style>
