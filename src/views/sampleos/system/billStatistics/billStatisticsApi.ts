import { defHttpForRes } from '@/utils/http/axios';

enum Api {
  TABLE_DATA = '/billStatistics/list',
  NOT_INTERNAL_GROUP = '/system/userGroup/groupSelect',
}

/** 获取账单表格数据 */
export const TableDataApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.TABLE_DATA,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getTableDataApi-rsp', rsp);
  return rsp;
};

/** 获取非内部组单位 */
export const getNotInternalGroupApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.NOT_INTERNAL_GROUP,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });

  // console.log('getUserGroupInfoApi-rsp', rsp);
  return rsp;
};
