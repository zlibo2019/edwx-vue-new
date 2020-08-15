<!--loading效果组件-->
<template>
    <div class="mask-container">
        <transition name="fade-in">
            <div class="mask"></div>
        </transition>
        <div class="loadEffect" :style="{marginTop: marginTop? marginTop : '65%',background:'url('+backgroundImg+') no-repeat center center/100%'}">
            <span class="ld-span" v-if="backgroundImg == ''"></span>
            <span class="ld-span" v-if="backgroundImg == ''"></span>
            <span class="ld-span" v-if="backgroundImg == ''"></span>
            <span class="ld-span" v-if="backgroundImg == ''"></span>
            <span class="ld-span" v-if="backgroundImg == ''"></span>
            <span class="ld-span" v-if="backgroundImg == ''"></span>
            <span class="ld-span" v-if="backgroundImg == ''"></span>
            <span class="ld-span" v-if="backgroundImg == ''"></span>
        </div>
    </div>
</template>

<script>
export default {
  name: "Loading",
  // props: ["marginTop",'backgroundImg'],
  props:{
    marginTop:{

    },
    backgroundImg:{
      type: String,
      default: ''
//      default: require("./icons/loading.gif")
    }
  }
};
</script>

<style scoped type="text/scss" lang="scss">
.mask-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  .mask {
    /*position: fixed;*/
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: #fff !important;
    opacity: 0.6;
    z-index: 400;

    &.fade-in-enter,
    &.fade-in-leave-to {
      opacity: 0;
    }

    &.fade-in-enter-active,
    &.fade-in-leave-active {
      transition: opacity 0.3s;
    }
  }
  .loadEffect {
    width: 60px;
    height: 57px;
    width: 1rem;
    height: 1rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    margin: 0 auto;
    z-index: 800;
    transform: scale(.5);
    /*background: url("./icons/loading.gif") no-repeat center center;*/
    background-size: 100%;
  }
}

.loadEffect .ld-span{
        display: inline-block;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #67e7d5;
        position: absolute;
        -webkit-animation: load 1.04s ease infinite;
    }
    @-webkit-keyframes load{
        0%{
            -webkit-transform: scale(1.2);
            opacity: 1;
        }
        100%{
            -webkit-transform: scale(.3);
            opacity: 0.5;
        }
    }
    .loadEffect .ld-span:nth-child(1){
        left: 0;
        top: 50%;
        margin-top:-10px;
        -webkit-animation-delay:0.13s;
    }
    .loadEffect .ld-span:nth-child(2){
        left: 14px;
        top: 14px;
        -webkit-animation-delay:0.26s;
    }
    .loadEffect .ld-span:nth-child(3){
        left: 50%;
        top: 0;
        margin-left: -10px;
        -webkit-animation-delay:0.39s;
    }
    .loadEffect .ld-span:nth-child(4){
        top: 14px;
        right:14px;
        -webkit-animation-delay:0.52s;
    }
    .loadEffect .ld-span:nth-child(5){
        right: 0;
        top: 50%;
        margin-top:-10px;
        -webkit-animation-delay:0.65s;
    }
    .loadEffect .ld-span:nth-child(6){
        right: 14px;
        bottom:14px;
        -webkit-animation-delay:0.78s;
    }
    .loadEffect .ld-span:nth-child(7){
        bottom: 0;
        left: 50%;
        margin-left: -10px;
        -webkit-animation-delay:0.91s;
    }
    .loadEffect .ld-span:nth-child(8){
        bottom: 14px;
        left: 14px;
        -webkit-animation-delay:1.04s;
    }
</style>
