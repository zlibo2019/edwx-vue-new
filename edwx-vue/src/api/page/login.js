import base from '../base';
import http from '../http';

const Login = {
  getOpenId(code, mode) {
    if (mode === '1') {
      return http.get(`${base.dev}/wx/getOpenId`, {params: {code}});
    } else {
      return http.get(`${base.dev}/user/getOpenId`, {params: {code}});
    }
  },
  getUserInfoByOpenId(openId) {
    return http.get(`${base.dev}/user/getUserInfoByOpenId`, {
      params: {
        openId,
      },
    });
  },
  setOpenId(code, companyId) {
    return http.get(`${base.dev}/user/setOpenId`, {
      params: {
        code,
      },
      headers: {
        'CompanyId': companyId,
      },
    });
  },
  getOpenIdByUnionId(unionId, companyId) {
    return http.get(`${base.dev}/user/getUserByUnionId`, {
      params: {
        unionId,
      },
      headers: {
        'CompanyId': companyId,
      },
    });
  },
  login(params) {
    return http.post(`${base.dev}/user/userLoginCheck`, params, {
      headers: {
        'CompanyId': params.companyId,
      },
    });
  },
  updateInfo(params) {
    return http.post(`${base.dev}/companyUserInfo/updateInfo`, params);
  },
};
export default Login;
