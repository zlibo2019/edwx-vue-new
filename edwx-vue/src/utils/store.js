const Store = {
  setItem: function (key, value) {
    sessionStorage.setItem(key, value);
  },
  getItem: function (key) {
    return sessionStorage.getItem(key);
  },
  removeItem: function (key) {
    sessionStorage.removeItem(key);
  },
  clear: function () {
    sessionStorage.clear();
  },
  setLocalItem: function (key, value) {
    localStorage.setItem(key, value);
  },
  getLocalItem: function (key) {
    return localStorage.getItem(key);
  },
  removeLocalItem: function (key) {
    localStorage.removeItem(key);
  },
  clearLocalItem: function (key) {
    localStorage.clear();
  }
};

export default Store
