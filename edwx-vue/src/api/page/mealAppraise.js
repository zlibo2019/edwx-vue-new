import base from '../base';
import http from '../http';

const MealAppraise = {
  insert(params) {
    return http.put(`${base.dev}/edMealAppraise/insert`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/edMealAppraise/updateByPrimaryKey`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/edMealAppraise/selectListPageByEntity`, params);
  },
  selectListByEntity(params) {
    return http.post(`${base.dev}/edMealAppraise/selectListByEntity`, params);
  },
  deleteByPrimaryKey(bh) {
    return http.delete(`${base.dev}/edMealAppraise/deleteByPrimaryKey`, {params: {bh}});
  },
  selectByPrimaryKey(bh) {
    return http.get(`${base.dev}/edMealAppraise/selectByPrimaryKey`, {params: {bh}});
  },
};
export default MealAppraise;
