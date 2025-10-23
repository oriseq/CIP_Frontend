/* eslint-disable @typescript-eslint/no-duplicate-enum-values */
import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
// import { DemoParams, DemoListGetResultModel } from './model/tableModel';

/** 弹窗类型 */
export enum MoadlType {
  ADD_PACKAGE = 'addPackage',
  MODIFY_PACKAGE = 'modifyPackage',
}

enum Api {
  PACKAGE_ALL = '/sample/combos',
  PROJECT_LIST = '/system/project/list',
  PROJECTS = '/sample/projectList',
  PROJECT_TREE = '/sample/projects',
  ADD_PACKAGE = '/system/package',
  DELETE_PACKAGE = '/system/package',
  MODIFY_PACKAGE = '/system/package',
  PACKAGE_LIST = '/system/package/list',
  USERGROUP_LIST = '/system/userGroup/groupSelect',
}

/**
 * 获取已有的全部套餐信息
 * @param params 请求
 * @returns
 */
export const getAllPackageApi = async (params) => {
  const rsp = await defHttpForRes.get({
    url: Api.PACKAGE_ALL,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getAllPackageApi-rsp:', rsp);
  return rsp;
};

/**
 * 包含项目列表
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
 * 获取套餐列表
 * @param params 请求
 * @returns
 */
export const getPackageListApi = (params) => {
  const rsp = defHttp.post({
    url: Api.PACKAGE_LIST,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getPackageListApi-rsp', rsp);
  return rsp;
};

/* 获取所有项目树
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

/** 新增套餐
 * @param params 请求
 * @returns
 */
export const addPackageApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.ADD_PACKAGE,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('addPackageApi-rsp', rsp);
  return rsp;
};

/** 修改套餐
 * @param params 请求
 * @returns
 */
export const modifyPackageInfoApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.MODIFY_PACKAGE,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('modifyPackageInfoApi-rsp', rsp);
  return rsp;
};

/** 删除套餐
 * @param params 请求
 * @returns
 */
export const deletePackageApi = (params) => {
  const rsp = defHttpForRes.delete({
    url: Api.DELETE_PACKAGE,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('deletePackageApi-rsp', rsp);
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
