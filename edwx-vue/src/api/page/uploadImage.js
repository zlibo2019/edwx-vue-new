import base from '../base';
import http from '../http';

const UploadImage = {
  insertPhoto(params) {
    return http.post(`${base.dev}/management/insertPhoto`, params);
  },
  deletePhoto(imgPath) {
    return http.delete(`${base.dev}/management/deletePhoto`, {params: {imgPath}});
  },
};
export default UploadImage;
