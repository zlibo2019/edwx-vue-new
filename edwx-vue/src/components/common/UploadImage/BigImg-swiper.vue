<template>
    <!-- swiper在pc端时不能滑动翻页展示图片，手机端可以 -->
    <transition name="fade">
        <div class="img-view" @click="bigImg">
            <!-- 遮罩层 -->
            <div class="img-layer"></div>
            <div class="img">
              <!--show-desc-mask  是否显示描述半透明遮罩
                  show-dots       是否显示提示点
                  on-index-change 轮播 index 变化时触发
                  height          高度值，不设默认180px-->
              <swiper :list="data" v-model="cindex_js" @on-index-change="onIndexChange"
                      :show-dots="showDots"
                      :show-desc-mask="false"
                      :height="he"></swiper>
            </div>
        </div>
    </transition>
</template>
<script>
  import {Swiper} from 'vux'

    export default {
      components:{
        Swiper
      },
      props: {
          data:{},
          cindex:0,//图片index
          height:'',
          showDots:{//是否显示点
            type: Boolean,
            default: false
          }
      },
      data(){
        return{
            cindex_js:this.cindex,//接收外部传来的图片index
            he:''//设置swiper高度，必须设，不然图片不居中
        }
      },
      methods: {
        bigImg() {
          // 发送事件
          this.$emit('clickit')
        },
        onIndexChange (index) {
          this.cindex_js = index
        },
      },
      mounted(){
        this.he = $('.img')[0].offsetHeight +'px'
      }
    }
</script>
<style type="text/scss" lang="scss">
    /*动画*/
    .fade-enter-active,
    .fade-leave-active {
        transition: all .2s linear;
        transform: translate3D(0, 0, 0);
        z-index: 1000;
    }

    .fade-enter,
    .fade-leave-active {
        transform: translate3D(100%, 0, 0);
    }

    /* bigimg */

    .img-view {
        position: fixed;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
      z-index: 900;
    }

    /*遮罩层样式*/
    .img-view .img-layer {
        position: fixed;
        z-index: 999;
        top: 0;
        left: 0;
        background: rgba(0, 0, 0, 0.7);
        width: 100%;
        height: 100%;
        overflow: hidden;
    }
    .img-view .img{
      position: relative;
      width: 100%;
      height: 100%;
      z-index: 999;

    }
    //使swiper图片按比例布局
    .vux-slider{
      max-width: 100%;
      max-height: 100%;

      .vux-swiper{
        height: 100%;
        width: 100%;

        .vux-img{
          background-size: contain !important;
        }
      }
    }
</style>
