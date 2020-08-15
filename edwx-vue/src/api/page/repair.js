import base from '../base';
import http from '../http';

const Repair = {
  getRepairDetail(params) {
    return http.post(`${base.dev}/attendance/selectAttendance`, params);
  },
  insertRepair(params) {
    return http.post(`${base.dev}/attendance/insertAttendance`, params);
  },
  deleteRepair(xh, userSerial, reason) {
    return http.delete(`${base.dev}/attendance/deleteAttendance`, {params: {xh, userSerial, reason}});
  },
  approvalRepair(params) {
    return http.post(`${base.dev}/attendance/approvalAttendance`, params);
  },
};
export default Repair;
