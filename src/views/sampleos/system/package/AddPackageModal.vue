<template>
  <BasicModal
    v-bind="$attrs"
    @register="registerModal"
    :title="getTitle"
    :minHeight="50"
    width="800px"
    @ok="handleSubmit"
  >
    <BasicForm @register="registerForm">
      <template #customSlot="{ model, field }">
        <div>
          <a-row :gutter="[8, 8]">
            <a-col :span="21">
              <a-input-search
                v-model:value="searchValue"
                style="margin-bottom: 8px"
                placeholder="搜索"
              />
            </a-col>
            <a-col :span="3">
              <a-button type="primary" @click="handleSortPanel()">排序</a-button>
            </a-col>
          </a-row>

          <a-tree
            :autoExpandParent="autoExpandParent"
            v-model:expandedKeys="expandedKeys"
            v-model:selectedKeys="selectedKeys"
            v-model:checkedKeys="checkedKeys"
            checkable
            :tree-data="treeData"
            :field-names="fieldNames"
            @expand="onExpand"
            @select="handleSelect"
          >
            <template #title="{ name, id, status, disableCheckbox }">
              <span v-if="name.indexOf(searchValue) > -1">
                {{ name.substring(0, name.indexOf(searchValue)) }}
                <span style="color: #f50">{{ searchValue }}</span>
                {{ name.substring(name.indexOf(searchValue) + searchValue.length) }}
              </span>
              <span v-else>{{ name }}</span>
            </template>
          </a-tree></div
        >
      </template>
    </BasicForm>
    <SortProjectModal @register="sortprojectmodal" :visible="false" @success="sortSuccess" />
  </BasicModal>
  <!-- <a-button type="primary" preIcon="mdi:page-next-outline" @click="console.log(getExpandedKeys())">
    测试
  </a-button> -->
