import base from '../base';
import http from '../http';

const My = {
  loginOut(params) {
    return http.post(`${base.dev}/user/unbindRelation`, params);
  },
  deleteInfo(openId) {
    return http.delete(`${base.dev}/companyUserInfo/deleteByPrimaryKey`, {params: {openId}});
  },
  pushMessage(params) {
    return http.post(`${base.dev}/loginOpenid/updateSendState`, params);
  },
  selectSendState(params) {
    return http.post(`${base.dev}/loginOpenid/selectSendState`, params);
  },
  updatePwd(params) {
    return http.post(`${base.dev}/user/updatePwd`, params);
  },
  updateDefaultPwd(params) {
    return http.post(`${base.dev}/user/updateDefaultPwd`, params);
  },
  getCardState(params) {
    return http.post(`${base.dev}/card/getCardState`, params);
  },
  getCardInfo(params) {
    return http.post(`${base.dev}/user/getCardInfo`, params);
  },
  cardLoss(params) {
    return http.post(`${base.dev}/user/cardLoss`, params);
  },
  setWxHeadImage(params) {
    return http.post(`${base.dev}/userInfo/setWxHeadImage`, params);
  },
  getWxHeadImage(userSerial) {
    return http.get(`${base.dev}/userInfoExtend/selectByPrimaryKey`, {params: {userSerial}});
  },
  getUserHeadImage(userSerial) {
    return http.get(`${base.dev}/user/getUserHeadImage`, {params: {userSerial}});
  },
};
export default My;
