import type { FormInstance } from 'ant-design-vue/lib/form/Form';
import type {
  RuleObject,
  NamePath,
  Rule as ValidationRule,
} from 'ant-design-vue/lib/form/interface';
import { ref, computed, unref, Ref } from 'vue';
import { useI18n } from '@/hooks/web/useI18n';

export enum LoginStateEnum {
  LOGIN,
  REGISTER,
  RESET_PASSWORD,
  MOBILE,
  QR_CODE,
}

const currentState = ref(LoginStateEnum.LOGIN);

// 这里也可以优化
// import { createGlobalState } from '@vueuse/core'

export function useLoginState() {
  function setLoginState(state: LoginStateEnum) {
    currentState.value = state;
  }

  const getLoginState = computed(() => currentState.value);

  function handleBackLogin() {
    setLoginState(LoginStateEnum.LOGIN);
  }

  return { setLoginState, getLoginState, handleBackLogin };
}

export function useFormValid<T extends Object = any>(formRef: Ref<FormInstance>) {
  const validate = computed(() => {
    const form = unref(formRef);
    return form?.validate ?? ((_nameList?: NamePath) => Promise.resolve());
  });

  async function validForm() {
    const form = unref(formRef);
    if (!form) return;
    const data = await form.validate();
    return data as T;
  }

  return { validate, validForm };
}

export function useFormRules(formData?: Recordable) {
  const { t } = useI18n();

  // 登录(含短信登录)必填内容提示
  const getAccountFormRule = computed(() => createRule(t('sys.login.accountPlaceholder')));
  const getPasswordFormRule = computed(() => createRule(t('sys.login.passwordPlaceholder')));
  const getSmsFormRule = computed(() => createRule(t('sys.login.smsPlaceholder')));
  // const getMobileFormRule = computed(() => createRule(t('sys.login.mobilePlaceholder')));

  /** 验证同意权限 */
  const validatePolicy = async (_: RuleObject, value: boolean) => {
    return !value ? Promise.reject(t('sys.login.policyPlaceholder')) : Promise.resolve();
  };

  /** 验证两次密码输入 */
  const validateConfirmPassword = (password: string) => {
    return async (_: RuleObject, value: string) => {
      if (!value) {
        return Promise.reject(t('sys.register.repeatnewpwdPlaceholder'));
      }
      if (value !== password) {
        return Promise.reject(t('sys.login.diffPwd'));
      }
      return Promise.resolve();
    };
  };

  /** 验证手机或邮箱输入格式 */
  const validatePhoneOrEmail = (value: string) => {
    return async (_: RuleObject, empty_value: string) => {
      const phoneRegex =
        /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/;
      const emailRegex = /^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      // 空值时不报出错误
      if (!empty_value) {
        return Promise.resolve();
      }
      if (!phoneRegex.test(value) && !emailRegex.test(value)) {
        return Promise.reject(t('sys.resetPassword.errorPhoneOrEmailPlacehoder'));
      }
      return Promise.resolve();
    };
  };

  /** 表单输入规则 */
  const getFormRules = computed((): { [k: string]: ValidationRule | ValidationRule[] } => {
    // 通用规则
    const accountFormRule = unref(getAccountFormRule);
    const passwordFormRule = unref(getPasswordFormRule);
    const smsFormRule = unref(getSmsFormRule);

    switch (unref(currentState)) {
      // register form rules
      case LoginStateEnum.REGISTER:
        return {
          // account: accountFormRule,
          phone: [
            { required: true, message: t('sys.register.mobilePlaceholder'), trigger: 'blur' },
            {
              pattern:
                /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
              message: t('sys.register.errorPhonePlacehoder'),
              trigger: 'blur',
            },
          ],
          email: [
            { required: true, message: t('sys.register.emailPlaceholder'), trigger: 'blur' },
            {
              type: 'email',
              message: t('sys.register.errorEmailPlacehoder'),
              trigger: 'blur',
            },
          ],
          username: [
            { required: true, message: t('sys.register.userNamePlaceholder'), trigger: 'blur' },
            {
              pattern: /^(?!.*@)(?!\d+$)[\w\u4e00-\u9fa5]+$/,
              message: '用户名格式不正确,用户名不含@且不是纯数字',
              trigger: 'blur',
            },
          ],
          password: [
            { required: true, message: t('sys.register.passwordPlaceholder'), trigger: 'blur' },
            { min: 8, message: t('sys.register.errorPasswordPlacehoder'), trigger: 'blur' },
          ],
          inviteCode: [
            { required: true, message: t('sys.register.inviteCodePlaceholder'), trigger: 'blur' },
          ],
          confirmPassword: [
            { validator: validateConfirmPassword(formData?.password), trigger: 'change' },
          ],
          policy: [{ validator: validatePolicy, trigger: 'change' }],
        };

      // reset password form rules
      case LoginStateEnum.RESET_PASSWORD:
        return {
          phoneOrMail: [
            {
              required: true,
              message: t('sys.resetPassword.phoneOrMailPlaceholder'),
              trigger: 'blur',
            },
            {
              validator: validatePhoneOrEmail(formData?.phoneOrMail),
              trigger: ['blur', 'change'],
            },
          ],
          verificationCode: [
            {
              required: true,
              message: t('sys.resetPassword.verificationCodePlaceholder'),
              trigger: 'blur',
            },
          ],
          newPassword: [
            {
              required: true,
              message: t('sys.resetPassword.newPasswordPlaceholder'),
              trigger: 'blur',
            },
            { min: 8, message: t('sys.resetPassword.errorPasswordPlacehoder'), trigger: 'blur' },
          ],
          confirmPassword: [
            { validator: validateConfirmPassword(formData?.newPassword), trigger: 'change' },
          ],
        };

      // mobile form rules
      case LoginStateEnum.MOBILE:
        return {
          mobile: [
            { required: true, message: t('sys.register.mobilePlaceholder'), trigger: 'blur' },
            {
              pattern:
                /^(13[0-9]|14[01456879]|15[0-35-9]|16[2567]|17[0-8]|18[0-9]|19[0-35-9])\d{8}$/,
              message: t('sys.register.errorPhonePlacehoder'),
              trigger: 'blur',
            },
          ],
          sms: smsFormRule,
        };

      // login form rules
      default:
        return {
          account: accountFormRule,
          password: passwordFormRule,
        };
    }
  });
  return { getFormRules };
}

function createRule(message: string): ValidationRule[] {
  return [
    {
      required: true,
      message,
      trigger: 'change',
    },
  ];
}
