import base from '../base';
import http from '../http';

const Meal = {
  getMealTypeList(params) {
    return http.post(`${base.dev}/edDineMealSetting/selectDayMeal`, params);
  },
  getFoodList(params) {
    return http.post(`${base.dev}/edDineFood/selectFoodList`, params);
  },
  getAddressList(params) {
    return http.post(`${base.dev}/edDineAddress/selectListByEntity`, params);
  },
  getOrderInfo(userSerial) {
    return http.get(`${base.dev}/edDineOrder/selectLastOrder`, {params: {userSerial}});
  },
  getAccountRecords(params) {
    return http.post(`${base.dev}/xfMx/selectAccountRecord`, params);
  },
  insertOrder(params) {
    return http.put(`${base.dev}/edDineOrder/insert`, params);
  },
  getExplain(placeId) {
    return http.get(`${base.dev}/edDineShow/selectByPrimaryKey`, {params: {placeId}});
  },
  getOrderRecords(params) {
    return http.post(`${base.dev}/edDineOrder/selectOrderListPageByEntity`, params);
  },
  getOrderDetail(orderId, mealId) {
    return http.get(`${base.dev}/edDineOrder/selectOrderDetail`, {params: {orderId, mealId}});
  },
  selectDayState(params) {
    return http.post(`${base.dev}/edDineMealSetting/selectDayState`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/edDineOrderInfo/updateByPrimaryKey`, params);
  },
};
export default Meal;
