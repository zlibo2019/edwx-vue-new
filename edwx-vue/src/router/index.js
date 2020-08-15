// import Vue from 'vue'
// import Router from 'vue-router'

// Vue.use(Router);

import Utils from '../utils';
import API from '../api';

const router = new VueRouter({
  routes: [
    {
      path: '/Login',
      name: 'Login',
      component: () => import('@/components/page/Login/Login'),
      meta: {
        title: '登录',
      },
    },
    {
      path: '/',
      name: 'Home',
      component: () => import('@/components/page/Home/Home'),
      children: [
        {
          path: '/',
          name: 'Index',
          component: () => import('@/components/page/Index/Index'),
          meta: {
            title: '主页',
          },
        },
        {
          path: '/Schedule',
          name: 'Schedule',
          component: () => import('@/components/page/Schedule/Schedule'),
          meta: {
            title: '日程',
          },
        },
        {
          path: '/Linkman',
          name: 'Linkman',
          component: () => import('@/components/page/Linkman/Linkman'),
          meta: {
            title: '通讯录',
          },
        },
        {
          path: '/My',
          name: 'My',
          component: () => import('@/components/page/My/My'),
          meta: {
            title: '我',
          },
        },
      ],
    },
    {
      path: '/MyQrcode',
      name: 'MyQrcode',
      component: () => import('@/components/page/Index/MyQrcode'),
      meta: {
        title: '二维码',
      },
    },
    {
      path: '/Account',
      name: 'Account',
      component: () => import('@/components/page/Index/Account'),
      meta: {
        title: '账户',
      },
    },
    {
      path: '/Recharge',
      name: 'Recharge',
      component: () => import('@/components/page/Index/Recharge'),
      meta: {
        title: '充值',
      },
    },
    {
      path: '/RechargeRecord',
      name: 'RechargeRecord',
      component: () => import('@/components/page/Index/RechargeRecord'),
      meta: {
        title: '充值记录',
      },
    },
    {
      path: '/MessageList',
      name: 'MessageList',
      component: () => import('@/components/page/Index/MessageList'),
      meta: {
        title: '通知列表',
      },
    },
    {
      path: '/Message',
      name: 'Message',
      component: () => import('@/components/page/Index/Message'),
      meta: {
        title: '通知详情',
      },
    },
    {
      path: '/Application',
      name: 'Application',
      component: () => import('@/components/page/Application/Application'),
      meta: {
        title: '申请审批',
      },
    },
    {
      path: '/MyApply',
      name: 'MyApply',
      component: () => import('@/components/page/Application/MyApply'),
      meta: {
        title: '我的申请',
      },
    },
    {
      path: '/LeaveDetail',
      name: 'LeaveDetail',
      component: () => import('@/components/page/Application/LeaveDetail'),
      meta: {
        title: '请假详情',
      },
    },
    {
      path: '/GoOutDetail',
      name: 'GoOutDetail',
      component: () => import('@/components/page/Application/GoOutDetail'),
      meta: {
        title: '公出详情',
      },
    },
    {
      path: '/OverTimeDetail',
      name: 'OverTimeDetail',
      component: () => import('@/components/page/Application/OverTimeDetail'),
      meta: {
        title: '加班详情',
      },
    },
    {
      path: '/ChangeShiftDetail',
      name: 'ChangeShiftDetail',
      component: () => import('@/components/page/Application/ChangeShiftDetail'),
      meta: {
        title: '调班详情',
      },
    },
    {
      path: '/RepairAttendanceDetail',
      name: 'RepairAttendanceDetail',
      component: () => import('@/components/page/Application/RepairAttendanceDetail'),
      meta: {
        title: '补出勤详情',
      },
    },
    {
      path: '/ContractDetail',
      name: 'ContractDetail',
      component: () => import('@/components/page/Application/ContractDetail'),
      meta: {
        title: '合同详情',
      },
    },
    {
      path: '/SelectMen',
      name: 'SelectMen',
      component: () => import('@/components/page/Application/SelectMen'),
    },
    {
      path: '/MyApproval',
      name: 'MyApproval',
      component: () => import('@/components/page/Application/MyApproval'),
      meta: {
        title: '我审批的',
      },
    },
    {
      path: '/CopyToMe',
      name: 'CopyToMe',
      component: () => import('@/components/page/Application/CopyToMe'),
      meta: {
        title: '抄送我的',
      },
    },
    {
      path: '/LeaveApply',
      name: 'LeaveApply',
      component: () => import('@/components/page/Application/LeaveApply'),
      meta: {
        title: '请假申请',
      },
    },
    {
      path: '/GoOut',
      name: 'GoOut',
      component: () => import('@/components/page/Application/GoOut'),
      meta: {
        title: '公出申请',
      },
    },
    {
      path: '/Overtime',
      name: 'Overtime',
      component: () => import('@/components/page/Application/Overtime'),
      meta: {
        title: '加班申请',
      },
    },
    {
      path: '/ChangeShift',
      name: 'ChangeShift',
      component: () => import('@/components/page/Application/ChangeShift'),
      meta: {
        title: '调班申请',
      },
    },
    {
      path: '/Contract',
      name: 'Contract',
      component: () => import('@/components/page/Application/Contract'),
      meta: {
        title: '合同申请',
      },
    },
    {
      path: '/RepairAttendance',
      name: 'RepairAttendance',
      component: () => import('@/components/page/Application/RepairAttendance'),
      meta: {
        title: '补出勤申请',
      },
    },
    {
      path: '/ChangePWD',
      name: 'ChangePWD',
      component: () => import('@/components/page/My/ChangePWD'),
      meta: {
        title: '修改密码',
      },
    },
    {
      path: '/LossSolution',
      name: 'LossSolution',
      component: () => import('@/components/page/My/LossSolution'),
      meta: {
        title: '卡片挂失',
      },
    },
    {
      path: '/DineHome',
      name: 'DineHome',
      component: () => import('@/components/page/Dine/DineHome'),
      meta: {
        title: '预约订餐',
      },
    },
    {
      path: '/OrderMeeting',
      name: 'OrderMeeting',
      component: () => import('@/components/page/Meeting/OrderMeeting'),
      meta: {
        title: '会议预约',
      },
    },
    {
      path: '/MeetingRoomDetail',
      name: 'MeetingRoomDetail',
      component: () => import('@/components/page/Meeting/MeetingRoomDetail'),
      meta: {
        title: '会议室预约详情',
      },
    },
    {
      path: '/MakeOrder',
      name: 'MakeOrder',
      component: () => import('@/components/page/Meeting/MakeOrder'),
      meta: {
        title: '预约会议',
      },
    },
    {
      path: '/MyMeetingOrder',
      name: 'MyMeetingOrder',
      component: () => import('@/components/page/Meeting/MyMeetingOrder'),
      meta: {
        title: '我的会议预约',
      },
    },
    {
      path: '/MeetingDetail',
      name: 'MeetingDetail',
      component: () => import('@/components/page/Meeting/MeetingDetail'),
      meta: {
        title: '会议预约详情',
      },
    },
    {
      path: '/MyApplyTrip',
      name: 'MyApplyTrip',
      component: () => import('@/components/page/BusinessTrip/MyApplyTrip'),
      meta: {
        title: '出差详情',
      },
    },
    {
      path: '/MakeTrip',
      name: 'MakeTrip',
      component: () => import('@/components/page/BusinessTrip/MakeTrip'),
      meta: {
        title: '出差申请',
      },
    },
    {
      path: '/FaceTake',
      name: 'FaceTake',
      component: () => import('@/components/page/Face/FaceTake'),
      meta: {
        title: '人脸采集',
      },
    },
    {
      path: '/ManList',
      name: 'ManList',
      component: () => import('@/components/page/Public/ManList'),
      meta: {
        title: '人员选择',
      },
    },
    {
      path: '/RichScan',
      name: 'RichScan',
      component: () => import('@/components/page/Index/RichScan'),
      meta: {
        title: '扫一扫',
      },
    },
    {
      path: '/Jumper',
      name: 'Jumper',
      component: () => import('@/components/page/Public/Jumper'),
    },
    {
      path: '/DineDetail',
      name: 'DineDetail',
      component: () => import('@/components/page/Dine/DineDetail'),
      meta: {
        title: '订餐记录',
      },
    },
    {
      path: '/FeedBack',
      name: 'FeedBack',
      component: () => import('@/components/page/Info/FeedBack'),
      meta: {
        title: '信息反馈',
      },
    },
    {
      path: '/InvoiceInfo',
      name: 'InvoiceInfo',
      component: () => import('@/components/page/Info/InvoiceInfo'),
      meta: {
        title: '发票信息',
      },
    },
    {
      path: '/SpendDetail',
      name: 'SpendDetail',
      component: () => import('@/components/page/Consumption/SpendDetail'),
      meta: {
        title: '消费记录',
      },
    },
    {
      path: '/OutSide',
      name: 'OutSide',
      component: () => import('@/components/page/Attence/OutSide'),
      meta: {
        title: '外勤',
      },
    },
    {
      path: '/BdMap',
      name: 'BdMap',
      component: () => import('@/components/page/Attence/BdMap'),
      meta: {
        title: '地图定位',
      },
    },
    {
      path: '/StartWork',
      name: 'StartWork',
      component: () => import('@/components/page/Attence/StartWork'),
      meta: {
        title: '定位考勤',
      },
    },
    {
      path: '/Attendances',
      name: 'Attendances',
      component: () => import('@/components/page/Attence/Attendances'),
      meta: {
        title: '考勤汇总',
      },
    },
    {
      path: '/AttendDetail',
      name: 'AttendDetail',
      component: () => import('@/components/page/Attence/AttendDetail'),
      meta: {
        title: '考勤记录',
      },
    },
    {
      path: '/DoorControl',
      name: 'DoorControl',
      component: () => import('@/components/page/DoorControl/DoorControl'),
      meta: {
        title: '门禁开门',
      },
    },
    {
      path: '/OrgTree/:depSerial',
      name: 'OrgTree',
      component: () => import('@/components/page/Public/OrgTree'),
      meta: {
        title: '组织架构',
      },
    },
    {
      path: '/PayResult',
      name: 'PayResult',
      component: () => import('@/components/page/Index/PayResult'),
      meta: {
        title: '充值信息',
      },
    },
    {
      path: '/Temp',
      name: 'Temp',
      component: () => import('@/components/page/Dine/Temp'),
    },
    {
      path: '/InvitationList',
      name: 'InvitationList',
      component: () => import('@/components/page/Visitor/InvitationList'),
      meta: {
        title: '访客邀请记录',
      },
    },
    {
      path: '/VisitorDetail',
      name: 'VisitorDetail',
      component: () => import('@/components/page/Visitor/VisitorDetail'),
      meta: {
        title: '访客记录详情',
      },
    },
    {
      path: '/InvitationResult',
      name: 'InvitationResult',
      component: () => import('@/components/page/Visitor/InvitationResult'),
      meta: {
        title: '访客邀请结果',
      },
    },
    // {
    //   path: '/InvitePass',
    //   name: 'InvitePass',
    //   component: () => import('@/components/page/Visitor/InvitePass'),
    //   meta: {
    //     title: '邀请通行证'
    //   }
    // },
    {
      path: '/CompleteVisitorInfo',
      name: 'CompleteVisitorInfo',
      component: () => import('@/components/page/Visitor/CompleteVisitorInfo'),
      meta: {
        title: '邀请访客',
      },
    },
    {
      path: '/VisitorRegister',
      name: 'VisitorRegister',
      component: () => import('@/components/page/Visitor/VisitorRegister'),
      meta: {
        title: '访客登记',
      },
    },
    {
      path: '/CompanyInfoPage',
      name: 'CompanyInfoPage',
      component: () => import('@/components/page/Visitor/CompanyInfoPage'),
      meta: {
        title: '访客登记',
      },
    },
    {
      path: '/RegisterResult',
      name: 'RegisterResult',
      component: () => import('@/components/page/Visitor/RegisterResult'),
      meta: {
        title: '访客申请结果',
      },
    },
    // {
    //   path: '/InvalidCode',
    //   name: 'InvalidCode',
    //   component: () => import('@/components/page/Visitor/InvalidCode'),
    //   meta: {
    //     title: '邀请二维码失效'
    //   }
    // },
    {
      path: '/VisitPermit',
      name: 'VisitPermit',
      component: () => import('@/components/page/Visitor/VisitPermit'),
      meta: {
        title: '访客通行证',
      },
    },
    {
      path: '/InfoList',
      name: 'InfoList',
      component: () => import('@/components/page/InfoFeedback/InfoList'),
    },
    {
      path: '/InfoDetail',
      name: 'InfoDetail',
      component: () => import('@/components/page/InfoFeedback/InfoDetail'),
    },
    {
      path: '/RepairInfo',
      name: 'RepairInfo',
      component: () => import('@/components/page/Repair/RepairInfo'),
    },
    {
      path: '/RepairList',
      name: 'RepairList',
      component: () => import('@/components/page/Repair/RepairList'),
    },
    {
      path: '/RepairDetail',
      name: 'RepairDetail',
      component: () => import('@/components/page/Repair/RepairDetail'),
    },
    {
      path: '/RepairAppList',
      name: 'RepairAppList',
      component: () => import('@/components/page/Repair/RepairAppList'),
    },
    {
      path: '/RepairAppInfo',
      name: 'RepairAppInfo',
      component: () => import('@/components/page/Repair/RepairAppInfo'),
    },
    {
      path: '/AllPrograms',
      name: 'AllPrograms',
      component: () => import('@/components/page/Index/AllPrograms'),
      meta: {
        title: '编辑应用',
      },
    },
    {
      path: '/PlaceSelect',
      name: 'PlaceSelect',
      component: () => import('@/components/page/OrderMeals/PlaceSelect'),
      meta: {
        title: '选择餐厅',
        cancelFlag: '1',
      },
    },
    {
      path: '/MealOrdering',
      name: 'MealOrdering',
      component: () => import('@/components/page/OrderMeals/MealOrdering'),
      meta: {
        title: '预约订餐',
      },
    },
    {
      path: '/OrderPay',
      name: 'OrderPay',
      component: () => import('@/components/page/OrderMeals/OrderPay'),
      meta: {
        title: '订单结算',
      },
    },
    {
      path: '/OrderPayResult',
      name: 'OrderPayResult',
      component: () => import('@/components/page/OrderMeals/OrderPayResult'),
      meta: {
        title: '订单结算',
      },
    },
    {
      path: '/OrderRecord',
      name: 'OrderRecord',
      component: () => import('@/components/page/OrderMeals/OrderRecord'),
      meta: {
        title: '订餐记录',
      },
    },
    {
      path: '/OutsideList',
      name: 'OutsideList',
      component: () => import('@/components/page/Attence/OutsideList'),
      meta: {title: '外勤记录'},
    },
    {
      path: '/OutsideForm',
      name: 'OutsideForm',
      component: () => import('@/components/page/Attence/OutsideForm'),
      meta: {title: '外勤详情'},
    },
    {
      path: '/LivingPage',
      name: 'LivingPage',
      component: () => import('@/components/page/LivingInfo/LivingPage'),
      meta: {title: '警告详情'},
    },
    {
      path: '/AgentList',
      name: 'AgentList',
      component: () => import('@/components/page/Agent/AgentList'),
      meta: {title: '报备清单'},
    },
    {
      path: '/AgentForm',
      name: 'AgentForm',
      component: () => import('@/components/page/Agent/AgentForm'),
      meta: {title: '报备信息'},
    },
    {
      path: '/MealAppraiseList',
      name: 'MealAppraiseList',
      component: () => import('@/components/page/MealAppraise/MealAppraiseList'),
      meta: {title: '评价清单'},
    },
    {
      path: '/MealAppraiseForm',
      name: 'MealAppraiseForm',
      component: () => import('@/components/page/MealAppraise/MealAppraiseForm'),
      meta: {title: '就餐评价'},
    },
  ],
});

