<template>
  <div class="d-flex vh-100">
    <!-- Sidebar -->
    <div class="w-50 bg-warning text-white d-flex flex-column justify-content-center align-items-center text-center p-4">
      <h1 class="text-start fw-bold position-absolute top-0 start-0 m-4">Attend<br>Ease</h1>
      <p class="fs-3 fw-bold text-start mt-5">"เช็คชื่อง่าย แจ้งลาสะดวก<br>จัดการทุกการเข้าเรียนในที่เดียว"</p>
      <img :src="require('@/assets/login-icon.png')" alt="login-icon" class="w-50">
    </div>

    <!-- Sign-in Form -->
    <div class="w-50 d-flex justify-content-center align-items-center rounded-3">
      <div class="w-50">
        <h2 class="fw-bold mb-4">Sign In</h2>
        <form @submit.prevent="handleLogin">
          <div class="mb-3">
            <input v-model="username" type="text" class="form-control" placeholder="Username" required>
          </div>
          <div class="mb-3 position-relative">
            <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" placeholder="Password" required>
          </div>
          <div class="mb-3">
            <select v-model="role" class="form-control" required>
              <option disabled value="">Select Role</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" class="btn btn-warning w-100">Sign in</button>
        </form>
        <p class="mt-3 text-center">Don't have an account? <router-link to="/signup">Sign up</router-link></p>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      username: '',
      password: '',
      showPassword: false,
      role: ''
    };
  },
  methods: {
    async handleLogin() {
      if (!this.username || !this.password || !this.role) {
        alert("Please fill in all required fields.");
        return;
      }

      try {
        const response = await axios.post('/login', {
          username: this.username,
          password: this.password,
          role: this.role
        });

        const { message, token } = response.data;
        alert(message || "Login successful");

        const decoded = JSON.parse(atob(token.split('.')[1]));
        const userRole = decoded.role;

        localStorage.setItem('token', token);
        localStorage.setItem('username', this.username);
        localStorage.setItem('role', userRole);

        if (userRole === 'admin') {
          this.$router.push('/admin/home');
        } else if (userRole === 'lecturer') {
          this.$router.push('/lecturer/home');
        } else {
          this.$router.push('/home');
        }

      } catch (error) {
        alert(error.response?.data?.message || "Login failed");
      }
    }
  }
};
</script>
