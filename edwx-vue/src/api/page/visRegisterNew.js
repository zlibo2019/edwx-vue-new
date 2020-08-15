import base from '../base';
import http from '../http';

const VisRegisterNew = {
  insert(params) {
    return http.put(`${base.dev}/visRegisterNew/insert`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/visRegisterNew/updateByPrimaryKey`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/visRegisterNew/selectListPageByEntity`, params);
  },
  selectListByEntity(params) {
    return http.post(`${base.dev}/visRegisterNew/selectListByEntity`, params);
  },
  deleteByPrimaryKey(xh) {
    return http.delete(`${base.dev}/visRegisterNew/deleteByPrimaryKey`, {params: {xh}});
  },
  selectByPrimaryKey(xh) {
    return http.get(`${base.dev}/visRegisterNew/selectByPrimaryKey`, {params: {xh}});
  },
  selectListByKeys(params) {
    return http.post(`${base.dev}/visRegisterNew/selectListByKeys`, params);
  },
  deleteBatchByKeys(keys) {
    return http.delete(`${base.dev}/visRegisterNew/deleteBatchByKeys`, {params: {keys}});
  },
};
export default VisRegisterNew;