let nocheck = ['VisitorRegister', 'RegisterResult', 'CompleteVisitorInfo', 'VisitPermit', 'InvalidCode', 'CompanyInfoPage'];

// 全局路由守卫
router.beforeEach((to, from, next) => {
  let state = decodeURI(Utils.Tools.getQueryString('state'));
  if (state !== null && state !== '' && to.params.state === undefined) {
    to.params['state'] = state;
    to.params['notification'] = 1;      //设定一个状态值，默认为1，
  }

  if (nocheck.indexOf(to.name) > -1) {
    next();
  } else {
    let openId = Utils.Store.getItem('openId');
    let init = Utils.Store.getItem('init');
    let token = Utils.Store.getItem('token');
    let unionId = to.query.unionId;
    if (unionId !== undefined && init === null) {
      getOpenIdByUnionId(unionId, next);
    } else {
      Utils.Tools.getEnv(res => {
        if (res === 0 || res === 1) {
          let wxcode = Utils.Tools.getQueryString('code');
          // 已登录状态；当路由到Login时，跳转至Index
          if (openId === null && init === null) {
            if (res === 0) {
              setOpenId(wxcode, next);
            } else {
              getOpenId(wxcode, to, next, state);
            }
          } else {
            if (token === null && to.name !== 'Login') {
              router.replace({name: 'Login'});
            } else {
              next();
            }
          }
        } else {
          if (openId === null && init === null) {
            dtLogin(to, next, state);
          } else {
            if (token === null && to.name !== 'Login') {
              router.replace({name: 'Login'});
            } else {
              next();
            }
          }
        }
      });
    }
  }
});

