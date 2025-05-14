<template>
  <div class="h-screen flex flex-row bg-gray-100 overflow-hidden">
    <!-- Sidebar -->
    <div class="sidebar">
      <div>
        <h2 class="font-bold text-2xl mb-8">Menu</h2>
        <router-link to="/home" class="menu-item">🏠 Home</router-link>
        <router-link to="/notification" class="menu-item">🔔 Notification</router-link>
        <router-link to="/summary" class="menu-item active">📊 Summary</router-link>
      </div>
      <div class="menu-item" @click="logout">⬅️ Log Out</div>
    </div>

    <!-- Main content wrapper -->
    <div class="main">
      <div class="header">
        <h1 class="text-3xl font-bold mb-2">สรุปผลการเข้าเรียนรายวิชา</h1>
        <p class="text-gray-600 mb-6">แสดงสถิติการเข้าเรียนขาดเรียน และการมาสายรายวิชา</p>

        <!-- Course Dropdown -->
        <div class="dropdown">
          <select class="border border-gray-300 rounded-lg px-4 py-2">
            <option>CS251</option>
          </select>
        </div>

        <!-- Table -->
        <div>
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold">รายละเอียด</h2>
            <div class="relative">
              <input
                type="text"
                v-model="search"
                placeholder="Search"
                class="border border-gray-300 rounded-full px-4 py-2 pl-10 w-64"
              />
              <span class="absolute left-3 top-2.5 text-gray-500">🔍</span>
            </div>
          </div>

          <table class="min-w-full text-sm border-t border-gray-200">
            <thead class="bg-gray-100 text-gray-700">
              <tr>
                <th class="py-3 px-4 text-left">Student ID</th>
                <th class="py-3 px-4 text-left">Name</th>
                <th class="py-3 px-4 text-left">เข้าเรียน</th>
                <th class="py-3 px-4 text-left">ลา</th>
                <th class="py-3 px-4 text-left">ขาด</th>
                <th class="py-3 px-4 text-left">รายละเอียด</th>
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
                <td class="py-2 px-4 text-blue-500 cursor-pointer">more...</td>
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

export default {
  name: "AttendanceSummary",
  data() {
    return {
      attendanceData: [],
      loading: true,
      error: null,
      search: "",
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
  },
  created() {
    const courseId = this.$route.params.courseId;
    axios
      .get(`/attendance-report/${courseId}`)
      .then((res) => {
        this.attendanceData = res.data;
      })
      .catch((err) => {
        this.error =
          err.response?.data?.message || "Failed to load attendance report.";
      })
      .finally(() => {
        this.loading = false;
      });
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
