import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
// import { DemoParams, DemoListGetResultModel } from './model/tableModel';

export enum MoadlType {
  SAMPLE_TRANSFER = 'SampleTransfer',
  SAMPLE_HOSTING = 'SampleHosting',
}

enum Api {
  SAMPLE_INFORMATION = '/sample/sampleInformation',
  ESCROW_SAMPLE_INFORMATION_LIST = '/sample/escrowSampleInformation',
  SAMPLE_LOGISTICS = '/sample/sampleLogistics',
  OTHER_GROUP_USERS = '/sample/otherGroupUsers',
  GROUP_USERS_CASCADER = '/sample/otherGroupUsersCascader',
  SAMPLE_TRANSFER = '/sample/sampleTransfer',
  SAMPLE_HOSTING = '/sample/sampleHosting',
  NO_HOSTING = '/sample/noHosting',
  PROJECTS = '/sample/projectList',
  SAMPLE = '/sample/importSample',
  PROJECT_TREE = '/sample/projects',
  UPDATE_SAMPLE_INFORMATION = '/sample/sampleInfo',
  USERGROUP_LIST = '/system/userGroup/groupSelect',
  FILE = '/file',
}

/**
 * @description: Get sample list value
 */

export const listApi = (params) => {
  const rsp = defHttp.post({
    url: Api.ESCROW_SAMPLE_INFORMATION_LIST,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

export const deleteApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.SAMPLE_INFORMATION,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

export const addSampleLogisticsApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.SAMPLE_LOGISTICS,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

/**
 * 取其他用户
 * @param params
 * @returns
 */
export const otherGroupUsers = (params) => {
  const rsp = defHttp.get({
    url: Api.OTHER_GROUP_USERS,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};
/**
 * 取其他用户
 * @param params
 * @returns
 */
export const groupUsersCascader = (params) => {
  const rsp = defHttp.get({
    url: Api.GROUP_USERS_CASCADER,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

/**
 * 样本过户
 * @param params 请求
 * @returns
 */
export const sampleTransferApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.SAMPLE_TRANSFER,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

/**
 * 样本代管
 * @param params 请求
 * @returns
 */
export const sampleHostingApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.SAMPLE_HOSTING,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};
/**
 * 取消代管
 * @param params 请求
 * @returns
 */
export const noHostingApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.NO_HOSTING,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};
/**
 * 获取项目树
 * @param params 请求
 * @returns
 */
export const getProjectListApi = async (params) => {
  const rsp = await defHttp.get({
    url: Api.PROJECTS,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

/**
 * 导入样本信息
 * @param params 请求
 * @returns
 */
export const improtSampleApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.SAMPLE,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

/**
 * 获取所有项目信息树
 * @param params 请求
 * @returns
 */
export const getProjectTreeApi = (params) => {
  const rsp = defHttp.get({
    url: Api.PROJECT_TREE,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};
/**
 * 更新样本信息
 * @param params 请求
 * @returns
 */
export const updateSampleInformationApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.UPDATE_SAMPLE_INFORMATION,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

/** 获取用户组名信息 */
export const getUserGroupInfoApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.USERGROUP_LIST,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getUserGroupInfoApi-rsp', rsp);
  return rsp;
};

/**
 * 获取文件
//  * @param params 请求
 * @returns
 */
export const getFile = (id) => {
  const rsp = defHttpOrigin.get({
    url: Api.FILE + '/' + id,
    // params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
    responseType: 'blob', // 设置响应类型为 blob
  });
  // console.log('rsp:', rsp);

  return rsp;
};
