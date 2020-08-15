import base from '../base';
import http from '../http';

const Out = {
  getOutDetail(params) {
    return http.post(`${base.dev}/out/selectOutByXh`, params);
  },
  insertOut(params) {
    return http.post(`${base.dev}/out/insertOut`, params);
  },
  deleteOut(xh, userSerial, reason) {
    return http.delete(`${base.dev}/out/deleteOut`, {params: {xh, userSerial, reason}});
  },
  approvalOut(params) {
    return http.post(`${base.dev}/out/approvalOut`, params);
  },
};
export default Out;
