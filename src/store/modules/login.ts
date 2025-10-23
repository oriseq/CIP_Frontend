import { defineStore } from 'pinia';

export const useLoginStore = defineStore('showForm', {
  // 动作
  actions: {
    toRegistForm() {
      this.showLoginForm = false;
      this.showRegistForm = true;
      this.showResetForm = false;
      this.loginTitle = '欢迎注册';
    },
    toResetForm() {
      this.showLoginForm = false;
      this.showRegistForm = false;
      this.showResetForm = true;
      this.loginTitle = '重置密码';
    },
    toLoginForm() {
      this.showLoginForm = true;
      this.showRegistForm = false;
      this.showResetForm = false;
      this.loginTitle = '欢迎登录';
    },
  },
  // 状态
  state() {
    return {
      showLoginForm: true,
      showRegistForm: false,
      showResetForm: false,
      loginTitle: '欢迎注册',
    };
  },
  // 计算
  getters: {},
});
