import base from '../base';
import http from '../http';

const Attence = {
  insertOutSide(params) {
    return http.post(`${base.dev}/attence/addWq`, params);
  },
  getRange(params) {
    return http.post(`${base.dev}/attence/getRange`, params);
  },
  insertAttenct(params) {
    return http.post(`${base.dev}/attence/addKq`, params);
  },
  getBanci(params) {
    return http.post(`${base.dev}/attence/newGetBanci`, params);
  },
  getToday(params) {
    return http.post(`${base.dev}/attence/getKq`, params);
  },
  getKqDetail(params) {
    return http.post(`${base.dev}/attence/getKqDetail`, params);
  },
  getAttenceSum(params) {
    return http.post(`${base.dev}/attence/kqHzNew`, params);
  },
  getAttenceRecord(params) {
    return http.post(`${base.dev}/attence/newKqJl`, params);
  },
  getAttenceDayRecord(params) {
    return http.post(`${base.dev}/attence/getKqjl`, params);
  },
  getAttenceDetail(params) {
    return http.post(`${base.dev}/attence/newKqMx`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/attence/updateWqByPrimaryKeySelective`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/attence/selectWqListByEntity`, params);
  },
  selectWxByPrimaryKey(id) {
    return http.get(`${base.dev}/attence/selectWxByPrimaryKey`, {params: {id}});
  },
  getKqInfo(bh) {
    return http.get(`${base.dev}/attence/getKqInfo`, {params: {bh}});
  },
};
export default Attence;
