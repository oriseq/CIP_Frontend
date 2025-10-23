import { h } from 'vue';
import { Tooltip } from 'ant-design-vue';
import { useUserStore } from '@/store/modules/user';

const userStore = useUserStore();
export function sampleStatusMapping(status) {
  switch (status) {
    case 0:
      return '无项目';
    case 1:
      return '无确认项目';
    case 2:
      return '等待检测';
    case 3:
      return '正在检测';
    case 4:
      return '部分完成';
    case 5:
      return '全部完成';
  }
}
export function sampleSexMapping(sex) {
  switch (sex) {
    case 1:
      return '男';
    case 2:
      return '女';
    case 3:
      return '未知';
  }
}

export function reSampleSexMapping(sex) {
  switch (sex) {
    case '男':
      return 1;
    case '女':
      return 2;
    case '未知':
      return 3;
    default:
      return 0;
  }
}

export function sampleFieldMapping(title) {
  /**
   * const header = {
      id: 'ID',
      name: '姓名',
      sex: '性别',
      age: '年龄',
      birthday: '出生日期',
      projects: '项目列表',
      status: '状态',
      logisticsInformation: '物流信息',
      annexPath: '附件路径',
      submissionTime: '提交时间',
      updateTime: '更新时间',
    };
   */
  switch (title) {
    case 'ID':
      return 'id';
    case '姓名':
      return 'name';
    case '性别':
      return 'sex';
    case '年龄':
      return 'age';
    case '出生日期':
      return 'birthday';
    case '项目列表（项目之间，分隔）':
      return 'projects';
    case '物流信息':
      return 'logisticsInformation';
  }
}

export function sampleProjectStatusMapping(status) {
  /* 
    项目状态

      - 取消:0

      - 待定:1

      - 确认检测:2

      - 正在检测:3
        
      - 已完成:4
        
    */
  switch (status) {
    case 0:
      return '取消';
    case 1:
      return '待定';
    case 2:
      return '确认检测';
    case 3:
      return '正在检测';
    case 4:
      return '已完成';
  }
}

export function getTagColor(status) {
  /* 
      项目状态
  
        - 取消:0
  
        - 待定:1
  
        - 确认检测:2
  
        - 正在检测:3
          
        - 已完成:4
          
      */
  switch (status) {
    case 0:
      return '#7a7e87';
    case 1:
      return '#f499a8';
    case 2:
      return '#f9ca24';
    case 3:
      return '#2c7b8a';
    case 4:
      return '#3c8521';
    default:
      return 'gray';
  }
}

export function sampleProjectReportResultMapping(status) {
  /* 
    阴阳性：0：阴，1阳
    */
  switch (status) {
    case 0:
      return '阴性';
    case 1:
      return '阳性';
  }
}

export const getColor = (item) => {
  // 获取文件的单元格标签的颜色
  const extension = getFileExtension(item);
  if (extension === 'pdf') {
    return 'red';
  } else if (extension === 'xlsx' || extension === 'xls') {
    return 'green';
  } else if (extension === 'doc' || extension === 'docx') {
    return 'blue';
  } else {
    return 'gray';
  }
};

export const getFileExtension = (item) => {
  // 获取文件的单元格标签里的缩略文本
  const parts = item.split('.');
  return parts.length > 1 ? parts[parts.length - 1] : '';
};

/** 性别浮窗文本处理 */
function genderTextProcess(text) {
  if (text == 1) {
    return '男';
  } else if (text == 2) {
    return '女';
  } else if (text == 3) {
    return '未知';
  } else {
    return text;
  }
}

/** 样本状态浮窗文本处理 */
function sampleStatusProcess(text) {
  switch (text) {
    case 0:
      return '无项目';
    case 1:
      return '无确认项目';
    case 2:
      return '等待检测';
    case 3:
      return '正在检测';
    case 4:
      return '部分完成';
    case 5:
      return '全部完成';
    default:
      return text;
    // code block
  }
}
/** 物流信息文本处理 */
function logisticsInfoProcess(record) {
  let result = record?.logisticsTrackingNumber;
  if (record?.phoneNumLastFour) {
    result += ':' + record?.phoneNumLastFour;
  }
  return result;
}

