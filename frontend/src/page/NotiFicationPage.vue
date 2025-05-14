<template>
  <div class="d-flex">
    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column">
      <h2 class="fw-bold">Menu</h2>
      <router-link to="/home" class="menu-item" active-class="active">
        <img class="menu-icon" :src="homeIcon" alt="Home" /> Home
      </router-link>
      <router-link to="/notification" class="menu-item active" active-class="active">
        <img class="menu-icon" :src="notiIcon" alt="Notification" /> <span class="text-white">Notification</span>
      </router-link>
      <router-link to="/summary" class="menu-item" active-class="active">
        <img class="menu-icon" :src="summaryIcon" alt="Summary" /> Summary
      </router-link>
      <div class="menu-item mt-auto" @click="logout">
        <img class="menu-icon" :src="logoutIcon" alt="Logout" /> Log Out
      </div>
    </div>

    <!-- Content -->
    <div class="content flex-grow-1">
      <div class="container">
        <h2 class="mb-4">การแจ้งเตือนทั้งหมด</h2>

        <div class="notification-item" v-for="(item, index) in notifications" :key="index" @click="markAsRead(item.id)">
          <img class="icon" :src="userIcon" alt="user icon" />
          <div class="text">
            <p class="message" :class="{ unread: item.unread, read: !item.unread }">
              {{ item.message }}
            </p>
            <p class="time">{{ item.time }}</p>
          </div>
          <div class="dot" v-if="item.unread"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import userIcon from '@/assets/user-icon.png';
import homeIcon from '@/assets/home-icon.png';
import notiIcon from '@/assets/noti-icon.png';
import summaryIcon from '@/assets/summary-icon.png';
import logoutIcon from '@/assets/logout-icon.png';

export default {
  name: 'NotiFicationPage',
  data() {
    return {
      userIcon,
      homeIcon,
      notiIcon,
      summaryIcon,
      logoutIcon,
      notifications: []
    };
  },
  mounted() {
    this.fetchNotifications();
  },
  methods: {
    fetchNotifications() {
      fetch("http://localhost:5000/notifications")
        .then((res) => res.json())
        .then((data) => {
          this.notifications = data.notifications.map((n) => ({
            id: n.notificationId,
            message: n.message,
            time: "เมื่อกี้",
            unread: !n.isRead,
          }));
        })
        .catch((err) => console.error("Fetch error:", err));
    },
    markAsRead(id) {
      const userId = "U001";
      fetch(`http://localhost:5000/notifications/${id}/mark-read`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, userId }),
      })
        .then((res) => res.json())
        .then(() => {
          const noti = this.notifications.find((n) => n.id === id);
          if (noti) noti.unread = false;
        })
        .catch((err) => console.error("Mark read error:", err));
    },
    logout() {
      console.log("Logged out");
    }
  }
};
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Prompt:wght@400;700&display=swap');

.sidebar {
  width: 250px;
  background: #ffffff;
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

.text-white {
  color: white;
}

/* Content Area */
.content {
  font-family: 'Prompt', sans-serif;
  padding: 20px;
  background: #f5f5f5;
}

.notification-item {
  display: flex;
  align-items: center;
  background: #f5f5f5;
  border: 1px solid rgb(192, 192, 193);
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.icon {
  width: 50px;
  height: 50px;
  margin-right: 12px;
}

.text {
  flex-grow: 1;
}

.message {
  margin: 0;
  font-size: 16px;
  color: #000;
}

.unread {
  font-weight: 700;
  color: rgb(0, 0, 0) !important;
}

.read {
  font-weight: 400;
  color: #000;
}

.time {
  margin-top: 4px;
  font-size: 14px;
  color: #888787;
}

.dot {
  width: 10px;
  height: 10px;
  background-color: #3b82f6;
  border-radius: 50%;
}

.fw-bold {
  margin-left: 10px;
}

.mb-4 {
  font-size: 32px;
  font-weight: bold;
}
</style>

