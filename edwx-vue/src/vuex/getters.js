let getStoryage = (item) => {
  let str = window.vm.$utils.Store.getLocalItem(item);
  return JSON.parse(str);
};

const getters = {
  getterFoodList: (state) => {
    return state.foodList ? state.foodList : getStoryage('foodList');
  },
};
export default getters;
