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
              <input type="radio"/>
              <td>{{ row.leave ? '(อัปไฟล์)' : '' }}</td>
              <td>{{ row.teacher }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
const StudentID = localStorage.getItem('studentID');

export default {

  data() {
    return {
      attendance: [
        { date: '2025-03-25', checked: true, leave: false, teacher: 'Dr. Smith' },
        { date: '2025-03-26', checked: false, leave: true, teacher: 'Prof. Johnson' },
      ],
    };
  },
  methods: {
    logout() {
      alert("Logging out...");
      // Implement actual logout logic here
    }
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
  border-radius: 12px; /* Slightly more rounded on hover */
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
