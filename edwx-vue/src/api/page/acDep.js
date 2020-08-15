import base from '../base';
import http from '../http';

const AcDep = {
  insert(params) {
    return http.put(`${base.dev}/acDep/insert`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/acDep/updateByPrimaryKey`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/acDep/selectListPageByEntity`, params);
  },
  selectListByEntity(params) {
    return http.post(`${base.dev}/acDep/selectListByEntity`, params);
  },
  deleteByPrimaryKey(userSerial) {
    return http.delete(`${base.dev}/acDep/deleteByPrimaryKey`, {params: {userSerial}});
  },
  selectByPrimaryKey(userSerial) {
    return http.get(`${base.dev}/acDep/selectByPrimaryKey`, {params: {userSerial}});
  },
  selectListByKeys(params) {
    return http.post(`${base.dev}/acDep/selectListByKeys`, params);
  },
  deleteBatchByKeys(keys) {
    return http.delete(`${base.dev}/acDep/deleteBatchByKeys`, {params: {keys}});
  },
  selectDinePlace(params) {
    return http.get(`${base.dev}/acDep/selectDinePlace`);
  },
};
export default AcDep;
