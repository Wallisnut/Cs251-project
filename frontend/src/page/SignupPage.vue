<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <div class="w-50 bg-warning text-white d-flex flex-column justify-content-center align-items-center text-center p-4">
      <h1 class="text-start fw-bold position-absolute top-0 start-0 m-4">Attend<br>Ease</h1>
      <p class="fs-3 fw-bold text-start mt-5">"เช็คชื่อง่าย แจ้งลาสะดวก<br>จัดการทุกการเข้าเรียนในที่เดียว"</p>
      <img :src="require('../assets/login-icon.png')" alt="login-icon" class="w-50">
    </div>

    <!-- Sign-up Form -->
    <div class="w-50 d-flex justify-content-center align-items-center rounded-3">
      <div class="w-100" style="max-width: 400px;">
        <h2 class="fw-bold mb-4">Sign Up</h2>
        <form @submit.prevent="handleSignup">
          <div class="row mb-3">
            <div class="col">
              <input v-model="firstName" type="text" class="form-control" placeholder="First Name">
            </div>
            <div class="col">
              <input v-model="lastName" type="text" class="form-control" placeholder="Last Name">
            </div>
          </div>

          <div class="mb-3"><input v-model="email" type="email" class="form-control" placeholder="Email"></div>

          <div class="mb-3">
            <select v-model="department" class="form-control">
              <option disabled value="">Select Department</option>
              <option>MATHEMATICS AND STATISTICS</option>
              <option>PHYSICS</option>
              <option>CHEMISTRY</option>
              <option>COMPUTER SCIENCE</option>
              <option>AGRICULTURAL TECHNOLOGY</option>
              <option>ENVIRONMENTAL SCIENCE</option>
              <option>SUSTAINABLE DEVELOPMENT TECHNOLOGY</option>
              <option>FOOD SCIENCE AND TECHNOLOGY</option>
              <option>BIOTECHNOLOGY</option>
              <option>MATERIALS AND TEXTILE TECHNOLOGY</option>
            </select>
          </div>

          <div class="mb-3">
            <input v-model="phoneNo" type="text" class="form-control" placeholder="Phone No." maxlength="10" pattern="0[0-9]{9}" title="เบอร์โทรต้องขึ้นต้นด้วย 0 และมีทั้งหมด 10 ตัว">
          </div>

          <div class="mb-3"><input v-model="username" type="text" class="form-control" placeholder="Username"></div>

          <div class="mb-3 position-relative">
            <input :type="showPassword ? 'text' : 'password'" v-model="password" class="form-control" placeholder="Password">
            <button type="button" @click="showPassword = !showPassword" class="btn btn-sm btn-secondary position-absolute end-0 top-50 translate-middle-y me-2">
              {{ showPassword ? 'Hide' : 'Show' }}
            </button>
          </div>

          <div class="mb-3">
            <select v-model="role" class="form-control">
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div v-if="role === 'student'">
            <div class="mb-3">
              <select v-model="faculty" class="form-control">
                <option disabled value="">Select Faculty</option>
                <option v-for="item in facultyList" :key="item" :value="item">{{ item }}</option>
              </select>
            </div>
            <div class="row mb-3">
              <div class="col">
                <input v-model="studentId" type="text" class="form-control" maxlength="10" placeholder="Student ID">
              </div>
              <div class="col">
                <input v-model="year"
                       type="text"
                       class="form-control"
                       placeholder="Year"
                       maxlength="1"
                       pattern="[1-9]"
                       title="กรอกปีการศึกษาเป็นเลขหลักเดียว (1-9)">
              </div>
            </div>
          </div>

          <div v-if="role === 'lecturer'">
            <div class="mb-3"><input v-model="lecturerId" type="text" class="form-control" placeholder="Lecturer ID"></div>
          </div>

          <div v-if="role === 'admin'">
            <div class="mb-3"><input v-model="adminId" type="text" class="form-control" placeholder="Admin ID"></div>
          </div>

          <button type="submit" class="btn btn-warning w-100">Register</button>
        </form>
        <p class="mt-3 text-center">Already have an account? <router-link to="/login">Sign in</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      firstName: '',
      lastName: '',
      email: '',
      department: '',
      phoneNo: '',
      username: '',
      password: '',
      role: 'student',
      faculty: '',
      year: '',
      studentId: '',
      lecturerId: '',
      adminId: '',
      showPassword: false,
      facultyList: [
        "Faculty of Science and Technology"
      ]
    };
  },
  methods: {
    async handleSignup() {
      try {
        if (!/^0\d{9}$/.test(this.phoneNo)) {
          alert("เบอร์โทรต้องขึ้นต้นด้วย 0 และมี 10 ตัว");
          return;
        }

        const response = await axios.post("/register", {
          firstName: this.firstName,
          lastName: this.lastName,
          email: this.email,
          department: this.department,
          phoneNo: this.phoneNo,
          username: this.username,
          password: this.password,
          role: this.role,
          faculty: this.faculty,
          year: this.year,
          studentId: this.studentId,
          lecturerId: this.lecturerId,
          adminId: this.adminId,
        });

        if (response && response.data) {
          alert("สมัครสมาชิกสำเร็จ!");
          this.$router.push("/login");
        } else {
          alert("สมัครไม่สำเร็จ: ไม่มี response จาก server");
        }

      } catch (error) {
        console.error("Signup error:", error);
        alert("เกิดข้อผิดพลาดในการสมัคร: " + (error.response?.data?.message || error.message));
      }
    }
  }
};
</script>
