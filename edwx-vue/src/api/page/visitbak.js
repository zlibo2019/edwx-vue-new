import base from '../base';
import http from '../http';

const Visit = {
  addVisitorOrder(params) {
    return http.put(`${base.dev}/visRegister/insert`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/visRegister/updateByPrimaryKey`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/visRegister/selectListPageByEntity`, params);
  },
  selectListByEntity(params) {
    return http.post(`${base.dev}/visRegion/selectListByEntity`, params);
  },
  getVisitorQrCode(userSerial, reqUrl) {
    return http.get(`${base.dev}/visRegister/getVisitorQrCode`, {params: {userSerial, reqUrl}});
  },
  selectByPrimaryKey(xh) {
    return http.get(`${base.dev}/visRegister/selectByPrimaryKey`, {params: {xh}});
  },
  getWxOpenIdByCode(code) {
    return http.get(`${base.dev}/user/getWxOpenIdByCode`, {params: {code}});
  },
  getVisitorInfo(openId) {
    return http.get(`${base.dev}/visUser/selectByPrimaryKey`, {params: {openId}});
  },
  checkVisitorQrCode(params, openId) {
    return http.get(`${base.dev}/visRegister/checkVisitorQrCode`, {params: {params, openId}});
  },
  getReasonList(params) {
    return http.post(`${base.dev}/visThing/selectListByEntity`, params);
  },
  getPlaceList(params) {
    return http.post(`${base.dev}/visRegion/selectListByEntity`, params);
  },
};
export default Visit;
