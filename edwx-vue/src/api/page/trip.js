import base from '../base';
import http from '../http';

const Trip = {
  getTripDetail(params) {
    return http.post(`${base.dev}/businessTravel/selectUserBusiness`, params);
  },
  insertTrip(params) {
    return http.post(`${base.dev}/businessTravel/insertBusinessTravel`, params);
  },
  deleteTrip(xh, userSerial, reason) {
    return http.delete(`${base.dev}/businessTravel/deleteBusiness`, {params: {xh, userSerial, reason}});
  },
  approvalTrip(params) {
    return http.post(`${base.dev}/businessTravel/approvalBusiness`, params);
  },
};
export default Trip;