</template>
<script lang="ts" setup>
  // import { accountFormSchema } from './account.data';
  // import { BasicTree, TreeItem } from '@/components/Tree';
  // import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  // import { defineDocExtension } from 'codemirror';
  // import { getTagColor, sampleProjectStatusMapping } from '../inspectionMission/fieldMapping';
  // import { Option } from 'vxe-table';
  // import { defHttpForRes, defHttp } from '@/utils/http/axios';
  import { ref, computed, unref, watch, reactive } from 'vue';
  import { BasicModal, useModalInner, useModal } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { useMessage } from '@/hooks/web/useMessage';
  import type { TreeProps } from 'ant-design-vue';
  import type { FormSchema } from '@/components/Form';
  import {
    // otherGroupUsers,
    // sampleTransferApi,
    // sampleHostingApi,
    // groupUsersCascader,
    // updateProjectsApi,
    // addProjectApi,
    // updateProjectStatusApi,
    MoadlType,
    addPackageApi,
    getProjectTreeApi,
  } from './pkgMngApi';
  import { treeData } from './data';
  import { useGo, useRedo } from '@/hooks/web/usePage';
  import { useTabs } from '@/hooks/web/useTabs';
  import { RunCheckTreeBox } from '../../sample/inspectionForm/inspectionFormApi';
  import SortProjectModal from './SortProjectModal.vue';

  const go = useGo();
  const redo = useRedo();
  const { closeCurrent } = useTabs();

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const moadlType = ref();
  const seledIds = ref([]);
  const isSuper = ref();
  const packageName = ref();

  /** 项目树 */
  const defaultexpandNode: string[] = [];
  const expandedKeys = ref<string[]>(defaultexpandNode);
  const selectedKeys = ref<string[]>([]);
  const checkedKeys = ref<string[]>([]);
  const fieldNames: TreeProps['fieldNames'] = {
    title: 'name',
    key: 'id',
  };

  const searchValue = ref<string>('');
  const autoExpandParent = ref<boolean>(true);

  let FirstNodeList = ref<string[]>([]);
  let SecondNodeList = ref<string[]>([]);

  // const selectedIds = ref<number[]>([]);

  /** 弹窗标题 */
  const getTitle = computed(() => {
    // console.log('!unref(moadlType), ', !unref(moadlType));
    switch (unref(moadlType)) {
      case MoadlType.ADD_PACKAGE:
        return '新增套餐';
      default:
        return '';
    }
  });

  /** 新增套餐表单内容 */
  const AddPackageSchemas: FormSchema[] = [
    {
      field: 'packageName',
      label: '套餐名',
      component: 'Input',
      required: true,
    },
    {
      field: 'remarks',
      label: '备注',
      component: 'InputTextArea',
    },
    {
      field: 'projectIds',
      label: '所有项目',
      slot: 'customSlot',
    },
  ];

  /** 弹窗表单 */
  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 22 },
    schemas: AddPackageSchemas,
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  /** 弹窗数据传输 */
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 参数设置
    moadlType.value = data?.moadlType;
    // console.log('moadlType.value:', moadlType.value); // "addPackage"
    seledIds.value = data?.projectIds;
    // console.log('seledIds.value:', seledIds.value); // undefined
    isSuper.value = data?.isSuper;
    // console.log('isSuper:', isSuper.value); // undefined
    packageName.value = data?.packageName;
    // console.log('packageName.value:', packageName.value); // undefined

    // 显示方框
    updateSchema([
      {
        field: 'addPackage',
        ifShow: data?.moadlType == MoadlType.ADD_PACKAGE,
      },
    ]);
    // console.log('useModalInner:data:', data);

    // 新增套餐弹窗
    if (moadlType.value == MoadlType.ADD_PACKAGE) {
      // 1. 项目树获取
      const projectTree = await getProjectTreeApi(null);
      treeData.splice(0, treeData.length, ...projectTree);
      // 查看项目树
      // console.log('projectTree', projectTree);
      // 2. 获取项目树中，取出一级二级节点id为字符串的id，组成列表用于eexpandedKeys，使得树默认展开
      projectTree.forEach((item_parent) => {
        defaultexpandNode.push(item_parent.id);
        // 获取1级节点
        FirstNodeList.value.push(item_parent.id);
        if (item_parent.children.length > 0) {
          let ArrayChild = item_parent.children;
          ArrayChild.forEach((item_child) => {
            typeof item_child.id == 'string' ? defaultexpandNode.push(item_child.id) : null;
          });
        }
      });
      SecondNodeList.value = defaultexpandNode.filter((id) => !FirstNodeList.value.includes(id));
      // 打开窗口，复原勾选树状态
      checkedKeys.value = [];
    }

    resetFields();
    setModalProps({ confirmLoading: false });
  });

  /** 提交表单 */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // console.log('values:', values);
      // console.log('seledIds:', seledIds);

      // 新增套餐
      if (moadlType.value == MoadlType.ADD_PACKAGE) {
        // 1-1. 获取表格已有套餐名或id
        const foundObjects = getSelectedObject();
        // console.log('foundObjects: ', foundObjects); // [{id: 120, name: '抗精子抗体定量（IgG）', status: 2, consumableType: '黄头管'}]
        const data = foundObjects.map((item) => item.id);

        if (data.length == 0) {
          warning('项目未勾选，无法新增套餐');
        } else {
          // 1-2. 获取填写的套餐名
          const formData = {
            packageName: values.packageName,
            projectIds: data,
            remarks: values.remarks,
          };
          // console.log('formData', formData);

          // 2. 发送新增套餐请求
          const response = await addPackageApi(formData);
          // console.log('response: ', response);
          // 3. 根据请求结果，前端弹窗输出
          if (response.success) {
            success(response.message);
            closeModal();
            emit('success');
          } else {
            error(response.message);
          }
        }
      }
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /**
   * 得到用户勾选的项目对象
   */
  function getSelectedObject() {
    let foundObjects = getObjectsByIds(treeData, checkedKeys.value);
    // 只保留项目数据
    foundObjects = foundObjects
      .filter((item) => item.status)
      .map((item) => ({
        ...item,
        // projectName: item.name,
      }));
    return foundObjects;
  }
  function getObjectsByIds(data, ids) {
    return ids.reduce((result, id) => {
      const foundObject = findObjectById(data, id);
      if (foundObject) {
        result.push(foundObject);
      }
      return result;
    }, []);
  }
  function findObjectById(data, id) {
    for (const item of data) {
      if (item.id === id) {
        return item;
      }
      if (item.children) {
        const foundObject = findObjectById(item.children, id);
        if (foundObject) {
          return foundObject;
        }
      }
    }
    return null;
  }

  /** 搜索树相关 */
  watch(searchValue, (value) => {
    // 获取需要展开的key, 符合包含字符串的key
    /**
     * 找到节点
     * @param data
     * @param keyword
     */
    function findIdsByName(data, keyword) {
      const results = [];

      function search(node) {
        if (node.name.includes(keyword)) {
          results.push(node);
        }
        if (node.children) {
          node.children.forEach((child) => search(child));
        }
      }

      data.forEach((node) => search(node));
      // console.log("result: ", results);

      // 取id
      const matchIds = results.map((item) => item.id);

      return matchIds;
    }
    const matchIds = findIdsByName(treeData, value);
    // console.log("matchIds: ", matchIds);

    if (value) {
      expandedKeys.value = matchIds;
    } else {
      // console.log("selectedKeys.value: ", selectedKeys.value);
      let alwaysExpand = [...checkedKeys.value, ...defaultexpandNode];
      expandedKeys.value = checkedKeys.value.length > 0 ? alwaysExpand : defaultexpandNode;
    }

    // console.log("expandedKeys.value:", expandedKeys.value);
    searchValue.value = value;
    autoExpandParent.value = true;
  });

  const onExpand = (keys: string[]) => {
    // console.log('onExpand keys:', keys);
    expandedKeys.value = keys;
    autoExpandParent.value = false;
  };

  /** 监听树的变化，用于检测子孙节点是否为灰色勾选 */
  watch(treeData, (newTree) => {
    // console.log('newTree:', newTree);
    RunCheckTreeBox(newTree, checkedKeys);
  });

  // 从已勾选的数组中 删除 特定节点的勾选
  function handleFilter(node) {
    checkedKeys.value = checkedKeys.value
      .filter((k) => node.key !== k) // 删除树node的子节点
      .filter((j) => node.id !== j); // 删除树data的孙节点
  }
  function getIsAllCheck(node, append_arr): boolean {
    // console.log('此时node = ', node);
    append_arr = append_arr.length > 0 ? append_arr : [];

    // 如果节点没有子节点，直接检查该节点的 id 是否在 checkedKeys.value
    if (!node.children || node.children.length === 0) {
      const r1 = checkedKeys.value.includes(node.id);
      // console.log('id 是否在 checkedKeys.value：', r1);
      append_arr.push(r1);
      return r1;
    }
    // 递归检查所有子节点及其子孙节点
    // console.log('此时node.children = ', node.children);
    for (const child of node.children) {
      if (!getIsAllCheck(child, append_arr)) {
        // console.log('此时检查节点是：', child);
        return false;
      }
    }
    // 检查当前节点的 id 是否在 CheckedKeys.value 中
    return append_arr.every(function (i) {
      return i;
    });
  }

  function handleSelectSub(node) {
    // 父节点
    if (node.children) {
      // 子节点是否全部勾选
      const isAllChecked = getIsAllCheck(node, []);

      // 取消可能存在的父节点的key(通过勾选框的方式时）
      if (!(node?.disableCheckbox ?? false)) {
        handleFilter(node);
      }

      for (let node_chlildren of node.children) {
        // 父节点存在孙节点（一二三级）
        if (node_chlildren.children) {
          // 执行递归函数
          handleSelectSub(node_chlildren);
          // 父节点不存在孙节点（二三级）
        } else {
          if (!isAllChecked) {
            // 子节点此时处于勾选
            if (checkedKeys.value.includes(node_chlildren.id)) {
              continue;
            } else {
              // 若未勾选，则勾选
              checkedKeys.value = [...checkedKeys.value, node_chlildren.id];
            }
          } else {
            // 当选中1级文本，且遍历到2级树（2级树没有checked键），则不做取消处理
            if (SecondNodeList.value.includes(node?.id) && node.checked === undefined) {
              // console.log(
              //   `${node.checked}||${node.id}====选中1级文本, 填充2级勾选`,
              //   node_chlildren,
              // );
            } else {
              // console.log(`${node.checked}||${node.id}====取消时，选中2级文本`);
              handleFilter(node_chlildren);
            }
            // 取消蓝色勾选
            // if (!(node_chlildren?.disableCheckbox ?? false)) {
            // }
          }
        }
      }

      // 孙节点
    } else {
      // 勾选且不是灰色按钮，则取消勾选
      if (checkedKeys.value.includes(node.key)) {
        handleFilter(node);
      } else {
        checkedKeys.value = [...checkedKeys.value, node.key];
      }
    }
  }

  const handleSelect = (selectedKeys, { selected, selectedNodes, node }) => {
    handleSelectSub(node);

    // 最外层处理1级节点的取消问题
    if (node.checked && FirstNodeList.value.includes(node?.id)) {
      let node_bellow_all_int_id: number[] = [];
      node.children.forEach((item_lv2) => {
        item_lv2.children.forEach((item_lv3) => {
          node_bellow_all_int_id.push(item_lv3.id);
        });
      });
      checkedKeys.value = checkedKeys.value.filter((id) => !node_bellow_all_int_id.includes(id));
    }
  };

  // 排序面板
  const [sortprojectmodal, { openModal: openModalSort }] = useModal(); // 用于排序项目信息
  /** 打开排序面板 */
  function handleSortPanel() {
    openModalSort(true, {
      moadlType: MoadlType.ADD_PACKAGE,
      projectsList: getObjectsByIds(treeData, checkedKeys.value),
    });
  }
  /** 排序成功回调 */
  function sortSuccess(info) {
    checkedKeys.value = info.checkedKeys;
    // console.log('sortSuccess-info', info);
  }
</script>
