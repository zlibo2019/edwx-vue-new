import base from '../base';
import http from '../http';

const Agent = {
  insert(params) {
    return http.put(`${base.dev}/edAgentDevicePrice/insert`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/edAgentDevicePrice/updateByPrimaryKey`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/edAgentDevicePrice/selectListPageByEntity`, params);
  },
  selectListByEntity(params) {
    return http.post(`${base.dev}/edAgentDevicePrice/selectListByEntity`, params);
  },
  deleteByPrimaryKey(id) {
    return http.delete(`${base.dev}/edAgentDevicePrice/deleteByPrimaryKey`, {params: {id}});
  },
  selectByPrimaryKey(id) {
    return http.get(`${base.dev}/edAgentDevicePrice/selectByPrimaryKey`, {params: {id}});
  },
};
export default Agent;
