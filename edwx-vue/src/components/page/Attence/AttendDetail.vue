<template>
  <div class="attendetail-detail">
    <view-box body-padding-top="0.43rem" body-padding-bottom="0">
      <div class="attendetail-detail-head">
        <tab>
          <tab-item @on-item-click="onItemClick(item.index)"
                    v-for="(item, i) in titles" :key="i" :selected="+item.index===+index">
            {{item.title}}
          </tab-item>
        </tab>
      </div>
      <div class="attendetail-detail-list">
        <scroll :pullup-padding-bottom="20"
                :pullDownRefresh="pullDownRefresh"
                @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
          <timeline>
            <timeline-item v-for="(item, k) in list" :key="k">
              <flexbox :gutter="0" class="attendetail-record">
                <flexbox-item style="text-align:right;" :span="0.2">
                  <p>{{item.date}}</p>
                  <p>{{item.week}}</p>
                </flexbox-item>
                <flexbox-item style="padding-left:0.5rem;">
                  {{content}}
                </flexbox-item>
              </flexbox>
            </timeline-item>
          </timeline>
        </scroll>
      </div>
    </view-box>
  </div>
</template>

<script>
  import {
    Flexbox, FlexboxItem, ViewBox, Timeline, TimelineItem, Tab,
    TabItem
  } from "vux";
  import Scroll from '@/components/common/Scroll/Scroll';

  export default {
    name: "AttendDetail",
    components: {
      Flexbox,
      FlexboxItem,
      ViewBox,
      Timeline,
      TimelineItem,
      Tab,
      TabItem,
      Scroll
    },
    data() {
      return {
        list: [],
        titles: [
          {title: "迟到", index: "1"},
          {title: "早退", index: "4"},
          {title: "请假", index: "2"},
          {title: "旷工", index: "3"}
        ],
        content: '',
        index: 0,
        pullDownRefresh: {
          threshold: 60, // 下拉多少开始刷新
          stop: 40 // 下拉回弹到多少停住
        },
        isPullDown: false, // 正在下拉刷新
        emptyShow: false
      };
    },
    methods: {
      // 下拉刷新
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.list = [];
        this.getAttenceDetail(this.index, this.$route.params.date);
      },
      // 刷新 Scroll 状态
      updateScroll: function () {
        this.isPullDown = false;
        this.$refs.scroll.forceUpdate();
      },
      onItemClick: function (index) {
        this.index = index;
        this.$utils.Tools.loadShow();
        this.list = [];
        this.getAttenceDetail(index, this.$route.params.date);
        for (let item of this.titles) {
          if (+item.index === +index) {
            this.content = item.title;
            break;
          }
        }
      },
      getAttenceDetail: function (index, date) {
        this.emptyShow = false;
        this.$api.Attence.getAttenceDetail({
          userSerial: this.userSerial,
          dates: date,
          flag: index
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg)
            } else {
              this.list = data;
              if (this.list.length === 0) {
                this.emptyShow = true;
              }
              this.updateScroll();
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      /** 函数function 设定当前页面
       *  wzx
       *  2019.01.09
       **/
      pushHistory() {
        var state = {
          title: "title",
          url: ""
        };
        window.history.pushState(state, state.title, state.url);
      }
    },
    created() {
      this.$utils.Tools.loadShow();
      this.userSerial = this.$utils.Store.getItem("userSerial");
      this.index = this.$route.params.index;
      for (let item of this.titles) {
        if (+item.index === +this.index) {
          this.content = item.title;
          break;
        }
      }
      this.getAttenceDetail(this.$route.params.index, this.$route.params.date);
    },
    mounted() {
      this.$utils.Store.setItem("attendDate", this.$route.params.date);
      // this.pushHistory();
      // window.onpopstate = () => {
      //     this.$router.push('/Attendances');
      // }
    },
  };
</script>

<style type="text/scss" lang="scss">
  .attendetail-detail {
    position: relative;
    height: 100%;

    .attendetail-detail-head {
      font-size: 0.14rem;
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;

      .attendetail-detail-title {
        padding: 0.1rem 0 0.1rem 0;
        color: #ffffff;
        background-color: #3399ff;
        border-radius: 8px;
        height: 1.3rem;

        div {
          text-align: center;
        }
      }
    }

    .attendetail-detail-list {
      font-size: 0.14rem;
      height: 100%;
      overflow-y: scroll;

      .vux-timeline {
        padding: 0.1rem;

        .vux-timeline-item-content {
          padding: 0 0 0 0;
        }

        .vux-timeline-item-tail {
          left: 0.95rem;
          background-color: #eeeeee;
        }

        .vux-timeline-item-head {
          left: 0.9rem;
          width: 0.1rem;
          height: 0.1rem;

          &::after {
            position: absolute;
            content: "";
            z-index: 99;
            border-radius: 99px;
            width: 0.06rem;
            height: 0.06rem;
            top: 0.02rem;
            left: 0.02rem;
            background-color: #ffffff;
          }
        }

        .vux-timeline-item-head-first {
          left: 0.9rem;
          width: 0.1rem;
          height: 0.1rem;

          &::after {
            position: absolute;
            content: "";
            z-index: 99;
            border-radius: 99px;
            width: 0.06rem;
            height: 0.06rem;
            top: 0.02rem;
            left: 0.02rem;
            background-color: #ffffff;
          }

          i {
            display: none;
          }
        }
      }

      .attendetail-record {
        padding: 0 0 0.3rem 0;
      }

      li:last-child .attendetail-record {
        padding: 0 0 0 0;
      }
    }
  }
</style>
