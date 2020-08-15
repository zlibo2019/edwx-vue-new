import base from '../base';
import http from '../http';

const CompanyInfo = {
  insert(params) {
    return http.put(`${base.dev}/companyInfo/insert`, params);
  },
  updateByPrimaryKey(params) {
    return http.post(`${base.dev}/companyInfo/updateByPrimaryKey`, params);
  },
  selectListPageByEntity(params) {
    return http.post(`${base.dev}/companyInfo/selectListPageByEntity`, params);
  },
  selectListByEntity(params) {
    return http.post(`${base.dev}/companyInfo/selectListByEntity`, params);
  },
  deleteByPrimaryKey(companyId) {
    return http.delete(`${base.dev}/companyInfo/deleteByPrimaryKey`, {params: {companyId}});
  },
  selectByPrimaryKey(companyId) {
    return http.get(`${base.dev}/companyInfo/selectByPrimaryKey`, {params: {companyId}});
  },
  selectListByKeys(params) {
    return http.post(`${base.dev}/companyInfo/selectListByKeys`, params);
  },
  deleteBatchByKeys(keys) {
    return http.delete(`${base.dev}/companyInfo/deleteBatchByKeys`, {params: {keys}});
  },
  getKeys() {
    return http.get(`${base.dev}/common/getKeys`);
  },
  selectCompanyRight(companyId) {
    return http.get(`${base.dev}/companyInfo/selectCompanyRight`, {params: {companyId}});
  },
  updateCompanyRight(params) {
    return http.post(`${base.dev}/companyInfo/updateCompanyRight`, params);
  },
};
export default CompanyInfo;
