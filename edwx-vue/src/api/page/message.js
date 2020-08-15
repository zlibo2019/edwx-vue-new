import base from '../base';
import http from '../http';

const Message = {
  getMessageDetail(params) {
    if (window.vm.$params.message === '1') {
      return http.post(`${base.dev}/nEWS/selectByPrimaryKey`, params);
    } else {
      return http.post(`${base.dev}/nEWS/selectByPrimaryKeyNew`, params);
    }
  },
  getMessageData(params) {
    if (window.vm.$params.message === '1') {
      return http.post(`${base.dev}/nEWS/selectListPageByEntity`, params);
    } else {
      return http.post(`${base.dev}/nEWS/selectListPageByEntityNew`, params);
    }
  },
};
export default Message;
