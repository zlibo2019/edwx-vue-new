import base from '../base';
import http from '../http';

const Approver = {
  selectApprovalUser(params) {
    return http.post(`${base.dev}/management/selectApprovalUser`, params);
  },
};
export default Approver;
