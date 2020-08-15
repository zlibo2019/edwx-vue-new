import base from '../base';
import http from '../http';

const Spend = {
  getMxRecord(params) {
    return http.post(`${base.dev}/xfMx/selectRecordList`, params);
  },

  getXfRecord(params) {
    return http.post(`${base.dev}/xfMx/collectSum`, params);
  },


};
export default Spend;
