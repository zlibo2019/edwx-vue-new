const Params = {
  // 外勤调整范围 默认1000
  radius: 1000,
  // 是否多企业模式
  mode: '0',
  // 定位考勤、外勤是否拍照 默认0
  attence: '0',
  // 定位考勤是否显示外勤 默认1
  outside: '1',
  // 是否显示解绑按钮 默认1
  unlock: '1',
  // 通知公告是否标准 默认1
  message: '1',
  // 审批人是否可选 默认1
  approve: '1',
  // 抄送人是否可选 默认1
  copyuser: '1',
  // 申请审批是否根据员工员工权限
  appcopy: '0',
  // 请假时长是否显示 默认1
  leaveLength: '1',
  // 外勤显示内容
  commonList: [
    {key: '1', value: '作为上班打卡'},
    {key: '2', value: '作为下班打卡'},
  ],
  // 我的显示样式
  mytheme: '0',

  setRadius(radius) {
    this.radius = radius;
  },

  setMode(mode) {
    this.mode = mode;
  },

  setAttence(attence) {
    this.attence = attence;
  },

  setOutside(outside) {
    this.outside = outside;
  },

  setUnlock(unlock) {
    this.unlock = unlock;
  },

  setMessage(message) {
    this.message = message;
  },

  setApprove(approve) {
    this.approve = approve;
  },

  setCopyuser(copyuser) {
    this.copyuser = copyuser;
  },

  setAppcopy(appcopy) {
    this.appcopy = appcopy;
  },

  setLeaveLength(leaveLength) {
    this.leaveLength = leaveLength;
  },

  setCommonList(commonList) {
    this.commonList = commonList;
  },

  setMytheme(mytheme) {
    this.mytheme = mytheme;
  },
};

export default Params;
