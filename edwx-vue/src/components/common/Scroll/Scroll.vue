<template>
  <div style="height: 100%;">
    <empty :show="emptyShow" :tip="emptyTip" v-show="emptyShow===true"></empty>
    <div class="scroll-wrapper" ref="wrapper" v-show="emptyShow===false">
      <div class="scroll-content">
        <!-- 内容 -->
        <div class="scroll-slot" ref="listWrapper">
          <slot></slot>
        </div>
        <!-- 上拉加载 -->
        <slot name="pullup" :pullUpLoad="pullUpLoad" :isPullUpLoad="isPullUpLoad">
          <!--<div v-if="pullUpLoad" class="pullup-wrapper">-->
            <!--<div v-if="!isPullUpLoad" class="before-trigger">-->
              <!--<span>{{pullUpTip}}</span>-->
            <!--</div>-->
            <!--<div v-else class="after-trigger">-->
              <!--<inline-loading></inline-loading>-->
            <!--</div>-->
          <!--</div>-->
        </slot>
      </div>
      <slot name="pulldown" :pullDownRefresh="pullDownRefresh" :pullDownStyle="pullDownStyle"
            :beforePullDown="beforePullDown" :isPullingDown="isPullingDown" :bubbleY="bubbleY">
        <!-- 下拉刷新 -->
        <div v-if="pullDownRefresh" class="pulldown-wrapper" ref="pulldown" :style="pullDownStyle">
          <div v-if="beforePullDown" class="before-trigger">
            <bubble :y="bubbleY"></bubble>
          </div>
          <div v-else class="after-trigger">
            <div v-if="isPullingDown" class="loading">
              <inline-loading></inline-loading>
            </div>
            <div v-else>
              <span>{{refreshTip}}</span>
            </div>
          </div>
        </div>
      </slot>
    </div>
  </div>
</template>

