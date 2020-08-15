import base from '../base';
import http from '../http';

const Leave = {
  getLeaveDetail(params) {
    return http.post(`${base.dev}/leave/selectLeaveByXh`, params);
  },
  selectLeave() {
    return http.post(`${base.dev}/leave/selectLeave`);
  },
  insertLeave(params) {
    return http.post(`${base.dev}/leave/insertLeave`, params);
  },
  deleteLeave(xh, userSerial, reason) {
    return http.delete(`${base.dev}/leave/deleteLeave`, {params: {xh, userSerial, reason}});
  },
  approvalLeave(params) {
    return http.post(`${base.dev}/leave/approvalLeave`, params);
  },
};
export default Leave;
