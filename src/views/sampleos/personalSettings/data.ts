import { FormSchema } from '@/components/Form';
import { defHttpForRes } from '@/utils/http/axios';

enum Api {
  MODIFY_BASIC_INFO = '/personalSettings/basicInformation',
  MODIFY_PASSWORD = '/personalSettings/password',
}

/** 更改基本信息 */
export const modifyBaseInfoApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.MODIFY_BASIC_INFO,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('postBaseInfoApi-rsp', rsp);
  return rsp;
};

/** 更改密码 */
export const modifyPasswordApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.MODIFY_PASSWORD,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('postBaseInfoApi-rsp', rsp);
  return rsp;
};

export interface ListItem {
  key: string;
  title: string;
  description: string;
  extra?: string;
  avatar?: string;
  color?: string;
}

// tab的list
export const settingList = [
  {
    key: '1',
    name: '基本设置',
    component: 'BaseSetting',
  },
  {
    key: '2',
    name: '修改密码',
    component: 'ChangePassword',
  },
];

// 基础设置 form
export const baseSetschemas: FormSchema[] = [
  {
    field: 'username',
    component: 'Input',
    label: '用户名',
    // colProps: { span: 15 },
    // helpMessage: '网站的昵称',
  },
  {
    field: 'realname',
    component: 'Input',
    label: '真实姓名',
    dynamicDisabled: false,
    // colProps: { span: 15 },
    required: true,
    // helpMessage: '自动获取钉钉中的名字',
  },
  {
    field: 'phone',
    component: 'Input',
    label: '手机号',
    // colProps: { span: 15 },
    helpMessage: '修改手机号将会重新登录',
    required: true,
  },
  {
    field: 'email',
    component: 'Input',
    label: '邮箱',
    dynamicDisabled: false,
    // colProps: { span: 15 },
    // helpMessage: '企业邮箱，用于登录',
  },
];

// 修改密码 list
export const modifyPasswordschemas: FormSchema[] = [
  {
    field: 'oldPassword',
    label: '旧密码',
    component: 'InputPassword',
    componentProps: { placeholder: '旧密码' },
    rules: [
      {
        required: true,
        message: '请输入旧密码',
      },
    ],
  },
  {
    field: 'newPassword',
    label: '新密码',
    component: 'StrengthMeter',
    componentProps: {
      placeholder: '新密码',
    },

    dynamicRules: ({ values }) => {
      return [
        {
          required: true,
          validator: (_, value) => {
            if (!value) {
              return Promise.reject('请输入新密码');
            }
            if (value == values.oldPassword) {
              return Promise.reject('新旧密码重复');
            }
            return Promise.resolve();
          },
        },
      ];
    },
  },
  {
    field: 'confirmPassword',
    label: '确认密码',
    component: 'InputPassword',
    componentProps: {
      placeholder: '再次输入新密码',
    },
    dynamicRules: ({ values }) => {
      return [
        {
          required: true,
          validator: (_, value) => {
            if (!value) {
              return Promise.reject('请再次输入新密码');
            }
            if (value !== values.newPassword) {
              return Promise.reject('两次输入的密码不一致!');
            }
            return Promise.resolve();
          },
        },
      ];
    },
  },
];
