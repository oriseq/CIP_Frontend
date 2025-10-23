<template>
  <div v-if="getShow">
    <LoginFormTitle class="enter-x" />
    <Form class="p-4 enter-x" :model="formData" :rules="getFormRules" ref="formRef">
      <FormItem name="phone" class="enter-x">
        <Input
          size="large"
          v-model:value="formData.phone"
          :placeholder="t('sys.register.phone')"
          class="fix-auto-fill"
        />
      </FormItem>

      <FormItem name="email" class="enter-x">
        <Input
          size="large"
          v-model:value="formData.email"
          :placeholder="t('sys.register.email')"
          class="fix-auto-fill"
        />
      </FormItem>

      <FormItem name="username" class="enter-x">
        <Input
          class="fix-auto-fill"
          size="large"
          v-model:value="formData.username"
          :placeholder="t('sys.register.userName')"
        />
      </FormItem>

      <FormItem name="inviteCode" class="enter-x">
        <Input
          size="large"
          v-model:value="formData.inviteCode"
          :placeholder="t('sys.register.inviteCode')"
          class="fix-auto-fill"
        />
      </FormItem>

      <FormItem name="password" class="enter-x">
        <StrengthMeter
          size="large"
          v-model:value="formData.password"
          :placeholder="t('sys.register.password')"
        />
      </FormItem>
      <FormItem name="confirmPassword" class="enter-x">
        <InputPassword
          size="large"
          visibilityToggle
          v-model:value="formData.confirmPassword"
          :placeholder="t('sys.register.confirmPassword')"
        />
      </FormItem>

      <FormItem name="realName" class="enter-x">
        <Input
          class="fix-auto-fill"
          size="large"
          v-model:value="formData.realName"
          :placeholder="t('sys.register.realName')"
        />
      </FormItem>

      <FormItem class="enter-x" name="policy">
        <!-- No logic, you need to deal with it yourself -->
        <Checkbox v-model:checked="formData.policy" size="small">
          {{ t('sys.login.policy') }}
        </Checkbox>
      </FormItem>

      <ARow class="enter-x" :gutter="[16, 16]">
        <ACol :md="12" :xs="24">
          <Button type="primary" class="enter-x" size="large" block @click="handleRegister">
            {{ t('sys.register.registerButton') }}
          </Button>
        </ACol>
        <ACol :md="12" :xs="24">
          <Button type="default" class="enter-x" size="large" block @click="resetForm">
            {{ t('sys.register.resetButton') }}
          </Button>
        </ACol>
      </ARow>

      <Button size="large" block class="mt-4 enter-x" @click="handleBackLogin">
        {{ t('sys.login.backSignIn') }}
      </Button>
    </Form>
  </div>
</template>
<script lang="ts" setup>
  import { reactive, ref, unref, computed, watch } from 'vue';
  import LoginFormTitle from './LoginFormTitle.vue';
  import { Form, Input, Button, Checkbox } from 'ant-design-vue';
  import { StrengthMeter } from '@/components/StrengthMeter';
  // import { CountdownInput } from '@/components/CountDown';
  import { useI18n } from '@/hooks/web/useI18n';
  import { useLoginState, useFormRules, useFormValid, LoginStateEnum } from './useLogin';

  import { register } from '@/api/sys/user';

  const FormItem = Form.Item;
  const InputPassword = Input.Password;
  const { t } = useI18n();
  const { handleBackLogin, getLoginState } = useLoginState();

  const formRef = ref();

  const formData = reactive({
    phone: '',
    email: '',
    username: '',
    inviteCode: '',
    password: '',
    confirmPassword: '',
    realName: '',
    policy: false,
  });

  // 提取用户名
  watch(
    () => formData.email,
    (newEmail) => {
      if (newEmail) {
        const [username] = newEmail.split('@');
        formData.username = username;
      } else {
        formData.username = '';
      }
    },
  );

  // const submitForm = async () => {
  //   if (validateForm()) {
  //     // console.log('将要提交的数据：', form);
  //     // let stringify = JSON.stringify(form);
  //     let res = await register(formData);
  //     // console.log('注册返回结果：', res);
  //     if (res.success) {
  //       ElMessage.success('注册成功');
  //       // 清空表单
  //       resetForm();
  //       // 显示登录表单
  //       // toLoginForm();
  //     } else {
  //       ElMessage.error(res.message);
  //     }

  //     // 执行注册逻辑
  //     console.log('注册成功');
  //   }
  // };
  const resetForm = () => {
    formData.phone = '';
    formData.email = '';
    formData.username = '';
    formData.inviteCode = '';
    formData.password = '';
    formData.confirmPassword = '';
    formData.realName = '';
  };

  const validateForm = () => {
    // 进行表单验证逻辑，确保必填字段都已填写且密码一致
    if (
      formData.phone &&
      formData.email &&
      formData.username &&
      formData.inviteCode &&
      formData.password &&
      formData.confirmPassword &&
      formData.password === formData.confirmPassword
    ) {
      return true;
    } else {
      return false;
    }
  };

  const { getFormRules } = useFormRules(formData);
  const { validForm } = useFormValid(formRef);

  const getShow = computed(() => unref(getLoginState) === LoginStateEnum.REGISTER);

  async function handleRegister() {
    const data = await validForm();
    if (!data) return;

    // 打印注册表单
    // console.log(data);

    // 提交注册表单
    if (validateForm()) {
      let res = await register(data);
      if (res.success) {
        ElMessage.success('注册成功');
        // 清空表单
        resetForm();
        // 显示登录表单
        // toLoginForm();
      } else {
        ElMessage.error(res.message);
      }

      // 执行注册逻辑
      console.log('注册成功');
    }
  }
</script>
