<<<<<<< Updated upstream
<template>
    <div :class="$style.notification">
          <div :class="$style.notificationChild" />
          <div :class="$style.notificationItem" />
          <div :class="$style.div">10 นาทีที่แล้ว</div>
          <div :class="$style.cs222">คุณไม่ได้เข้าเรียนในรายวิชา CS222 คลิกเพื่อส่งใบลา </div>
          <b :class="$style.b">การแจ้งเตือนทั้งหมด</b>
          <div :class="$style.notificationInner" />
          <div :class="$style.rectangleDiv" />
          <div :class="$style.ellipseDiv" />
          <img :class="$style.userIcon" alt="" src="User.svg" />
          <div :class="$style.div1">3 วันที่แล้ว</div>
          <div :class="$style.cs232">คุณไม่ได้เข้าเรียนในรายวิชา CS232 คลิกเพื่อส่งใบลา </div>
          <div :class="$style.notificationChild1" />
          <img :class="$style.userIcon1" alt="" src="User.svg" />
          <div :class="$style.menuPanel">
                <div :class="$style.menuPanelChild" />
                <div :class="$style.menu">Menu</div>
                <div :class="$style.home">Home</div>
                <div :class="$style.notification1">Notification</div>
                <div :class="$style.summary">Summary</div>
                <img :class="$style.vectorIcon" alt="" src="Vector.svg" />
                <div :class="$style.noti">
                      <div :class="$style.notiChild" />
                      <img :class="$style.icon" alt="" src="􀝖.svg" />
                </div>
                <img :class="$style.vectorIcon1" alt="" src="Vector.svg" />
                <div :class="$style.logOut">Log Out</div>
                <img :class="$style.vectorIcon2" alt="" src="Vector.svg" />
          </div>
    </div>
