import { defineStore } from 'pinia'

export const useCourseStore = defineStore('courseStore', {
  state: () => ({
    todayCourses: []
  }),
  actions: {
    setCourses(courses) {
      this.todayCourses = courses
    },
    updateCourseStatus(courseId, newStatus) {
      const course = this.todayCourses.find(c => c.courseId === courseId)
      if (course) course.status = newStatus
    }
  }
})
