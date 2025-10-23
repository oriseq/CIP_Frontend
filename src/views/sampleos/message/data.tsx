import { FormSchema } from '@/components/Form';
import { defHttp, defHttpForRes } from '@/utils/http/axios';

export interface ListItem {
  title: string;
  icon: string;
  color?: string;
}

export interface TabItem {
  key: string;
  name: string;
  list: ListItem[];
  unreadlist?: ListItem[];
}

export const tags: string[] = [
  '很有想法的',
  '专注设计',
  '川妹子',
  '大长腿',
  '海纳百川',
  '前端开发',
  'vue3',
];

export const teams: ListItem[] = [
  {
    icon: 'ri:alipay-fill',
    title: '科学搬砖组',
    color: '#ff4000',
  },
  {
    icon: 'emojione-monotone:letter-a',
    title: '中二少年团',
    color: '#7c51b8',
  },
  {
    icon: 'ri:alipay-fill',
    title: '高逼格设计',
    color: '#00adf7',
  },
  {
    icon: 'jam:codepen-circle',
    title: '程序员日常',
    color: '#00adf7',
  },
  {
    icon: 'fa:behance-square',
    title: '科学搬砖组',
    color: '#7c51b8',
  },
  {
    icon: 'jam:codepen-circle',
    title: '程序员日常',
    color: '#ff4000',
  },
];

export const details: ListItem[] = [
  {
    icon: 'ic:outline-contacts',
    title: '交互专家',
  },
  {
    icon: 'grommet-icons:cluster',
    title: '某某某事业群',
  },
  {
    icon: 'bx:bx-home-circle',
    title: '福建省厦门市',
  },
];

export const actions: any[] = [
  { icon: 'clarity:star-line', text: '156', color: '#018ffb' },
  { icon: 'bx:bxs-like', text: '156', color: '#459ae8' },
  { icon: 'bx:bxs-message-dots', text: '2', color: '#42d27d' },
];

export const articleList = (() => {
  const result: any[] = [];
  for (let i = 0; i < 4; i++) {
    result.push({
      title: 'Lims-X',
      description: ['Vben', '设计语言', 'Typescript'],
      content: '基于Vue Next, TypeScript, Ant Design实现的一套完整的企业级后台管理系统。',
      time: '2020-11-14 11:20',
    });
  }
  return result;
})();

export const applicationList = (() => {
  const result: any[] = [];
  for (let i = 0; i < 8; i++) {
    result.push({
      title: 'Lims-X',
      icon: 'emojione-monotone:letter-a',
      color: '#1890ff',
      active: '100',
      new: '1,799',
      download: 'bx:bx-download',
    });
  }
  return result;
})();

export const tabListData: TabItem[] = [
  {
    key: '1',
    name: '通知',
    list: [],
  },
  // {
  //   key: '3',
  //   name: '待办',
  //   list: [],
  // },
];
/*export const tabListData: TabItem[] = [
  {
    key: '1',
    name: '通知',
    list: [
      {
        id: '000000001',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/ThXAXghbEsBCCSDihZxY.png',
        title: '你收到了 14 份新周报',
        description: 'rrerewrewrewrewrewrew周报',
        datetime: '2017-08-09 12:11:02',
        type: '1',
      },
      {
        id: '000000002',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/OKJXDXrmkNshAMvwtvhu.png',
        title: '你推荐的 曲妮妮 已通过第三轮面试',
        description:
          '已通过基于Vue Next, TypeScript, Ant Design实现的一套完整的企业级后台管理系统。Ant Design实现的一套完整的企业级后台管理系统。Ant Design实现的一套完整的企业级后台管理系统。',
        datetime: '2017-08-08 12:11:02',
        type: '1',
      },
      {
        id: '000000003',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/kISTdvpyTAhtGxpovNWd.png',
        title: '这种模板可以区分多种通知类型',
        description:
          '描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息描述信息',
        datetime: '2017-08-07 12:11:02',
        read: true,
        type: '1',
      },
      {
        id: '000000004',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title: '左侧图标用于区分不同的类型',
        description: '',
        datetime: '2017-08-07 23:11:02',
        type: '1',
      },
      {
        id: '000000005',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title:
          '标题可以设置自动显示省略号，本例中标题行数已设为1行，如果内容超过1行将自动截断并支持tooltip显示完整标题。',
        description: '',
        datetime: '2017-08-07',
        type: '1',
      },
      {
        id: '000000006',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title: '左侧图标用于区分不同的类型',
        description: '',
        datetime: '2017-08-07',
        type: '1',
      },
      {
        id: '000000007',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title: '左侧图标用于区分不同的类型',
        description: '',
        datetime: '2017-08-07',
        type: '1',
      },
      {
        id: '000000008',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title: '左侧图标用于区分不同的类型',
        description: '',
        datetime: '2017-08-07',
        type: '1',
      },
      {
        id: '000000009',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title: '左侧图标用于区分不同的类型',
        description: '',
        datetime: '2017-08-07',
        type: '1',
      },
      {
        id: '000000010',
        avatar: 'https://gw.alipayobjects.com/zos/rmsportal/GvqBnKhFgObvnSGkDsje.png',
        title: '左侧图标用于区分不同的类型',
        description: '',
        datetime: '2017-08-07',
        type: '1',
      },
    ],
  },
  {
    key: '3',
    name: '待办',
    list: [
      {
        id: '000000009',
        avatar: '',
        title: '任务名称',
        description: '任务需要在 2017-01-12 20:00 前启动',
        datetime: '',
        extra: '未开始',
        color: '',
        type: '3',
      },
      {
        id: '000000010',
        avatar: '',
        title: '第三方紧急代码变更',
        description: '冠霖 需在 2017-01-07 前完成代码变更任务',
        datetime: '',
        extra: '马上到期',
        color: 'red',
        type: '3',
      },
      // {
      //   id: '000000011',
      //   avatar: '',
      //   title: '信息安全考试',
      //   description: '指派竹尔于 2017-01-09 前完成更新并发布',
      //   datetime: '',
      //   extra: '已耗时 8 天',
      //   color: 'gold',
      //   type: '3',
      // },
      // {
      //   id: '000000012',
      //   avatar: '',
      //   title: 'ABCD 版本发布',
      //   description: '指派竹尔于 2017-01-09 前完成更新并发布',
      //   datetime: '',
      //   extra: '进行中',
      //   color: 'blue',
      //   type: '3',
      // },
    ],
  },
];*/

