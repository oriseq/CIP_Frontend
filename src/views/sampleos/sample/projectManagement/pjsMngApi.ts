import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
// import { DemoParams, DemoListGetResultModel } from './model/tableModel';

export enum MoadlType {
  ADD_PROJECT = 'addProject',
  EDIT_PROJECT = 'editProject',
  SAMPLE_TRANSFER = 'SampleTransfer',
  SAMPLE_HOSTING = 'SampleHosting',
  REVIEW_RESULTS = 'ReviewResults',
  CHEAK_LOGISITICS = 'CheckLogistics',
}

enum Api {
  PROJECTS_INFO = '/sampleProject/sampleProjectInfo',
  SAMPLE_INFO = '/sampleProject/sampleInfo',
  IS_ESCROW_SAMPLE = '/sampleProject/isEscrowSample',
  PROJECTS = '/sample/projectList',
  DEMO_LIST = '/sample/sampleInformation',
  OTHER_GROUP_USERS = '/sample/otherGroupUsers',
  GROUP_USERS_CASCADER = '/sample/otherGroupUsersCascader',
  SAMPLE_TRANSFER = '/sample/sampleTransfer',
  SAMPLE_HOSTING = '/sample/sampleHosting',
  NO_HOSTING = '/sample/noHosting',
  PROJECT_TREE = '/sample/projects',
  ADD_PROJECTS = '/sampleProject/sampleProjects',
  EDIT_PROJECT = '/sampleProject/sampleProject',
  UPLOAD_REPORT_DATA = '/sampleProject/uploadReportData',
  FILE = '/file',
  REPORT_RESULT = '/sampleProject/reportResultsSelect',
  REVIEW_RESULT = '/sampleProject/review',
  DELIVERY_UNIT = '/sample/deliveryUnitSelect',
  DELIVERY_PERSON = '/sampleProject/deliveryPersonSelect',
}

/**
 * @description: Get sample list value
 */

export const sampleInfoApi = (id, params) => {
  const rsp = defHttp.get({
    url: Api.SAMPLE_INFO + '/' + id,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

export const isEscrowSampleApi = (id, params) => {
  const rsp = defHttp.get({
    url: Api.IS_ESCROW_SAMPLE + '/' + id,
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  // console.log('rsp:', rsp);

  return rsp;
};

export const projectsInfoApi = (params) => {
  const rsp = defHttp.post({
    url: Api.PROJECTS_INFO,
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
    url: Api.PROJECTS_INFO,
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
 * 更新项目信息
 * @param params 请求
 * @returns
 */
export const updateProjectsApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.ADD_PROJECTS,
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
 * 更新项目状态
 * @param params 请求
 * @returns
 */
export const updateProjectStatusApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.EDIT_PROJECT,
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
 * 上传报告数据
 * @param params 请求
 * @returns
 */
export const uploadReportDataApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.UPLOAD_REPORT_DATA,
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

/**
 * 报告结果下拉选项
 * @param params
 * @returns
 */
export const getReportResultSelectApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.REPORT_RESULT,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('getReportResultSelectApi-rsp:', rsp);

  return rsp;
};

/**
 * 复核结果
 * @param params
 * @returns
 */
export const ReviewResultApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.REVIEW_RESULT,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('ReviewResultApi-rsp', rsp);
  return rsp;
};

/**
 * 外送单位
 * @param params
 * @returns
 */
export const DeliveryUnitApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.DELIVERY_UNIT,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('DeliveryUnitApi-rsp', rsp);
  return rsp;
};

/**
 * 外送人
 * @param params
 * @returns
 */
export const DeliveryPersonApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.DELIVERY_PERSON,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('DeliveryPersonApi-rsp', rsp);
  return rsp;
};
