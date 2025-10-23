import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';
// import { DemoParams, DemoListGetResultModel } from './model/tableModel';

export enum MoadlType {
  MODIFY_STATUS = 'ModifySampleStatus',
  SAMPLE_TRANSFER = 'SampleTransfer',
  SAMPLE_HOSTING = 'SampleHosting',
  CHEAK_LOGISITICS = 'CheckLogistics',
}

enum Api {
  DEMO_LIST = '/sample/sampleInformation',
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
  LOGISITICS_INFO = '/sample/logisticsInformation',
  FILE = '/file',
  UPLOAD_REPORT = '/sample/sampleReportId',
  USERGROUP_LIST = '/system/userGroup/groupSelect',
  SELECTED_PROJECTS = '/sample/sampleProjectSelect',
  SAMPLE_BASIC_INFO = '/sampleProject/sampleInfo',
  MODIFY_SAMPLE_STTAUS = '/sample/changeSampleProjectsStatus',
  GET_OUTPUT_DATA = '/sample/exportSampleInformation', // 获取可导出表格的数据
  SUMMARY_OF_INSPECTION_TASKS = '/sample/summaryOfInspectionTasks',
  INSTRUMENT_TYPE = '/system/instrument/simpleList', // 获取仪器类型
  DELIVERY_UNIT = '/sample/deliveryUnitSelect', // 获取外送单位下拉选项
  INSTRUMENT_EXPORT_COLUMN = '/system/instrument/', // 根据仪器ID获取可导出的列
}

/**
 * @description: Get sample list value
 */

export const listApi = (params) => {
  const rsp = defHttp.post({
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

export const deleteApi = (params) => {
  const rsp = defHttpForRes.put({
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

/**
 * 获取物流信息
 * @param params 请求
 * @returns
 */
export const logisticsInfoApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.LOGISITICS_INFO,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('logisticsInfoApi-rsp', rsp);
  return rsp;
};

/**
 * 获取文件
//  * @param params 请求
 * @returns
 */
export const getFile = (id) => {
  // 重试机制设置为1次
  const retryRequest = {
    isOpenRetry: true,
    count: 1,
    waitTime: 1000,
  };
  const rsp = defHttpOrigin.get(
    {
      url: Api.FILE + '/' + id,
      // params,
      headers: {
        // @ts-ignore
        ignoreCancelToken: true,
      },
      responseType: 'blob', // 设置响应类型为 blob
    },
    { retryRequest, joinTime: false },
  );
  // console.log('rsp:', rsp);

  return rsp;
};

/**
 * 上传报告数据
 * @param params 请求
 * @returns
 */
export const uploadReportApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.UPLOAD_REPORT,
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
 * 获取当前样本的项目列表，用于上传报告时勾选
 * @param params 请求
 * @returns
 */
export const getSelectProjectApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.SELECTED_PROJECTS,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getProjectListApi-rsp: ', rsp);
  return rsp;
};

/**
 * 从样本基本信息中获取项目状态统计
 * @id 样本id号
 */
export const getSampleProjStatusApi = (id) => {
  const rsp = defHttp.get({
    url: Api.SAMPLE_BASIC_INFO + '/' + id,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
    // responseType: 'blob', // 设置响应类型为 blob
  });

  return rsp.then((val) => {
    return val.projectStatusStatistics;
  });
};

/**
 * 修改样本项目状态
 */
export const modifySampleStatusApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.MODIFY_SAMPLE_STTAUS,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('modifySampleStatusApi-rsp', rsp);
  return rsp;
};

/**
 * 用于获取表格数据
 */
export const getSampleFormApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.GET_OUTPUT_DATA,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  console.log('getSampleFormApi-rsp.result', rsp);
  return rsp;
};

/**
 * 获取汇总 送检任务汇总
 * @param params 请求
 * @returns
 */
export const summaryOfInspectionTasksApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.SUMMARY_OF_INSPECTION_TASKS,
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
  // console.log('InstrumentTypeApi-rsp', rsp);
  return rsp;
};

/**
 * 获取外送单位
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
 * 根据仪器ID获取导出列
 */
export const getExportColumnApi = (id) => {
  const rsp = defHttpForRes.get({
    url: Api.INSTRUMENT_EXPORT_COLUMN + id,
    headers: {
      ignoreCancelToken: true,
    },
  });
  console.log('getExportColumnApi-rsp', rsp);
  return rsp;
};
