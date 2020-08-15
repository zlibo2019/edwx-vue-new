import base from '../base';
import http from '../http';

const Dict = {
  getDictInfo(params) {
    return http.post(`${base.dev}/dictInfo/selectListByEntity`, params);
  },
};
export default Dict;
