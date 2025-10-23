import { defHttpForRes, defHttpOrigin } from '@/utils/http/axios';

enum Api {
  APPENDIX_FILE_LIST = '/sample/fileList',
  FILE = '/file',
  ADD_APPENDIX_OR_DELETE_FILE = '/sample/reportFile',
  FILES = '/file/getFiles',
}

/** 获取附件文件列表 */
export const getAppendixFileListApi = (params) => {
  const rsp = defHttpForRes.get({
    url: Api.APPENDIX_FILE_LIST,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  return rsp;
};

/**
 * 获取文件
 * @param params 请求
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
 * 获取多个文件
 */
export const getFiles = (params) => {
  const rsp = defHttpOrigin.post({
    url: Api.FILES,
    params,
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
 * 删除文件
 * @param 参数
 * @returns
 */
export const deleteFile = (params) => {
  const rsp = defHttpForRes.delete({
    url: Api.ADD_APPENDIX_OR_DELETE_FILE,
    params,
    headers: {
      ignoreCancelToken: true,
    },
  });
  return rsp;
};

/**
 * 新增附件文件
 * @param sampleId 样本ID
 * @param fileId 文件ID
 */
export const addAppendixFile = (sampleId: number, fileId: string) => {
  const rsp = defHttpForRes.post({
    url: Api.ADD_APPENDIX_OR_DELETE_FILE,
    params: {
      sampleId,
      fileId,
    },
    headers: {
      ignoreCancelToken: true,
    },
  });
  return rsp;
};
