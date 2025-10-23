import { defHttpForRes } from '@/utils/http/axios';

enum Api {
  // 获取所有账单
  TABLE_DATA = '/itemizedBill/list',
  NOT_INTERNAL_GROUP = '/system/userGroup/groupSelect',
}

/** 获取账单明细表 */
export const TableDataApi = (params) => {
  const rsp = defHttpForRes.post({
    url: Api.TABLE_DATA,
    params,
    headers: { ignoreCancelToken: true },
  });

  return rsp;
};

/** 送检单位下拉列表 */
export const getNotInternalGroupApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.NOT_INTERNAL_GROUP,
    params,
    headers: { ignoreCancelToken: true },
  });

  return rsp;
};
