import base from '../base';
import http from '../http';

const Sys = {
  getSystemDate(mode) {
    if (mode === '1') {
      return http.get(`${base.dev}/wx/getSystemDate`);
    } else {
      return http.get(`${base.dev}/system/getSystemDate`);
    }
  },
  getSystemParams(tenancyId, paramKey) {
    return http.get(`${base.dev}/sysParam/selectByPrimaryKey`, {
      params: {tenancyId, paramKey},
    });
  },
  getWxImageUrl(mediaId, mode) {
    if (mode === '1') {
      return http.get(`${base.dev}/wx/getWxImageUrl`, {params: {mediaId}});
    } else {
      return http.get(`${base.dev}/system/getWxImageUrl`, {params: {mediaId}});
    }
  },
  getSysSetting() {
    return http.get('./static/data.json');
  },
  getConfig(url, mode) {
    if (mode === '1') {
      return http.get(`${base.dev}/wx/getConfig`, {params: {url}});
    } else {
      return http.get(`${base.dev}/system/getConfig`, {params: {url}});
    }
  },
};
export default Sys;
