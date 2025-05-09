<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <div class="w-50 bg-warning text-white d-flex flex-column justify-content-center align-items-center text-center p-4">
      <h1 class="text-start fw-bold position-absolute top-0 start-0 m-4">Attend<br>Ease</h1>
      <p class="fs-3 fw-bold text-start mt-5">"เช็คชื่อง่าย แจ้งลาสะดวก<br>จัดการทุกการเข้าเรียนในที่เดียว"</p>
      <img :src="require('@/assets/login-icon.png')" alt="login-icon" class="w-50">
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
              <option value="Faculty of Law">Faculty of Law</option>
              <option value="Thammasat Business School">Thammasat Business School</option>
              <option value="Faculty of Political Science">Faculty of Political Science</option>
              <option value="Faculty of Economics">Faculty of Economics</option>
              <option value="Faculty of Social Administration">Faculty of Social Administration</option>
              <option value="Faculty of Sociology and Anthropology">Faculty of Sociology and Anthropology</option>
              <option value="Faculty of Liberal Arts">Faculty of Liberal Arts</option>
              <option value="Faculty of Journalism and Mass Communication">Faculty of Journalism and Mass Communication</option>
              <option value="Faculty of Science and Technology">Faculty of Science and Technology</option>
              <option value="Faculty of Engineering">Faculty of Engineering</option>
              <option value="Faculty of Architecture and Planning">Faculty of Architecture and Planning</option>
              <option value="Faculty of Medicine">Faculty of Medicine</option>
              <option value="Faculty of Allied Health Sciences">Faculty of Allied Health Sciences</option>
              <option value="Faculty of Dentistry">Faculty of Dentistry</option>
              <option value="Faculty of Nursing">Faculty of Nursing</option>
              <option value="Faculty of Public Health">Faculty of Public Health</option>
              <option value="College of Innovation">College of Innovation</option>
              <option value="College of Interdisciplinary Studies">College of Interdisciplinary Studies</option>
              <option value="School of Global Studies">School of Global Studies</option>
              <option value="Sirindhorn International Institute of Technology">Sirindhorn International Institute of Technology</option>
              <option value="Pridi Banomyong International College">Pridi Banomyong International College</option>
              <option value="Chulabhorn International College of Medicine">Chulabhorn International College of Medicine</option>
              <option value="Thai Khadi Research Institute">Thai Khadi Research Institute</option>
              <option value="Institute of East Asian Studies">Institute of East Asian Studies</option>
              <option value="Thammasat University Research and Consultancy Institute">Thammasat University Research and Consultancy Institute</option>
              <option value="Language Institute">Language Institute</option>
              <option value="Thammasat Institute of Area Studies">Thammasat Institute of Area Studies</option>
            </select>
          </div>
          <div class="mb-3"><input v-model="phoneNo" type="text" class="form-control" placeholder="Phone No."></div>
          <div class="mb-3"><input v-model="username" type="text" class="form-control" placeholder="Username"></div>
          <div class="mb-3"><input v-model="password" type="password" class="form-control" placeholder="Password"></div>

          <div class="mb-3">
            <select v-model="role" class="form-control">
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div v-if="role === 'student'">
            <div class="mb-3"><input v-model="faculty" type="text" class="form-control" placeholder="Faculty"></div>
            <div class="row mb-3">
            <div class="col">
              <input v-model="studentId" type="text" class="form-control" maxlength="10" placeholder="Student ID">
            </div>
            <div class="col">
              <input v-model="year" type="text" class="form-control" placeholder="Year">
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
      adminId: ''
    };
  },
  methods: {
    async handleSignup() {
      const commonData = {
        firstName: this.firstName,
        lastName: this.lastName,
        email: this.email,
        department: this.department,
        phoneNo: this.phoneNo,
        username: this.username,
        password: this.password,
        role: this.role
      };

      let roleData = {};
      if (this.role === 'student') {
        roleData = {
          faculty: this.faculty,
          year: this.year,
          studentId: this.studentId
        };
      } else if (this.role === 'lecturer') {
        roleData = {
          lecturerId: this.lecturerId
        };
      } else if (this.role === 'admin') {
        roleData = {
          adminId: this.adminId
        };
      }

      try {
        await axios.post('http://localhost:5000/register', {
          ...commonData,
          ...roleData
        });
        alert("Registration successful! Please login.");
        this.$router.push({ name: 'login' });
      } catch (error) {
        alert(error.response?.data?.message || "Registration failed");
      }
    }
  }
};
</script>