</template>
<script>
    import { defineComponent } from 'vue' ;
    
    
    export default defineComponent({
          name: "NotiFicationPage"})
    </script>
    <style  module>.notificationChild {
          position: absolute;
          top: calc(50% - 474px);
          left: 323px;
          border-radius: 20px;
          background-color: #f5f5f5;
          width: 937px;
          height: 948px;
    }
          .notificationItem {
                position: absolute;
                height: 2.04%;
                width: 1.56%;
                top: 15.61%;
                right: 5.39%;
                bottom: 82.35%;
                left: 93.05%;
                border-radius: 50%;
                background-color: #3a7fe8;
          }
          .div {
                position: absolute;
                top: 170px;
                left: 444px;
                color: #888787;
                display: inline-block;
                width: 121px;
                height: 32px;
          }
          .cs222 {
                position: absolute;
                top: 132px;
                left: 445px;
                font-size: 28px;
                font-weight: 600;
                display: inline-block;
                width: 615px;
                height: 34px;
          }
          .b {
                position: absolute;
                top: 56px;
                left: 363px;
                font-size: 32px;
                display: inline-block;
                text-align: center;
                width: 283px;
                height: 34px;
          }
          .notificationInner {
                position: absolute;
                top: 120px;
                left: 309px;
                filter: drop-shadow(4px 4px 7px rgba(0, 0, 0, 0.15));
                border-radius: 15px;
                border: 1px solid #b9b9b9;
                box-sizing: border-box;
                width: 995px;
                height: 82px;
          }
          .rectangleDiv {
                position: absolute;
                top: 201px;
                left: 309px;
                filter: drop-shadow(4px 4px 7px rgba(0, 0, 0, 0.15));
                border-radius: 15px;
                border: 1px solid #b9b9b9;
                box-sizing: border-box;
                width: 995px;
                height: 82px;
          }
          .ellipseDiv {
                position: absolute;
                height: 5.2%;
                width: 3.98%;
                top: 13.88%;
                right: 67.66%;
                bottom: 80.92%;
                left: 28.36%;
                border-radius: 50%;
                border: 3px solid #3a7fe8;
                box-sizing: border-box;
          }
          .userIcon {
                position: absolute;
                top: 145px;
                left: 371px;
                width: 36px;
                height: 36px;
                overflow: hidden;
          }
          .div1 {
                position: absolute;
                top: 251px;
                left: 444px;
                color: #888787;
                display: inline-block;
                width: 121px;
                height: 32px;
          }
          .cs232 {
                position: absolute;
                top: 213px;
                left: 445px;
                font-size: 28px;
                font-weight: 500;
                display: inline-block;
                width: 615px;
                height: 34px;
          }
          .notificationChild1 {
                position: absolute;
                height: 5.2%;
                width: 3.98%;
                top: 22.14%;
                right: 67.66%;
                bottom: 72.65%;
                left: 28.36%;
                border-radius: 50%;
                border: 3px solid #3a7fe8;
                box-sizing: border-box;
          }
          .userIcon1 {
                position: absolute;
                top: 226px;
                left: 371px;
                width: 36px;
                height: 36px;
                overflow: hidden;
          }
          .menuPanelChild {
                position: absolute;
                top: 157.34px;
                left: 0px;
                box-shadow: 0px 10px 7px -5px rgba(0, 0, 0, 0.2);
                border-radius: 22px;
                background-color: #f6b51b;
                width: 259px;
                height: 61px;
          }
          .menu {
                position: absolute;
                top: 0px;
                left: 24.22px;
                font-size: 45px;
                display: flex;
                align-items: center;
                width: 173.3px;
                height: 61.8px;
          }
          .home {
                position: absolute;
                top: 89.11px;
                left: 86.64px;
                display: flex;
                align-items: center;
                width: 88.5px;
                height: 32.1px;
          }
          .notification1 {
                position: absolute;
                top: 172px;
                left: 86.64px;
                color: #fff;
                display: flex;
                align-items: center;
                width: 142px;
                height: 33px;
          }
          .summary {
                position: absolute;
                top: 257px;
                left: 86.64px;
                display: flex;
                align-items: center;
                width: 126px;
                height: 32px;
          }
          .vectorIcon {
                position: absolute;
                top: 87px;
                left: 24px;
                width: 34.5px;
                height: 34.5px;
          }
          .notiChild {
                position: absolute;
                top: 4.31px;
                left: 0px;
                background-color: rgba(217, 217, 217, 0);
                width: 34.7px;
                height: 29.9px;
          }
          .icon {
                position: absolute;
                top: 0px;
                left: 0px;
                width: 34.7px;
                height: 29.9px;
          }
          .noti {
                position: absolute;
                top: 172px;
                left: 21px;
                width: 34.7px;
                height: 34.2px;
          }
          .vectorIcon1 {
                position: absolute;
                top: 254px;
                left: 20px;
                width: 34.5px;
                height: 34.5px;
          }
          .logOut {
                position: absolute;
                bottom: 32px;
                left: 89px;
                display: flex;
                align-items: center;
                width: 126px;
                height: 32px;
          }
          .vectorIcon2 {
                position: absolute;
                bottom: 30.2px;
                left: 28px;
                width: 37.5px;
                height: 33.8px;
          }
          .menuPanel {
                position: absolute;
                top: 56px;
                left: 28px;
                width: 259px;
                height: 762px;
                font-size: 22px;
                font-family: 'Konkhmer Sleokchher';
          }
          .notification {
                width: 100%;
                position: relative;
                background-color: #fcfbfb;
                height: 980px;
                overflow: hidden;
                text-align: left;
                font-size: 20px;
                color: #000;
                font-family: Inter;
          }
    
    </style> 
=======
<!-- <template>
  <div class="d-flex">
    Sidebar
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

    Content
    <div class="content flex-grow-1">
      <div class="container">
        <h2 class="mb-4">การแจ้งเตือนทั้งหมด</h2>

        <div class="notification-item" v-for="(item, index) in notifications" :key="index">
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
      notifications: [
        {
          message: 'คุณไม่ได้เข้าเรียนในรายวิชา CS222 คลิกเพื่อส่งใบลา',
          time: '10 นาทีที่แล้ว',
          unread: true,
        },
        {
          message: 'คุณไม่ได้เข้าเรียนในรายวิชา CS232 คลิกเพื่อส่งใบลา',
          time: '3 วันที่แล้ว',
          unread: false,
        },
      ],
    };
  },
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
</style> -->

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
>>>>>>> Stashed changes
