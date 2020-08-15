<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>

export default {
  name: 'app'
}
document.addEventListener('blur', (e) => {
    ['input', 'textarea'].includes(e.target.localName) && document.body.scrollIntoView(false)
}, true)
</script>

<style lang="less">
body {
  background-color: #ffffff;
}

#app {
    width:100%;
    height:100%;
    font-family: 'Avenir', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #333;
}

@import '~vux/src/styles/1px.less';
</style>