<script>
  import {InlineLoading} from 'vux'
  import Bubble from '../Bubble/Bubble'
  import BScroll from 'better-scroll'
  import Empty from '../Empty/Empty'

  export default {
    name: 'Scroll',
    components: {
      Bubble,
      InlineLoading,
      Empty
    },
    props: {
      emptyShow: {
        type: Boolean,
        default: false
      },
      emptyTip: {
        type: String,
        default: "暂无记录"
      },
      scrollbar: { // 是否显示滚动条
        type: Boolean,
        default: false
      },
      pullDownRefresh: { // 是否开启下拉刷新
        type: null,
        default: false
      },
      pullUpLoad: { // 是否开启上拉加载
        type: null,
        default: false
      },
      probeType: { // 滚动事件类型
        type: Number,
        default: 1
      },
      listenScroll: { // 是否监听滚动事件
        type: Boolean,
        default: false
      },
      pullupPaddingBottom: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        defaultLoadTxtMore: '加载中',
        defaultLoadTxtNoMore: '-- -- 我是有底线的 -- --',
        defaultRefreshTxt: '刷新成功',
        isPullUpLoad: false, // 正在上拉加载
        isPullingDown: false, // 下拉松手后
        isRebounding: false, // 回弹
        beforePullDown: true, // 下拉松手前
        finshPullupLoad: false, // 结束上拉加载
        pullUpDirty: true, // 上拉加载是否还有更多
        pullDownStyle: '', // 下拉刷新的位置
        bubbleY: 0 // 气泡偏移量
      }
    },
    computed: {
      // 上拉加载提示信息
      pullUpTip() {
        // 开启上拉加载 并且有 tip 属性 并且 tip 属性里还有 more 属性,否则默认值
        const moreTip = (this.pullUpLoad && this.pullUpLoad.tip && this.pullUpLoad.tip.more) || this.defaultLoadTxtMore;
        // 开启上拉加载 并且有 tip 属性 并且 tip 属性里还有 noMore 属性,否则默认值
        const noMoreTip = (this.pullUpLoad && this.pullUpLoad.tip && this.pullUpLoad.tip.noMore) || this.defaultLoadTxtNoMore;
        return this.pullUpDirty ? moreTip : noMoreTip;
      },
      // 下拉刷新提示信息
      refreshTip() {
        return (this.pullDownRefresh && this.pullDownRefresh.tip) || this.defaultRefreshTxt;
      }
    },
    created() {
      // 初始下拉显示位置
      this.pullDownInitTop = -50
    },
    mounted() {
      this.$nextTick(() => {
        this.initScroll()
      })
    },
    methods: {
      // 初始化滚动
      initScroll() {
        if (!this.$refs.wrapper) {
          return;
        }
        if (this.pullupPaddingBottom) {
          this.$refs.listWrapper.style.paddingBottom = `${this.pullupPaddingBottom}px`
        }
        if (this.$refs.listWrapper && (this.pullDownRefresh || this.pullUpLoad)) {
          this.$refs.listWrapper.style.minHeight = `${this.$refs.wrapper.offsetHeight + 1}px`
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          click: true, // 开启点击事件,这个不做配置因为都会用到
          scrollbar: this.scrollbar, // 滚动条
          pullDownRefresh: this.pullDownRefresh, // 下拉刷新
          pullUpLoad: this.pullUpLoad, // 上拉加载
          probeType: this.probeType // 滚动事件类型
        });
        // 开启监听滚动事件
        if (this.listenScroll) {
          this.scroll.on('scroll', (pos) => {
            this.$emit('scroll', pos)
          })
        }
        // 开启监听下拉刷新
        if (this.pullDownRefresh) {
          this._initPullDownRefresh()
        }
        // 开启上拉加载
        if (this.pullUpLoad) {
          this._initPullUpLoad()
        }
      },
      // 刷新滚动
      refresh() {
        this.scroll && this.scroll.refresh()
      },
      // 关闭
      closePullUp() {
        this.scroll && this.scroll.closePullUp()
      },
      // 更新数据
      forceUpdate(noMore) {
        // 开启了下拉刷新,并且在刷新中
        if (this.pullDownRefresh && this.isPullingDown) {
          this.isPullingDown = false;
          this._reboundPullDown().then(() => {
            // 显示下拉刷新 成果
            this._afterPullDown()
          })
        } else if (this.pullUpLoad && this.isPullUpLoad) {
          this.isPullUpLoad = false;
          this.scroll.finishPullUp();
          this.pullUpDirty = noMore;
          this.refresh()
        } else {
          this.refresh()
        }
      },
      // 初始下拉刷新
      _initPullDownRefresh() {
        this.scroll.on('pullingDown', () => {
          this.beforePullDown = false;
          this.isPullingDown = true;// 下拉刷新
          this.pullUpDirty = false; // 隐藏上拉加载提示
          this.$emit('pullingDown');
        });
        this.scroll.on('scroll', (pos) => {
          // 如果没有开启下拉刷新,就什么都不做
          if (!this.pullDownRefresh) {
            return;
          }
          // 如果还没松手
          if (this.beforePullDown) {
            this.bubbleY = Math.max(0, pos.y + this.pullDownInitTop);
            this.pullDownStyle = `top:${Math.min(pos.y + this.pullDownInitTop, 10)}px`;
          } else {
            this.bubbleY = 0;
          }
          if (this.isRebounding) {
            this.pullDownStyle = `top:${10 - (this.pullDownRefresh.stop - pos.y)}px`;
          }
        })
      },
      // 下拉刷新的回弹
      _reboundPullDown() {
        const {stopTime = 600} = this.pullDownRefresh;
        return new Promise((resolve) => {
          setTimeout(() => {
            this.isRebounding = true;
            this.scroll.finishPullDown();
            resolve()
          }, stopTime)
        })
      },
      // 下拉回弹之后
      _afterPullDown() {
        setTimeout(() => {
          this.pullDownStyle = `top:${this.pullDownInitTop}px`;
          this.beforePullDown = true;
          this.isRebounding = false;
          this.refresh()
        }, this.scroll.options.bounceTime)
      },
      // 初始上拉加载
      _initPullUpLoad() {
        this.scroll.on('pullingUp', () => {
          this.isPullUpLoad = true;
          this.$emit('pullingUp');
        })
      }
    },
    destroyed() {
      this.$refs.scroll && this.$refs.scroll.destroy()
    }
  }
</script>

<style lang="scss" scoped>
  .scroll-wrapper {
    position: relative;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    padding-top: -0.03rem;

    .scroll-content {
      position: relative;
    }

    .pullup-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0.1rem 0;

      .before-trigger, .after-trigger {
        color: #999999;
        font-size: 0.14rem;
      }
    }

    .pulldown-wrapper {
      position: absolute;
      width: 100%;
      left: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      transition: all;

      .before-trigger {
        color: #999999;
        font-size: 0.14rem;
      }

      .after-trigger {
        margin-top: 0.1rem;
        color: #ffffff;
        font-size: 0.14rem;
      }
    }
  }
</style>
