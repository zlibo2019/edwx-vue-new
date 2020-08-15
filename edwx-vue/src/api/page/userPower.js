import base from '../base';
import http from '../http';

const UserPower = {
  insert(params) {
    return http.put(`${base.dev}/userPower/insert`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/userPower/updateByPrimaryKey`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/userPower/selectListPageByEntity`, params);
  },
  selectListByEntity(params) {
    return http.post(`${base.dev}/userPower/selectListByEntity`, params);
  },
  deleteByPrimaryKey(userSerial) {
    return http.delete(`${base.dev}/userPower/deleteByPrimaryKey`, {params: {userSerial}});
  },
  selectByPrimaryKey(userSerial) {
    return http.get(`${base.dev}/userPower/selectByPrimaryKey`, {params: {userSerial}});
  },
};
export default UserPower;
