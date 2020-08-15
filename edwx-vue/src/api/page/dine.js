import base from '../base';
import http from '../http';

const Dine = {
  getMeals(params) {
    return http.post(`${base.dev}/dineMeal/selectListByEntity`, params);
  },

  updateUserAutoFlag(params) {
    return http.post(`${base.dev}/dineUser/updateByPrimaryKey`, params);
  },

  getUserAutoFlag(userSerial) {
    return http.get(`${base.dev}/dineUser/selectByPrimaryKey`, {
      params: {
        userSerial,
      },
    });
  },

  getDineRemark() {
    return http.get(`${base.dev}/dineGlobal/selectDineRemark`);
  },

  getUserOrderList(params) {
    return http.post(`${base.dev}/dineOrder/selectListByCondition`, params);
  },

  getUserOrderListPage(params) {
    return http.post(`${base.dev}/dineOrder/selectListPageByEntity`, params);
  },

  getDineNums(params) {
    return http.post(`${base.dev}/dineOrder/selectDineNums`, params);
  },

  updateDineNums(params) {
    return http.post(`${base.dev}/dineOrder/updateByPrimaryKey`, params);
  },
};
export default Dine;
