import { computed, ref, h } from 'vue';
import { BasicColumn, FormProps } from '/@/components/Table';
import type { FormSchema } from '/@/components/Table';
import { MissionMngColumns } from '../../sample/inspectionMission/fieldMapping';
import { Tooltip } from 'ant-design-vue';

export enum ModalType {
  ADD_INFO = '新增信息',
  EDIT_INFO = '修改信息',
}

// 表格数据demo
// export const TableDataDemo = [
//   {
//     id: 1,
//     name: '化学分析仪器1',
//     remarks: '备注1',
//     exportFields: MissionMngColumns.slice(0, 10).map((item) => item.dataIndex),
//   },
//   {
//     id: 2,
//     name: '化学分析仪器2',
//     remarks: '备注2',
//     exportFields: ['id', 'updateTime', 'status'],
//   },
// ];

// 表格列
export const getBasicColumns = (): BasicColumn[] => [
  {
    title: '名称',
    dataIndex: 'name',
    width: 100,
    align: 'center',
    customRender: ({ text }) => {
      return h(Tooltip, { title: text }, () =>
        h(
          'span',
          {
            style: {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'inline-block',
              maxWidth: '100%',
            },
          },
          text,
        ),
      );
    },
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    width: 300,
    align: 'center',
    customRender: ({ text }) => {
      return h(Tooltip, { title: text }, () =>
        h(
          'span',
          {
            style: {
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'inline-block',
              maxWidth: '100%',
            },
          },
          text,
        ),
      );
    },
  },
  {
    title: '导出列名',
    dataIndex: 'exportFields',
    width: 100,
    align: 'center',
  },
];

// 类型：导出列表的下拉选项
interface OptionsType {
  label: string;
  value: string;
}
// 构建导出列表的下拉选项
const exportFieldsOptions = computed(() => {
  const colsList = ref<OptionsType[]>([]);
  MissionMngColumns.forEach((item) => {
    colsList.value.push({
      label: item.title,
      value: item.dataIndex,
    });
  });
  // 添加空列的下拉选项
  colsList.value.push({
    label: '（空）',
    value: 'empty',
  });
  return colsList.value;
});
// 搜索栏配置
export const getFormConfig = (): Partial<FormProps> => {
  return {
    labelWidth: 100,
    baseColProps: { span: 6 },
    showAdvancedButton: true,
    autoAdvancedLine: 1,
    schemas: [
      {
        field: 'name',
        label: '仪器名称',
        component: 'Input',
      },
      {
        field: 'remarks',
        label: '备注',
        component: 'Input',
      },
      {
        field: 'exportFields',
        label: '导出列名',
        component: 'Select',
        componentProps: {
          options: exportFieldsOptions,
          mode: 'multiple',
          filterOption: (inputValue, option) => {
            return option.toLowerCase().indexOf(inputValue.toLowerCase()) >= 0;
          },
        },
      },
    ],
  };
};

// 对话框表单配置
export function getDialogFormSchemas(type: ModalType): FormSchema[] {
  return [
    {
      field: 'name',
      label: '仪器名称',
      component: 'Input',
      colProps: {
        span: 20,
      },
      // ifShow: type === ModalType.ADD_INFO,
      required: true,
    },
    {
      field: 'remarks',
      label: '备注',
      component: 'InputTextArea',
      componentProps: {
        allowClear: true,
        autoSize: true,
      },
      colProps: {
        span: 20,
      },
    },
    {
      field: 'exportFields',
      label: '导出列名',
      component: 'Select',
      componentProps: {
        options: exportFieldsOptions,
        mode: 'multiple',
        filterOption: (inputValue, option) => {
          return option.label.includes(inputValue);
        },
      },
      colProps: {
        span: 20,
      },
    },
  ];
}
