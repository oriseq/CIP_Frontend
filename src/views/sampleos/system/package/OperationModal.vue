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
</template>
<script lang="ts" setup>
  // import { defHttpForRes, defHttp } from '@/utils/http/axios';
  // import { accountFormSchema } from './account.data';
  // import { BasicTree, TreeItem } from '@/components/Tree';
  // import permission from '@/router/routes/modules/demo/permission';
  // import { getDeptList } from '@/api/demo/system';
  // import { defineDocExtension } from 'codemirror';
  // import { getTagColor, sampleProjectStatusMapping } from '../inspectionMission/fieldMapping';
  // import { Option } from 'vxe-table';
  import { ref, computed, unref, watch, reactive } from 'vue';
  import { BasicModal, useModalInner, useModal } from '@/components/Modal';
  import { BasicForm, useForm } from '@/components/Form';
  import { useMessage } from '@/hooks/web/useMessage';
  import type { TreeProps } from 'ant-design-vue';
  import type { FormSchema } from '@/components/Form';
  import {
    MoadlType,
    modifyPackageInfoApi,
    getProjectTreeApi,
    getUserGroupInfoApi,
  } from './pkgMngApi';
  import { useGo, useRedo } from '@/hooks/web/usePage';
  import { useTabs } from '@/hooks/web/useTabs';

  import { useUserStore } from '@/store/modules/user';
  import { treeData, AllPackageData } from './data';
  import { RunCheckTreeBox } from '../../sample/inspectionForm/inspectionFormApi';
  import SortProjectModal from './SortProjectModal.vue';

  const go = useGo();
  const redo = useRedo();
  const { closeCurrent } = useTabs();
  const userStore = useUserStore();

  const searchValue = ref<string>('');
  const autoExpandParent = ref<boolean>(true);

  defineOptions({ name: 'AccountModal' });

  const emit = defineEmits(['success', 'register']);
  const { createMessage } = useMessage();
  const { info, success, warning, error } = createMessage;

  const moadlType = ref();
  const seledIds = ref([]);
  const isSuper = ref();
  const userGroupId = ref();

  // 表单内容存储
  const packageName = ref();
  const InputPackageId = ref();
  const projectIds = ref([]);
  const remarks = ref();
  // const combone = ref([]);
  // const combone = [];
  // const isUpdate = ref(true);

  // 项目树
  const expandedKeys = ref<number[]>([]);
  const selectedKeys = ref<string[]>([]);
  const checkedKeys = ref<number[]>([]);
  const fieldNames: TreeProps['fieldNames'] = {
    title: 'name',
    key: 'id',
  };

  watch(checkedKeys, () => {
    // console.log('checkedKeys', checkedKeys.value);
  });

  let FirstNodeList = ref<string[]>([]);
  let SecondNodeList = ref<string[]>([]);

  /** 编辑套餐信息表单schemas */
  const ModifyPackageSchemas: FormSchema[] = [
    {
      field: 'packageName',
      label: '套餐名',
      component: 'Input',
      required: true,
    },
    {
      field: 'userGroupId',
      label: '归属用户组',
      component: 'ApiSelect',
      componentProps: {
        api: getUserGroupInfoApi,
        resultField: 'result',
        labelField: 'groupName',
        valueField: 'id',
      },
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

  /** 编辑套餐信息弹窗表单 */
  const [registerForm, { setFieldsValue, updateSchema, resetFields, validate }] = useForm({
    labelWidth: 100,
    baseColProps: { span: 22 },
    schemas: ModifyPackageSchemas,
    showActionButtonGroup: false,
    actionColOptions: {
      span: 23,
    },
  });

  // console.log('getExpandedKeys: ', getExpandedKeys());

  /** 获取所有的套餐信息 */
  // const packageInfo = AllPackageData();
  // console.log('packageInfo: ', packageInfo);

  /** 获取指定套餐id的对象以及套餐包含项目id */
  async function findPackageById(packageId) {
    try {
      const info = await AllPackageData();
      for (const pkg of info) {
        if (pkg.id === packageId) {
          // console.log(`成功获取指定套餐 ${packageId} 的对象`);
          const projectIds = pkg.projects.map((item) => item.id);
          // console.log('projectIds', projectIds);
          return projectIds;
        }
      }
    } catch (error) {
      console.log('错误', error);
      return [];
    }
  }
  // findPackageById(3);

  /** 弹窗传参 */
  const [registerModal, { setModalProps, closeModal }] = useModalInner(async (data) => {
    // 显示
    updateSchema([
      {
        field: 'modifyPackage',
        ifShow: data?.moadlType == MoadlType.MODIFY_PACKAGE,
      },
    ]);

    // console.log('useModalInner:data:', data);

    // 重置表单值
    resetFields();
    setModalProps({ confirmLoading: false });

    // 获取当前操作列的弹窗名称
    moadlType.value = data?.moadlType;
    isSuper.value = data?.record?.isSuper;
    packageName.value = data?.record?.packageName; // 获取套餐名
    // console.log('packageName.value:', packageName.value);
    InputPackageId.value = data?.record?.id; // 获取套餐id
    // console.log('InputPackageId.value:', InputPackageId.value);
    projectIds.value = data?.record?.projectIds; // 获取项目id
    // console.log('projectIds.value:', projectIds.value);
    remarks.value = data?.record?.remarks;

    userGroupId.value = data?.record?.userGroupId;

    // 设置表单字段值，使表格已填写的值默认填充到表单中
    setFieldsValue({
      packageName: packageName.value,
      userGroupId: userGroupId.value,
      remarks: remarks.value,
    });

    // 编辑套餐弹窗
    let defaultexpandNode = [];
    if (moadlType.value == MoadlType.MODIFY_PACKAGE) {
      // 1-1. 项目树获取
      const projectTree = await getProjectTreeApi(null);
      treeData.splice(0, treeData.length, ...projectTree);
      // console.log('projectTree', projectTree);
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

      // 1-2. 获取套餐对应的项目id号数组
      // console.log('projectIds', projectIds);
      const projectsIdsArray = projectIds.value.map(Number);

      // 2. 勾选项目
      expandedKeys.value.splice(0, expandedKeys.value.length, ...projectsIdsArray);
      // console.log('expandedKeys=', expandedKeys);

      checkedKeys.value.splice(0, checkedKeys.value.length, ...projectsIdsArray);
      // console.log('checkedKeys=', checkedKeys);
    }
  });

  /** 操作列弹窗标题 */
  const getTitle = computed(() => {
    // console.log('!unref(moadlType), ', !unref(moadlType));
    switch (unref(moadlType)) {
      case MoadlType.MODIFY_PACKAGE:
        return '编辑套餐信息';
      default:
        return '';
    }
  });

  /** 编辑套餐信息弹窗提交 */
  async function handleSubmit() {
    try {
      const values = await validate();
      setModalProps({ confirmLoading: true });

      // console.log('values:', values);
      // console.log('seledIds:', seledIds);

      if (moadlType.value == MoadlType.MODIFY_PACKAGE) {
        // 1. 勾选的数据
        const foundObjects = getSelectedObject();
        // const resultFoundObjects = foundObjects
        //   .filter((item) => !item.disableCheckbox)
        //   .map(({ id, status, ...rest }) => ({
        //     id,
        //     status,
        //   }));

        // console.log('foundObjects', foundObjects);

        let selectProjectIdsList: number[] = [];
        foundObjects.forEach((item) => selectProjectIdsList.push(item.id));
        const formData = {
          id: `${InputPackageId.value}`,
          packageName: values.packageName,
          projectIds: selectProjectIdsList,
          remarks: values.remarks,
          userGroupId: values.userGroupId,
        };
        // console.log('formData:', formData);

        if (
          !userStore.userInfo?.isSuper &&
          !userStore.userInfo?.isInternalGroup &&
          formData.userGroupId != userGroupId.value
        ) {
          error('非超级管理员或内部组，禁止修改归属用户组');
          return;
        }
        // 发送修改请求
        const data = await modifyPackageInfoApi(formData);
        // console.log('data', data);
        if (data.success) {
          success(data.message);
          redo(); // 修改完成，刷新页面
        } else {
          error(data.message);
          return;
        }
      }
      closeModal();
      emit('success');
    } finally {
      setModalProps({ confirmLoading: false });
    }
  }

  /**
   * 得到选择的项目对象
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

  // 搜索树相关
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
      expandedKeys.value = checkedKeys.value;
    }

    // console.log("expandedKeys.value:", expandedKeys.value);
    searchValue.value = value;
    autoExpandParent.value = true;
  });

  const onExpand = (keys: any[]) => {
    // console.log('onExpand keys:', keys);
    expandedKeys.value = keys;
    // console.log('on-Expand: expandedKeys', expandedKeys);
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
      handleFilter(node);

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
            // 取消蓝色勾选
            if (SecondNodeList.value.includes(node?.id) && node.checked === undefined) {
              // console.log(
              //   `${node.checked}||${node.id}====选中1级文本, 填充2级勾选`,
              //   node_chlildren,
              // );
            } else {
              // console.log(`${node.checked}||${node.id}====取消时，选中2级文本`);
              handleFilter(node_chlildren);
            }
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
