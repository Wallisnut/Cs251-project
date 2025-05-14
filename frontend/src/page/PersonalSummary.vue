<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <nav class="w-20 bg-warning text-white d-flex flex-column p-4">
      <h2 class="mb-5">AttendEase</h2>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item mb-2"><router-link to="/admin/home" class="nav-link text-white">Home</router-link></li>
      </ul>
      <div class="mt-auto">
        <button @click="logout" class="btn btn-light text-warning w-100">Log Out</button>
      </div>
    </nav>

    <!-- Main Content -->
    <div class="flex-grow-1 bg-light p-5">
      <div class="mb-6">
        <h1 class="text-3xl font-bold">สรุปผลการเข้าเรียนรายวิชา</h1>
        <p class="text-gray-600 -mt-2">แสดงสถิติการเข้าเรียน ขาดเรียน และการลา ตามรายวิชา</p>
      </div>

      <div v-for="(group, index) in groupedByCourse" :key="index" class="mb-8">
        <h2 class="text-xl font-bold mb-2">{{ group.course }}</h2>

        <div class="flex space-x-3 mb-2">
          <span class="bg-black text-white px-4 py-1 rounded-full text-sm">เช็กชื่อ {{ group.present }}</span>
          <span class="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm">ลา {{ group.late }}</span>
          <span class="bg-gray-400 text-white px-4 py-1 rounded-full text-sm">ขาดเรียน {{ group.absent }}</span>
        </div>

        <!-- Progress bar -->
        <!-- Attendance percentage progress bar -->
        <div class="attendance-bar">
        <!-- Filled bar -->
        <div
            class="attendance-fill"
            :style="{ width: group.attendancePercentage + '%' }"
        ></div>

        <!-- Badge with percentage -->
        <div
            class="attendance-badge"
            :style="{ left: group.attendancePercentage + '%' }"
        >
            {{ group.attendancePercentage }}%
        </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      studentId: '',
      attendance: [],
    };
  },
  computed: {
    groupedByCourse() {
      const groups = {};
      this.attendance.forEach((record) => {
        if (!groups[record.CourseID]) {
          groups[record.CourseID] = {
            course: record.CourseID,
            present: 0,
            late: 0,
            absent: 0,
          };
        }
        if (record.Status === 'present') groups[record.CourseID].present++;
        else if (record.Status === 'late') groups[record.CourseID].late++;
        else if (record.Status === 'absent') groups[record.CourseID].absent++;
      });

      return Object.values(groups).map((group) => {
        const total = group.present + group.late + group.absent;
        const attendancePercentage = total > 0 ? Math.round((group.present / total) * 100) : 0;
        return {
          ...group,
          attendancePercentage,
        };
      });
    },
  },
  mounted() {
    // You may replace with actual auth info
    this.studentId = localStorage.getItem('studentId');
    if (!this.studentId) {
      console.error('Missing studentId');
      return;
    }
    

    axios
      .get(`/attendance-history/${this.studentId}`)
      .then((res) => {
        this.attendance = res.data;
      })
      .catch((err) => {
        console.error(err);
      });
  },
  methods: {
    logout() {
      // Add logout logic here
      this.$router.push('/login');
    },
  },
};
</script>

<style scoped>
:root {
  --progress-left: 70%; /* this will be updated inline by style binding */
}
.attendance-bar {
  position: relative;
  width: 100%;
  height: 12px;
  border-radius: 6px;
  background-color: white;
  overflow: hidden;
}

.attendance-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 12px;
  background-color: black;
  border-radius: 6px;
}

.attendance-badge {
  position: absolute;
  top: -32px;
  transform: translateX(-50%);
  background-color: black;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}

/* Responsive layout for summary cards */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }

  .main-content {
    padding: 16px;
  }

  .attendance-bar {
    height: 8px;
  }

  .attendance-badge {
    top: -24px;
    font-size: 10px;
  }
}

</style>
