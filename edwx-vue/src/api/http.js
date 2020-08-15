// import axios from 'axios'
import router from '../router/index'

// 创建 axios 实例
const service = axios.create({
  timeout: 1000 * 21
});

const tip = msg => {
  window.vm.$vux.toast.text(msg);
};

const toSignIn = () => {
  tip('请重新登录');
  let openId = window.vm.$utils.Store.getItem("openId");
  window.vm.$utils.Store.clear();
  window.vm.$utils.Store.setItem("openId", openId);
  router.replace('/')
};

const errorHandler = (status) => {
  switch (status) {
    case 401:
      toSignIn();
      break;
    case 403:
      tip('暂无权限');
      break;
    case 404:
      tip('请求资源不存在');
      break;
    case 405:
      tip('请求方式不正确');
      break;
  }
};

/**
 * 请求拦截器
 * 本地有 token 需要带上
 */
service.interceptors.request.use(
  config => {
    // 接口请求控制,本地有 token 带上
    // 后台根据 token 判断用户状态,并返回给我们状态码
    // 在后面的响应拦截器,根据 状态码 做处理
    // const token = 'ZXlKMGVYQWlPaUpLVjFRaUxDSmhiR2NpT2lKSVV6STFOaUo5LmV5SnBZWFFpT2pFMU5EYzBNamc0TWpnc0luTjFZaUk2SW14dloybHVJaXdpYVhOeklqb2lkMlZrY3lJc0ltVjRjQ0k2TVRVMU1EQXlNRGd5T0N3aWNHRnNaeUk2SW1GbGN5MHlOVFl0WTJKaklpd2lhblJwSWpvaU4wVXdRVUZETkRneFJVUTFORUV4UkRnek1UazNSRVpGTjBSRVF6VkRNVFFpTENKaGRXUWlPaUpsWkNJc0luQmtZWFJoSWpvaUsyMDVjMjEwZGpKR05rRktNMEU1UkdRd1ZGaEpOVGN2VDJGYVkzTTNZVEZWVlVKMlltVnBUWFYzV1VvMVR6aHVjMFl2ZWtwc1lYcFRNMFJ3YVM5RmFHVlZZME0yWkdaYVdqRmtjbFJMZURFeVNVMUNkbmM5UFNKOS5jZDd2S0ZYZXI4Nk5pazFheDd4U3dkR1VZQkFVcWxtSk9lQm4ybnNpWWpz';
    const token = window.vm.$utils.Store.getItem('token');
    if (token) {
      config.headers['Authorization'] = '' + token;
    }

    const companyId = window.vm.$utils.Store.getItem('companyId');
    if (!config.headers['CompanyId'] && companyId) {
      config.headers['CompanyId'] = companyId;
    }

    config.headers['Channel'] = 'app';
    // const openId = window.vm.$utils.Store.getItem('openId');
    // // console.log(666,token)
    // if (openId) {
    //   config.headers['OpenId'] = '' + openId;
    // }

    // let timeStamp = new Date().getTime() + "";
    // let key = CryptoJS.enc.Utf8.parse("weds123456789012");
    // let iv = CryptoJS.enc.Utf8.parse("weds123456789012");
    // let data = CryptoJS.enc.Utf8.parse(timeStamp);
    // console.log(timeStamp);
    // config.headers['AccessToken'] = CryptoJS.AES.encrypt(data, key, {
    //   iv: iv,
    //   mode: CryptoJS.mode.CBC,
    //   padding: CryptoJS.pad.Pkcs7
    // }).toString();

    // let userSerial = window.vm.$localStorage.get("userSerial");
    //
    // if (config.data !== undefined) {
    //   config.data.user_serial = userSerial;
    //   config.data.userSerial = userSerial;
    // }
    //
    // if (config.params !== undefined) {
    //   config.params.user_serial = userSerial;
    //   config.params.userSerial = userSerial;
    // }

    // console.log(1, JSON.stringify(config));

    return config
  },
  error => Promise.reject(error)
);

/**
 * 响应拦截器
 */
service.interceptors.response.use(
  response => {
    //console.log(JSON.stringify(response))
    return response.status === 200 ?
      Promise.resolve(response.data) :
      Promise.reject(response)
  },
  error => {
    // console.log('请求异常');
    // console.log(JSON.stringify(error));
    const {
      response
    } = error;
    if (response) {
      return errorHandler(response.status);
    } else {
      if (error.message.indexOf("timeout") > -1) {
        // ECONNABORTED
        tip('请求服务超时');
      } else {
        tip('请求服务异常');
      }
      // 处理断网情况
    }
    // Promise.reject(error);
  }
);

export default service
