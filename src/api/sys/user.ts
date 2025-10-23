import { defHttp, defHttpForRes, formHttp } from '@/utils/http/axios';
import { LoginParams, LoginResultModel, GetUserInfoModel } from './model/userModel';

import { ErrorMessageMode } from '#/axios';

enum Api {
  Login = '/login',
  SmsLogin = '/smsLogin',
  Logout = '/logout',
  GetUserInfo = '/getUserInfo',
  GetPermCode = '/getPermCode',
  TestRetry = '/testRetry',
  GetSmsVerificationCode = '/smsVerificationCode',
  // 获取验证码：用于重置密码
  GetVerificationCode = '/verificationCode',
  Register = '/regist',
  ReSetPasswd = '/resetPasswd',
}

/**
 * @description: user login api
 */
export function loginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<LoginResultModel>(
    {
      url: Api.Login,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: user login api
 */
export function smsLoginApi(params: LoginParams, mode: ErrorMessageMode = 'modal') {
  return defHttp.post<LoginResultModel>(
    {
      url: Api.SmsLogin,
      params,
    },
    {
      errorMessageMode: mode,
    },
  );
}

/**
 * @description: getUserInfo
 */
export function getUserInfo() {
  return defHttp.get<GetUserInfoModel>({ url: Api.GetUserInfo }, { errorMessageMode: 'none' });
}

export function getPermCode() {
  return defHttp.get<string[]>({ url: Api.GetPermCode });
}

export function doLogout() {
  return defHttp.get({ url: Api.Logout });
}

export function testRetry() {
  return defHttp.get(
    { url: Api.TestRetry },
    {
      retryRequest: {
        isOpenRetry: true,
        count: 5,
        waitTime: 1000,
      },
    },
  );
}

/**
 * 获取短信验证码
 * @param params
 */
export function getSmsVerificationCode(params) {
  return formHttp.get({ url: Api.GetSmsVerificationCode, params });
}

/**
 * 获取短信验证码,用于重置密码
 * @param params
 */
export function getVerificationCode(params) {
  return formHttp.get({ url: Api.GetVerificationCode, params });
}

/**
 * 注册
 * @param params
 */
export function register(params) {
  return defHttpForRes.post({ url: Api.Register, params });
}

/**
 * 重置密码
 * @param params
 */
export function reSetPasswd(params) {
  return defHttpForRes.post({ url: Api.ReSetPasswd, params });
}
