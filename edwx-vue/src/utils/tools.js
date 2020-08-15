const Tools = {
  httpError: function () {
    this.loadHide();
    // this.toastShow(i18n.t("http.error"));
  },
  confirm: function (confirmCallback, tip, title = '提示', inputFlag = false, confirmButtonText = '确定', cancelButtonText = '取消') {
    window.vm.$vux.confirm.show({
      showInput: inputFlag,
      title: title,
      confirmText: confirmButtonText,
      cancelText: cancelButtonText,
      content: tip,
      onConfirm(value) {
        confirmCallback(value);
      },
      onCancel() {

      },
    });
  },
  loadShow: function (msg) {
    if (msg !== undefined) {
      window.vm.$vux.loading.show(msg);
    } else {
      window.vm.$vux.loading.show(i18n.t('http.loading'));
    }
  },
  loadHide: function () {
    window.vm.$vux.loading.hide();
  },
  toastShow: function (msg) {
    window.vm.$vux.toast.show({
      text: msg,
      type: 'text',
      isShowMask: true,
    });
  },
  toastCustom: function (code, msg) {
    window.vm.$vux.toast.show({
      text: msg,
      type: +code === window.vm.$code.success ? 'success' : 'cancel',
      isShowMask: true,
    });
  },
  toastSuccess: function (msg) {
    window.vm.$vux.toast.show({
      text: msg,
      type: 'success',
      isShowMask: true,
    });
  },
  toastCancel: function (msg) {
    window.vm.$vux.toast.show({
      text: msg,
      type: 'cancel',
      isShowMask: true,
    });
  },
  toastHide: function () {
    window.vm.$vux.toast.hide();
  },
  optFailed: function () {
    this.toastShow(i18n.t('http.failed'));
  },
  optSuccess: function () {
    this.toastShow(i18n.t('http.success'));
  },
  getQueryString: function (name) {
    let reg = new RegExp('(^|&)' + name + '=([^&]*)(&|$)', 'i');
    let r = window.location.search.substr(1).match(reg);
    if (r != null) return unescape(r[2]);
    return null;
  },
  getEnv: function (callback) {
    let userAgent = window.navigator.userAgent.toLowerCase();
    if (userAgent.indexOf('miniprogram') > -1) {
      callback(0);
    } else if (userAgent.indexOf('micromessenger') > -1) {
      callback(1);
    } else {
      callback(2);
    }
  },
  getSys: function (callback) {
    let userAgent = window.navigator.userAgent;
    if (/Android|webOS|iPhone|iPod|BlackBerry/i.test(userAgent)) {
      if (userAgent.indexOf('iPhone') > -1) {
        callback(0);
      } else {
        callback(1);
      }
    } else {
      callback(9);
    }
  },
  pushHistory: function () {
    let state = {
      title: 'title',
      url: '#',
    };
    window.history.pushState(state, state.title, state.url);
  },

  isnull: function (obj, val = '') {
    if (obj) {
      return obj;
    } else {
      return val;
    }
  },

  isArray: function (arg) {
    return Object.prototype.toString.call(arg) === '[object Array]';
  },
};

export default Tools;
