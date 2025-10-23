<template>
  <div class="reset">
    <!--            <el-tabs v-model="activeTab" class="tabs">
                  <el-tab-pane label="短信重置" name="resetSms">-->
    <!-- 手机短信重置密码表单 -->
    <el-form ref="smsFormRef" :model="resetSmsForm" :rules="resetSmsRules" label-width="0px">
      <el-form-item prop="phoneOrMail" class="reset-password-content">
        <el-input
          placeholder="手机或邮箱（*必填）"
          v-model="resetSmsForm.phoneOrMail"
          size="large"
          type="text"
        >
          <!--          <template #prefix>-->
          <!--            <el-icon>-->
          <!--              <i-ep-user />-->
          <!--            </el-icon>-->
          <!--          </template>-->
        </el-input>
      </el-form-item>
      <el-form-item prop="verificationCode" class="reset-password-content vercode-form">
        <el-input
          placeholder="验证码"
          v-model="resetSmsForm.verificationCode"
          size="large"
          type="text"
        />
        <br />
        <el-button
          :disabled="countdown > 0"
          @click="sendResetSmsVerificationCode"
          id="send-vercode-btn"
        >
          {{ countdown > 0 ? `重新发送(${countdown})` : '发送验证码' }}
        </el-button>
      </el-form-item>
      <el-form-item prop="newPassword" class="reset-password-content">
        <el-input
          placeholder="新密码 （*必填）"
          v-model="resetSmsForm.newPassword"
          size="large"
          type="password"
        />
      </el-form-item>
      <el-form-item prop="confirmPassword" class="reset-password-content">
        <el-input
          placeholder="重复新密码（必须与新密码一致）"
          v-model="resetSmsForm.confirmPassword"
          size="large"
          type="password"
        />
      </el-form-item>
      <el-form-item class="reset-password-content">
        <el-button
          type="primary"
          style="width: 100%; background-color: #2d75f4"
          @click="submitResetSmsForm"
          size="large"
          >重置密码
        </el-button>
      </el-form-item>
    </el-form>
    <div style="text-align: end">
      <a style=" width: 20px; height: 20px;font-size: 18px" href="#" @click.prevent="toLoginForm"
        >欢迎登录 </a
      >|
      <a style=" width: 20px; height: 20px;font-size: 18px" href="#" @click.prevent="toRegistForm"
        >立即注册
      </a>
    </div>
  </div>
</template>

<script setup>
  // 自动导入vue相关函数, ref,reactive等
  import { ref, reactive } from 'vue';
  // import request from "@/utils/request";
  import { useLoginStore } from '@/store/modules/login';
  import { getVerificationCode, reSetPasswd } from '@/api/sys/user';

  let loginStore = useLoginStore();
  const { toLoginForm, toRegistForm } = loginStore;

  // 手机短信重置表单数据和校验规则
  const resetSmsForm = reactive({
    phoneOrMail: '',
    verificationCode: '',
    newPassword: '',
    confirmPassword: '',
  });
  const smsFormRef = ref(null);

  const validatePhoneOrEmail = (rule, value, callback) => {
    const phoneRegex =
      /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
    const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    if (!phoneRegex.test(value) && !emailRegex.test(value)) {
      callback(new Error('请输入有效的手机或邮箱'));
    } else {
      callback();
    }
  };

  const resetSmsRules = reactive({
    phoneOrMail: [
      { required: true, message: '请输入手机号', trigger: 'blur' },
      { validator: validatePhoneOrEmail, trigger: 'blur' },
    ],
    verificationCode: [{ required: true, message: '请输入验证码', trigger: 'blur' }],
    newPassword: [
      { required: true, message: '请输入新密码', trigger: 'blur' },
      { min: 8, message: '密码长度不能少于8位', trigger: 'blur' },
    ],
    confirmPassword: [
      { required: true, message: '请再次输入新密码', trigger: 'blur' },
      {
        validator: (rule, value) => {
          if (value !== resetSmsForm.newPassword) {
            return Promise.reject('两次输入的密码不一致');
          }
          return Promise.resolve();
        },
        trigger: 'blur',
      },
    ],
  });

  /**
   * 发送手机短信验证码
   */
  const sendResetSmsVerificationCode = () => {
    validateField('resetSmsForm', 'phoneOrMail', smsFormRef, resetSmsRules, async () => {
      // 发送短信验证码
      console.log('执行发送验证码');
      startCountdown();
      let resp = await getVerificationCode({ phoneOrMail: resetSmsForm.phoneOrMail });
      console.log('resp:', resp);
      if (resp.success) {
        ElMessage({
          message: '发送验证码成功',
          type: 'success',
        });
      } else {
        ElMessage.error(resp.message);
      }
    });
  };
  const submitResetSmsForm = () => {
    validateForm('resetSmsForm', smsFormRef, resetSmsRules, async () => {
      // 执行手机重置密码逻辑
      // var form_json = JSON.parse(JSON.stringify(resetSmsForm));
      let resp = await reSetPasswd(resetSmsForm);
      if (resp.success) {
        ElMessage({
          message: '重置密码成功',
          type: 'success',
        });
        // 清空表单
        resetForm();
        // 显示登录表单
        toLoginForm();
      } else {
        ElMessage.error(resp.message);
      }
    });
  };

  const resetForm = () => {
    resetSmsForm.phoneOrMail = '';
    resetSmsForm.verificationCode = '';
    resetSmsForm.newPassword = '';
    resetSmsForm.confirmPassword = '';
  };
  const validateField = (formRef, field, form, rules, callback) => {
    console.log('@@form', form);
    form.value.validateField(field, (valid) => {
      if (valid) {
        callback();
      } else {
        console.log(`${field}验证失败`);
      }
    });
  };

  const countdown = ref(0);
  const startCountdown = () => {
    countdown.value = 60;
    const timer = setInterval(() => {
      if (countdown.value > 0) {
        countdown.value--;
      } else {
        clearInterval(timer);
      }
    }, 1000);
  };

  const validateForm = (formRef, form, rules, callback) => {
    form.value.validate((valid) => {
      if (valid) {
        callback();
      } else {
        console.log('表单验证失败');
      }
    });
  };
</script>

<style lang="scss" scoped>
  /* 重置框 */
  .reset {
    margin: 20px;
  }

  .reset-password-content {
    margin-top: 32px;
  }

  #send-vercode-btn {
    width: 26%;
  }
</style>
