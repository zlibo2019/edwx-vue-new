import base from '../base';
import http from '../http';

const Meeting = {
  getMeetingList(params) {
    return http.post(`${base.dev}/tkqRoom/selectListPageByEntity`, params);
  },
  selectTkqRoomInfo(depSerial) {
    return http.get(`${base.dev}/tkqRoom/selectTkqRoomInfo`, {params: {depSerial}});
  },
  getMyMeetingDateList(params) {
    return http.post(`${base.dev}/meet/selectDateListByEntity`, params);
  },
  getRoomMeetingList(params) {
    return http.post(`${base.dev}/meet/selectMeetListByRoom`, params);
  },
  getMyMeetingList(params) {
    return http.post(`${base.dev}/meet/selectMyMeetListByDate`, params);
  },
  getMeetingDetail(bh, userSerial) {
    return http.get(`${base.dev}/meet/selectByPrimaryKey`, {params: {bh, userSerial}});
  },
  insertMeetingOrder(params) {
    return http.put(`${base.dev}/meet/insert`, params);
  },
  deleteMeetingOrder(bh, userSerial) {
    return http.delete(`${base.dev}/meet/deleteByPrimaryKey`, {params: {bh, userSerial}});
  },
  getApproveList(params) {
    return http.post(`${base.dev}/roomGly/selectListByEntity`, params);
  },

  selectMySubmit(params) {
    return http.post(`${base.dev}/meet/selectMySubmit`, params);
  },
  selectMyApprove(params) {
    return http.post(`${base.dev}/meet/selectMyApprove`, params);
  },
  selectMyCopy(params) {
    return http.post(`${base.dev}/meet/selectMyCopy`, params);
  },
  approveMeeting(params) {
    return http.post(`${base.dev}/meet/approveMeeting`, params);
  },
  isMyApprove(params) {
    return http.post(`${base.dev}/meet/isMyApprove`, params);
  },
};
export default Meeting;
