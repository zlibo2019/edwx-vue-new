const actions = {
  actionFoodList({commit}, foodList) {
    return commit('mutationFoodList', foodList);
  },
};
export default actions;
