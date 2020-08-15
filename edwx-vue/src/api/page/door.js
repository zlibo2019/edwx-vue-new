import base from '../base';
import http from '../http';

const Door = {
  getDoor(params) {
    return http.post(`${base.dev}/mjMobile/selectDoorList`, params);
  },
  updateDoor(params) {
    return http.post(`${base.dev}/mjMobile/updateGateOrder`, params);
  },
  openDoor(params) {
    return http.post(`${base.dev}/mjMobile/openDoor`, params);
  },
  getMjInfo(xh) {
    return http.get(`${base.dev}/mjMobile/getMjInfo`, {params: {xh}});
  },
};
export default Door;
