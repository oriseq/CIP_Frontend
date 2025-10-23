import { defHttp, defHttpForRes } from '@/utils/http/axios';
// import { DemoParams, DemoListGetResultModel } from './model/tableModel';

enum Api {
  DEMO_LIST = '/system/user/list',
  GROUP_SELECT = '/system/userGroup/groupSelect',
  MSG_GROUP_LIST = '/system/user/msgGroup',
  GROUP_USER_CASCADER = '/sample/groupUsersCascader',
  UPDATE_MSG_GROUP = '/system/user/msgGroup'
}

/**
 * @description: Get sample list value
 */

export const userListApi = (params) => {
  const rsp = defHttp.get({
    url: Api.DEMO_LIST,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

export const groupSelectApi = (params) => {
  return defHttp.get({
    url: Api.GROUP_SELECT,
    params,
  });
};

/** 获取接收通知组-GET */
export const msgGroupListApi = (params) => {
  return defHttp.get({
    url: Api.MSG_GROUP_LIST,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
};

/** 获取其它组用户级联 */
export const userGroupCascaderApi = (params) => {
  const rsp = defHttp.get({
    url: Api.GROUP_USER_CASCADER,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('userGroupCascaderApi-rsp', rsp);

  return rsp;
};

/**
 * 更新接收通知组
 * @param params
 * @returns
 */
export const UpdateMsgGroupApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.UPDATE_MSG_GROUP,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('UpdateMsgGroupApi-rsp', rsp);
  return rsp;
};

// type DemoListGetResultModel = BasicFetchResult<DemoListItem>;
// interface DemoListItem {
//   id: string;
//   beginTime: string;
//   endTime: string;
//   address: string;
//   name: string;
//   no: number;
//   status: number;
// }

// interface BasicFetchResult<T> {
//   items: T[];
//   total: number;
// }
// type DemoParams = Partial<BasicPageParams>;
// interface BasicPageParams {
//   page: number;
//   pageSize: number;
// }
