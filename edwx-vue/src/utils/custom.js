import Utils from './index';

const Custom = {
  setUserInfo: function (data) {
    Utils.Store.setItem('openId', data.openId);
    Utils.Store.setItem('token', data.token);
    Utils.Store.setItem('userSerial', data.userSerial);
    Utils.Store.setItem('userNo', data.userNo);
    Utils.Store.setItem('userLname', data.userLname);
    Utils.Store.setItem('lx', data.lx);        //人员类型
    Utils.Store.setItem('orgId', data.orgId);      //企业ID，用于获取组织架构等
    Utils.Store.setItem('orgName', data.orgName);      //企业名称，用于获取组织架构等
    Utils.Store.setItem('userTelephone', data.userTelephone);
    Utils.Store.setItem('spareCol1', Utils.Tools.isnull(data.spareCol1));
    Utils.Store.setItem('spareCol2', Utils.Tools.isnull(data.spareCol2));
  },
};

export default Custom;
