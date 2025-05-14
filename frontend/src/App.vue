<template>
  <div>
      <router-view></router-view>
  </div>
</template>

<script>
export default {
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
