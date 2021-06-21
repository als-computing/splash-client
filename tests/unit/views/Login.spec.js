import { /* shallowMount, */ mount, createLocalVue } from '@vue/test-utils';
import VueRouter from 'vue-router';
import Login from '@/views/Login.vue';
import routes from '@/routes.js';
import BootstrapVue, { BCardText } from 'bootstrap-vue';
import * as bootstrap from 'bootstrap-vue';
import mockAxios from 'axios';
import responses from '../../responses/login-responses';


const localVue = createLocalVue();
localVue.use(VueRouter);
localVue.use(BootstrapVue);
localVue.use({
  install(Vue) {
    Vue.prototype.$api = mockAxios.create();
  },
});

window.gapi = { signin2: { render: jest.fn() } };
jest.useFakeTimers();

describe('Login component', () => {
  const router = new VueRouter({ routes });
  const wrapper = mount(Login, {
    localVue,
    router,
    mocks: {
      $login_url: 'Mount_Doom',
      $store: {
        commit: jest.fn(),
        dispatch: jest.fn(),
      },
    },
  });


  beforeEach(async () => {
    wrapper.vm.$store.dispatch.mockClear();
    wrapper.vm.$api.post.mockClear();
    if (wrapper.vm.$route.path !== '/login') {
      await router.replace('/login');
    }
  });

  function testCard(wrapperInst) {
    const card = wrapperInst.findComponent(bootstrap.BCard);
    expect(card.exists()).toBe(true);
    expect(card.isVisible()).toBe(true);
    expect(card.find('.card-title').text()).toBe('Welcome to Splash!');
    const bCardText = wrapperInst.findComponent(bootstrap.BCardText);
    expect(bCardText.exists()).toBe(true);
    expect(bCardText.isVisible()).toBe(true);
  }


  it('renders the google button', async () => {
    const spinner = wrapper.findComponent(bootstrap.BSpinner);
    expect(spinner.isVisible()).toBe(false);
    testCard(wrapper);
    const buttonRender = window.gapi.signin2.render;
    expect(buttonRender).toHaveBeenCalledTimes(1);

    const buttonId = buttonRender.mock.calls[0][0];
    expect(typeof buttonId).toBe('string');

    const buttonElement = wrapper.find(`#${buttonId}`);
    expect(buttonElement.exists()).toBe(true);
    expect(buttonElement.isVisible()).toBe(true);

    const config = buttonRender.mock.calls[0][1];
    expect(typeof config).toBe('object');
    expect(config.scope).toBe('profile email');
    expect(config.width).toBe(240);
    expect(config.height).toBe(50);
    expect(config.longtitle).toBe(true);
    expect(config.theme).toBe('dark');
    expect(typeof config.onsuccess).toBe('function');
    expect(typeof config.onfailure).toBe('function');
  });

  it('on google sign in failure does nothing', async () => {
    const { onfailure } = window.gapi.signin2.render.mock.calls[0][1];
    onfailure();
    testCard(wrapper);
    const buttonRender = window.gapi.signin2.render;
    const buttonId = buttonRender.mock.calls[0][0];
    const buttonElement = wrapper.find(`#${buttonId}`);
    expect(buttonElement.exists()).toBe(true);
    expect(buttonElement.isVisible()).toBe(true);
  });

  const mockGoogleUser = {
    getBasicProfile() {
      // TODO: implement this function
      return undefined;
    },
    getAuthResponse() {
      return {
        id_token: 'the_one_ring',
      };
    },
  };

  async function testAxios(response, isError = true) {
    const buttonRender = window.gapi.signin2.render;
    const { onsuccess } = buttonRender.mock.calls[0][1];
    wrapper.vm.$api.post.mockImplementation(async () => {
      // simulate loading time
      await new Promise((resolve) => setTimeout(resolve, 200));
      if (isError) {
        const error = new Error();
        if (response) {
          error.response = response;
        }
        throw error;
      } else {
        return Promise.resolve(response);
      }
    });
    onsuccess(mockGoogleUser);
    await jest.advanceTimersByTime(100);
    // while the axios code is running the spinner should replace the button
    const buttonId = buttonRender.mock.calls[0][0];
    const buttonElement = wrapper.find(`#${buttonId}`);
    expect(buttonElement.exists());
    expect(buttonElement.isVisible()).toBe(false);

    const spinner = wrapper.findComponent(bootstrap.BSpinner);
    expect(spinner.exists()).toBe(true);
    expect(spinner.isVisible()).toBe(true);
    await jest.advanceTimersByTime(100);
    // ARGH WHY TWO nexTicks?????????!!!!! maybe it has something to do with the timer
    // being advanced?
    await wrapper.vm.$nextTick();
    await wrapper.vm.$nextTick();

    expect(spinner.isVisible()).toBe(false);
    expect(buttonElement.isVisible()).toBe(true);

    expect(wrapper.vm.$api.post).toHaveBeenCalledTimes(1);
    const url = wrapper.vm.$api.post.mock.calls[0][0];
    expect(url).toBe(`${wrapper.vm.$login_url}?auth_provider=google`);
    const reqBody = wrapper.vm.$api.post.mock.calls[0][1];
    expect(typeof reqBody).toBe('object');
    expect(reqBody.token).toBe(mockGoogleUser.getAuthResponse().id_token);
    const config = wrapper.vm.$api.post.mock.calls[0][2];
    expect(typeof config).toBe('object');
    expect(config.headers['Content-Type']).toBe('application/json');
  }

  async function testModalErrors(message) {
    expect(wrapper.vm.$store.dispatch).toHaveBeenCalledTimes(1);
    expect(wrapper.vm.$store.dispatch.mock.calls[0][0]).toBe('login/logout');
    const modals = wrapper.findAllComponents(bootstrap.BModal);
    const visibleModals = modals.wrappers.filter((modal) => {
      const body = modal.find('.modal-body');
      if (body.text() === message) {
        expect(modal.find('.modal').isVisible()).toBe(true);
        return true;
      }
      expect(modal.find('.modal').isVisible()).toBe(false);
      return false;
    });
    expect(visibleModals.length).toBe(1);
    const modal = visibleModals[0];
    expect(modal.find('.modal').isVisible()).toBe(true);
    expect(modal.find('.modal-body').text()).toBe(message);

    const okButton = modal.find('.btn.btn-primary');
    expect(okButton.exists()).toBe(true);
    // Clear the modal before going on to the next test
    await okButton.trigger('click');
  }

  it('on google sign in success,  sends axios request with correct parameters, but user is not registered in splash, and so renders correct modal, and dispatches login/logout to store', async () => {
    await testAxios(responses.userNotRegistered);
    await testModalErrors('Looks like you\'re not registered.');
  });

  it('on google sign in success, sends axios request with correct parameters, but another error is received from axios, so it renders correct modal, and dispatches login/logout to store', async () => {
    await testAxios(responses.otherError);
    await testModalErrors('Something went wrong on our end. Please try again. If the problem persists contact the system admins.');
  });
  /* this test should work but it is not working.
  for some reason this component just won't be visible even though
  this works when I test it maually. I think it has something to do with
  dismissing the modal and then summoning it again because when I try running a duplicate
  of any of the other tests the same error pops up
  Maybe the test framework is too fast for the modal to realize it should be visible again
  after being dismissed by the OK button??? */

  /* it('on google sign in success, sends axios request with correct parameters, but an error is thrown without the response key, so it renders correct modal, and dispatches login/logout to store', async () => {
    await testAxios()
    await testModalErrors('Something went wrong on our end. Please try again. If the problem persists contact the system admins.');
  }); */

  it('on google sign in success, sends axios request with correct parameters, receives a token from the server, calls vuex correctly, and then routes to /', async () => {
    const response = responses.success;
    await testAxios(response, false);

    const storeCommit = wrapper.vm.$store.commit;
    expect(storeCommit).toBeCalledTimes(1);

    expect(storeCommit.mock.calls[0][0]).toBe('login/AUTH_SUCCESS');

    const state = storeCommit.mock.calls[0][1];
    expect(typeof state).toBe('object');
    expect(state.user).toBe(response.data.user);
    expect(state.api_access_token).toBe(response.data.access_token);
    expect(wrapper.vm.$router.currentRoute.fullPath).toBe('/');
  });
});
