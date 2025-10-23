import { BasicColumn } from '@/components/Table/src/types/table';
import { type FormSchema } from '@/components/Form';
import { useUserStore } from '@/store/modules/user';
import { getProjectTreeApi } from './pjsMngApi';
import { Tooltip } from 'ant-design-vue';
import { h } from 'vue';

const userStore = useUserStore();

const isSuper = () => {
  return userStore.userInfo?.isSuper ?? false;
};

// import { DescItem } from '@/components/Description';
// import { Button } from '@/components/Button';
// import { Badge } from 'ant-design-vue';

/** 分组下套餐数据类型 */
export interface CascadarType {
  id?: number;
  value: number;
  label: string;
  children?: CascadarType[];
}

/** 表格列名 */
export const projectTableSchema: BasicColumn[] = [
  {
    title: 'ID',
    dataIndex: 'id',
    width: 80,
    resizable: true,
    sorter: (a, b) => {
      return a.id - b.id;
    },
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
    title: '项目名称',
    dataIndex: 'projectName', //'project_name',
    width: 200,
    resizable: true,
    sorter: (a, b) => {
      return a.projectName.localeCompare(b.projectName);
    },
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
    title: '外送单位',
    dataIndex: 'deliveryUnits',
    width: 150,
    resizable: true,
    // customRender: ({ text }) => {
    //   return h(Tooltip, { title: text }, () =>
    //     h(
    //       'span',
    //       {
    //         style: {
    //           whiteSpace: 'nowrap',
    //           overflow: 'hidden',
    //           textOverflow: 'ellipsis',
    //           display: 'inline-block',
    //           maxWidth: '100%',
    //         },
    //       },
    //       text,
    //     ),
    //   );
    // },
  },
  {
    title: '检测方法',
    dataIndex: 'detectMethod', //'detect_method',
    width: 150,
    resizable: true,
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
    title: '采样耗材类型',
    dataIndex: 'consumableType', //'consumable_type',
    width: 150,
    resizable: true,
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
    title: '仪器',
    dataIndex: 'instrumentName',
    width: 150,
    resizable: true,
  },
  {
    title: '报告周期',
    dataIndex: 'reportDate',
    width: 150,
    ifShow: isSuper,
    resizable: true,
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
    title: '项目分类',
    dataIndex: 'projectCategoryName',
    width: 150,
    ifShow: isSuper,
    resizable: true,
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
    title: '价格',
    dataIndex: 'price',
    width: 100,
    resizable: true,
    sorter: (a, b) => {
      return a.price - b.price;
    },
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
    title: '样本要求',
    dataIndex: 'sampleRequirements',
    width: 150,
    resizable: true,
    ellipsis: true,
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
  // {
  //   title: '时分刻度是否置末',
  //   dataIndex: 'is_report_hour_minutes_end',
  //   width: 100,
  //   resizable: true,
  //   ellipsis: true,
  //   format: (text, record, index) => {
  //     return text == 1 ? '是' : '否';
  //   },
  // },
  // {
  //   title: '报告天数',
  //   dataIndex: 'report_day',
  //   width: 100,
  //   resizable: true,
  //   ellipsis: true,
  // },
  // {
  //   title: '报告小时',
  //   dataIndex: 'report_hour',
  //   width: 100,
  //   resizable: true,
  //   ellipsis: true,
  // },
  // {
  //   title: '排除星期',
  //   dataIndex: 'disable_week',
  //   width: 100,
  //   resizable: true,
  //   ellipsis: true,
  // },
  // {
  //   title: '警报剩余小时',
  //   dataIndex: 'remaining_hour',
  //   width: 100,
  //   resizable: true,
  //   ellipsis: true,
  // },
  {
    title: '备注',
    dataIndex: 'remarks',
    width: 200,
    resizable: true,
    ellipsis: true,
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
];

/** 套餐测试 */
export function projectPackageMap(index) {
  switch (index) {
    case 0:
      return '测试套餐1';
    case 1:
      return '测试套餐2';
    case 2:
      return '测试套餐3';
    case 3:
      return '测试套餐4';
  }
}

/** 采样耗材类型匹配 */
export function projectConsumableTypeMap(status) {
  switch (status) {
    case 0:
      return '黄头管';
    case 1:
      return '黄头管B';
    case 2:
      return '蓝头管';
    case 3:
      return '灰头管';
    case 4:
      return '紫头管';
  }
}

/** 申请项目表单内容 */
export const ApplicateProjectSchemas: FormSchema[] = [
  {
    field: 'projects',
    component: 'ApiTree',
    label: '所有项目',
    colProps: { span: 15 },
    required: true,
  },
];

/** 获取项目分类 */
// 1. 获取项目分类请求结果
async function getProjectCategory() {
  try {
    const response = await getProjectTreeApi(null);
    return response;
  } catch (error) {
    console.log('error');
    return;
  }
}

// 2. 调用项目分类请求结果
const ProjectCategoryCascaderPromise = getProjectCategory();

// 3. 处理项目分类结果
export const ProjectCategoryList: CascadarType[] = [];

ProjectCategoryCascaderPromise.then((data) => {
  // 处理顶层数据
  // console.log('data', data);
  data.forEach((item: CascadarType) => {
    // console.log(item);
    ProjectCategoryList.push({
      id: item.id,
      value: item.value,
      label: item.label,
      children: processCascaderChildren(
        item.children as Array<{
          id: number;
          label: string;
          value: number;
          children?: Array<{ label: string; value: number }>;
        }>,
      ),
    });
  });
  // console.log('PackageList', PackageList);
}).catch((error) => {
  console.error('Error:', error);
});

/** 处理级联children的通用方法 */
function processCascaderChildren(
  children: Array<{
    label: string;
    value: number;
    children?: Array<{ label: string; value: number }>;
  }>,
): CascadarType[] {
  if (!children || !Array.isArray(children)) {
    return [];
  }
  return children.map((item) => ({
    value: item.value,
    label: item.label,
    children: item.children ? processCascaderChildren(item.children) : [],
  }));
}

/** 排除星期多选数据 */
export const WeekOption = [
  {
    label: '周一',
    value: 1,
  },
  {
    label: '周二',
    value: 2,
  },
  {
    label: '周三',
    value: 3,
  },
  {
    label: '周四',
    value: 4,
  },
  {
    label: '周五',
    value: 5,
  },
  {
    label: '周六',
    value: 6,
  },
  {
    label: '周日',
    value: 7,
  },
];

// /** 新增项目表单内容 */
// export const AddProjectSchemas: FormSchema[] = [
//   {
//     field: 'project_name',
//     component: 'Input',
//     label: '项目名称',
//     colProps: { span: 15 },
//     componentProps: {
//       onChange: (e: any) => {
//         console.log(e);
//       },
//     },
//     required: true,
//   },
//   {
//     field: 'detect_method',
//     component: 'Input',
//     label: '检测方法',
//     colProps: { span: 15 },
//     required: true,
//   },
//   {
//     field: 'consumable_type',
//     component: 'Select',
//     label: '采样耗材类型',
//     colProps: { span: 15 },
//     componentProps: {
//       options: [
//         { label: '黄头管-Fake', value: '1', key: '1' },
//         { label: '黄头管B-Fake', value: '2', key: '2' },
//         { label: '蓝头管-Fake', value: '3', key: '3' },
//         { label: '灰头管-Fake', value: '4', key: '4' },
//         { label: '紫头管-Fake', value: '5', key: '5' },
//       ],
//     },
//     required: true,
//   },
//   {
//     field: 'user_group_name',
//     component: 'Select',
//     label: '所属用户组',
//     colProps: { span: 15 },
//     componentProps: {
//       options: [
//         { label: '序源-Fake', value: '1', key: '1' },
//         { label: '客户A-Fake', value: '2', key: '2' },
//       ],
//       // api: areaRecord,
//       // apiParamKey: 'parentCode',
//       // // dataField: 'data',
//       // labelField: 'name',
//       // valueField: 'code',
//       // initFetchParams: {
//       //   parentCode: '',
//       // },
//       // isLeaf: (record) => {
//       //   return !(record.levelType < 3);
//       // },
//       // onChange: (e, ...v) => {
//       //   console.log('ApiCascader====>:', e, v);
//       // },
//     },
//     required: true,
//   },
//   {
//     field: 'price',
//     component: 'Input',
//     label: '价格',
//     colProps: {
//       span: 15,
//     },
//     required: true,
//   },
// ];
