import base from '../base';
import http from '../http';

const Overtime = {
  getOvertimeDetail(params) {
    return http.post(`${base.dev}/overTime/selectOverTimeByXh`, params);
  },
  insertOverTime(params) {
    return http.post(`${base.dev}/overTime/insertOverTime`, params);
  },
  deleteOverTime(xh, userSerial, reason) {
    return http.delete(`${base.dev}/overTime/deleteOverTime`, {params: {xh, userSerial, reason}});
  },
  approvalOverTime(params) {
    return http.post(`${base.dev}/overTime/approvalOverTime`, params);
  },
};
export default Overtime;