// 送检任务管理的列名和dataindex映射表
export const MissionMngColumns = [
  {
    title: '编号',
    dataIndex: 'id',
    width: 100,
    resizable: true,
    ellipsis: true,
    helpMessage: '检测人本次检测的唯一编号',
    sorter: (a, b) => {
      return a.id - b.id;
    },
  },
  {
    title: '样本编号',
    dataIndex: 'sampleId',
    width: 120,
    resizable: true,
    ellipsis: true,
    helpMessage: '样本的唯一编号',
    sorter: (a, b) => {
      if (a.sampleId === null && b.sampleId === null) {
        return 0;
      } else if (a.sampleId === null) {
        return 1;
      } else if (b.sampleId === null) {
        return -1;
      } else {
        return a.sampleId.localeCompare(b.sampleId);
      }
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
    title: '当天提交编号',
    dataIndex: 'submitNumberToday',
    width: 140,
    resizable: true,
    ellipsis: true,
    helpMessage: '送检单位-当天已提交数量',
    sorter: (a, b) => {
      if (a.submitNumberToday === null && b.submitNumberToday === null) {
        return 0;
      } else if (a.submitNumberToday === null) {
        return 1;
      } else if (b.submitNumberToday === null) {
        return -1;
      } else {
        return a.submitNumberToday.localeCompare(b.submitNumberToday);
      }
    },
    ifShow: userStore.userInfo?.isInternalGroup,
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
    title: '姓名',
    dataIndex: 'name',
    width: 100,
    resizable: true,
    ellipsis: true,
    helpMessage: '检测人姓名',
    sorter: (a, b) => {
      return a.name.localeCompare(b.name);
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
    title: '性别',
    dataIndex: 'sex',
    width: 60,
    resizable: true,
    ellipsis: true,
    helpMessage: '检测人性别',
    customRender: ({ text }) => {
      return h(Tooltip, { title: genderTextProcess(text) }, () =>
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
          genderTextProcess(text),
        ),
      );
    },
  },
  {
    title: '年龄',
    dataIndex: 'age',
    width: 60,
    resizable: true,
    ellipsis: true,
    helpMessage: '检测人年龄',
    sorter: (a, b) => {
      return a.age - b.age;
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
    title: '出生日期',
    dataIndex: 'birthday',
    ifShow: () => false,
    sorter: (a, b) => {
      return a.birthday.localeCompare(b.birthday);
    },
    width: 120,
    resizable: true,
    ellipsis: true,
    helpMessage: '检测人出生日期，可能由年龄计算，作为参考',
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
    title: '送检单位',
    dataIndex: 'sampleUserGroupName',
    width: 110,
    resizable: true,
    ellipsis: true,
    helpMessage: '指定样本归属的单位名称',
    ifShow: userStore.userInfo?.isInternalGroup,
    sorter: (a, b) => {
      if (a.sampleUserGroupName === null && b.sampleUserGroupName === null) {
        return 0;
      } else if (a.sampleUserGroupName === null) {
        return 1;
      } else if (b.sampleUserGroupName === null) {
        return -1;
      } else {
        return a.sampleUserGroupName.localeCompare(b.sampleUserGroupName);
      }
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
    title: '项目',
    dataIndex: 'projects',
    width: 250,
    resizable: true,
    ellipsis: true,
    helpMessage: '检测人所涉及的检验项目，颜色代表不同状态',
    // ellipsis: true,
  },
  {
    title: '项目数量',
    dataIndex: 'projectsNum',
    width: 90,
    resizable: true,
    ellipsis: true,
    helpMessage: '检验的项目总数量',
    sorter: (a, b) => {
      return a.projects.length - b.projects.length;
    },
    customRender: ({ text, record, index }) => {
      return h(Tooltip, { title: record?.projects?.length }, () =>
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
          record?.projects?.length,
        ),
      );
    },
  },
  {
    title: '项目状态数量',
    dataIndex: 'projectStatusStatistics',
    width: 120,
    resizable: true,
    ellipsis: true,
    helpMessage: '样本含项目的状态数量',
  },
  {
    title: '样本状态',
    dataIndex: 'status',
    width: 90,
    resizable: true,
    ellipsis: true,
    helpMessage:
      '样本状态，通过汇总所有检验项目的项目状态，得到的样本综合状态。有以下类型：【无项目】、【无确认项目】、【等待检测】、【正在检测】、【部分完成】、【全部完成】。用户可参考样本综合状态进行行为决策。',
    customRender: ({ text }) => {
      return h(Tooltip, { title: sampleStatusProcess(text) }, () =>
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
          sampleStatusProcess(text),
        ),
      );
    },
  },
  {
    title: '物流信息',
    dataIndex: 'logisticsTrackingNumber',
    width: 150,
    resizable: true,
    ellipsis: true,
    helpMessage: '物流信息: 显示格式{物流单号:手机号后四位}',
    customRender: ({ text, record, index }) => {
      return h(Tooltip, { title: logisticsInfoProcess(record) }, () =>
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
          logisticsInfoProcess(record),
        ),
      );
    },
  },
  {
    title: '代管用户',
    dataIndex: 'managedUsers',
    ifShow: false,
    width: 100,
    resizable: true,
    ellipsis: true,
    helpMessage: '表示该样本的授权代管权用户',
    customRender: ({ text }) => {
      return h(Tooltip, { title: text.join(',') }, () =>
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
          text.join(','),
        ),
      );
    },
  },
  {
    title: '附件',
    dataIndex: 'fileInfo',
    width: 150,
    resizable: true,
    ellipsis: true,
    ifShow: true,
  },
  {
    title: '提交时间',
    dataIndex: 'submissionTime',
    width: 150,
    resizable: true,
    ellipsis: true,
    sorter: (a, b) => {
      return a.submissionTime.localeCompare(b.submissionTime);
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
    title: '更新时间',
    dataIndex: 'updateTime',
    width: 150,
    resizable: true,
    ellipsis: true,
    sorter: (a, b) => {
      if (a.updateTime === null && b.updateTime === null) {
        return 0;
      } else if (a.updateTime === null) {
        return 1;
      } else if (b.updateTime === null) {
        return -1;
      } else {
        return a.updateTime.localeCompare(b.updateTime);
      }
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
    title: '备注',
    dataIndex: 'remarks',
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
];
