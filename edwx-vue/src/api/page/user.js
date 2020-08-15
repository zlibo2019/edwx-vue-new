import base from '../base';
import http from '../http';

const User = {
  getWxOpenIdByCode(code, companyId) {
    return http.get(`${base.dev}/user/getWxOpenIdByCode`, {
      params: {code},
      headers: {
        'CompanyId': companyId,
      },
    });
  },
  getUserInfo(userSerial) {
    return http.get(`${base.dev}/userInfo/selectByPrimaryKey`, {params: {userSerial}});
  },

  getUser(userSerial) {
    return http.get(`${base.dev}/userBase/selectByPrimaryKey`, {params: {userSerial}});
  },

  addFace(params) {
    return http.post(`${base.dev}/userBase/updateByPrimaryKey`, params);
  },

  delFace(userSerial) {
    return http.post(`${base.dev}/userBase/deleteFace?userSerial=${userSerial}`);
  },
};
export default User;
