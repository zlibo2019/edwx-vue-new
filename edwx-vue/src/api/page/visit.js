import base from '../base';
import http from '../http';

const Visit = {
  addVisitorOrder(params) {
    return http.put(`${base.dev}/visRegisterNew/insertOrUpdate`, params, {
      headers: {
        'CompanyId': params.companyId,
      },
    });
  },
  getVisitorInfo(openId, companyId) {
    return http.get(`${base.dev}/visUserNew/selectByOpenId`, {
      params: {openId}, headers: {
        'CompanyId': companyId,
      },
    });
  },
  getReasonList(params) {
    return http.post(`${base.dev}/visThing/selectListByEntity`, params, {
      headers: {
        'CompanyId': params.companyId,
      },
    });
  },
  getPlaceList(params) {
    return http.post(`${base.dev}/visRegion/selectListByEntity`, params);
  },
  selectByPrimaryKey(xh) {
    return http.get(`${base.dev}/visRegisterNew/selectByPrimaryKey`, {params: {xh}});
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/visRegisterNew/updateVis`, params);
  },

  selectListPageByEntity(params) {
    return http.post(`${base.dev}/visRegisterNew/selectListPageByEntity`, params);
  },

  getVisitDate(id, companyId) {
    return http.get(`${base.dev}/visSetting/selectByPrimaryKey`, {
      params: {id}, headers: {
        'CompanyId': companyId,
      },
    });
  },
  getVisitType() {
    return http.get(`${base.dev}/visRegisterNew/selectVisDiscernType`);
  },
};
export default Visit;
