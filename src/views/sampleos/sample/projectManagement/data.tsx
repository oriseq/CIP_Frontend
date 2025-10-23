import { DescItem } from '@/components/Description';
import { BasicColumn } from '@/components/Table/src/types/table';
import { Button } from '@/components/Button';

import { h } from 'vue';
import { Badge, Tag, Tooltip } from 'ant-design-vue';
import Icon from '@/components/Icon/Icon.vue';

import { sampleProjectStatusMapping, getTagColor } from '../inspectionMission/fieldMapping';

import { useModal } from '@/components/Modal';

import { useUserStore } from '@/store/modules/user';
import { MoadlType } from './pjsMngApi';

const userStore = useUserStore();

const isInternalGroup = () => {
  return userStore?.userInfo?.isInternalGroup ?? false;
};

// 创建 useModal 实例
const [registerModal, modalInstance] = useModal();
export const openModalLogistics = modalInstance.openModal;
export const registerLogisticsModal = registerModal;

/** 报告结果数据类型 */
export interface ReportResultType {
  value: string;
  label: string;
}

export const sampleSchema: DescItem[] = [
  {
    field: 'name',
    label: '用户姓名',
    labelStyle: {
      // fontSize: '16px',
      // color: '#333',
      // fontWeight: 'bold',
      // marginLeft: '15px',
    },
    // span: 3,
  },
  {
    field: 'sex',
    label: '性别',
    render: (val, data) => {
      if (val == 1) {
        return '男';
      } else if (val == 2) {
        return '女';
      } else if (val == 3) {
        return '未知';
      } else {
        return val;
      }
    },
  },
  {
    field: 'age',
    label: '年龄',
  },
  {
    field: 'birthday',
    label: '出生日期',
  },

  {
    field: 'projectStatusStatistics',
    label: '项目状态数量统计',
    // span: 20,
    render: (val, data) => {
      val.forEach((element) => {
        element.color = getTagColor(element.status);
        element.label = sampleProjectStatusMapping(element.status);
      });
      // console.log('val: ', val);
      // console.log('data: ', data);
      return (
        <div>
          {val.map((status, index) => (
            <div key={index} style="display:inline-block">
              <Badge
                style={{ verticalAlign: 'text-bottom' }}
                count={status.count}
                showZero={true}
                numberStyle={{ backgroundColor: status.color }}
              />
              &nbsp;
              <span>{status.label}&nbsp;&nbsp;&nbsp;</span>
            </div>
          ))}
        </div>
        // <div>
        //   <Badge count="2" number-style={{ backgroundColor: '#7a7e87' }} />
        //   取消&nbsp;
        //   <Badge count="3" number-style={{ backgroundColor: '#f499a8' }} />
        //   待定&nbsp;
        //   <Badge count="5" number-style={{ backgroundColor: '#f9ca24' }} />
        //   确认检测&nbsp;
        //   <Badge count="89" number-style={{ backgroundColor: '#2c7b8a' }} />
        //   正在检测&nbsp;
        //   <Badge count="2" number-style={{ backgroundColor: '#3c8521' }} />
        //   已完成&nbsp;
        // </div>
      );
    },
  },
  {
    field: 'logisticsTrackingNumber',
    label: '物流信息',
    // render: (val, data) => {
    //   let result = data?.logisticsTrackingNumber;
    //   if (data?.phoneNumLastFour) {
    //     result += ':' + data?.phoneNumLastFour;
    //   }
    //   return result;
    // },
    render: (val, data) => {
      const logisticsTrackingNumber = data?.logisticsTrackingNumber;
      const phoneNumLastFour = data?.phoneNumLastFour;
      return (
        <a onClick={() => checklogistics(logisticsTrackingNumber, phoneNumLastFour)}>
          <Icon icon="ant-design:search-outlined" size={20}></Icon>
        </a>
      );
    },
  },
];
export const refundTableSchema: BasicColumn[] = [
  {
    title: '商品编号',
    width: 150,
    dataIndex: 't1',
    customRender: ({ record }) => {
      return (
        <Button type="link" size="small">
          {() => record.t1}
        </Button>
      );
    },
  },
  {
    title: '商品名称',
    width: 150,
    dataIndex: 't2',
  },
  {
    title: '商品条码',
    width: 150,
    dataIndex: 't3',
  },
  {
    title: '单价	',
    width: 150,
    dataIndex: 't4',
  },
  {
    title: '数量（件）	',
    width: 150,
    dataIndex: 't5',
  },
  {
    title: '金额',
    width: 150,
    dataIndex: 't6',
  },
];

