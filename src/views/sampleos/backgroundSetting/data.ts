import { FormSchema } from '@/components/Form';
import { defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
// import { uploadApi } from '@/api/sys/upload';

enum Api {
  GET_INFO = '/sysConfig/list',
  UPDATE_INFO = '/sysConfig/batch',
  GET_NOTICE_OPTIONS = '/message/notificationSecondaryTypes',
  WINDOWS_ICO = '/file/open/favicon',
}

/** 获取所有信息 */
export const getInfoApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.GET_INFO,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  return rsp;
};

/** 提交修改 */
export const bachUpdateApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.UPDATE_INFO,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  return rsp;
};

/** 获取通知选项 */
export const getNoticeOptionsApi = (params) => {
  const rsp = defHttpOrigin.get({
    url: Api.GET_NOTICE_OPTIONS,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  return rsp;
};

/** 获取浏览器图标 */
export const getWindowsIconApi = (params) => {
  const rsp = defHttpOrigin.get({
    url: Api.WINDOWS_ICO,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  console.log("🚀 ~ getWindowsIconApi ~ rsp:", rsp)
  return rsp;
};

/** 单个通知选项 */
export interface NoticeItem {
  id: number;
  msgType: string;
}

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
    name: '站点设置',
    component: 'siteSetting',
  },
  {
    key: '2',
    name: '登录页',
    component: 'loginPageSetting',
  },
  {
    key: '3',
    name: '通知',
    component: 'noticeSetting',
  },
];

// 站点设置 form
export const siteSettingSchemas: FormSchema[] = [
  {
    field: 'site.basic.title',
    component: 'Input',
    label: '主页标题',
    labelWidth: 140,
    helpMessage: '登录之后的左上角标题，主页标题更改后需要在浏览器刷新后才出效果',
    colProps: { span: 15 },
  },
  {
    field: 'site.browser.favicon',
    label: '浏览器标签图标路径',
    slot: 'uploadSlot',
    labelWidth: 150,
    helpMessage: '图标更改后需要在浏览器刷新后才出效果',
    colProps: { span: 18 },
    // component: 'Upload',
    // componentProps: {
    //   value: [],
    //   api: uploadApi,
    //   multiple: false,
    //   maxNumber: 10,
    //   maxSize: 5,
    //   resultField: 'data.result',
    //   onChange: (fileList) => {
    //     // 这里可以处理文件上传状态的变化
    //     console.log('上传的文件列表：', fileList);
    //   },
    //   onDelete: (record) => {
    //     // 在上传列表中删除文件的事件
    //     console.log('删除的文件列表：', record);
    //   },
    //   previewColumns: [
    //     {
    //       title: '文件名',
    //       dataIndex: 'name',
    //     },
    //   ],
    //   beforePreviewData: (arg) => {
    //     console.log('arg：', arg);
    //     // 确保arg是数组且包含有效数据
    //     if (Array.isArray(arg)) {
    //       return arg
    //         .filter((item) => !!item)
    //         .map((item) => {
    //           // 直接使用接口返回的url对象
    //           return {
    //             name: item?.originalFileName || '',
    //             id: item?.id || '',
    //             fileSize: item?.fileSize || 0,
    //             creationTime: item?.creationTime || '',
    //           };
    //         });
    //     }
    //     return [];
    //   },
    //   helpText: '单个文件不超过5MB，最多只能上传10个文件',
    // },
  },
  // {
  //   field: 'Ip',
  //   component: 'Input',
  //   label: 'Ip',
  //   labelWidth: 140,
  //   colProps: { span: 15 },
  //   ifShow: false,
  //   helpMessage: '网站IP地址',
  // },
  // {
  //   field: 'areaName',
  //   component: 'Input',
  //   label: '域名',
  //   labelWidth: 140,
  //   colProps: { span: 15 },
  //   ifShow: false,
  //   helpMessage: '网站域名',
  // },
];

// 登录页设置 form
export const loginPageSettingSchemas: FormSchema[] = [
  {
    field: 'login.basic.mainTitle',
    component: 'Input',
    label: '登录页主标题',
    labelWidth: 140,
    helpMessage: '登录界面的主标题，默认是临床检验信息管理平台',
    colProps: { span: 15 },
  },
  {
    field: 'login.basic.subTitle',
    component: 'Input',
    label: '登录页副标题',
    labelWidth: 140,
    helpMessage:
      '登录界面的副标题，默认是Clinical Test Program Information Management Platform,ClP',
    colProps: { span: 15 },
  },
  {
    field: 'login.register.allowRegister',
    component: 'Switch',
    label: '是否允许新用户注册',
    labelWidth: 150,
    colProps: { span: 24 },
    helpMessage: '开放/关闭注册功能',
    componentProps: {
      checkedChildren: '允许',
      checkedValue: 'true',
      unCheckedChildren: '禁止',
      unCheckedValue: 'false',
    },
  },
  {
    field: 'login.sms.enabled',
    component: 'Switch',
    label: '是否启用短信登录',
    labelWidth: 150,
    colProps: { span: 24 },
    helpMessage: '开放/关闭短信登录功能',
    componentProps: {
      checkedChildren: '允许',
      checkedValue: 'true',
      unCheckedChildren: '禁止',
      unCheckedValue: 'false',
    },
  },
  {
    field: 'login.security.sliderCaptcha',
    component: 'Switch',
    label: '是否启用验证滑块',
    labelWidth: 150,
    colProps: { span: 24 },
    helpMessage: '开放/关闭登录页面的滑块验证',
    componentProps: {
      checkedChildren: '开启',
      checkedValue: 'true',
      unCheckedChildren: '关闭',
      unCheckedValue: 'false',
    },
    defaultValue: true,
  },
];

// 通知设置 form
export const noticeSettingSchemas: FormSchema[] = [
  {
    field: 'notify.basic.use',
    component: 'Input',
    label: '启用的通知事件',
    colProps: { span: 18 },
    // helpMessage: '网站的昵称',
  },
];
