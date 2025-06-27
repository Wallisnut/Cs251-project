<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column">
      <h2 class="fw-bold">Menu</h2>
      <router-link to="/home" class="menu-item">🏠 Home</router-link>
      <router-link to="/notification" class="menu-item"
        >🔔 Notification</router-link
      >
      <router-link to="/personal_summary" class="menu-item active">📊 Summary</router-link>
      <div class="menu-item mt-auto" @click="logout">⬅️ Log Out</div>
    </div>

    <!-- Main Content -->
    <div class="main flex-grow-1 p-5">
      <div class="mb-6">
        <h1 class="text-3xl font-bold">สรุปผลการเข้าเรียนรายวิชา</h1>
        <p class="text-gray-600 -mt-2">แสดงสถิติการเข้าเรียน ขาดเรียน และการลา ตามรายวิชา</p>
      </div>

      <div v-for="(group, index) in groupedByCourse" :key="index" class="summary-card">
        <h2 class="text-xl font-bold">{{ group.courseId }} {{ group.courseName }}</h2>

        <div class="status-tags">
          <span class="badge present">เช็กชื่อ {{ group.present }}</span>
          <span class="badge late">ลา {{ group.late }}</span>
          <span class="badge absent">ขาดเรียน {{ group.absent }}</span>
        </div>

        <div class="attendance-bar">
          <div
            class="attendance-fill present-fill"
            :style="{ width: group.presentPercentage + '%' }"
          ></div>
          <div
            class="attendance-fill late-fill"
            :style="{ width: group.latePercentage + '%' , left: group.presentPercentage + '%' }"
          ></div>
          <div
            class="attendance-fill absent-fill"
            :style="{ width: group.absentPercentage + '%', left: group.presentPercentage + group.latePercentage + '%' }"
          ></div>
          <div
            class="attendance-badge"
            :style="{ left: group.presentPercentage + group.latePercentage + group.absentPercentage + '%' }"
          >
            {{ group.attendancePercentage }}%
          </div>
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
      studentId: "",
      attendance: [],
      coursesMap: {}, // เก็บชื่อวิชาตาม CourseID
    };
  },
  computed: {
    groupedByCourse() {
      // รวม attendance แยกตาม CourseID + คำนวณ % ของสถานะต่าง ๆ
      const groups = {};
      this.attendance.forEach((record) => {
        if (!groups[record.CourseID]) {
          groups[record.CourseID] = {
            courseId: record.CourseID,
            courseName: this.coursesMap[record.CourseID] || null,
            present: 0,
            late: 0,
            absent: 0,
          };
        }
        if (record.Status === "present") groups[record.CourseID].present++;
        else if (record.Status === "late") groups[record.CourseID].late++;
        else if (record.Status === "absent") groups[record.CourseID].absent++;
      });

      return Object.values(groups).map((group) => {
        const total = group.present + group.late + group.absent;
        const attendancePercentage = total > 0 ? Math.round((group.present / total) * 100) : 0;
        return {
          ...group,
          attendancePercentage,
          presentPercentage: total > 0 ? (group.present / total) * 100 : 0,
          latePercentage: total > 0 ? (group.late / total) * 100 : 0,
          absentPercentage: total > 0 ? (group.absent / total) * 100 : 0,
        };
      });
    },
  },
  mounted() {
  this.studentId = localStorage.getItem("studentId");
  const token = localStorage.getItem("token");

  if (!this.studentId || !token) {
    console.error("Missing studentId or token");
    return;
  }

  axios.get("/all-courses", {
    headers: { Authorization: `Bearer ${token}` },
  }).then((res) => {
    res.data.courses.forEach((course) => {
      this.coursesMap[course.CourseID] = course.CourseName;
    });

    return axios.get(`/attendance-history/${this.studentId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }).then((res) => {
    this.attendance = res.data;
  }).catch((err) => {
    console.error(err);
  });
},
  methods: {
    logout() {
      localStorage.removeItem("studentId");
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
.main {
  background-color: #f5f5f5;
  /* border: 6px solid white; */
  border-radius: 20px;
}

.menu-item {
  padding: 12px;
  font-weight: bold;
  cursor: pointer;
  text-decoration: none;
  display: block;
  border-radius: 12px;
  margin-bottom: 10px;
}

.menu-item:hover,
.active {
  background: #ffc107;
  color: black !important;
}

.summary-card {
  background: white;
  padding: 24px;
  border-radius: 16px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  margin-bottom: 24px;
}

.status-tags {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.badge {
  padding: 6px 16px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: bold;
  user-select: none;
}

.present {
  background: black;
  color: white;
}

.late {
  background: #ffc107;
  color: black;
}

.absent {
  background: #6c757d;
  color: white;
}

.attendance-bar {
  position: relative;
  width: 100%;
  height: 14px;
  background-color: #e0e0e0;
  border-radius: 7px;
  overflow: hidden;
  margin-top: 10px;
}

.attendance-fill {
  position: absolute;
  height: 100%;
  top: 0;
  transition: width 0.5s ease;
}

.present-fill {
  background-color: black;
  left: 0;
}

.late-fill {
  background-color: #ffc107;
}

.absent-fill {
  background-color: #6c757d;
}

.attendance-badge {
  position: absolute;
  top: -30px;
  transform: translateX(-50%);
  background-color: black;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
}
</style>
