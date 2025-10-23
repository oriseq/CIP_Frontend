<template>
  <BasicModal v-bind="$attrs" @register="registerModal" :title="getTitle" @ok="handleSubmit">
    <BasicTree
      v-model:checkedKeys="checkedKeys"
      :treeData="treeDataApi"
      checkable
      toolbar
      :fieldNames="{ title: 'permissionName', key: 'id' }"
      title="权限分配"
      v-show="!recordDataIsSuper"
      ref="treeRef"
    />
  </BasicModal>
  <!-- <a-button type="primary" preIcon="mdi:page-next-outline" @click="console.log(getExpandedKeys())">
    测试
  </a-button> -->
</template>
<script lang="ts" setup>
  import { ref, computed, unref, watch, nextTick } from 'vue';
  import { BasicModal, useModalInner } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { useMessage } from '@/hooks/web/useMessage';
  // import { accountFormSchema } from './account.data';
  import type { TreeProps } from 'ant-design-vue';
  import { BasicTree, TreeItem } from '@/components/Tree';
  import permission from '@/router/routes/modules/demo/permission';
  import { useUserStore } from '@/store/modules/user';
  import { groupSelectApi } from '@/views/sampleos/system/user/userApi';

  defineOptions({ name: 'PermissionModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const userStore = useUserStore();
  const { info, success, warning, error } = createMessage;

  // console.log('userStore.userInfo:', userStore.userInfo);

  const rowId = ref('');

  const treeRef = ref(null);
  /* 获取权限树 */
  const treeDataApi = ref([]);
  async function setPermissions(id) {
    // 发请求
    const data = await defHttpForRes.get({
      url: '/getPermissionList',
      params: { id: id },
    });
    // console.log('data', data);
    // console.log('treeDataApi:', treeDataApi);
    if (data.success) {
      // success(data.message);
      treeDataApi.value = data.result.permissionList;
      // checkedKeys.value = { checked: data.result.permissionIds, halfChecked: [] };
      checkedKeys.value = [...data.result.permissionIds];
      nextTick(() => {
        treeRef.value.expandAll(true);
      });

      // return data.result;
    }
  }

  const checkedKeys = ref();
  watch(checkedKeys, () => {
    console.log('checkedKeys', checkedKeys.value);
  });

  const recordDataIsSuper = ref(true);
  const [registerModal, { setModalProps, closeModal, changeLoading }] = useModalInner(
    async (data) => {
      changeLoading(true);
      // console.log('useModalInner:data:', data);

      // setModalProps({ confirmLoading: false });
      rowId.value = data.id;
      recordDataIsSuper.value = data.isSuper;
      // 得到权限
      await setPermissions(data.id);

      changeLoading(false);
    },
  );

  const getTitle = computed(() => '权限修改');

  async function handleSubmit() {
    try {
      setModalProps({ confirmLoading: true });
      // console.log('rowId:', rowId);
      // console.log('checkedKeys:', checkedKeys.value);
      // const ancestors = findAncestors(treeDataApi.value, checkedKeys.value);
      // console.log("ancestors: ", ancestors);
      let params = {
        id: rowId.value,
        permissionIds: checkedKeys.value
          ? findAncestors(treeDataApi.value, checkedKeys.value)
          : undefined,
      };
      // console.log('req.params:', params);
      // 发请求新增
      const data = await defHttpForRes.post({
        url: '/system/user/permission',
        params: params,
      });
      // console.log('data', data);
      if (data.success) {
        success(data.message);
      } else {
        const megdetail = data.result.join(',');
        error(megdetail);
        return;
      }
      closeModal();
      // emit('success', { isUpdate: unref(isUpdate), values: { ...values, id: rowId.value } });
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /**
   * 使用id list获取 所有祖id和自身id，目的是为了能够提交父菜单的权限
   * @param data 树
   * @param targetIds id list
   */
  function findAncestors(data, targetIds) {
    // 构建节点映射
    const nodeMap = buildNodeMap(data);
    // console.log('nodeMap: ', nodeMap);

    /**
     * 构建所有node
     * @param data
     * @param map
     */
    function buildNodeMap(data, map = new Map()) {
      data.forEach((node) => {
        map.set(node.id, node);
        if (node.children) {
          buildNodeMap(node.children, map);
        }
      });
      return map;
    }

    // 递归查找祖先
    function findAncestor(nodeId, ancestors = []) {
      const node = nodeMap.get(nodeId);
      if (!node) return ancestors; // 节点不存在
      ancestors.push(node);
      if (node.parentId) {
        return findAncestor(node.parentId, [...ancestors]);
      }
      return ancestors;
    }

    // 初始化结果数组
    const result = [];
    // 遍历目标 ID，查找每个节点的祖先
    targetIds.forEach((id) => {
      result.push(...findAncestor(id));
    });

    // 去重
    // const uniqueResult = [...new Set(result.map(node => node.id))].map(id => nodeMap.get(id));
    const uniqueResult = [...new Set(result.map((node) => node.id))];
    return uniqueResult;
  }
</script>
