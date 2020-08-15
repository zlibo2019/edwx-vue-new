<template>
  <div class="order-record">
    <div class="date-box">
        <div class="month-box">
          <group class="selectDate">
            <datetime v-model="selectDat" format="YYYY-MM" @on-change="changeDate"></datetime>
          </group>
          <i class="iconfont icon-yueli"></i>
          <dt><span>{{month}}</span>月</dt>
          <dd>{{year}}年</dd>
          <img src="@/assets/down.png" alt="">
        </div>
    </div>
    <div class="food-wrapper" ref="foodsWrapper">
      <Scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
              :pullDownRefresh="pullDownRefresh" @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
        <ul>
          <li v-for="(item,index) in goods" :key="index" class="food-list food-list-hook">
            <h1 class="title" v-if="item.orderDate">{{$utils.DateUtils.getWeekCnThree(item.orderDate)}}<span>{{item.orderDate}}</span></h1>
              <div class="goods-box" v-for="(food,idx) in item.list" :key="idx">
                <div class="goods-info" @click="showClick(food.orderId,food.mealId)">
                  <div class="meal-name">{{ food.mealName }}</div>
                  <div class="meal-info">
                    <dd>下单时间：{{ food.ctDate }}</dd>
                    <dd>消费金额：<span>{{ food.orderPrice }}</span>元</dd>
                  </div>
                </div>
                <!--<div class="goods-state" :class="food.mealState == '已完成'?'ordered':'ordering'">{{food.mealState}}</div>-->
              </div>
          </li>
        </ul>
      </Scroll>
    </div>
  </div>
