import base from '../base';
import http from '../http';

const DepUser = {
  insert(params) {
    return http.put(`${base.dev}/depUser/insert`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/depUser/updateByPrimaryKey`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/depUser/selectListPageByEntity`, params);
  },
  selectListByEntity(params) {
    return http.post(`${base.dev}/depUser/selectListByEntity`, params);
  },
  deleteByPrimaryKey(userSerial) {
    return http.delete(`${base.dev}/depUser/deleteByPrimaryKey`, {params: {userSerial}});
  },
  selectByPrimaryKey(userSerial) {
    return http.get(`${base.dev}/depUser/selectByPrimaryKey`, {params: {userSerial}});
  },
  selectListByKeys(params) {
    return http.post(`${base.dev}/depUser/selectListByKeys`, params);
  },
  deleteBatchByKeys(keys) {
    return http.delete(`${base.dev}/depUser/deleteBatchByKeys`, {params: {keys}});
  },
};
export default DepUser;
