import base from '../base';
import http from '../http';

const Copyer = {
  selectCopyUser(params) {
    return http.post(`${base.dev}/management/selectCopyUser`, params);
  },
  insertCopyUser(params) {
    return http.post(`${base.dev}/management/insertCopyUser`, params);
  },
  deleteCopyUser(userSerial, copyType) {
    return http.delete(`${base.dev}/management/deleteCopyUser`, {params: {userSerial, copyType}});
  },
};
export default Copyer;
