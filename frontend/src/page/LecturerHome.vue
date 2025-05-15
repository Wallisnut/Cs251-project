<template>
  <div class="home">
    <!-- Sidebar -->
    <div class="sidebar d-flex flex-column">
      <h2 class="fw-bold">Menu</h2>
      <router-link to="/home" class="menu-item active">🏠 Home</router-link>
      <router-link to="/notification" class="menu-item">🔔 Notification</router-link>
      <router-link to="/summary" class="menu-item">📊 Summary</router-link>
      <div class="menu-item mt-auto" @click="logout">⬅️ Log Out</div>
    </div>

    <!-- Main Content -->
    <div class="main-container">
      <h2 class="today">TODAY</h2>
      <div class="today-container" style="display: flex; flex-wrap: wrap; gap: 1rem; border: 10px saddlebrown;">
        <!-- <div class="courseStatus"> -->
          <div
            class="course-card"
            v-for="course in todayCourses"
            :key="course.courseId"
            :class="getCourseCardClass(course.status)"
            style="position: relative"
          >
            <div class="dots" @click="toggleDropdown(course.courseId)">⋮</div>
            <div v-if="dropdownVisible === course.courseId" class="dropdown-menu">
              <button @click="showJoinCode(course)">Join Code</button>
              <button @click="cancelClass(course)">Cancel Class</button>
            </div>

            <div class="status">
              <span :style="{ backgroundColor: getStatusDotColor(course.status) }"></span>
              {{ course.status }}
            </div>
            <h4>{{ course.courseId }}</h4>
            <p>{{ course.schedule.dayOfWeek }}</p>
            <p>{{ course.schedule.startTime }} - {{ course.schedule.endTime }}</p>
          </div>
        <!-- </div> -->
      </div>

      <h3 class="all-courses">All Courses</h3>
      <div class="all-courses" style="display: flex; flex-wrap: wrap; gap: 1rem">
        <div
          v-for="course in allCourses"
          :key="course.courseId"
          class="course-card"
          style="background: #b9b9b9; position: relative;z-index: 1;"
        >
          <div class="dots" @click="toggleDropdown(course.courseId)">⋮</div>
          <div v-if="dropdownVisible === course.courseId" class="dropdown-menu" ref="dropdown">
            <button @click="showJoinCodeallcourse(course)">Join Code</button>
          </div>

          <h4>{{ course.courseId }}</h4>
          <p>{{ course.courseName }}</p>
          <p>{{ course.schedule.dayOfWeek }}</p>
          <p>{{ course.schedule.startTime }} - {{ course.schedule.endTime }}</p>
        </div>
      </div>

      <div v-if="showJoinCodeModal" class="modal-overlay">
        <div class="modal-content">
          <h3>Join Code</h3>
          <p>{{ selectedCourse?.joinCode }}</p>
          <button  class="close-button" @click="showJoinCodeModal = false">Close</button>
        </div>
      </div>

      <div class="plus-icon" @click="showModal = true">+</div>
      
      <!-- Add Course Modal (with multiple schedules) -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal-content">
          <h3 class="modal-title">เพิ่มรายวิชา</h3>
          
          <div class="modal-inputs">
            <input v-model="newCourse.courseId" @input="newCourse.courseId = newCourse.courseId.toUpperCase()" placeholder="กรอกรหัสวิชา" />
            <input v-model="newCourse.courseName" placeholder="กรอกชื่อวิชา" />
          </div>

          <div class="modal-row" v-for="(slot, index) in newCourse.schedules" :key="index">
            <select v-model="slot.day">
              <option disabled value="">เลือกวัน</option>
              <option>Mon</option>
              <option>Tue</option>
              <option>Wed</option>
              <option>Thu</option>
              <option>Fri</option>
              <option>Sat</option>
              <option>Sun</option>
            </select>
            <input type="time" v-model="slot.startTime" />
            <input type="time" v-model="slot.endTime" />

            <button class="plus-mini" @click="addScheduleRow" v-if="index === newCourse.schedules.length - 1">+</button>

            <button
              class="minus-mini"
              @click="removeScheduleRow(index)"
              v-if="newCourse.schedules.length > 1"
            >−</button>
          </div>


          <div class="modal-buttons">
            <div v-if="exceedsCreditLimit" class="warning">
              รวมเวลาเกิน 3 ชั่วโมง! กรุณาแก้ไข
            </div>

            <button :disabled="exceedsCreditLimit" @click="submitCourse">ตกลง</button>
            <button @click="showModal = false">ยกเลิก</button>
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
      dropdownVisible: null,
      lecturerId: "",
      taughtCourseIds: [],
      allCourses: [],
      todayCourses: [],
      courses:[],
      showModal: false,
      showJoinModal: false,
      joinCodeToShow: "", 
      showJoinCodeModal: false,
      selectedCourse: null,
      newCourse: {
        courseId: "",
        day: "",
        startTime: "",
        endTime: "",
        schedules: [
          { day: "", startTime: "", endTime: "" }, // initial row
        ],
      },
    };
  },
  async mounted() {
    await this.fetchCourses();
    document.addEventListener("click", this.onClickOutsideDropdown,true);
  },
  computed: {
    totalCreditHours() {
      return this.newCourse.schedules.reduce((sum, slot) => {
        if (!slot.startTime || !slot.endTime) return sum;
        const [startH, startM] = slot.startTime.split(":").map(Number);
        const [endH, endM] = slot.endTime.split(":").map(Number);
        const diff = (endH * 60 + endM - startH * 60 - startM) / 60;
        return sum + (diff > 0 ? diff : 0);
      }, 0);
    },
    exceedsCreditLimit() {
      return this.totalCreditHours > 3;
    }
  },
  methods: {
    async showJoinCodeallcourse(course) {
      const token = localStorage.getItem("token");
      const headers = { Authorization: token };
      try {
        const response = await axios.get(`/course/${course.courseId}/join-code`, { headers });
        this.selectedCourse = {
          ...course,
          joinCode: response.data.joinCode,
        };
        this.showJoinCodeModal = true;
      } catch (err) {
        console.error("Failed to fetch join code:", err);
        alert("Could not load join code");
      }
    },
    logout() {
      localStorage.removeItem("token");
      this.$router.push("/login");
    },
    getCourseCardClass(status) {
      if (status === "In Progress") return "in-progress";
      if (status === "Upcoming") return "upcoming";
      if (status === "Canceled") return "canceled";
      return "course-card";
    },
    getStatusDotColor(status) {
      if (status === "In Progress") return "#2BC642";
      if (status === "Upcoming") return "#FFCD29";
      if (status === "Canceled") return "#FF2929";
      return "#000";
    },
    cancelClass(course) {
      if (course.status !== "Canceled") {
        course.status = "Canceled";
      }
      this.dropdownVisible = null;
    },

    toggleDropdown(courseId) {
      this.dropdownVisible = this.dropdownVisible === courseId ? null : courseId;
    },
    onClickOutsideDropdown(event) {

      const dropdowns = this.$el.querySelectorAll(".dropdown-menu");
      const dots = this.$el.querySelectorAll(".dots");
      
      for (const el of [...dropdowns, ...dots]) {
        if (el.contains(event.target)) return;
      }
      
      this.dropdownVisible = null;
    },
    async fetchCourses(){
      const token = localStorage.getItem("token");
      const headers = { Authorization: token };
      const now = new Date();

      try {
        const userInfo = await axios.get("/user-info", { headers });
        this.lecturerId = userInfo.data.lecturerDetails.LecturerID;

        const teachInRes = await axios.get("/teach-in", { headers });
        const teachMap = teachInRes.data.filter(
          (t) => t.LecturerID === this.lecturerId);
        this.taughtCourseIds = teachMap.map((t) => t.CourseID);

        const allRes = await axios.get("/all-courses", { headers });
        const rawCourses = allRes.data;

        //const filteredCourses = rawCourses;
        const filteredCourses = rawCourses.filter((c) =>
          this.taughtCourseIds.includes(c.CourseID)
        );

        const withStatus = filteredCourses.map((c) => {
          const start = new Date(`${c.CourseDate}T${c.StartTime}`);
          console.log("CourseDate:", c.CourseDate, "Parsed Date:", start);
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
          if (isToday) console.log("Matched Course:", c.CourseID, status);
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
        this.todayCourses = withStatus.filter((c) =>
          c.isToday && ["In Progress", "Upcoming", "Canceled"].includes(c.status)
        );

      } catch (err) {
        console.error("Error loading data:", err);
      }
    },
    showJoinCode(course) {
      this.selectedCourse = course;
      this.showJoinCodeModal = true;
      this.dropdownVisible = null;
    },
    isTodayCourse(course) {
      const courseDate = new Date(course.schedule.date);
      const today = new Date();

      return (
        courseDate.getDate() === today.getDate() &&
        courseDate.getMonth() === today.getMonth() &&
        courseDate.getFullYear() === today.getFullYear()
      );
    },
    
    formatDateLocal(date) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    },
    async submitCourse() {
      console.log("Submitting:", this.newCourse);
      const courseIdPattern = /^[A-Z]{2}\d{3}$/;
      if (!courseIdPattern.test(this.newCourse.courseId)) {
        alert("รหัสวิชาต้องมีรูปแบบเป็น 2 ตัวอักษรตามด้วยตัวเลข 3 หลัก (เช่น CS101)");
        return;
      }

      const token = localStorage.getItem("token");
      const headers = { Authorization: token };

      try {
        const joinCodes = [];
        for (const schedule of this.newCourse.schedules) {
          const dayMap = {Sun: 0,Mon: 1,Tue: 2,Wed: 3,Thu: 4,Fri: 5,Sat: 6};

          const today = new Date();
          const currentDay = today.getDay();
          const targetDay = dayMap[schedule.day];
          const offset = (targetDay + 7 - currentDay) % 7;
          const classDate = new Date(today);
          classDate.setDate(today.getDate() + offset);

          const formattedDate = this.formatDateLocal(classDate);

          
          const toMinutes = (time) => {
            const [h, m] = time.split(":").map(Number);
            return h * 60 + m;
          };

          const courseHour = (toMinutes(schedule.endTime) - toMinutes(schedule.startTime)) / 60;

          const payload = {
            courseId: this.newCourse.courseId,
            courseName: this.newCourse.courseName || "Untitled Course",
            courseHour,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            courseDate: formattedDate,
          };

          const response = await axios.post("http://localhost:5000/add-course", payload, { headers });
          console.log("Response:", response.data);
          const joinCode = response.data.joinCode
          joinCodes.push(response.data.joinCode);
          alert(`Courses added successfully!\nJoin Codes:\n${joinCodes.join('\n')}`);

          const start = new Date(`${payload.courseDate}T${payload.startTime}`);
          const end = new Date(`${payload.courseDate}T${payload.endTime}`);
          const now = new Date();
          const isSameDay = (a, b) =>
            a.getFullYear() === b.getFullYear() &&
            a.getMonth() === b.getMonth() &&
            a.getDate() === b.getDate();

          const isToday = isSameDay(start, now);

          let status = "";
          if (isToday && now >= start && now <= end) status = "In Progress";
          else if (isToday && now < start) status = "Upcoming";
          else if (isToday && now > end) status = "Canceled";

          const newCourse = {
            courseId: payload.courseId,
            courseName: payload.courseName,
            schedule: {
              date: payload.courseDate,
              dayOfWeek: schedule.day,
              startTime: payload.startTime,
              endTime: payload.endTime,
            },
            status,
            isToday,
            joinCode:joinCode
          };

          this.allCourses.push(newCourse);
          if (isToday && status) {
            this.todayCourses.push(newCourse);
          }
        }

        this.newCourse = {
          courseId: "",
          courseName: "",
          schedules: [{ day: "", startTime: "", endTime: "" }],
        };
        this.showModal = false;
        await this.fetchCourses();
      } catch (err) {
        console.error("Failed to add course:", err.response?.data || err.message);
        alert("Error: " + (err.response?.data?.message || err.message));
      }
    },

    addScheduleRow() {
      this.newCourse.schedules.push({ day: "", startTime: "", endTime: "" });
    },
    removeScheduleRow(index) {
      this.newCourse.schedules.splice(index, 1);
    }

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
  overflow: visible !important;
  padding-left: 15px;
}
.courseStatus {
  display: flex;
  gap: 15px;
  overflow: visible !important;
}
.course-card {
  width: 200px;
  padding: 20px;
  border-radius: 10px;
  color: white;
  position: relative;
  display: flex;
  flex-direction: column;
  overflow: visible;
  z-index: 1;
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
  gap:0.5rem;
  font-weight: bold;
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
.course-card.in-progress {
  border-left: 5px solid green;
}

.course-card.upcoming {
  border-left: 5px solid purple;
}

.course-card.canceled {
  border-left: 5px solid red;
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
  z-index: 9999;
}
.plus-icon:hover {
  box-shadow: 0 0 10px rgba(246, 181, 27, 0.8);
}
.modal-inputs {
  display: flex;
  flex-direction: column;
  gap: 1rem; /* spacing between inputs */
  margin-bottom: 1rem;
}
.modal-inputs input {
  padding: 0.7rem;
  border: 1px solid #ccc;
  border-radius: 1rem;
  font-size: 1rem;
  width: 100%
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 150;
}
.modal-content {
  background: #fff;
  padding: 2rem;
  border-radius: 1rem;
  width: 500px;
  text-align: center;
}
.modal-title {
  margin-bottom: 1rem;
  color: #003366;
}
.modal-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1rem 0;
}
.modal-row input,
.modal-row select,
input {
  flex: 1;
  padding: 0.7rem;
  border-radius: 1rem;
  border: 1px solid #ccc;
}
.modal-buttons {
  display: flex;
  justify-content: space-between;
}
.modal-buttons button {
  flex: 1;
  margin: 0 0.5rem;
  padding: 0.6rem;
  border: none;
  border-radius: 1.5rem;
  cursor: pointer;
}
.modal-buttons button:first-child {
  background-color: #003366;
  color: white;
}
.modal-buttons button:last-child {
  background-color: #ccc;
}
.plus-mini {
  height: 32px;
  width: 32px;
  border-radius: 50%;
  background-color: #f6b51b;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border: none;
  margin-left: 0.5rem;
  cursor: pointer;
  z-index: 9999;
}
.minus-mini {
  height: 32px;
  width: 32px;
  border-radius: 50%;
  background-color: #dc3545;
  color: white;
  font-size: 20px;
  font-weight: bold;
  border: none;
  margin-left: 0.3rem;
  cursor: pointer;
}

.modal-row {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 0.8rem;
}
.modal-row select,
.modal-row input {
  flex: 1;
  padding: 0.5rem;
  border-radius: 1rem;
  border: 1px solid #ccc;
}
.warning {
  color: #d8000c;
  background-color: #ffd2d2;
  padding: 0.75rem;
  border-radius: 1rem;
  margin: 1rem 0;
  font-weight: bold;
}
button[disabled] {
  background-color: #ccc !important;
  cursor: not-allowed;
}
.dots {
  position: absolute;
  top: 10px;
  right: 10px;
  cursor: pointer;
  font-size: 18px;
}
.dropdown-menu {
  position: absolute;
  top: -10px;
  right: 15px;
  color: white;
  border: 1px solid #ccc;
  padding: 5px 10px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}
.dropdown-menu button {
  background-color: #f6b51b;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  margin-bottom: 6px;
  width: 100%;
  text-align: left;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-menu button:hover {
  background-color: #e0a419;
}
.close-button {
  margin-top: 1rem;
  background-color: #f6b51b;
  color: white;
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.3s ease;
}
.close-button:hover {
  background-color: #e0a419;
}

</style>
