import { defHttp } from '@/utils/http/axios';
// import { DemoParams, DemoListGetResultModel } from './model/tableModel';

enum Api {
  DEMO_LIST = '/system/userGroup/list',
}

/**
 * @description: Get sample list value
 */

export const userGroupListApi = (params) => {
  const rsp = defHttp.get({
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
// type DemoListGetResultModel = BasicFetchResult<DemoListItem>;
// interface DemoListItem {
//   id: string;
//   beginTime: string;
//   endTime: string;
//   address: string;
//   name: string;
//   no: number;
//   status: number;
// }

// interface BasicFetchResult<T> {
//   items: T[];
//   total: number;
// }
// type DemoParams = Partial<BasicPageParams>;
// interface BasicPageParams {
//   page: number;
//   pageSize: number;
// }
