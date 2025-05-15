<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <nav style="width: 15%;" class="w-22 bg-white text-black d-flex flex-column p-4">
      <h2 class="mb-5">Menu</h2>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item mb-2">
          <router-link to="/admin/home" class="menu-item nav-link text-black">Home</router-link>
        </li>
        <li class="nav-item mb-2">
          <router-link to="/notification" class="menu-item nav-link text-black">Notification</router-link>
        </li>
        <li class="nav-item mb-2">
          <router-link to="/course_summary" class="menu-item active nav-link">Summary</router-link>
        </li>
      </ul>
      <div class="mt-auto">
        <button @click="logout" class="btn btn-light text-warning w-100">Log Out</button>
      </div>
    </nav>

    <!-- Main content wrapper -->
    <div class="main">
      <div class="header">
        <h1 class="text-3xl font-bold mb-2">สรุปผลการเข้าเรียนรายวิชา</h1>
        <p class="text-gray-600 mb-6">แสดงสถิติการเข้าเรียนขาดเรียน และการมาสายรายวิชา</p>

        <!-- Course Dropdown -->
        <div class="dropdown">
      <select v-model="selectedCourseId" @change="onCourseChange" class="border border-gray-300 rounded-lg px-4 py-2">
        <option v-for="course in courses" :key="course.CourseID" :value="course.CourseID">
          {{ course.CourseName }}
        </option>
      </select>

        </div>
        <canvas id="attendanceChart" class="max-w-80 max-h-80 mb-10"></canvas>

        <!-- Table -->
        <div>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">รายละเอียด</h2>
          </div>

          <table class="min-w-full text-sm border-t border-gray-200">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="py-3 px-4 text-left">Student ID</th>
                <th class="py-3 px-4 text-left">Name</th>
                <th class="py-3 px-4 text-left">เข้าเรียน</th>
                <th class="py-3 px-4 text-left">ลา</th>
                <th class="py-3 px-4 text-left">ขาด</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="record in filteredData"
                :key="record.StudentID"
                class="border-t border-gray-200 hover:bg-gray-50"
              >
                <td class="py-2 px-4">{{ record.StudentID }}</td>
                <td class="py-2 px-4">{{ record.StudentFirstName }} {{ record.StudentLastName }}</td>
                <td class="py-2 px-4">{{ record.PresentClasses }}</td>
                <td class="py-2 px-4">{{ record.LateClasses }}</td>
                <td class="py-2 px-4">{{ record.AbsentClasses }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default {
  name: "AttendanceSummary",
  data() {
    return {
      courses: [],
      selectedCourseId: null,
      attendanceData: [],
      loading: true,
      error: null,
      search: "",
      useMock: true,  // สลับใช้ mock หรือไม่
    mockAttendanceData: [
      { StudentID: 'S001', StudentFirstName: 'ณัฐชยา', StudentLastName: 'ทาศรี', PresentClasses: 8, AbsentClasses: 1, LateClasses: 0 },
      { StudentID: 'S002', StudentFirstName: 'สมชาย', StudentLastName: 'ใจดี', PresentClasses: 7, AbsentClasses: 2, LateClasses: 1 },
      { StudentID: 'S003', StudentFirstName: 'สุนิสา', StudentLastName: 'สดใส', PresentClasses: 9, AbsentClasses: 0, LateClasses: 0 },
    ],
    };
  },
computed: {
  filteredData() {
    const keyword = this.search.toLowerCase();
    return this.attendanceData.filter(
      (item) =>
        item.StudentID.includes(keyword) ||
        item.StudentFirstName.toLowerCase().includes(keyword) ||
        item.StudentLastName.toLowerCase().includes(keyword)
    );
  },
},
  methods: {
    logout() {
      // add logout logic here
      this.$router.push("/login");
    },
       renderChart() {
      const ctx = document.getElementById('attendanceChart').getContext('2d');
        if (!ctx) {
        console.error("Canvas context not found");
        return;
        }
      const labels = this.attendanceData.map((item, index) => `${index + 1}th`);
      const present = this.attendanceData.map(item => item.PresentClasses);
      const absent = this.attendanceData.map(item => item.AbsentClasses);
      const late = this.attendanceData.map(item => item.LateClasses);

      new Chart(ctx, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Present',
              data: present,
              backgroundColor: '#a78bfa', // light purple
            },
            {
              label: 'Absent',
              data: absent,
              backgroundColor: '#fca5a5', // soft red
            },
            {
              label: 'Leave',
              data: late,
              backgroundColor: '#67e8f9', // light blue
            },
          ],
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: 'bottom' },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: {
              stacked: false,
              title: { display: true, text: 'Students' },
            },
            y: {
              beginAtZero: true,
              title: { display: true, text: 'Number of Classes' },
            },
          },
        },
      });
    },
      loadCourses() {
    axios.get('/all-courses')
      .then(res => {
        this.courses = res.data;
        if (this.courses.length > 0) {
          this.selectedCourseId = this.courses[0].CourseID;
          this.loadAttendance(this.selectedCourseId);
        }
      })
      .catch(err => {
        console.error(err);
      });
  },
    onCourseChange() {
    if (this.selectedCourseId) {
      this.loadAttendance(this.selectedCourseId);
    }},
  loadAttendance(courseId) {
    this.loading = true;
    axios.get(`/attendance-report/${courseId}`)
      .then(res => {
        this.attendanceData = res.data;
      })
      .catch(err => {
        this.error = err.response?.data?.message || "Failed to load attendance report.";
      })
      .finally(() => {
        this.loading = false;
      });
  }

  },
  created(){
    this.loadCourses();
  const courseId = this.$route.params.courseId;

  if (this.useMock) {
    this.attendanceData = this.mockAttendanceData;
    this.loading = false;
  } else {
    axios
      .get(`/attendance-report/${courseId}`)
      .then((res) => {
        this.attendanceData = res.data;
      })
      .catch((err) => {
        this.error = err.response?.data?.message || "Failed to load attendance report.";
      })
      .finally(() => {
        this.loading = false;
      });
  }
},
    watch: {
    attendanceData(newData) {
      if (newData.length > 0) {
      this.$nextTick(() => {
        this.renderChart();
      });
    }
    },
  },
};
</script>
<style scoped>
.sidebar {
  width: 250px;
  background: #f8f9fa;
  height: 100vh;
  padding: 30px 20px;
  font-size: 16px;
  box-shadow: 1px 0 5px rgba(0,0,0,0.1);
}
.sidebar h2 {
    font-size: 24px;
    margin-bottom: 40px;
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
  border-radius: 12px;
  margin-bottom: 10px;
}
.menu-item:hover,
.active {
  background: #ffc107;
  color: black !important;
}
.main {
    flex: 1;
    padding: 40px;
    background-color: #f5f5f5;
    border: 6px solid white;
    border-radius: 20px;
}
canvas {
  background: #fff;
  border-radius: 16px;
  padding: 16px;
}
.header h1 {
    font-size: 28px;
}
.header p {
    margin-top: -10px;
    color: #777;
}
.dropdown {
    margin: 20px 0;
}

.dropdown select {
    padding: 10px;
    font-size: 16px;
    border-radius: 8px;
    border: 1px solid #ccc;
    }
* {
  box-sizing: border-box;
  font-family: sans-serif;
}
</style>