export const schemas: FormSchema[] = [
  {
    field: 'content',
    component: 'Input',
    label: '内容',
    labelWidth: 75,
    helpMessage: '可搜索标题+描述里的内容',
    colProps: {
      span: 6,
    },
    // componentProps: {
    //   onChange: (e: any) => {
    //     console.log(e);
    //   },
    // },
  },
  {
    field: 'datetime',
    component: 'RangePicker',
    // labelWidth: 50,
    label: '时间',
    colProps: {
      // span: 6,
    },
    componentProps: {
      format: 'YYYY-MM-DD',
      placeholder: ['开始日期、时间', '结束日期、时间'],
      // showTime: { format: 'HH:mm:ss' },
      onChange: (e: any) => {
        if (e[0] && e[1]) {
          e[0].$H = 0;
          e[1].$H = 23;
          e[0].$m = 0;
          e[1].$m = 59;
          e[0].$s = 0;
          e[1].$s = 59;
        }
      },
    },
  },
  {
    field: 'secondaryType',
    component: 'ApiSelect',
    label: '类型',
    colProps: {
      span: 6,
    },
    componentProps: {
      api: async () => {
        const rsp = await getMsgSecondaryTypeApi({ type: 1 });
        console.log('secondaryType-rsp', rsp);
        return rsp;
      },
      params: {
        type: 1,
      },
      resultField: 'result',
      labelField: 'secondaryType',
      valueField: 'secondaryType',
      // mode: 'multiple',
      // showSearch: true,
      // filterOption: (input, option) => {
      //   if (option?.label.includes(input)) {
      //     return true;
      //   }
      //   // console.log('input:', input);
      //   // console.log('option:', option);
      //   return false;
      // },
    },
  },
  {
    /*
    查收类型
      未查收
        对应status等于0或1
      已查收
        对应status等于2
    * */
    field: 'externalState',
    component: 'Select',
    label: '状态',
    colProps: {
      span: 6,
    },
    componentProps: {
      options: [
        {
          label: '未查收',
          value: '0',
          key: '1',
        },
        {
          label: '已查收',
          value: '1',
          key: '2',
        },
      ],
    },
  },
];

export const schemas2: FormSchema[] = [
  {
    field: 'content',
    component: 'Input',
    label: '内容',
    // labelWidth: 75,
    helpMessage: '可搜索标题+描述里的内容',
    colProps: {
      span: 6,
    },
    // componentProps: {
    //   onChange: (e: any) => {
    //     console.log(e);
    //   },
    // },
  },
  {
    field: 'datetime',
    component: 'RangePicker',
    // labelWidth: 50,
    label: '时间',
    colProps: {
      // span: 6,
    },
    componentProps: {
      format: 'YYYY-MM-DD',
      placeholder: ['开始日期、时间', '结束日期、时间'],
      // showTime: { format: 'HH:mm:ss' },
      onChange: (e: any) => {
        if (e[0] && e[1]) {
          e[0].$H = 0;
          e[1].$H = 23;
          e[0].$m = 0;
          e[1].$m = 59;
          e[0].$s = 0;
          e[1].$s = 59;
        }
      },
    },
  },
  {
    field: 'secondaryType',
    component: 'ApiSelect',
    label: '类型',
    colProps: {
      span: 6,
    },
    componentProps: {
      api: async () => {
        const rsp = await getMsgSecondaryTypeApi({ type: 3 });
        console.log('secondaryType-rsp', rsp);
        return rsp;
      },
      params: {
        type: 3,
      },
      resultField: 'result',
      labelField: 'secondaryType',
      valueField: 'secondaryType',
      // mode: 'multiple',
      // showSearch: true,
      // filterOption: (input, option) => {
      //   if (option?.label.includes(input)) {
      //     return true;
      //   }
      //   // console.log('input:', input);
      //   // console.log('option:', option);
      //   return false;
      // },
    },
  },
  {
    /*
    查收类型
      未查收
        对应status等于0或1
      已查收
        对应status等于2
    * */
    field: 'externalState',
    component: 'Select',
    label: '状态',
    colProps: {
      span: 6,
    },
    componentProps: {
      options: [
        {
          label: '未完结',
          value: '0',
          key: '1',
        },
        {
          label: '已完结',
          value: '1',
          key: '2',
        },
      ],
    },
  },
];

enum Api {
  MSG_ALL = '/message/msgAll',
}

async function getMsgSecondaryTypeApi(params) {
  const rsp = await defHttpForRes.post({
    url: '/message/msgSecondaryType',
    params,
    headers: {
      // @ts-ignore
      ignoreCancelToken: true,
    },
  });
  console.log('getMsgSecondaryTypeApi-rsp', rsp);

  return rsp;
}

export const getAllMessage = (params) => {
  return defHttpForRes.post({
    url: Api.MSG_ALL,
    params,
  });
};
