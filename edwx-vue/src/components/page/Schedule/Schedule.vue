<template>
  <div class="schedule">
      <div class="empty-box">
          <img src="@/assets/developing.gif" alt="">
          <p>功能暂未开放</p>
      </div>
  </div>
</template>
<script>
  import {} from "vux"

  export default {
    name: "Schedule",
    components: {},
    beforeRouteLeave(to, from, next) {
      next(this.$route.params.flag);
    },
    data() {
      return {}
    },
    computed: {},
    methods: {},
    created() {

    },
    mounted() {
      // window.onpopstate = () => {
      //   WeixinJSBridge.call('closeWindow');
      // }
    },
    destroyed() {

    }
  }
</script>
<style type="text/scss" lang="scss">
  .schedule {
    width: 100%;
    height: 100%;
      .empty-box{
          width:80%;
          height:2rem;
          text-align: center;
          position: absolute;
          top: 1.4rem;
          left:0;
          right:0;
          margin: auto;
          img{
              width:2rem;
          }
          p{
              font-size: 0.14rem;
              color: #A7A7A7;
              margin-top: -0.1rem;
          }
      }
  }
</style>
