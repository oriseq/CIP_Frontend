import { defHttp, defHttpOrigin, defHttpForRes } from '@/utils/http/axios';
// import { DemoParams, DemoListGetResultModel } from './model/tableModel';

enum Api {
  TABLE_DATA = '/system/deliveryUnit/list', // 表格数据接口
  DELIVERY_UNIT = '/sample/deliveryUnitSelect', // 获取外送单位数组
  ADD_INFO = '/system/deliveryUnit', // 新增
  MODIFY_INFO = '/system/deliveryUnit', // 修改
  DELETE_INFO = '/system/deliveryUnit',
}

export enum ModalType {
  ADD_DELIVERY = '新增外送',
  EDIT_INFO = '编辑信息',
}

/**
 * 表格数据
 */
export const TableDataApi = async (params) => {
  const rsp = await defHttp.post({
    url: Api.TABLE_DATA,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('TableDataApi-rsp', rsp);
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
 * 新增信息
 */
export const addInfoApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.ADD_INFO,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('addDeliveryUnitApi-rsp', rsp);
  return rsp;
};

/**
 * 修改信息
 */
export const modifyInfoApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.MODIFY_INFO,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('modifyDeliveryUnitApi-rsp', rsp);
  return rsp;
};

/**
 * 删除信息
 */
export const delInfoApi = (params) => {
  const rsp = defHttpForRes.delete({
    url: Api.DELETE_INFO,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('delInfoApi-rsp', rsp);
  return rsp;
};