</template>
<script>
  import {
    XButton,
    Group,
    Cell,
    Datetime
  } from "vux"
  import Scroll from '@/components/common/Scroll/Scroll';
  export default {
    name: "OrderRecord",
    components: {
       XButton, Group, Cell, Scroll,Datetime
    },
    data() {
      return {
        selectDat:'', //选择的年月
        month:'',     //当前几月
        year:'',      //当前年份
        startDate:'',
        endDate:'',
        goods: [
          {
            orderDate: '2019-04-16',
            mealList:[
              {
                mealName:'早餐',
                mealPrice:'100.86',
                mealState:'已预订',
                mealTime:'06:28:18',
              },
              {
                mealName:'早餐',
                mealPrice:'100.86',
                mealState:'已预订',
                mealTime:'06:28:18',
              },
            ]
          },
          {
            orderDate: '2019-04-15',
            mealList:[
              {
                mealName:'午餐',
                mealPrice:'86.68',
                mealState:'已完成',
                mealTime:'11:56:28',
              },
              {
                mealName:'午餐',
                mealPrice:'86.68',
                mealState:'已完成',
                mealTime:'11:56:28',
              },
              {
                mealName:'午餐',
                mealPrice:'86.68',
                mealState:'已完成',
                mealTime:'11:56:28',
              },
            ]
          },
          {
            orderDate: '2019-04-14',
            mealList:[
              {
                mealName:'晚餐',
                mealPrice:'88.28',
                mealState:'已完成',
                mealTime:'18:16:38',
              },
              {
                mealName:'晚餐',
                mealPrice:'88.28',
                mealState:'已完成',
                mealTime:'18:16:38',
              },
              {
                mealName:'晚餐',
                mealPrice:'88.28',
                mealState:'已完成',
                mealTime:'18:16:38',
              },
              {
                mealName:'晚餐',
                mealPrice:'88.28',
                mealState:'已完成',
                mealTime:'18:16:38',
              },
            ]
          },
        ],  //
        goods:[],
        curPage: 1,      //当前页
        totalPage:0,    //总页数
        pageNum: 20,    //每页条数
        pullDownRefresh: {
          threshold: 40, // 下拉多少开始刷新
          stop: 20 // 下拉回弹到多少停住
        },
        pullUpLoad: {
          threshold: 25
        },
        isPullDown: false, // 正在下拉刷新
        isPullUp: false, // 正在上拉加载
        emptyShow: false,
        initFlag: true
      }
    },
    computed: {},
    methods: {
      /**
       * @function获取当前日期
       *      wzx
       *   2019.04.12
       **/
      getSysDate() {
        this.$utils.Tools.loadShow();
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.today = data.sysDate.substring(0, 10);
              this.timestamp = this.$utils.DateUtils.getTimeStamp(data.sysDate) * 1000;
              this.year = data.sysDate.substring(0, 4);
              this.month = data.sysDate.substring(5, 7);
              this.startDate =  this.$utils.DateUtils.getMonthStart(data.sysDate.substring(0,7));
              this.endDate =  this.$utils.DateUtils.getMonthEnd(data.sysDate.substring(0,7));
              console.log(22,this.startDate,this.endDate)
              this.getOrderRecords();
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      /**
       * @function点击年或月份，显示月份下拉菜单
       *      wzx
       *   2019.01.14
       **/
      changeDate(val){
        this.year = val.substring(0,4);
        this.month = val.substring(5,7);
        this.selectDat = this.year+"-"+this.month;
        this.startDate =  this.$utils.DateUtils.getMonthStart(val);
        this.endDate =  this.$utils.DateUtils.getMonthEnd(val);
        this.getOrderRecords();
      },
      onPullingDown: function () {
        if (this.isPullDown) return;
        this.isPullDown = true; // 下拉刷新
        this.goods = [];
        this.curPage = 1;
        this.getOrderRecords();
      },
      onPullingUp: function () {
        if (this.isPullUp) return;
        this.isPullUp = true;
        this.curPage++;
        if (this.curPage > this.totalPage) {
          this.updateScroll();
          return;
        }
        this.getOrderRecords();
      },
      // 刷新 Scroll 状态
      updateScroll: function (flag) {
        this.isPullDown = false;
        this.isPullUp = false;
        this.$refs.scroll.forceUpdate(flag);
      },
      getOrderRecords(){
        this.$utils.Tools.loadShow();
        this.$api.Meal.getOrderRecords({
          pageIndex:this.curPage,
          pageSize:this.pageNum,
          search:{
            startDate:this.startDate,
            endDate:this.endDate,
            userSerial:this.$utils.Store.getItem('userSerial'),
          }
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              if(data.records && data.records.length>0){
                this.goods = data.records;
              }else{
                this.goods = [];
                this.emptyShow = true;
              }
              this.updateScroll();
              // this.mealList = data.records[1].mealList;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      showClick(orderId){
        this.$router.push({path:'/OrderPayResult',query:{orderId:orderId}})
      }
    },
    created() {
      this.getSysDate();
    },
    mounted() {

    },
    destroyed() {

    }
  }
</script>
<style type="text/scss" lang="scss">
  .order-record {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .date-box {
      flex-basis: 0.56rem;
      padding: 0 0.1rem;
      border-bottom: 1px solid #eaeaea;
        .month-box {
          width: 1.2rem;
          float: right;
          position: relative;
          .selectDate{
            width:100%;
            height:100%;
            position: absolute;
            top:0;
            left:0;
            z-index: 20;
            opacity: 0;
            .weui-cells{
              margin-top: 0!important;
            }
          }
          dt {
            height: 0.3rem;
            padding-top: 0.03rem;
            font-size: 0.13rem;
            color: #529DFE;
            text-align: center;
            span {
              font-size: 0.2rem;
            }
          }
          dd {
            height: 0.2rem;
            font-size: 0.13rem;
            text-align: center;
          }
          img{
            width:0.08rem;
            height:0.08rem;
            position: absolute;
            top:0.05rem;
            right:0.48rem;
          }
        }
        i {
          font-size: 0.35rem;
          float: right;
          padding-top: 0.1rem;
          color:#3399ff;
        }
    }
    .food-wrapper {
      flex: 1;
      overflow-y: scroll;
      /*border-bottom: 5px solid #eaeaea;*/
      ul {
        li {
          &:last-of-type{
            border-bottom: 1px solid #eaeaea;
          }
          h1 {
            height: 0.4rem;
            font-size: 0.15rem;
            line-height: 0.4rem;
            padding-left: 0.25rem;
            position: relative;
            overflow: hidden;
            font-weight: normal;
            background: #F5F5F5;
            color: #3399ff;
            /*border-bottom: 1px solid #eaeaea;*/
            &:before {
              width: 3px;
              height: 0.24rem;
              content: "";
              background: #3399ff;
              position: absolute;
              left: 0.1rem;
              top: 0.08rem;
            }
            span {
              padding-left: 0.15rem;
            }
          }
          .goods-box {
            height: 0.8rem;
            padding:0.1rem 0;
            display: flex;
            flex-direction: row;
            border-bottom: 1px solid #eaeaea;
            &:last-of-type{
              border-bottom: none;
            }
            .goods-info{
              flex:1;
              display: flex;
              flex-direction: row;
              .meal-name{
                flex-basis: 0.8rem;
                text-align: center;
                line-height: 0.6rem;
                font-size: 0.15rem;
                color:#333;
              }
              .meal-info{
                flex:1;
                dd{
                  line-height: 0.3rem;
                  font-size: 0.13rem;
                  color:#666;
                  span{
                    color:#FF6600;
                    padding-right: 0.05rem;
                  }
                }
              }
            }
            .goods-state{
              flex-basis: 0.8rem;
              line-height: 0.6rem;
              font-size: 0.13rem;
              &.ordering{
                color:#FF6600;
              }
              &.ordered{
                color:#12C9A4;
              }
            }
          }
        }
      }
    }
  }
</style>
