import base from '../base';
import http from '../http';

const Info = {
  addInfoFeedback(params) {
    return http.put(`${base.dev}/infoFeedback/insert`, params);
  },
  getInvoiceInfo(xh) {
    return http.get(`${base.dev}/invoiceInfo/selectByPrimaryKey`, {
      params: {
        xh,
      },
    });
  },
  getInfoList(params) {
    return http.post(`${base.dev}/infoFeedback/selectListPageByEntity`, params);
  },
  getInfoDetail(xh) {
    return http.get(`${base.dev}/infoFeedback/selectByPrimaryKey`, {
      params: {
        xh,
      },
    });
  },
};
export default Info;