// document.addEventListener('WeixinJSBridgeReady', function onBridgeReady() {
//   // 通过下面这个API隐藏右上角按钮
//   WeixinJSBridge.call('hideOptionMenu');
//   // WeixinJSBridge.call('showToolbar');        // 显示底部状态栏
// });

function onWeixinBridgeReady() {
  WeixinJSBridge.call('hideOptionMenu');
}

router.afterEach(function (to, from) {
  Utils.Tools.getEnv(res => {
    if (res === 1) {
      if (typeof WeixinJSBridge === 'undefined') {
        if (document.addEventListener) {
          document.addEventListener('WeixinJSBridgeReady', onWeixinBridgeReady, false);
        } else if (document.attachEvent) {
          document.attachEvent('WeixinJSBridgeReady', onWeixinBridgeReady);
          document.attachEvent('onWeixinJSBridgeReady', onWeixinBridgeReady);
        }
      } else {
        onWeixinBridgeReady();
      }
    }
  });

  document.body && (document.body.scrollTop = document.body.scrollTop);
  if (to.meta.title) {
    document.title = to.meta.title;
  } else {
    document.title = '智慧企业平台';
  }
});

function dtLogin(to, next, state) {
  API.$api.DingTalk.getDtConfig().then(response => {
    const {code, msg, data} = response;
    if (+code !== Vue.prototype.$code.success) {
      Utils.Tools.toastShow('获取企业信息异常');
      next(false);
    } else {
      Utils.DingTalk.getCode(data.corpId, info => {
        API.$api.DingTalk.getUnionId(info.code).then(response => {
          const {code, msg, data} = response;
          if (+code !== Vue.prototype.$code.success) {
            Utils.Tools.toastShow('获取用户信息异常');
            next(false);
          } else {
            getUserInfoByOpenId(data.userid, to, next, state);
          }
        }).catch(err => {
          console.log(err);
          Utils.Tools.toastShow('后台服务异常');
        });
      });
    }
  }).catch(err => {
    console.log(err);
    Utils.Tools.toastShow('后台服务异常');
  });
}

