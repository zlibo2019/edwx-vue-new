import base from '../base';
import http from '../http';

const Org = {
  getOrgList(depParentNo) {
    return http.get(`${base.dev}/dep/selectDeptUserInfo`, {
      params: {
        depParentNo,
      },
    });
  },
  getUserByOrg(depJson) {
    return http.get(`${base.dev}/userInfo/selectDeptUsers`, {
      params: {
        depJson,
      },
    });
  },
  getUserInfo(userJson) {
    return http.get(`${base.dev}/userInfo/selectUsersInfo`, {
      params: {
        userJson,
      },
    });
  },
  getUserList(userInfo) {
    return http.get(`${base.dev}/userInfo/selectUserList`, {
      params: {
        userInfo,
      },
    });
  },
};
export default Org;
