<template>
  <div v-if="getShow">
    <LoginFormTitle class="enter-x" />
    <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef">
      <FormItem name="phoneOrMail" class="enter-x">
        <Input
          size="large"
          v-model:value="formData.phoneOrMail"
          :placeholder="t('sys.resetPassword.phoneOrMail')"
          class="fix-auto-fill"
        />
      </FormItem>

      <FormItem name="verificationCode" class="enter-x">
        <CountdownInput
          size="large"
          v-model:value="formData.verificationCode"
          :placeholder="t('sys.resetPassword.verificationCode')"
          :sendCodeApi="sendResetSmsVerificationCode"
        />
      </FormItem>

      <FormItem name="newPassword" class="enter-x">
        <InputPassword
          size="large"
          v-model:value="formData.newPassword"
          visibilityToggle
          :placeholder="t('sys.resetPassword.newPassword')"
          :allowClear="true"
        />
      </FormItem>

      <FormItem name="confirmPassword" class="enter-x">
        <InputPassword
          size="large"
          v-model:value="formData.confirmPassword"
          visibilityToggle
          :placeholder="t('sys.resetPassword.confirmPassword')"
          :allowClear="true"
        />
      </FormItem>

      <FormItem class="enter-x">
        <Button type="primary" size="large" block @click="handleReset">
          {{ t('sys.resetPassword.resetPasswordButtonText') }}
        </Button>
        <Button type="default" size="large" class="mt-4" block @click="handleBackLogin">
          {{ t('sys.login.backSignIn') }}
        </Button>
      </FormItem>
    </Form>
  </div>
</template>

<script lang="ts" setup>
  import { reactive, ref, computed, unref } from 'vue';
  import LoginFormTitle from './LoginFormTitle.vue';
  import { Form, Input, Button } from 'ant-design-vue';
  import { CountdownInput } from '@/components/CountDown';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLoginState, useFormRules, LoginStateEnum, useFormValid } from './useLogin';
  import { getVerificationCode, reSetPasswd } from '@/api/sys/user';
  import type { RuleObject } from 'ant-design-vue/lib/form/interface';

  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { handleBackLogin, getLoginState } = useLoginState();

  const formRef = ref();

  const formData = reactive({
    phoneOrMail: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const { getFormRules } = useFormRules(formData);
  const { validForm } = useFormValid(formRef);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.RESET_PASSWORD);

  /** 发送验证码 (适配Vben) */
  async function sendResetSmsVerificationCode() {
    let userInput = formData.phoneOrMail;
    let isVaild = validatePhoneOrEmail(userInput);
    // 1. 验证输入格式
    if (!isVaild) {
      ElMessage.error('请输入有效的手机号码或邮箱');
      return false;
    }
    // 2. 发送验证码
    let response = await getVerificationCode({ phoneOrMail: userInput });
    if (response.success) {
      ElMessage({ message: '发送验证码成功', type: 'success' });
      return true;
    } else {
      console.log('发送验证码失败', response);
      return false;
    }
  }

  /** 提交重置密码表单 */
  async function handleReset() {
    const data = await validForm();
    if (!data) return;

    if (validateForm()) {
      console.log('表单验证通过');
      let resp = await reSetPasswd(formData);
      if (resp.success) {
        ElMessage({
          message: '重置密码成功',
          type: 'success',
        });
        resetForm();
      }
      await data.resetFields();
    }
  }

  /** 用于清空表单的方法 */
  const resetForm = () => {
    formData.phoneOrMail = '';
    formData.verificationCode = '';
    formData.newPassword = '';
    formData.confirmPassword = '';
  };

  /** 进行表单验证逻辑，确保字段都已填写且密码一致 */
  const validateForm = () => {
    if (
      formData.phoneOrMail &&
      formData.verificationCode &&
      formData.newPassword &&
      formData.confirmPassword &&
      formData.newPassword === formData.confirmPassword
    ) {
      console.log('表单验证成功');
      return true;
    } else {
      console.log('表单验证失败');
      return false;
    }
  };

  /** 验证手机或邮箱输入格式 */
  const validatePhoneOrEmail = (value: string) => {
    return async (_: RuleObject, empty_value: string) => {
      const phoneRegex =
        /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
      const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      // 空值时不报出错误
      if (!empty_value) {
        return false;
      }
      if (!phoneRegex.test(value) && !emailRegex.test(value)) {
        console.log(t('sys.resetPassword.errorPhoneOrEmailPlacehoder'));
        return false;
      }
      return true;
    };
  };
</script>
