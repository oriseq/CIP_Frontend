<template>
  <div v-if="getShow">
    <LoginFormTitle class="enter-x" />
    <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef">
      <FormItem name="mobile" class="enter-x">
        <Input
          size="large"
          v-model:value="formData.mobile"
          :placeholder="t('sys.login.mobile')"
          class="fix-auto-fill"
        />
      </FormItem>
      <FormItem name="sms" class="enter-x">
        <CountdownInput
          size="large"
          class="fix-auto-fill"
          v-model:value="formData.sms"
          :placeholder="t('sys.login.smsCode')"
          :sendCodeApi="sendVerificationCode"
        />
      </FormItem>

      <FormItem class="enter-x">
        <Button type="primary" size="large" block @click="handleLogin" :loading="loadingstatus">
          {{ t('sys.login.loginButton') }}
        </Button>
        <Button size="large" block class="mt-4" @click="handleBackLogin">
          {{ t('sys.login.backSignIn') }}
        </Button>
      </FormItem>
    </Form>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, computed, unref } from 'vue';
  import { Form, Input, Button } from 'ant-design-vue';
  import { CountdownInput } from '@/components/CountDown';
  import LoginFormTitle from './LoginFormTitle.vue';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLoginState, useFormRules, useFormValid, LoginStateEnum } from './useLogin';
  import { getSmsVerificationCode } from '@/api/sys/user';
  import { useMessage } from '@/hooks/web/useMessage';
  import { useDesign } from '@/hooks/web/useDesign';
  import { useUserStore } from '@/store/modules/user';

  const userStore = useUserStore();
  const { notification, createErrorModal } = useMessage();

  const FormItem = Form.Item;
  const { t } = useI18n();
  const { handleBackLogin, getLoginState } = useLoginState();
  const { getFormRules } = useFormRules();
  const { prefixCls } = useDesign('smslogin');
  const formRef = ref();
  const { validForm } = useFormValid(formRef);

  const loadingstatus = ref(false);

  const formData = reactive({
    mobile: '',
    sms: '',
  });

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.MOBILE);

  /** 验证手机号格式 */
  function validatePhone(phone: string) {
    const regex = /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    if (!regex.test(phone)) {
      return false;
    }
    return true;
  }

  /** 发送短信验证码 (基于promise<boolen>修改) */
  async function sendVerificationCode() {
    console.log('正在执行函数sendVerificationCode');
    // 1.验证手机号格式
    let mobile = formData.mobile;
    let isValidPhone = validatePhone(mobile);
    if (!isValidPhone) {
      ElMessage.error('请输入有效的手机号码');
      return false;
    }
    // 2.发送验证码
    const data = { phoneNum: mobile };
    const smsVerificationCode = await getSmsVerificationCode(data);
    console.log('smsVerificationCode:', smsVerificationCode);
    if (smsVerificationCode.success) {
      ElMessage.success('获取验证码成功'); // 弹出提醒
      console.log('验证码成功'); // 控制台打印
      return true;
    } else {
      ElMessage(smsVerificationCode.message);
      console.log('验证码失败');
      return false;
    }
  }

  /** 提交短信登录表单 */
  async function handleLogin() {
    const data = await validForm();
    if (!data) return;
    console.log('data', data);
    try {
      loadingstatus.value = true;
      const userInfo = await userStore.smsLogin({
        phone: data.mobile,
        verificationCode: data.sms,
        mode: 'none', //不要默认的错误提示
      });
      console.log('userInfo@', userInfo);
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${userInfo.username}`,
          duration: 3,
        });
      }
    } catch (error) {
      createErrorModal({
        title: t('sys.api.errorTip'),
        content: (error as unknown as Error).message || t('sys.api.networkExceptionMsg'),
        getContainer: () => document.body.querySelector(`.${prefixCls}`) || document.body,
      });
    } finally {
      loadingstatus.value = false;
    }
  }
</script>
