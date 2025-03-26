<template>
    <div class="container-fluid">
      <div class="row">
        <div class="col-md-3">
          <aside class="bg-light p-3">
            <h2 class="mb-4">Menu</h2>
            <ul class="nav flex-column">
              <li class="nav-item mb-2">
                <a class="nav-link active rounded bg-warning text-dark" href="#">
                  <i class="bi bi-house-door me-2"></i> Home
                </a>
              </li>
              <li class="nav-item mb-2">
                <a class="nav-link text-dark" href="#">
                  <i class="bi bi-bell me-2"></i> Notification
                </a>
              </li>
              <li class="nav-item mb-2">
                <a class="nav-link text-dark" href="#">
                  <i class="bi bi-list-ul me-2"></i> Summary
                </a>
              </li>
              <li class="nav-item mt-5">
                <a class="nav-link text-dark" href="#">
                  <i class="bi bi-box-arrow-left me-2"></i> Log Out
                </a>
              </li>
            </ul>
          </aside>
        </div>
  
        <div class="col-md-9">
          <main class="p-3">
            <h2 class="mb-4">TODAY</h2>
            <div class="row mb-4">
              <div class="col-md-4 mb-3">
                <div class="card bg-warning">
                  <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                      <span class="badge rounded-pill bg-success me-2">In Progress</span>
                      <h5 class="card-title mb-0">CS251</h5>
                    </div>
                    <p class="card-text">Wed 13:30-15:00</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card bg-purple text-white">
                  <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                      <span class="badge rounded-pill bg-primary me-2">Upcoming</span>
                      <h5 class="card-title mb-0">CS222</h5>
                    </div>
                    <p class="card-text">Wed 15:00-16:30</p>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card bg-success text-white">
                  <div class="card-body">
                    <div class="d-flex align-items-center mb-2">
                      <span class="badge rounded-pill bg-danger me-2">Canceled</span>
                      <h5 class="card-title mb-0">CS240</h5>
                    </div>
                    <p class="card-text">Wed 16:30-18:00</p>
                  </div>
                </div>
              </div>
            </div>
  
            <h2 class="mb-4">All Courses</h2>
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="card bg-secondary" style="height: 150px;"></div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card bg-secondary" style="height: 150px;"></div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card bg-secondary" style="height: 150px;">
                  <div class="d-flex justify-content-center align-items-center h-100">
                    <button class="btn btn-warning rounded-circle">+</button>
                  </div>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card bg-secondary" style="height: 150px;"></div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card bg-secondary" style="height: 150px;"></div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="card bg-secondary" style="height: 150px;"></div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: 'NewHomePage',
    data() {
      return {};
    },
  };
  </script>
  
  <style scoped>
  .bg-purple {
    background-color: purple;
  }
  </style>