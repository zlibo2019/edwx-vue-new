import * as dd from 'dingtalk-jsapi';
import position from './position';
import coordtransform from 'coordtransform';

const DingTalk = {
  uploadImage: function (callback, nums, sourceType = '1') {
    dd.ready(function () {
      if (sourceType === '1') {
        dd.biz.util.uploadImage({
          compression: true,//(是否压缩，默认为true)
          multiple: false, //是否多选，默认false
          max: nums, //最多可选个数
          quality: 50, // 图片压缩质量,
          resize: 50, // 图片缩放率
          onSuccess: function (result) {
            if (typeof callback === 'function') {
              callback(result);
            }
          },
          onFail: function (err) {
            console.log(err);
          },
        });
      } else {
        dd.biz.util.uploadImageFromCamera({
          compression: true,//(是否压缩，默认为true)
          quality: 50, // 图片压缩质量,
          resize: 50, // 图片缩放率
          onSuccess: function (result) {
            if (typeof callback === 'function') {
              callback(result);
            }
          },
          onFail: function (err) {
            console.log(err);
          },
        });
      }
    });
  },
  getCode: function (corpId, callback) {
    dd.ready(function () {
      dd.runtime.permission.requestAuthCode({
        corpId: corpId, // 企业id
        onSuccess: function (info) {
          if (typeof callback === 'function') {
            callback(info);
          }
        },
        onFail: function (err) {
          console.log(err);
        },
      });
    });
  },

  getConfig: function (ddConfig) {
    dd.config({
      agentId: ddConfig.agentId, // 必填，微应用ID
      corpId: ddConfig.corpId,//必填，企业ID
      timeStamp: ddConfig.timeStamp, // 必填，生成签名的时间戳
      nonceStr: ddConfig.nonceStr, // 必填，生成签名的随机串
      signature: ddConfig.signature, // 必填，签名
      type: 0,   //选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
      jsApiList: [
        'device.geolocation.get',
        'biz.alipay.pay',
        'biz.util.uploadImage',
        'biz.util.uploadImageFromCamera',
      ], // 必填，需要使用的jsapi列表，注意：不要带dd。
    });
  },

  dtGetLocationCity: function (container, zoom, dragFlag, callback) {
    let data = {
      flag: false,
      latitude: '',
      longitude: '',
      city: '',
    };
    dd.ready(function () {
      dd.device.geolocation.get({
        targetAccuracy: 200,
        coordinate: 0,
        withReGeocode: false,
        useCache: true, //默认是true，如果需要频繁获取地理位置，请设置false
        onSuccess: function (res) {
          let gcj02tobd09 = coordtransform.gcj02tobd09(
            res.longitude,
            res.latitude,
          );

          let longitude = gcj02tobd09[0];
          let latitude = gcj02tobd09[1];
          position.getCity(container, longitude, latitude, zoom, dragFlag, (city) => {
            data.flag = true;
            data.latitude = latitude;
            data.longitude = longitude;
            data.city = city;
            if (callback !== null && typeof callback === 'function') {
              callback(data);
            }
          });
        },
        onFail: function (err) {
          if (callback !== null && typeof callback === 'function') {
            callback(data);
          }
        },
      });
    });
  },

  dtGetLocation: function (container, zoom, dragFlag, callback) {
    if (callback == null || typeof callback !== 'function') {
      return;
    }
    let data = {
      flag: false,
      latitude: '',
      longitude: '',
      address: '',
    };

    dd.ready(function () {
      dd.device.geolocation.get({
        targetAccuracy: 200,
        coordinate: 0,
        withReGeocode: false,
        useCache: true, //默认是true，如果需要频繁获取地理位置，请设置false
        onSuccess: function (res) {
          let gcj02tobd09 = coordtransform.gcj02tobd09(
            res.longitude,
            res.latitude,
          );
          let longitude = gcj02tobd09[0];
          let latitude = gcj02tobd09[1];
          position.getMarkerBd(container, longitude, latitude, zoom, dragFlag, (rtn) => {
            data.flag = true;
            data.latitude = rtn.latitude;
            data.longitude = rtn.longitude;
            data.address = rtn.address;
            if (callback !== null && typeof callback === 'function') {
              callback(data);
            }
          });
        },
        onFail: function (err) {
          if (callback !== null && typeof callback === 'function') {
            callback(data);
          }
        },
      });
    });
  },
};

export default DingTalk;
