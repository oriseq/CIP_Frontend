import { BasicColumn } from '@/components/Table/src/types/table';
import { type FormSchema } from '@/components/Form';
import { useUserStore } from '@/store/modules/user';
import { getBelongPackageCascaderApi } from './pjsMngApi';
import { Tooltip } from 'ant-design-vue';
import { h } from 'vue';

const userStore = useUserStore();

const isInternalGroup = () => {
  return userStore?.userInfo?.isInternalGroup ?? false;
};

// import { DescItem } from '@/components/Description';
// import { Button } from '@/components/Button';
// import { Badge } from 'ant-design-vue';

/** 分组下套餐数据类型 */
export interface PackageType {
  id?: number;
  value: number;
  label: string;
  children?: PackageType[];
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
    title: '检测方法',
    dataIndex: 'detectMethod', //'detect_method',
    width: 100,
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
    width: 100,
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
    title: '所属用户组',
    dataIndex: 'userGroupName', //'user_group_name',
    width: 150,
    ifShow: isInternalGroup,
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
    title: '默认外送',
    dataIndex: 'defaultDeliveryUnitName',
    width: 100,
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
    width: 80,
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
    title: '折扣系数',
    dataIndex: 'priceCoefficient',
    width: 80,
    ifShow: isInternalGroup,
    resizable: true,
    sorter: (a, b) => {
      // return b.priceCoefficient - a.priceCoefficient;
      if (b.priceCoefficient === null) {
        return -1;
      }
      return a.priceCoefficient - b.priceCoefficient;
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
    title: '折后价格',
    dataIndex: 'discountedPrice',
    width: 80,
    ifShow: isInternalGroup,
    resizable: true,
    sorter: (a, b) => {
      if (b.discountedPrice === null) {
        return -1;
      }
      return a.discountedPrice - b.discountedPrice;
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

/** 获取分组下的套餐 */
export async function getBelongPackageCascader() {
  try {
    const response = await getBelongPackageCascaderApi(null);
    return response;
  } catch (error) {
    console.log('请求失败');
    return;
  }
}

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
