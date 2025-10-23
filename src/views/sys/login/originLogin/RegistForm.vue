<template>
  <div class="reg-form">
    <el-form ref="regForm" :model="form" :rules="rules" label-width="100px">
      <el-form-item label="手机号" prop="phone" required class="login-content">
        <el-input v-model="form.phone" placeholder="请输入手机号" size="large">
          <!--          <template #prefix>-->
          <!--            <el-icon>-->
          <!--              <i-ep-user />-->
          <!--            </el-icon>-->
          <!--          </template>-->
        </el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email" class="login-content">
        <el-input v-model="form.email" placeholder="请输入邮箱" size="large" />
      </el-form-item>
      <el-form-item label="用户名" prop="username" class="login-content">
        <el-input v-model="form.username" placeholder="请输入用户名" size="large" />
      </el-form-item>
      <el-form-item label="单位邀请码" prop="inviteCode" required class="login-content">
        <el-input v-model="form.inviteCode" placeholder="请输入邀请码" size="large" />
      </el-form-item>
      <el-form-item label="密码" prop="password" required class="login-content">
        <el-input v-model="form.password" placeholder="请输入密码" size="large" type="password" />
      </el-form-item>
      <el-form-item label="确认密码" prop="confirmPassword" required class="login-content">
        <el-input
          v-model="form.confirmPassword"
          placeholder="请再次输入密码"
          size="large"
          type="password"
        />
      </el-form-item>
      <el-form-item>
        <el-button
          class="from-button"
          style="background-color: #2d75f4"
          type="primary"
          @click="submitForm"
          >注册
        </el-button>
        <el-button class="from-button" style="width: 45%" @click="resetForm">重置</el-button>
      </el-form-item>
    </el-form>
    <div style="text-align: end">
      <a style="width: 20px; height: 20px; font-size: 18px" href="#" @click.prevent="toLoginForm"
        >欢迎登录 </a
      >|
      <a style="width: 20px; height: 20px; font-size: 18px" href="#" @click.prevent="toResetForm"
        >重置密码
      </a>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, watch } from 'vue';
  import { useLoginStore } from '@/store/modules/login';
  import { register } from '@/api/sys/user';

  let loginStore = useLoginStore();
  const { toLoginForm, toResetForm } = loginStore;

  const form = reactive({
    phone: '',
    email: '',
    username: '',
    inviteCode: '',
    password: '',
    confirmPassword: '',
  });

  const rules = {
    phone: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      {
        pattern: /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
        message: '手机号格式不正确',
        trigger: 'blur',
      },
    ],
    email: [
      { required: false, message: '请输入邮箱', trigger: 'blur' },
      { type: 'email', message: '邮箱格式不正确', trigger: ['blur', 'change'] },
    ],
    username: [
      { required: false, message: '请输入用户名', trigger: 'blur' },
      {
        pattern: /^(?!.*@)(?!\d+$)[\w\u4e00-\u9fa5]+$/,
        message: '用户名格式不正确,用户名不含@且不是纯数字',
        trigger: 'blur',
      },
    ],
    inviteCode: [{ required: true, message: '请输入单位邀请码', trigger: 'blur' }],
    password: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
    ],
    confirmPassword: [
      { required: true, message: '请再次输入密码', trigger: 'blur' },
      {
        validator: (rule, value, callback) => {
          if (value !== form.password) {
            callback(new Error('两次输入的密码不一致'));
          } else {
            callback();
          }
        },
        trigger: 'blur',
      },
    ],
  };

  // 提取用户名
  watch(
    () => form.email,
    (newEmail) => {
      if (newEmail) {
        const [username] = newEmail.split('@');
        form.username = username;
      } else {
        form.username = '';
      }
    },
  );

  const submitForm = async () => {
    if (validateForm()) {
      // console.log('将要提交的数据：', form);
      // let stringify = JSON.stringify(form);
      let res = await register(form);
      // console.log('注册返回结果：', res);
      if (res.success) {
        ElMessage.success('注册成功');
        // 清空表单
        resetForm();
        // 显示登录表单
        toLoginForm();
      } else {
        ElMessage.error(res.message);
      }

      // 执行注册逻辑
      console.log('注册成功');
    }
  };

  const resetForm = () => {
    form.phone = '';
    form.email = '';
    form.username = '';
    form.inviteCode = '';
    form.password = '';
    form.confirmPassword = '';
  };

  const regForm = ref(null);
  const validateForm = () => {
    // 进行表单验证逻辑，确保必填字段都已填写且密码一致
    if (
      form.phone &&
      form.inviteCode &&
      form.password &&
      form.confirmPassword &&
      form.password === form.confirmPassword
    ) {
      return true;
    } else {
      return false;
    }
  };
</script>

<style lang="scss" scoped>
  /* 注册框 */
  .reg-form {
    margin-right: 10px;
  }

  .from-button {
    display: block;
    width: 50%;
    height: 40px;
  }

  .login-content {
    margin-top: -3px;
  }
</style>