export const refundTableData: any[] = [
  {
    t1: 1234561,
    t2: '矿泉水 550ml',
    t3: '12421432143214321',
    t4: '2.00',
    t5: 1,
    t6: 2.0,
  },
  {
    t1: 1234562,
    t2: '矿泉水 550ml',
    t3: '12421432143214321',
    t4: '2.00',
    t5: 2,
    t6: 2.0,
  },
  {
    t1: 1234562,
    t2: '矿泉水 550ml',
    t3: '12421432143214321',
    t4: '2.00',
    t5: 2,
    t6: 2.0,
  },
  {
    t1: 1234562,
    t2: '矿泉水 550ml',
    t3: '12421432143214321',
    t4: '2.00',
    t5: 2,
    t6: 2.0,
  },
];

export const projectTableSchema: BasicColumn[] = [
  {
    title: 'ID',
    dataIndex: 'projectId',
    // fixed: 'left',
    width: 100,
    // ifShow: false,
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
  {
    title: '项目名称',
    dataIndex: 'projectName',
    width: 300,
    resizable: true,
    ellipsis: true,
    // filters: [
    //   { text: 'Male', value: 'male' },
    //   { text: 'Female', value: 'female' },
    // ],
  },
  {
    title: '项目状态',
    dataIndex: 'projectStatus',
    width: 100,
    // format: (text, record, index) => {
    //   // console.log('userStore...........', userStore.userInfo?.isInternalGroup);
    //   return sampleProjectStatusMapping(text);
    // },
    resizable: true,
    ellipsis: true,
    customRender: ({ text }) => {
      return h(Tooltip, { title: sampleProjectStatusMapping(text) }, () =>
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
          sampleProjectStatusMapping(text),
        ),
      );
    },
  },
  {
    title: '报告结果',
    dataIndex: 'polarity',
    width: 100,
    // filters: [
    //   { text: 'Male', value: 'male' },
    //   { text: 'Female', value: 'female' },
    // ],
    // format: (text, record, index) => {
    //   switch (text) {
    //     case 0:
    //       return '阴性';
    //     case 1:
    //       return '阳性';
    //     default:
    //       return text;
    //     // code block
    //   }
    // },
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
  {
    title: '审核图',
    dataIndex: 'resultImg',
    width: 100,
    resizable: true,
    ellipsis: true,
    ifShow: isInternalGroup,
  },
  {
    title: '外送单位',
    dataIndex: 'deliveryUnit',
    width: 100,
    resizable: true,
    ellipsis: true,
    ifShow: isInternalGroup,
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
    title: '外送人',
    dataIndex: 'deliveryPerson',
    width: 100,
    resizable: true,
    ellipsis: true,
    ifShow: isInternalGroup,
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
    title: '复核结果',
    dataIndex: 'reviewResults',
    width: 100,
    resizable: true,
    ellipsis: true,
    ifShow: isInternalGroup,
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    width: 100,
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
  {
    title: '截至时间',
    dataIndex: 'deadline',
    width: 100,
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

/** 表加复核结果，颜色tag */
export function getReviewResultTag(status) {
  switch (status) {
    case '正常':
      return 'green';
    case '异常':
      return 'red';
    default:
      return 'gray';
  }
}

/** 查看物流信息弹窗 */
function checklogistics(logisticsTrackingNumber, phoneNumLastFour) {
  openModalLogistics(true, {
    moadlType: MoadlType.CHEAK_LOGISITICS,
    record: {
      logisticsTrackingNumber,
      phoneNumLastFour,
    },
    // isUpdate: true,
    isSuper: userStore.userInfo?.isSuper,
  });
}
