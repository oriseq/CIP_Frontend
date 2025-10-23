import { defHttpForRes } from '@/utils/http/axios';

export interface Message {
  avatar: string;
  // 通知的标题内容
  title: string;
  description: string;
  type: string; // 通知：1  消息：2  待办：3
  extra?: string; // 待办类型：额外显示文本
  color?: string; // 待办类型：额外显示标签的颜色
  userIds: number[]; // 发送给哪个用户
}

export enum MessageType {
  NOTIFICATION = 1,
  MESSAGE = 2,
  TODO = 3,
}

export function getMessageTypeLabel(value: MessageType): string {
  switch (value) {
    case MessageType.NOTIFICATION:
      return '通知';
    case MessageType.MESSAGE:
      return '消息';
    case MessageType.TODO:
      return '待办';
    default:
      throw new Error(`Invalid message type value: ${value}`);
  }
}

export default function () {
  // 方法
  async function sendNotify(msg: Message) {
    const rsp = await defHttpForRes.post({
      url: '/message/msg',
      params: msg,
    });
    console.log('rsp: ', rsp);
  }

  //向外部暴露数据
  return { sendNotify };
}
