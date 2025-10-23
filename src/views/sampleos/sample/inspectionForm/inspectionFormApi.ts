import { defHttp, defHttpForRes, defHttpOrigin } from '@/utils/http/axios';

enum Api {
  USERGROUP_LIST = '/system/userGroup/groupSelect',
}

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

/** 项目树父子节点的勾选 */
export function RunCheckTreeBox(treeData, checkedKeys) {
  // 从父节点中，过滤出含子节点的树对象（方式1）
  treeData.splice(0, treeData.length, ...treeData.filter((fn) => fn.children.length > 0));
  for (const father of treeData) {
    // console.log('father-node', father);
    // 将父节点中没有子节点的设置为不可勾选（方式2）
    // if (father.children.length === 0) {
    //   father.disableCheckbox = true;
    //   continue;
    // }
    // 检查子节点是否全部被勾选
    let sonCheck = true;
    father.children.forEach((son) => {
      // console.log('son-node', son);
      if (!son?.disableCheckbox) {
        sonCheck = false;
      }
      // 检查孙节点是否全部被勾选
      let grandsonCheck = true;
      son.children.forEach((grandson) => {
        // console.log('grandson-node', grandson);
        if (!grandson?.disableCheckbox) {
          grandsonCheck = false;
        }
      });
      if (grandsonCheck) {
        son.disableCheckbox = true;
        checkedKeys.value.push(son.id);
      } else {
        son.disableCheckbox = false;
        checkedKeys.value = checkedKeys.value.filter((id) => id != son.id);
      }
    });
    if (sonCheck) {
      father.disableCheckbox = true;
      checkedKeys.value.push(father.id);
    } else {
      father.disableCheckbox = false;
      checkedKeys.value = checkedKeys.value.filter((id) => id != father.id);
    }
  }
  return [treeData, checkedKeys];
}
