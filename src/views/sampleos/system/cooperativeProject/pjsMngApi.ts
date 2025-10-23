/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
// import { DemoParams, DemoListGetResultModel } from './model/tableModel';

export enum MoadlType {
  ADD_PROJECT = 'addProject',
  EDIT_PROJECT = 'editProject',
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
  // PROJECTS_INFO = '/sample/sampleProjectInfo',
  // SAMPLE_INFO = '/sample/sampleInfo',
  // DEMO_LIST = '/sample/sampleInformation',
  // OTHER_GROUP_USERS = '/sample/otherGroupUsers',
  // GROUP_USERS_CASCADER = '/sample/otherGroupUsersCascader',
  // NO_HOSTING = '/sample/noHosting',
  // EDIT_PROJECT = '/sample/sampleProject',
  PROJECT_TREE = '/sample/projects',
  ALL_PROJECT_TREE = '/sample/AllProjects',
  PROJECTS = '/sample/projectList',
  BELONG_PACKAGE = '/system/project/belongingPackageCascader',
  PROJECT_LIST = '/system/project/list',
  MODIFY_PRICE = '/system/project',
  DELETE_PROJECT = '/system/project',
  APPLY_PROJECT = '/system/project/projectApplication',
  USERGROUP_LIST = '/system/userGroup/groupSelect',
  ADD_PROJECTS = '/system/project',
  PROJECT_BY_GROUP = '/system/project/projectIdsByGroup',
  DEFAULT_DELIVERY = '/sample/deliveryUnitSelect',
}

/**
 * 获取项目列表
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
    url: Api.ALL_PROJECT_TREE,
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
 * 获取项目列表
 * @param params 请求
 * @returns
 */
export const getSystemProjectListApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.PROJECT_LIST,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getSystemProjectListApi-rsp: ', rsp);
  return rsp;
};

/**
 * 获取分组下的套餐
 * @param params 请求
 * @returns
 */
export const getBelongPackageCascaderApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.BELONG_PACKAGE,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('getBelongPackageCascaderApi-rsp:', rsp);

  return rsp;
};

/**
 * 修改价格
 * @param params 请求
 * @returns
 */
export const modifyPriceApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.MODIFY_PRICE,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('modifyPriceApi-rsp', rsp);
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

/** 申请项目 */
export const applyProjectApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.APPLY_PROJECT,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('applyProjectApi-rsp', rsp);
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

/** 新增项目 */
export const addProjectApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.ADD_PROJECTS,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('addprojectApi-rsp', rsp);
  return rsp;
};

/** 通过用户组id获取项目ids */
export const getProjectIdsbyGroup = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.PROJECT_BY_GROUP,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getProjectIdsbyGroup-rsp', rsp);
  return rsp;
};

/** 获取默认外送单位下拉选项 */
export const getDefaultDeliveryApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.DEFAULT_DELIVERY,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getDefaultDeliveryApi-rsp', rsp);
  return rsp;
};
