// import Vue from 'vue'
// import FastClick from 'fastclick'
import App from './App';
import router from './router';
import store from './vuex/store';

import VueCropper from 'vue-cropper';

import Utils from './utils/index.js';
import API from './api/index.js';
import i18n from './locales/index.js';
import Params from './api/global.js';

import * as dd from 'dingtalk-jsapi';

// import DeviceDetect from 'mobile-device-detect';

import {
  ToastPlugin,
  LoadingPlugin,
  ConfirmPlugin,
  WechatPlugin,
  DatetimePlugin,
} from 'vux';

// import VueLocalStorage from 'vue-localstorage'
import VueTouch from 'vue-touch';

import './style/global.scss';
import animate from 'animate.css';

Vue.use(VueCropper);

Vue.use(animate);
Vue.use(API);
Vue.use(ToastPlugin);
Vue.use(LoadingPlugin);
Vue.use(ConfirmPlugin);
Vue.use(WechatPlugin);
Vue.use(DatetimePlugin);

Vue.use(VueTouch, {name: 'v-touch'});
FastClick.attach(document.body);

Vue.prototype.$dd = dd;
Vue.prototype.$utils = Utils;

Vue.prototype.$code = {
  success: 600,
  fail: 601,
  cancel: 602,
};

// Params.setCommonList([]);
// Params.setOutside('0');

// // 东药
// Params.setRadius(100);
// Params.setAttence('1');
// Params.setOutside('0');
// Params.setLeaveLength('0');
// Params.setCommonList(
//   [
//     {key: '1', value: '工作指标打点'},
//     {key: '2', value: '考勤打点'},
//   ],
// );
//

// // 童泰
// Params.setMytheme('1');

// // 澳森
// Params.setUnlock('0');
// Params.setMessage('0');
// Params.setApprove('0');
// Params.setCopyuser('0');
// Params.setAppcopy('1');

Vue.prototype.$params = Params;

Vue.prototype.$constant = {
  msgShowLen: 'MESSAGE_SHOW_LENGTH',
  repairAttendanceType: 'REPAIR_ATTENDANCE_TYPE',
};

Vue.config.productionTip = false;

let home = ['Index', 'Schedule', 'Linkman', 'My', 'Login', 'RegisterResult', 'InvalidCode'];
let detail = ['LeaveDetail', 'GoOutDetail', 'OverTimeDetail', 'ChangeShiftDetail', 'ContractDetail',
  'RepairAttendanceDetail', 'DineHome', 'MeetingDetail', 'RepairDetail', 'RepairAppInfo',
  'VisitorDetail', 'Attendances', 'LivingPage'];

window.onpopstate = () => {
  if (home.indexOf(window.vm.$route.name) > -1) {
    window.vm.$route.params['flag'] = false;
    Utils.Tools.getEnv(res => {
      if (res === 0) {
        Vue.wechat.miniProgram.navigateBack({
          delta: 1,
        });
      } else if (res === 1) {
        WeixinJSBridge.call('closeWindow');
      } else {
        dd.biz.navigation.close();
      }
    });
  }

  if (detail.indexOf(window.vm.$route.name) > -1) {
    if (window.vm.$route.params['notification']) {
      router.push('/');
    }
  }
};

/* eslint-disable no-new */
window.vm = new Vue({
  router,
  store,
  i18n,
  render: h => h(App),
}).$mount('#app-box');

// new VConsole();
