<template>
    <div class="d-flex vh-100">
      <!-- Sidebar -->
      <div class="w-50 bg-warning text-white d-flex flex-column justify-content-center align-items-center text-center p-4">
        <h1 class="text-start fw-bold position-absolute top-0 start-0 m-4">Attend<br>Ease</h1>
        
        <p class="fs-3 fw-bold text-start mt-5">"เช็คชื่อง่าย แจ้งลาสะดวก<br>จัดการทุกการเข้าเรียนในที่เดียว"</p>
        <img :src="require('@/assets/login-icon.png')" alt="login-icon" class="w-50 ">
      </div>
  
      <!-- Sign-in Form -->
      <div class="w-50 d-flex justify-content-center align-items-center rounded-3">
        <div class="w-50">
          <h2 class="fw-bold mb-4">Sign In</h2>
          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <input v-model="username" type="text" class="form-control" placeholder="Username">
            </div>
            <div class="mb-3 position-relative">
              <input v-model="password" :type="showPassword ? 'text' : 'password'" class="form-control" placeholder="Password">
              <span @click="togglePassword" class="position-absolute end-0 top-50 translate-middle-y me-2" style="cursor:pointer;">👁</span>
            </div>
            <button type="submit" class="btn btn-warning w-100">Sign in</button>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'HomePage',
    data() {
      return {
        username: '',
        password: '',
        showPassword: false
      };
    },
    methods: {
      handleLogin() {
        // Simulate a successful login and navigate to the homepage
        alert(`Logging in as: ${this.username}`);
        this.$router.push({ name: '../public/home.html' }); // Replace 'homepage' with your actual route name
      },
      togglePassword() {
        this.showPassword = !this.showPassword;
      }
    }
  };
  </script>