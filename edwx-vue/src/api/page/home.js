import base from '../base';
import http from '../http';

const Home = {
  getScanResult(params) {
    return http.post(`${base.dev}/ktJl/scanResult`, params);
  },
  getQrcode(params) {
    return http.post(`${base.dev}/user/getCode`, params);
  },
  getAccountInfo(params) {
    return http.post(`${base.dev}/xfMx/accountSum`, params);
  },
  getAccountRecords(params) {
    return http.post(`${base.dev}/xfMx/selectAccountRecord`, params);
  },
  recharge(params) {
    return http.put(`${base.dev}/account/payOrder`, params);
  },
  getRechargeRecord(params) {
    return http.post(`${base.dev}/xfMx/selectAccountRecharge`, params);
  },
  getHomeMenu(params) {
    return http.post(`${base.dev}/userMenus/selectListByEntity`, params);
  },
  getResultDetail(params) {
    return http.post(`${base.dev}/account/getResultDetail`, params);
  },
  getAllMenu(params) {
    return http.post(`${base.dev}/systemMenus/selectListByEntity`, params);
  },
  saveMyMenu(params) {
    return http.put(`${base.dev}/userMenus/insert`, params);
  },
};
export default Home;
