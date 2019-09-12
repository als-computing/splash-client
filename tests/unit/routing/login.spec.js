console.log("in test")
// import { mount, createLocalVue } from '@vue/test-utils'
// import VueRouter from 'vue-router'
// import mockRouter from './mockRouter'
// import flushPromises from 'flush-promises'
// import { toHaveRouteName } from 'vue-test-utils-helpers'
// import Login from '@/components/Login.vue'
// import loginService from '@/services/loginService'

// it('should navigate to Home on successful login', async () => {
//   loginService.isLoginValid = jest.fn().mockResolvedValue(true)
//   const localVue = createLocalVue()
  
//   localVue.use(VueRouter)
//   const router = mockRouter.mock()
  
//   const wrapper = mount(Login, {
//     localVue,
//     router
//   })
  
//   wrapper.find('button').trigger('click')
//   await flushPromises()
  
//   expect(wrapper).toHaveRouteName('Dashboard')
// })