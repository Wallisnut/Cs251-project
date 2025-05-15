<template>
  <div class="home">
    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column">
      <h2 class="fw-bold">Menu</h2>
      <router-link to="/home" class="menu-item active">🏠 Home</router-link>
      <router-link to="/notification" class="menu-item"
        >🔔 Notification</router-link
      >
      <router-link to="/summary" class="menu-item">📊 Summary</router-link>
      <div class="menu-item mt-auto" @click="logout">⬅️ Log Out</div>
    </div>

    <!-- Main Content -->
    <div class="main-container">
      <h2 class="today">TODAY</h2>
      <div class="today-container">
        <div class="courseStatus">
          <div
            class="course-card"
            v-for="course in todayCourses"
            :key="course.courseId"
            :class="getCourseCardClass(course.status)"
            @click="goToAttendance(course.courseId)"
          >
            <div class="status">
              <span
                :style="{ backgroundColor: getStatusDotColor(course.status) }"
              ></span>
              {{ course.status }}
            </div>
            <h4>{{ course.courseId }}</h4>
            <p>{{ course.schedule.dayOfWeek }}</p>
            <p>
              {{ course.schedule.startTime }} - {{ course.schedule.endTime }}
            </p>
          </div>
        </div>
      </div>

      <h3 class="all-courses">All Courses</h3>
      <div
        class="all-courses"
        style="display: flex; flex-wrap: wrap; gap: 1rem"
      >
        <div
          v-for="course in allCourses"
          :key="course.courseId"
          class="course-card"
          style="background: #b9b9b9"
        >
          <h4>{{ course.courseId }}</h4>
          <p>{{ course.courseName }}</p>
          <p>{{ course.schedule.dayOfWeek }}</p>
          <p>{{ course.schedule.startTime }} - {{ course.schedule.endTime }}</p>
        </div>
      </div>

      <div class="plus-icon" @click="showModal = true">+</div>
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h3>กรอกรหัสเพื่อเข้าร่วม</h3>

          <input
            type="text"
            v-model="joinCodeInput"
            placeholder="รหัสเข้าร่วม"
            class="join-input"
          />

          <div class="modal-actions">
            <button @click="confirmJoin" class="confirm-button">
              เข้าร่วม
            </button>
            <button @click="cancelJoin" class="cancel-button">ยกเลิก</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HomePage",
  data() {
    return {
      studentId: "",
      allCourses: [],
      todayCourses: [],
      enrolledCourseIds: [],
      availableCourses: [],
      showModal: false,
      joinCodeInput: "",
    };
  },
  async mounted() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: token };
    const now = new Date();

    const allRes = await axios.get("/all-courses", { headers });
    const allCourses = allRes.data;

    const joinedCourseIds = JSON.parse(
      localStorage.getItem("joinedCourses") || "[]"
    );

    const myCourses = allCourses.filter((c) =>
      joinedCourseIds.includes(c.CourseID)
    );

    const withStatus = myCourses.map((c) => {
      const start = new Date(`${c.CourseDate}T${c.StartTime}`);
      const end = new Date(`${c.CourseDate}T${c.EndTime}`);
      const isSameDay = (a, b) => a.toDateString() === b.toDateString();
      const isToday = isSameDay(start, now);

      let status = "";
      if (isToday && now >= start && now <= end) status = "In Progress";
      else if (isToday && now < start) status = "Upcoming";
      else if (isToday && now > end) status = "Canceled";

      return {
        courseId: c.CourseID,
        courseName: c.CourseName,
        schedule: {
          date: c.CourseDate,
          startTime: c.StartTime,
          endTime: c.EndTime,
          dayOfWeek: start.toLocaleDateString("en-US", { weekday: "long" }),
        },
        status,
        isToday,
      };
    });

    this.allCourses = withStatus;
    this.todayCourses = withStatus.filter((c) => c.isToday && c.status);
  },
  methods: {
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    getCourseCardClass(status) {
      if (status === "In Progress") return "in-progress";
      if (status === "Upcoming") return "upcoming";
      if (status === "Canceled") return "canceled";
      return "";
    },
    getStatusDotColor(status) {
      if (status === "In Progress") return "#2BC642";
      if (status === "Upcoming") return "#FFCD29";
      if (status === "Canceled") return "#FF2929";
      return "#000";
    },
    cancelJoin() {
      this.joinCodeInput = "";
      this.showModal = false;
    },
    confirmJoin() {
      if (!this.joinCodeInput) {
        alert("Please enter a join code.");
        return;
      }

      this.submitJoinCode();
    },

    async submitJoinCode() {
      const token = localStorage.getItem("token");
      const headers = { Authorization: token };

      try {
        const userInfo = await axios.get("/user-info", { headers });
        this.studentId = userInfo.data.studentDetails.StudentID;
        const response = await axios.post(
          "/join-course",
          {
            studentId: this.studentId,
            joinCode: this.joinCodeInput,
          },
          { headers }
        );

        const joined = JSON.parse(
          localStorage.getItem("joinedCourses") || "[]"
        );
        joined.push(response.data.courseId);
        localStorage.setItem(
          "joinedCourses",
          JSON.stringify([...new Set(joined)])
        );

        alert("Joined successfully!");
        this.showModal = false;
        this.reloadCourses(); // method นี้ไว้ refresh
      } catch (err) {
        alert("Invalid join code or already joined.");
        console.error("Join failed:", err);
      }
    },

    async reloadCourses() {
      const token = localStorage.getItem("token");
      const headers = { Authorization: token };

      try {
        const enrolledRes = await axios.get(`/join-course/${this.studentId}`, {
          headers,
        });
        const enrolled = enrolledRes.data;
        this.enrolledCourseIds = enrolled.map((c) => c.CourseID);

        const allRes = await axios.get("/all-courses", { headers });
        const rawCourses = allRes.data;

        const now = new Date();
        const enrolledCourses = rawCourses.filter((c) =>
          this.enrolledCourseIds.includes(c.CourseID)
        );

        const withStatus = enrolledCourses.map((c) => {
          const start = new Date(`${c.CourseDate}T${c.StartTime}`);
          const end = new Date(`${c.CourseDate}T${c.EndTime}`);
          const isSameDay = (a, b) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();
          const isToday = isSameDay(start, now);

          let status = "";
          if (isToday && now >= start && now <= end) status = "In Progress";
          else if (isToday && now < start) status = "Upcoming";
          else if (isToday && now > end) status = "Canceled";

          return {
            courseId: c.CourseID,
            courseName: c.CourseName,
            schedule: {
              date: c.CourseDate,
              startTime: c.StartTime,
              endTime: c.EndTime,
              dayOfWeek: start.toLocaleDateString("en-US", { weekday: "long" }),
            },
            status,
            isToday,
          };
        });

        this.allCourses = withStatus;
        this.todayCourses = withStatus.filter((c) => c.isToday && c.status);
      } catch (error) {
        console.error("Error reloading courses:", error);
      }
    },
    goToAttendance(courseId) {
      this.$router.push({ name: "StudentAttd", params: { courseId } });
    },
  },
};
</script>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
.home {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}
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
.main-container {
  width: 75%;
  height: 100%;
  background-color: #f5f5f5;
  padding: 20px;
  border-radius: 20px;
  margin-top: 20px;
  margin-right: 20px;
}
.main-container h2,
.main-container h3 {
  margin-top: 5px;
  margin-bottom: 15px;
  padding-left: 15px;
}
.main-container h3 {
  margin-top: 20px;
}
.today-container {
  display: flex;
  gap: 15px;
  padding-left: 15px;
}
.courseStatus {
  display: flex;
  gap: 15px;
}
.course-card {
  width: 200px;
  padding: 20px;
  border-radius: 10px;
  color: white;
  position: relative;
  display: flex;
  flex-direction: column;
}
.course-card h4 {
  margin-top: 30px;
  font-weight: bolder;
}
.status {
  position: absolute;
  top: 10px;
  left: 10px;
  display: flex;
  align-items: center;
  font-size: 14px;
}
.status span {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-right: 5px;
  border: 1.5px solid white;
}
.in-progress {
  background-color: #f4b400;
}
.upcoming {
  background-color: #8e24aa;
}
.canceled {
  background-color: #0f9d58;
}
.plus-icon {
  position: absolute;
  bottom: 70px;
  right: 70px;
  height: 60px;
  width: 60px;
  border-radius: 50%;
  background-color: #f6b51b;
  color: white;
  font-size: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}
.plus-icon:hover {
  box-shadow: 0 0 10px rgba(246, 181, 27, 0.8);
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.modal-content {
  background: white;
  padding: 20px;
  width: 400px;
  border-radius: 10px;
  text-align: center;
}
.modal-content h3 {
  color: #003366;
}
.modal-buttons button {
  margin: 0 1ren;
}
.confirm-button {
  background-color: #003366;
  color: white;
  border-radius: 15px;
}

.cancel-button {
  background-color: #cccccc;
  color: black;
  border-radius: 15px;
}

.join-input {
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border-radius: 10px;
}

.modal-actions button {
  margin: 5px;
  padding: 10px 20px;
  border: none;
  cursor: pointer;
}
</style>
