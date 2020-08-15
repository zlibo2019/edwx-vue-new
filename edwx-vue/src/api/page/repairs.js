import base from '../base';
import http from '../http';

const Repairs = {
  insert(params) {
    return http.put(`${base.dev}/repairInfo/insert`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/repairInfo/updateByPrimaryKey`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/repairInfo/selectListPageByEntity`, params);
  },
  selectSumInfoByEntity(params) {
    return http.post(`${base.dev}/repairInfo/selectSumInfoByEntity`, params);
  },
  selectByPrimaryKey(id) {
    return http.get(`${base.dev}/repairInfo/selectByPrimaryKey`, {params: {id}});
  },
  selectListByEntity(params) {
    return http.post(`${base.dev}/repairTypeParam/selectListByEntity`, params);
  },
};
export default Repairs;