function getOpenIdByUnionId(unionId, next) {
  API.$api.Login.getOpenIdByUnionId(unionId, 10000).then(response => {
    const {code, msg, data} = response;
    if (+code !== Vue.prototype.$code.success) {
      if (+code === 601) {
        window.location = data.user1;
      } else if (+code === 605) {
        // 微信小程序返回
        // Utils.Tools.toastShow(msg);
        Vue.wechat.miniProgram.navigateBack({delta: 1});
        Vue.wechat.miniProgram.postMessage({code: '601', data: msg});
      }
      next(false);
    } else {
      Utils.Store.setItem('init', 1);
      Utils.Custom.setUserInfo(data);
      next();
    }
  }).catch(err => {
    Vue.wechat.miniProgram.navigateBack({delta: 1});
    Vue.wechat.miniProgram.postMessage({code: '601', data: '后台服务异常'});
  });
}

function setOpenId(wxcode, next) {
  API.$api.Login.setOpenId(wxcode).then(response => {
    const {code, msg, data} = response;
    Utils.Store.setItem('init', 1);
    if (+code !== Vue.prototype.$code.success) {
      // 微信小程序返回
      // Utils.Tools.toastShow(msg);
      Vue.wechat.miniProgram.navigateBack({delta: 1});
      Vue.wechat.miniProgram.postMessage({code: '601', data: msg});
    } else {
      Utils.Custom.setUserInfo(data);
      next();
    }
  }).catch(err => {
    Utils.Tools.getEnv(res => {
      if (res === 0) {
        Vue.wechat.miniProgram.navigateBack({delta: 1});
        Vue.wechat.miniProgram.postMessage({code: '601', data: '后台服务异常'});
      } else {
        Utils.Tools.toastShow('后台服务异常');
      }
    });
  });
}

