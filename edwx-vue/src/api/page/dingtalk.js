import base from '../base';
import http from '../http';

const DingTalk = {
  getUnionId(code) {
    return http.get(`${base.dev}/user/getUserId`, {params: {code}});
  },
  getDtConfig(url) {
    return http.get(`${base.dev}/common/getDtConfig`, {params: {url}});
  },
  getPayInfo(fee) {
    return http.get(`${base.dev}/pay/getPayInfo`, {params: {fee}});
  },
  redirectPay(fee) {
    return http.get(`${base.dev}/pay/redirectPay`, {params: {fee}});
  },
  payDtOrder(params) {
    return http.put(`${base.dev}/account/payDtOrder`, params);
  },
  payDtOrderTemp(params) {
    return http.put(`${base.dev}/account/payDtOrderTemp`, params);
  },
  getDtResultDetail(params) {
    return http.post(`${base.dev}/account/getDtResultDetail`, params);
  },
};
export default DingTalk;
