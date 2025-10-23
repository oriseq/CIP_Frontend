/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
// import { DemoParams, DemoListGetResultModel } from './model/tableModel';

export enum MoadlType {
  ADD_PROJECT = 'addProject',
  APPLY_PROJECT = 'applyProject',
  MODIFY_PROJECT = 'modifyProject',
}

// enum Api {
//   PROJECTS_INFO = '/sample/sampleProjectInfo',
//   SAMPLE_INFO = '/sample/sampleInfo',
//   PROJECTS = '/sample/projectList',
//   DEMO_LIST = '/sample/sampleInformation',
//   OTHER_GROUP_USERS = '/sample/otherGroupUsers',
//   GROUP_USERS_CASCADER = '/sample/otherGroupUsersCascader',
//   SAMPLE_TRANSFER = '/sample/sampleTransfer',
//   SAMPLE_HOSTING = '/sample/sampleHosting',
//   NO_HOSTING = '/sample/noHosting',
//   PROJECT_TREE = '/sample/projects',
//   ADD_PROJECTS = '/sample/sampleProjects',
//   EDIT_PROJECT = '/sample/sampleProject',
//   UPLOAD_REPORT_DATA = '/sample/uploadReportData',
//   FILE = '/file',
// }

enum Api {
  PROJECT_LIST = '/system/innerProject/list',
  PROJECT_CLASSIFICATION = '/system/innerProject/projectClassification',
  DELETE_PROJECT = '/system/innerProject',
  UPDATE_PROJECT = '/system/innerProject',
  ADD_PROJECTS = '/system/innerProject',
  DETECT_METHOD = '/system/innerProject/detectMethod',
  CONSUMABLE_TYPE = '/system/innerProject/consumableType',
  DELIVERY_UNIT = '/sample/deliveryUnitSelect', // 获取外送单位数组
  INSTRUMENT_TYPE = '/system/instrument/simpleList', // 获取仪器类型
}

/**
 * 获取项目列表
 * @param params 请求
 * @returns
 */
export const getProjectListApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.PROJECT_LIST,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getProjectListApi-rsp: ', rsp);
  return rsp;
};

/**
 * 获取项目分类树
 * @param params 请求
 * @returns
 */
export const getProjectTreeApi = (params) => {
  const rsp = defHttp.get({
    url: Api.PROJECT_CLASSIFICATION,
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
 * 删除项目
 * @param params 请求
 * @returns
 */
export const deleteProjectApi = (params) => {
  const rsp = defHttpForRes.delete({
    url: Api.DELETE_PROJECT,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('deleteProjectApi-rsp', rsp);
  return rsp;
};

/**
 * 更新项目
 * @param params 请求
 * @returns
 */
export const updateProjectApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.UPDATE_PROJECT,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('modifyPriceApi-rsp', rsp);
  return rsp;
};

/** 新增项目 */
export const addProjectApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.ADD_PROJECTS,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  return rsp;
};

/** 获取检测方法list */
export const detectMethodApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.DETECT_METHOD,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  return rsp;
};

/** 获取耗材类型list */
export const consumableTypeApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.CONSUMABLE_TYPE,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  return rsp;
};

/**
 * 获取外送单位
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
 * 获取仪器类型
 */
export const InstrumentTypeApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.INSTRUMENT_TYPE,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  console.log('InstrumentTypeApi-rsp', rsp);
  return rsp;
};
