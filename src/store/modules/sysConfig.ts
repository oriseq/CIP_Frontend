import { defineStore } from 'pinia';
import { getInfoApi, getWindowsIconApi } from '@/views/sampleos/backgroundSetting/data';
import { ref } from 'vue';
import { useGlobSetting } from '@/hooks/setting';

const { apiUrl } = useGlobSetting();

/** 管理面板配置信息获取 */
export const useConfigStore = defineStore('config', () => {
  const configData = ref<any>(null);
  const loginCongfigData = ref<any>(null);

  const loading = ref<boolean>(false);

  const mainTitle = ref<string>(''); // 登录页-主标题
  const subTitle = ref<string>(''); // 登录页-副标题
  const allowRegister = ref<string>(''); // 登录页-是否允许注册
  const allowSmsLogin = ref<string>(''); // 登录页-是否启用短信登录
  const allowSlider = ref<string>(''); // 登录页-是否启用滑块

  const siteTitle = ref<string>(''); // 站点设置-网站标题
  const siteIcon = ref<string>(''); // 站点设置-网站图标

  const allowNotice = ref<string>(''); // 通知-是否启用通知事件

  // 获取配置信息
  const fetchConfig = async () => {
    try {
      loading.value = true;
      // 获取配置信息-1
      const res = await getInfoApi({});
      configData.value = res?.result || [];
      const resultData = Array.isArray(res?.result) ? res.result : [];

      // 登录页设置
      mainTitle.value =
        resultData
          .filter((item) => item?.configKey === 'login.basic.mainTitle')
          .map((item) => item?.configValue)[0] ?? '';
      subTitle.value =
        resultData
          .filter((item) => item?.configKey === 'login.basic.subTitle')
          .map((item) => item?.configValue)[0] ?? '';
      allowRegister.value = resultData
        .filter((item) => item?.configKey === 'login.register.allowRegister')
        .map((item) => item?.configValue)[0];
      allowSmsLogin.value = resultData
        .filter((item) => item?.configKey === 'login.sms.enabled')
        .map((item) => item?.configValue)[0];
      allowSlider.value = resultData
        .filter((item) => item?.configKey === 'login.security.sliderCaptcha')
        .map((item) => item?.configValue)[0];

      // 站点设置
      siteTitle.value =
        resultData
          .filter((item) => item?.configKey === 'site.basic.title')
          .map((item) => item?.configValue)[0] ?? '';
      siteIcon.value =
        resultData
          .filter((item) => item?.configKey === 'site.browser.favicon')
          .map((item) => item?.configValue)[0] ?? '';

      // 通知设置
      allowNotice.value = resultData
        .filter((item) => item?.configKey === 'notice.basic.use')
        .map((item) => item?.configValue)[0];

      // 保存到 localStorage
      if (siteTitle.value) {
        localStorage.setItem('app_siteTitle', siteTitle.value);
      }
      if (siteIcon.value) {
        localStorage.setItem('app_siteIcon', siteIcon.value);
      }
      localStorage.setItem('app_allowNotice', allowNotice.value);
      localStorage.setItem('app_allowRegister', allowRegister.value);
      localStorage.setItem('app_allowSmsLogin', allowSmsLogin.value);
      localStorage.setItem('app_mainTitle', mainTitle.value);
      localStorage.setItem('app_subTitle', subTitle.value);

      return resultData;
    } catch (error) {
      console.error('获取配置信息失败:', error);
      // 出错时设置默认值
      mainTitle.value = '';
      subTitle.value = '';
      allowRegister.value = 'false';
      allowSmsLogin.value = 'false';
      siteTitle.value = '';
      siteIcon.value = '';
      allowNotice.value = 'false';
      throw error;
    } finally {
      loading.value = false;
    }
  };
  return {
    configData,
    siteTitle,
    siteIcon,
    allowNotice,
    loginCongfigData,
    mainTitle,
    subTitle,
    allowRegister,
    allowSmsLogin,
    allowSlider,
    fetchConfig,
    loading,
  };
});
