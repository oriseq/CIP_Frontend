import { defHttpForRes } from '@/utils/http/axios';

enum Api {
  TABLE_DATA = '/system/instrument/list',
  INSTRUMENT_LIST = '/system/instrument/simpleList',
  DELETE_ROW = '/system/instrument/',
  ADD_ROW = '/system/instrument',
  MODIFY_ROW = '/system/instrument',
}

/**
 * 获取表格数据
 * @param params
 * @returns
 */
export const getTableDataApi = async (params) => {
  const rsp = await defHttpForRes.post({
    url: Api.TABLE_DATA,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('getTableDataApi-rsp', rsp);
  return rsp;
};

/**
 * 新增行
 */
export const addTableRowApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.ADD_ROW,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('addTableRowApi-rsp', rsp);
  return rsp;
};

/**
 * 修改行
 */
export const modifyTableRowApi = (params) => {
  const rsp = defHttpForRes.put({
    url: Api.MODIFY_ROW,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('modifyTableRowApi-rsp', rsp);
  return rsp;
};

/**
 * 删除行
 */
export const deleteTableRowApi = (id) => {
  const rsp = defHttpForRes.delete({
    url: Api.DELETE_ROW + id,
    headers: {
      ignoreCancelToken: true,
    },
  });
  // console.log('deleteTableRowApi-rsp', rsp);
  return rsp;
};