function getOpenId(wxcode, to, next, state) {
  API.$api.Login.getOpenId(wxcode, Vue.prototype.$params.mode).then(response => {
    //正式
    const {code, msg, data} = response;
    let _data = data;
    Utils.Store.setItem('init', 1);
    if (_data.companyId) {
      Utils.Store.setItem('companyId', _data.companyId);
    }
    if (+code === Vue.prototype.$code.success) {
      getUserInfoByOpenId(_data.openId, to, next, state);
    } else {
      Utils.Tools.toastShow('获取微信OpenId失败');
      Utils.Store.removeItem('init');
    }
  }).catch(err => {
    console.log(err);
    Utils.Tools.getEnv(res => {
      if (res === 0) {
        Vue.wechat.miniProgram.navigateBack({delta: 1});
        Vue.wechat.miniProgram.postMessage({code: '601', data: '后台服务异常'});
      } else {
        Utils.Tools.toastShow('后台服务异常');
      }
    });
  });
}

function getUserInfoByOpenId(openId, to, next, state) {
  API.$api.Login.getUserInfoByOpenId(openId).then(response => {
    const {code, msg, data} = response;
    if (+code !== Vue.prototype.$code.success) {
      Utils.Store.setItem('openId', openId);
      if (to.name !== 'Login') {
        next({
          name: 'Login',
          params: {
            page: to.name,
            state: state,
          },
          replace: true,
        });
      } else {
        next();
      }
    } else {
      Utils.Custom.setUserInfo(data);
      next();
    }
  }).catch(err => {
  });
}


export default router;
