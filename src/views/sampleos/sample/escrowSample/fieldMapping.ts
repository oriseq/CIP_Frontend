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
