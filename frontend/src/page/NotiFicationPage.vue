<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column">
      <h2 class="fw-bold">Menu</h2>
      <router-link to="/home" class="menu-item" active-class="active">
        <img class="menu-icon" :src="homeIcon" alt="Home" /> Home
      </router-link>
      <router-link to="/notification" class="menu-item" active-class="active">
        <img class="menu-icon" :src="notiIcon" alt="Notification" /> Notification
      </router-link>
      <router-link to="/personal_summary" class="menu-item" active-class="active">
        <img class="menu-icon" :src="summaryIcon" alt="Summary" /> Summary
      </router-link>
      <div class="menu-item mt-auto" @click="logout">
        <img class="menu-icon" :src="logoutIcon" alt="Logout" /> Log Out
      </div>
    </div>

    <!-- Content -->
    <div class="content flex-grow-1">
      <div class="container">
        <h2 class="mb-4 title">การแจ้งเตือนทั้งหมด</h2>

        <div class="notification-item" v-for="(item, index) in notifications" :key="item.NotificationID" @click="markAsRead(index)">
          <img class="icon" :src="userIcon" alt="user icon" />
          <div class="text">
            <p class="message" :class="{ unread: item.Status === 'unread', read: item.Status === 'read' }">
              {{ item.Message }}
            </p>
            <p class="time">{{ formatDate(item.Notification_date) }}</p>
          </div>
          <div class="dot" v-if="item.Status === 'unread'"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";
import userIcon from "../assets/user-icon.png";
import homeIcon from "../assets/home-icon.png";
import notiIcon from "../assets/noti-icon.png";
import summaryIcon from "../assets/summary-icon.png";
import logoutIcon from "../assets/logout-icon.png";

export default {
  name: "NotiFicationPage",
  data() {
    return {
      studentId: "66001", // ใช้ StudentID ที่มีอยู่ในฐานข้อมูล
      notifications: [],
      userIcon,
      homeIcon,
      notiIcon,
      summaryIcon,
      logoutIcon,
    };
  },
  created() {
    this.fetchNotifications();
  },
  methods: {
    fetchNotifications() {
      axios
        .get(`/notifications/${this.studentId}`)
        .then((res) => {
          this.notifications = res.data;
        })
        .catch((err) => {
          console.error("Error fetching notifications:", err);
        });
    },
    markAsRead(index) {
      if (this.notifications[index].Status === "unread") {
        this.notifications[index].Status = "read";
        // ถ้าต้องการอัปเดตฐานข้อมูลจริง ควรยิง PATCH ไปยัง backend ที่อัปเดต Status
      }
    },
    formatDate(datetime) {
      const d = new Date(datetime);
      return d.toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    logout() {
      alert("Logging out...");
    },
  },
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');

* {
  font-family: 'Inter', sans-serif;
}

/* Sidebar Styles */
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
  display: flex;
  align-items: center;
  background: transparent;
  transition: all 0.2s ease-in-out;
  margin-bottom: 5px;
}

.menu-item:hover,
.router-link-exact-active,
.active {
  background: #ffc107;
  border-radius: 12px;
}

.menu-icon {
  width: 20px;
  height: 20px;
  margin-right: 10px;
}

/* Content */
.content {
  padding: 20px;
  background: #f5f5f5;
}

.title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 20px;
}

/* Notification */
.notification-item {
  display: flex;
  align-items: center;
  background: #fff;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 12px;
  cursor: pointer;
  transition: background 0.2s;
}

.notification-item:hover {
  background-color: #f1f1f1;
}

.icon {
  width: 44px;
  height: 44px;
  margin-right: 12px;
}

.text {
  flex-grow: 1;
}

.message {
  margin: 0;
  font-size: 15px;
  color: #000;
}

.unread {
  font-weight: bold;
}

.read {
  font-weight: normal;
  color: #888;
}

.time {
  font-size: 12px;
  color: #888;
  margin-top: 4px;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: #3b82f6;
  border-radius: 50%;
}
</style>