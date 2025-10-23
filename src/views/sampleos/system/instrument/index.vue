<template>
  <PageWrapper dense contentFullHeight fixedHeight contentClass="flex">
    <BasicTable @register="registerTable">
      <template #tableTitle>
        <a-button type="primary" @click="handleAdd"> 新增 </a-button>
      </template>
      <template #bodyCell="{ column, text, record }">
        <template v-if="text && column.dataIndex === 'exportFields'">
          <div style="margin: 3px 0" v-for="(item, index) in text.slice(0, 3)" :key="index">
            {{ getSampleStatusText(item) }}
            <br />
          </div>
          <div
            v-if="text && text.length > 3"
            style="margin: 3px 0"
            @mouseenter="showFullText = true"
            @mouseleave="showFullText = false"
          >
            <Tag color="gray">
              <div class="custom-tooltip-wrapper">
                <a-typography-text
                  :style="{ width: '30px', color: 'white' }"
                  :ellipsis="{
                    tooltip: '...',
                  }"
                  :content="`all all`"
                >
                  <template #ellipsisTooltip>
                    <div style="width: 150px; max-height: 200px; overflow-y: scroll">
                      <span v-for="(item, idx) in text" :key="idx"
                        >{{ idx + 1 }}. {{ getSampleStatusText(item) }}<br
                      /></span>
                    </div>
                  </template>
                </a-typography-text>
              </div>
            </Tag>
          </div>
        </template>
        <template v-if="column.dataIndex === 'action'">
          <TableAction
            stopButtonPropagation
            :actions="[
              {
                icon: 'clarity:note-edit-line',
                tooltip: '编辑',
                onClick: handleEdit.bind(null, record),
              },
              {
                icon: 'ant-design:delete-outlined',
                color: 'error',
                tooltip: '删除',
                popConfirm: {
                  title: '是否确认删除',
                  placement: 'left',
                  confirm: handleDelete.bind(null, record),
                },
              },
            ]"
          />
        </template>
      </template>
    </BasicTable>
    <DefaultModal @register="registerModal" @success="handleSuccess" :maskClosable="false" />
  </PageWrapper>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { BasicTable, useTable } from '@/components/Table';
  import { useModal } from '@/components/Modal';
  import { useMessage } from '@/hooks/web/useMessage';
  import { getTableDataApi, deleteTableRowApi } from './instrumentApi';
  import { TableDataDemo, ModalType, getBasicColumns, getFormConfig } from './data';
  import DefaultModal from './DefaultModal.vue';
  import { MissionMngColumns } from '../../sample/inspectionMission/fieldMapping';
  import { Tag } from 'ant-design-vue';

  const { createMessage } = useMessage();
  const { success, error } = createMessage;

  const showFullText = ref(false);

  // 弹窗
  const [registerModal, { openModal: openDefaultModal }] = useModal();

  // 表格
  const [registerTable, { reload, getRowSelection, getDataSource }] = useTable({
    api: async (params) => {
      const rsp = await getTableDataApi(params);
      return rsp.result;
    },
    // dataSource: TableDataDemo,
    columns: getBasicColumns(),
    useSearchForm: true,
    formConfig: getFormConfig(),
    showTableSetting: true,
    tableSetting: { fullScreen: false },
    showIndexColumn: false,
    clickToRowSelect: false,
    rowKey: 'id',
    rowSelection: {
      type: 'checkbox',
    },
    showSelectionBar: true, // 显示多选状态栏
    actionColumn: {
      width: 100,
      title: '操作',
      dataIndex: 'action',
    },
    striped: false,
    beforeFetch: (params) => {
      console.log('beforeFetch: params', params);
      // params.id = [params.id];
    },
  });

  // 打开新增弹窗
  function handleAdd() {
    openDefaultModal(true, {
      title: ModalType.ADD_INFO,
      moadlType: ModalType.ADD_INFO,
    });
  }

  // 打开编辑弹窗
  function handleEdit(record) {
    openDefaultModal(true, {
      title: ModalType.EDIT_INFO,
      record,
      moadlType: ModalType.EDIT_INFO,
    });
  }

  // 删除
  async function handleDelete(record) {
    const rsp = await deleteTableRowApi(record.id);
    if (rsp.success) {
      success(rsp.message);
      reload(); // 表格重载
    } else {
      error(rsp.message);
    }
  }
  // 弹窗成功回调
  function handleSuccess(info) {
    console.log('handleSuccess: ', info);
    reload(); // 表格重载
  }

  // 根据固定的任务管理列名，获取中文
  function getSampleStatusText(dataIndex: string) {
    if (dataIndex !== 'empty') {
      return MissionMngColumns.filter((item_1) => item_1.dataIndex === dataIndex).map(
        (item_2) => item_2.title,
      )[0];
    } else {
      return '（空）';
    }
  }
</script>

<style scoped></style>
