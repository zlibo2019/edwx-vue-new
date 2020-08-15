const setStorage = (key, value) => {
  if (typeof (value) === 'object') {
    value = JSON.stringify(value);
  }
  window.vm.$utils.Store.setItem(key, value);
};
/*
* 避免刷新之后vuex被重置，在sessionStorage做一个备份
 */
const mutations = {
  mutationFoodList(state, foodList) {
    state.foodList = foodList;
    window.vm.$utils.Store.setLocalItem('foodList', foodList);
  },
};
export default mutations;
