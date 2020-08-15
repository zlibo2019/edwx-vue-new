import coordtransform from 'coordtransform';
import position from './position';

const WeiXin = {
  wxConfig: function (wxConfig) {
    window.vm.$wechat.config({
      debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
      appId: wxConfig.appId, // 必填，公众号的唯一标识
      timestamp: wxConfig.timestamp, // 必填，生成签名的时间戳
      nonceStr: wxConfig.nonceStr, // 必填，生成签名的随机串
      signature: wxConfig.signature, // 必填，签名
      jsApiList: [
        'checkJsApi',
        'scanQRCode',
        'getLocation',
        'chooseImage',
        'uploadImage',
        // "openLocation"
      ], // 必填，需要使用的JS接口列表
    });
  },
  wxReady: function (callback) {
    window.vm.$wechat.ready(function () {
      if (callback !== null && typeof callback === 'function') {
        callback();
      }
      window.vm.$wechat.error(function (res) {
      });
    });
  },
  wxScanQRCode: function (callback) {
    if (callback == null || typeof callback !== 'function') {
      return;
    }
    // window.vm.$wechat.ready(function () {
    window.vm.$wechat.checkJsApi({
      jsApiList: ['scanQRCode'],
      success: function (res) {
        window.vm.$wechat.scanQRCode({
          needResult: 1, // 默认为0，扫描结果由微信处理，1则直接返回扫描结果，
          scanType: ['qrCode', 'barCode'], // 可以指定扫二维码还是一维码，默认二者都有
          success: function (res) {
            let result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
            callback({codeStr: result, code: window.vm.$code.success});
          },
          error: function (res) {
            if (res.errMsg.indexOf('function_not_exist') > 0) {
              callback({codeStr: '版本过低请升级', code: window.vm.$code.fail});
            }
          },
          cancel: function () {
            callback({codeStr: '您已经取消扫描', code: window.vm.$code.cancel});
          },
        });
      },
    });
    // });
  },

  wxChooseImage: function (callback, nums, sourceType = ['album', 'camera']) {
    window.vm.$wechat.chooseImage({
      count: nums, // 默认9
      //'original',
      sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: sourceType, // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        if (res.errMsg === 'chooseImage:ok') {
          callback(res.localIds);
        }
      },
    });
  },
  wxUploadImage: function (callback, localId) {
    window.vm.$wechat.uploadImage({
      localId: localId, // 需要上传的图片的本地ID，由chooseImage接口获得
      isShowProgressTips: 1, // 默认为1，显示进度提示
      success: function (res) {
        if (res.errMsg === 'uploadImage:ok') {
          callback(res.serverId);
        }
      },
    });
  },
  wxGetLocationCity: function (container, zoom, dragFlag, callback) {
    let data = {
      flag: false,
      latitude: '',
      longitude: '',
      city: '',
    };
    window.vm.$wechat.ready(function () {
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
      window.vm.$wechat.checkJsApi({
        jsApiList: ['getLocation'],
        success: function (res) {
          window.vm.$wechat.getLocation({
            // 获取地理位置
            type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
            success: function (res) {
              // let latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
              // let longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
              // let speed = res.speed; // 速度，以米/每秒计
              // let accuracy = res.accuracy; // 位置精度
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
            error: function (res) {
              if (callback !== null && typeof callback === 'function') {
                callback(data);
              }
            },
          });
        },
        error: function (res) {
          if (callback !== null && typeof callback === 'function') {
            callback(data);
          }
        },
      });
      window.vm.$wechat.error(function (res) {
        if (callback !== null && typeof callback === 'function') {
          callback(data);
        }
      });
    });
  },

  wxGetLocation: function (container, zoom, dragFlag, callback) {
    if (callback == null || typeof callback !== 'function') {
      return;
    }
    let data = {
      flag: false,
      latitude: '',
      longitude: '',
      address: '',
    };
    // window.vm.$wechat.ready(() => {
    // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
    window.vm.$wechat.checkJsApi({
      jsApiList: ['getLocation'],
      success: function (res) {
        window.vm.$wechat.getLocation({
          // 获取地理位置
          type: 'gcj02', // 默认为wgs84的gps坐标，如果要返回直接给openLocation用的火星坐标，可传入'gcj02'
          success: function (res) {
            // let latitude = res.latitude; // 纬度，浮点数，范围为90 ~ -90
            // let longitude = res.longitude; // 经度，浮点数，范围为180 ~ -180。
            // let speed = res.speed; // 速度，以米/每秒计
            // let accuracy = res.accuracy; // 位置精度
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
          error: function (res) {
            if (callback !== null && typeof callback === 'function') {
              callback(data);
            }
          },
        });
      },
      error: function (res) {
        if (callback !== null && typeof callback === 'function') {
          callback(data);
        }
      },
    });
    // window.vm.$wechat.error(function (res) {
    //   if (callback !== null && typeof callback === 'function') {
    //     callback(data);
    //   }
    // });
    // });
  },

  // getMarkerBdByWx: function (wxConfig, container, zoom, dragFlag, callback) {
  //   if (callback == null || typeof callback !== 'function') {
  //     return;
  //   }
  //   this.wxConfig(wxConfig);
  //   return this.wxGetLocation(container, zoom, dragFlag, callback);
  // },

};

export default WeiXin;
