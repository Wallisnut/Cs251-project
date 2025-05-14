<template>
  <div class="home">
    <!-- Sidebar -->
    <nav class="w-25 bg-warning text-white d-flex flex-column p-4">
      <h2 class="mb-5">AttendEase</h2>
      <ul class="nav nav-pills flex-column mb-auto">
        <li class="nav-item mb-2"><router-link to="/lecturer/home" class="nav-link text-white">Home</router-link></li>
        <li class="nav-item mb-2"><router-link to="/lecturer/notifications" class="nav-link text-white">Notification</router-link></li>
        <li class="nav-item mb-2"><router-link to="/lecturer/summary" class="nav-link text-white">Summary</router-link></li>
      </ul>
      <div class="mt-auto">
        <button @click="logout" class="btn btn-light text-warning w-100">Log Out</button>
      </div>
    </nav>

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
          >
            <div class="status">
              <span :style="{ backgroundColor: getStatusDotColor(course.status) }"></span>
              {{ course.status }}
            </div>
            <h4>{{ course.courseId }}</h4>
            <p>{{ course.schedule.dayOfWeek }}</p>
            <p>{{ course.schedule.startTime }} - {{ course.schedule.endTime }}</p>
          </div>
        </div>
      </div>

      <h3 class="all-courses">All Courses</h3>
      <div class="all-courses" style="display: flex; flex-wrap: wrap; gap: 1rem">
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

      <div class="plus-icon">+</div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "HomePage",
  data() {
    return {
      lecturerId: "",
      taughtCourseIds: [],
      allCourses: [],
      todayCourses: [],
    };
  },
  async mounted() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: token };
    const now = new Date();

    try {
      const userInfo = await axios.get("/user-info", { headers });
      this.lecturerId = userInfo.data.lecturerDetails.LecturerID;

      const teachInRes = await axios.get("/teach-in", { headers });
      const teachMap = teachInRes.data.filter(
        (t) => t.LecturerID === this.lecturerId
      );
      this.taughtCourseIds = teachMap.map((t) => t.CourseID);

      const allRes = await axios.get("/all-courses", { headers });
      const rawCourses = allRes.data;

      const filteredCourses = rawCourses.filter((c) =>
        this.taughtCourseIds.includes(c.CourseID)
      );

      const withStatus = filteredCourses.map((c) => {
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
    } catch (err) {
      console.error("Error loading data:", err);
    }
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
  cursor: default;
}
.plus-icon:hover {
  box-shadow: 0 0 10px rgba(246, 181, 27, 0.8);
}
</style>
