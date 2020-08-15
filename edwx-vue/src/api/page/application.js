import base from '../base';
import http from '../http';

const Application = {
  getMyApplication(params) {
    return http.post(`${base.dev}/myRecord/getMyApplication`, params);
  },
  getMyApproval(params) {
    return http.post(`${base.dev}/myRecord/getMyApproval`, params);
  },
  getMyApproved(params) {
    return http.post(`${base.dev}/myRecord/getMyApproved`, params);
  },
  getMyCopy(params) {
    return http.post(`${base.dev}/myRecord/getMyMessage`, params);
  },
  deletePhoto(imgPath) {
    return http.delete(`${base.dev}/management/deletePhoto`, {params: {imgPath}});
  },
};
export default Application;
