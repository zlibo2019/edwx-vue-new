import base from '../base';
import http from '../http';

const ChangeShift = {
  getChangeShiftDetail(params) {
    return http.post(`${base.dev}/moveShift/selectMoveShiftByXh`, params);
  },
  insertChangeShift(params) {
    return http.post(`${base.dev}/moveShift/insertMoveShift`, params);
  },
  deleteChangeShift(xh, userSerial, reason) {
    return http.delete(`${base.dev}/moveShift/deleteMoveShift`, {params: {xh, userSerial, reason}});
  },
  approvalChangeShift(params) {
    return http.post(`${base.dev}/moveShift/approvalMoveShift`, params);
  },
  getBanci(params) {
    return http.post(`${base.dev}/moveShift/getBanci`, params);
  },
};
export default ChangeShift;
