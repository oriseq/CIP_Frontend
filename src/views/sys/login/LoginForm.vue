<template>
  <LoginFormTitle v-show="getShow" class="enter-x" />
  <Form
    class="p-4 enter-x"
    :model="passwordForm"
    :rules="getFormRules"
    ref="formRef"
    v-show="getShow"
    @keypress.enter="handleLogin"
  >
    <FormItem name="account" class="enter-x">
      <Input
        size="large"
        v-model:value="passwordForm.account"
        :placeholder="t('sys.login.account')"
        class="fix-auto-fill"
      />
    </FormItem>
    <FormItem name="password" class="enter-x">
      <InputPassword
        autocomplete="new-password"
        size="large"
        visibilityToggle
        v-model:value="passwordForm.password"
        :placeholder="t('sys.login.password')"
        :allowClear="true"
      />
    </FormItem>

    <FormItem class="login-content" v-if="allowSlider === 'true'">
      <dragVerify v-model:value="passwordFormIsVerifyPass" />
    </FormItem>

    <ARow class="enter-x">
      <ACol :span="12">
        <FormItem>
          <!-- No logic, you need to deal with it yourself -->
          <Checkbox v-model:checked="rememberMe" size="small">
            {{ t('sys.login.rememberMe') }}
          </Checkbox>
        </FormItem>
      </ACol>
      <ACol :span="12">
        <FormItem :style="{ 'text-align': 'right' }">
          <!-- No logic, you need to deal with it yourself -->
          <Button type="link" size="small" @click="setLoginState(LoginStateEnum.RESET_PASSWORD)">
            {{ t('sys.login.forgetPassword') }}
          </Button>
        </FormItem>
      </ACol>
    </ARow>

    <FormItem class="enter-x">
      <Button type="primary" size="large" block @click="handleLogin" :loading="loadingstatus">
        {{ t('sys.login.loginButton') }}
      </Button>
    </FormItem>
    <ARow class="enter-x" :gutter="[16, 16]">
      <ACol :md="buttonWidthByConf" :xs="24" v-if="allowSmsLogin === 'true'">
        <Button block @click="setLoginState(LoginStateEnum.MOBILE)">
          {{ t('sys.login.mobileSignInFormTitle') }}
        </Button>
      </ACol>
      <ACol :md="buttonWidthByConf" :xs="24" v-if="allowRegister === 'true'">
        <Button block @click="setLoginState(LoginStateEnum.REGISTER)">
          {{ t('sys.login.registerButton') }}
        </Button>
      </ACol>
    </ARow>

    <!-- <Divider class="enter-x">{{ t('sys.login.otherSignIn') }}</Divider>

    <div class="flex justify-evenly enter-x" :class="`${prefixCls}-sign-in-way`">
      <GithubFilled />
      <WechatFilled />
      <AlipayCircleFilled />
      <GoogleCircleFilled />
      <TwitterCircleFilled />
    </div> -->
  </Form>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed } from 'vue';

  import { Checkbox, Form, Input, Row, Col, Button } from 'ant-design-vue';
  import LoginFormTitle from './LoginFormTitle.vue';

  import { useI18n } from '@/hooks/web/useI18n';
  import { useMessage } from '@/hooks/web/useMessage';

  import { useUserStore } from '@/store/modules/user';
  import { LoginStateEnum, useLoginState, useFormRules, useFormValid } from './useLogin';
  import { useDesign } from '@/hooks/web/useDesign';
  //import { onKeyStroke } from '@vueuse/core';
  import dragVerify from '@/components/test/login/Sliding.vue';

  const ACol = Col;
  const ARow = Row;
  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { notification, createErrorModal } = useMessage();
  const { prefixCls } = useDesign('login');
  const userStore = useUserStore();

  const { setLoginState, getLoginState } = useLoginState();
  const { getFormRules } = useFormRules();

  const formRef = ref();
  const rememberMe = ref(false);

  const passwordForm = reactive({
    account: '',
    password: '',
  });

  // 父组件传入
  const allowRegister = defineModel<string>('allowRegister');
  console.log('🚀 ~ allowRegister:', allowRegister.value);
  const allowSmsLogin = defineModel<string>('allowSmsLogin');
  console.log('🚀 ~ allowSmsLogin:', allowSmsLogin.value);
  const allowSlider = defineModel<string>('allowSlider');
  console.log('🚀 ~ allowSlider:', allowSlider.value);

  // 根据是否注册和是否短信登录判断宽度显示
  const buttonWidthByConf = computed(() => {
    if (allowRegister.value === 'true' && allowSmsLogin.value === 'true') {
      return 12;
    } else if (allowRegister.value === 'true' || allowSmsLogin.value === 'true') {
      return 24;
    } else {
      return 0;
    }
  });

  const loadingstatus = ref(false);
  const passwordFormIsVerifyPass = ref(false);
  const { validForm } = useFormValid(formRef);

  //onKeyStroke('Enter', handleLogin);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.LOGIN);

  async function handleLogin() {
    const passwordFormRef = await validForm();
    if (!passwordFormRef) return;
    if (!allowSlider.value && !passwordFormIsVerifyPass.value) {
      ElMessage.error('请滑动验证');
      return;
    }
    try {
      loadingstatus.value = true;
      const userInfo = await userStore.login({
        account: passwordFormRef.account,
        password: passwordFormRef.password,
        // username: data.account,
        mode: 'none', //不要默认的错误提示
      });
      console.log('userInfo@', userInfo);
      let welcomePerson = getWelcomeBackPeople(userInfo);
      if (userInfo) {
        notification.success({
          message: t('sys.login.loginSuccessTitle'),
          description: `${t('sys.login.loginSuccessDesc')}: ${welcomePerson}`,
          duration: 3,
        });
      }
      // resetForm();
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

  /** 获取登录成功的欢迎人 */
  function getWelcomeBackPeople(userInfo) {
    if (userInfo?.realName) {
      return userInfo?.realName;
    } else if (userInfo?.username) {
      return userInfo?.username;
    } else if (userInfo?.email) {
      return userInfo?.email;
    }
  }
</script>
