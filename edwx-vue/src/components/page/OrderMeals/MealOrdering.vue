<template>
  <div class="meal-ordering">
    <div class="header">
      <popup-picker :data="windowList" v-model="tempMerchantId" :show-name="true"
                    class="window-select" @on-change="windowChange"></popup-picker>
      <div class="search-box">
        <x-input placeholder="请输入搜索内容" v-model="mySearch" @on-click-clear-icon="clearSearch"
                 @on-enter="goSearch">
          <i slot="right" class="iconfont icon-sousuo" @click="goSearch"></i>
        </x-input>
      </div>
      <i class="iconfont icon-chakandingdan" @click="historyClick" style="padding-right:0.1rem"></i>
    </div>
    <div class="date-box">
      <div class="month-box">
        <dt><span>{{month}}</span>月</dt>
        <dd>{{year}}年</dd>
      </div>
      <div class="days-box">
        <li>
          <dt v-for="item in weekTitle">{{item.title}}</dt>
        </li>
        <li>
          <!--unorder ordering curorder ordered -->
          <dd :class="orderDays.indexOf(day.day)===-1?'unorder':(day.day===currDate?'ordering':'curorder')"
              v-for="day in weekList" @click="dayClick(day)"><span>{{day.day.substring(8)}}</span>
          </dd>
        </li>
      </div>
    </div>
    <div class="meal-box">
      <tab class="tab-box">
        <tab-item :selected="curIndex === index" @on-item-click="onItemClick(item.mealId,index)"
                  v-for="(item,index) in mealTypeList" :key="index">{{item.mealName}}
        </tab-item>
      </tab>
      <div class="show-box">
        <div class="menu-wrapper" ref="menuWrapper">
          <ul>
            <li v-for="(item,index) in goods" :key="index" class="menu-item"
                :class="{'current': currentIndex === index}"
                @click="selectMenu(index, $event)">{{item.typeName}}
            </li>
          </ul>
        </div>
        <div class="food-wrapper" ref="foodsWrapper">
          <empty :show="emptyShow" :tip="emptyTip" v-show="emptyShow===true"></empty>
          <ul ref="foodsul">
            <li v-for="(item,index) in goods" :key="index" class="food-list food-list-hook">
              <h1 class="title">{{item.typeName}}</h1>
              <ul>
                <li v-for="(food, num) in item.meals" :key="num" class="food-item">
                  <div class="food-pic">
                    <img :src="food.foodPhoto" alt="" v-if="food.foodPhoto">
                    <i class="iconfont icon-morentupian" v-else></i>
                  </div>
                  <div class="content">
                    <h2 class="name">{{food.foodName}}</h2>
                    <p class="price">￥<span>{{food.foodPrice}}</span>元/份</p>
                    <p class="desc">余<span>{{food.foodNum-food.foodUse}}</span>份</p>
                  </div>
                  <div class="add-box">
                    <x-button @click.native="addToShopCart($event, food)"></x-button>
                  </div>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="operate-box">
      <dd class="desc" @click="showExplain">
        <a>订餐说明</a>
      </dd>
      <dl>
        <dt ref="cart" @click="cartClick">
          <i class="iconfont icon-gouwuche"></i>
        </dt>
      </dl>
      <dd class="countNum">共<span>{{totalNum}}</span>份</dd>
      <dd class="countPrice"><span>{{totalPrice}}</span>元</dd>
      <dd class="my-operate">
        <x-button type="primary" :disabled="totalNum === 0" @click.native="goPay">结算</x-button>
      </dd>
    </div>
    <alert v-model="alertFlag" title="订餐说明" :hide-on-blur=true>
      <div style="overflow-y:auto;height:3rem;text-align: left;">{{remark}}</div>
    </alert>
    <div v-transfer-dom class="gouwuche">
      <popup v-model="showCart">
        <popup-header
          right-text="清空购物车"
          :show-bottom-border="false"
          @on-click-right="emptyClick"></popup-header>
        <ul class="meal-list" v-if="meals.length>0">
          <li v-for="(item,index) in meals" :key="index" class="food-list food-list-hook">
            <h1 class="title" v-if="item.mealName"><span>{{item.mealName}}</span></h1>
            <group gutter="0" class="goods-list">
              <cell v-for="(food,idx) in mealList" :title="food.foodName" :inline-desc="'￥'+food.foodPrice+'元/份'"
                    :key="idx" v-if="food.mealId === item.mealId">
                <img slot="icon" :src="food.foodPhoto" alt="" v-if="food.foodPhoto">
                <i slot="icon" class="iconfont icon-morentupian" v-else></i>
                <inline-x-number slot="child" width="50px" v-model="food.foodOrder" min="0"
                                 :max="food.foodNum-food.foodUse"
                                 @on-change="changeNum(food.foodOrder,idx,food)"></inline-x-number>
              </cell>
            </group>
          </li>
        </ul>
        <dl v-else style="height: 2.6rem;">
          <dt>
            <svg class="icon" aria-hidden="true">
              <use xlink:href="#icon-kong"></use>
            </svg>
          </dt>
          <dd>肚子饿坏了吧，赶紧订餐吧~</dd>
        </dl>
        <div class="operate-box">
          <dd class="countNum">共<span>{{totalNum}}</span>份</dd>
          <dd class="countPrice"><span>{{totalPrice}}</span>元</dd>
          <dd class="my-operate">
            <x-button type="primary" :disabled="totalNum === 0" @click.native="goPay">结算</x-button>
          </dd>
        </div>
      </popup>
    </div>
  </div>
</template>

<script>
  import {
    XInput,
    Group,
    XButton,
    Cell,
    Tab,
    Alert,
    Popup,
    PopupHeader,
    TabItem,
    InlineXNumber,
    PopupPicker,
    TransferDomDirective as TransferDom,
  } from 'vux';
  import BScroll from 'better-scroll';
  import Empty from '@/components/common/Empty/Empty';
  // import ShopCartBalls from '@/components/common/ShopCartBalls/ShopCartBalls.vue'
  // import CartControl from '@/components/common/CartControl/CartControl.vue'

  export default {
    name: 'MealOrdering',
    directives: {
      TransferDom,
    },
    components: {
      XInput,
      Group,
      XButton,
      Cell,
      Tab,
      Alert,
      Popup,
      PopupHeader,
      InlineXNumber,
      PopupPicker,
      TabItem,
      Empty,
      // ShopCartBalls,
      // CartControl
    },
    data() {
      return {
        mySearch: '',
        weekTitle: [
          {
            title: '一',
            value: '1',
          },
          {
            title: '二',
            value: '2',
          },
          {
            title: '三',
            value: '3',
          },
          {
            title: '四',
            value: '4',
          },
          {
            title: '五',
            value: '5',
          },
          {
            title: '六',
            value: '6',
          },
          {
            title: '日',
            value: '7',
          },
        ],   //周标题数组
        weekList: [],  //周数组
        timestamp: 0,  //当前时间戳
        year: '',
        month: '',
        currDate: '',  //选中的某天
        today: '',  //今天
        nowTime: '', //当前时间
        merchantId: null,    //商户编号
        placeId: '',    //场所编号
        mealTypeList: [],
        mealId: '',    //选择的餐别ID
        curIndex: 0, //默认选中的餐别
        goods: [],
        emptyShow: false,  //数据是否为空
        emptyTip: '暂无菜品',
        // currentIndex: 0, //当前菜类
        listHeight: [],//每个菜单将要滑动的height
        scrollY: 0,
        alertFlag: false,
        showCart: false,
        remark: '',
        meals: [], //购物车订餐选择的餐别数组
        mealList: [], //购物车订餐选择的菜品数组
        foodOrder: 0,
        totalNum: 0, //预订总份数
        totalPrice: 0, //预订总价钱
        rightHeight: '',
        orderDays: [],
        cancelFlag: '',
        foodScroll: null,
        menuScroll: null,
        windowList: [[{name: '', value: ''}]],
        merchantName: null,
        tempMerchantId: [],
      };
    },
    computed: {
      currentIndex() {
        for (let i = 0; i < this.listHeight.length; i++) {
          let height1 = this.listHeight[i];
          let height2 = this.listHeight[i + 1];
          if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {
            return i;
          }
        }
        return 0;
      },
    },
    watch: {
      showCart() {
        if (this.showCart) {
          $('body').addClass('modal-open');
        } else {
          $('body').removeClass('modal-open');
        }
      },
    },
    methods: {
      /**
       * @function点击左侧菜类
       *      wzx
       *   2019.05.09
       **/
      selectMenu(index, event) {
        if (!event._constructed) {
          //避免点击事件发生两次
          return;
        }
        // this.scrollY = 0;
        let foodList = this.$refs.foodsWrapper.getElementsByClassName(
          'food-list-hook',
        );
        let el = foodList[index];
        this.foodScroll.scrollToElement(el, 300);
      },
      /**
       * @function获取右侧内容高度
       *      wzx
       *   2019.05.09
       **/
      _calculateHeight() {
        this.scrollY = 0;
        this.listHeight = [];
        let foodList = this.$refs.foodsWrapper.getElementsByClassName(
          'food-list-hook',
        );
        let height = 0;
        this.listHeight.push(height);
        for (let i = 0; i < foodList.length; i++) {
          let item = foodList[i];
          height += item.clientHeight; //元素内容及其边框所占据的空间大小
          this.listHeight.push(height);
        }
        // this.$refs.foodsul.style.height = this.listHeight[this.listHeight.length - 1] +'px';
        this.$refs.foodsul.style.transform = 'translate(0,0) scale(1) translateZ(0px)';
        // console.log(22, this.listHeight);
      },
      /**
       * @function设置右侧内容高度
       *      wzx
       *   2019.05.09
       **/
      _initScroll() {
        this.menuScroll = new BScroll(this.$refs.menuWrapper, {
          click: true, //可以点击
        });
        this.foodScroll = new BScroll(this.$refs.foodsWrapper, {
          probeType: 3, //检测滚动的位置
          click: true,
        });
        // 获取滚动的Y轴
        this.foodScroll.on('scroll', pos => {
          this.scrollY = Math.abs(Math.round(pos.y));
          // this.scrollY = Math.abs(Math.round(pos.y));
          // console.log(22, this.scrollY, this.currentIndex);
        });
      },
      /**
       * @function获取当前周数组
       *      wzx
       *   2019.05.05
       **/
      getWeekList(value) {
        this.weekList = [];
        let d = new Date(value).getDay();   //必须为value的日期
        let newWeekTitle = this.weekTitle.slice(d - 1);
        newWeekTitle.push(...this.weekTitle.slice(0, d - 1));
        this.weekTitle = newWeekTitle;
        for (let i = 0; i < 7; i++) {
          let curWeek = value + i * 24 * 3600 * 1000;     //获取当前周几的时间戳
          this.weekList.push({
            day: this.$utils.DateUtils.formatTimeStamp(curWeek),
            week: this.$utils.DateUtils.getWeekTimeStamp(curWeek),
          });     //根据周几的时间戳返回周几的日期
        }
      },
      /**
       * @function对象数组排序
       *      wzx
       *   2019.05.06
       **/
      compare(property) {
        return function (obj1, obj2) {
          let value1 = obj1[property];
          let value2 = obj2[property];
          return value1 - value2;     // 升序
        };
      },
      /**
       * @function查看购物车
       *      wzx
       *   2019.05.09
       **/
      cartClick() {
        this.showCart = true;
      },
      /**
       * @function清空购物车
       *      wzx
       *   2019.05.09
       **/
      emptyClick() {
        this.meals = [];
        this.mealList = [];
        this.totalPrice = 0;
        this.totalNum = 0;
        this.$store.dispatch('actionFoodList', []);
      },
      /**
       * @function添加到购物车功能
       *      wzx
       *   2019.05.05
       **/
      addToShopCart(event, food) {
        if (food.foodNum - food.foodUse === 0) {
          this.$utils.Tools.toastShow('此菜份数已预订完！');
          return;
        }

        if (this.cancelFlag === '1' && food.operate === '0' && this.nowTime >= food.orderEnd) {
          this.$utils.Tools.toastShow('已过' + food.mealName + '预订时间，不可预订！');
          return;
          // } else if (food.operate === '0' || this.nowTime < food.orderEnd) {
          //   this.$utils.Tools.toastShow('此菜已售完，下次早点预订噢~');
        }

        this.meals.push({mealId: food.mealId, mealName: food.mealName, orderEnd: food.orderEnd});
        let hash = {};
        /*es6数组去重*/
        const newArr = this.meals.reduceRight((item, next) => {
          hash[next.mealId] ? '' : hash[next.mealId] = true && item.push(next);
          return item;
        }, []);
        this.meals = newArr.sort(this.compare('mealId'));
        if (this.mealList.length === 0) {
          this.mealList.push({
            mealId: food.mealId,
            mealName: food.mealName,
            foodId: food.foodId,
            foodName: food.foodName,
            foodNum: food.foodNum,
            foodUse: food.foodUse,
            foodPhoto: food.foodPhoto,
            foodPrice: food.foodPrice,
            placeId: food.placeId,
            merchantId: food.merchantId,
            operate: food.operate,
            orderEnd: food.orderEnd,
            foodType: food.foodType,
            foodOrder: 1,
          });
        } else {
          let j;
          let list = this.mealList.filter((meal, indx) => {
            if (meal.foodId === food.foodId && meal.mealId === food.mealId) {
              j = indx;
              return true;
            } else {
              return false;
            }
          });
          if (list.length > 0) {
            this.$set(this.mealList[j], 'foodOrder', this.mealList[j].foodOrder + 1);
          } else {
            this.mealList.push(food);
            this.$set(this.mealList[this.mealList.length - 1], 'foodOrder', 1);
          }
        }
        this.totalPrice = 0;
        this.totalNum = 0;
        let totalPrice = 0;
        for (let item of this.mealList) {
          totalPrice += parseFloat((item.foodPrice * item.foodOrder).toFixed(2));
          this.totalNum += item.foodOrder;
        }
        this.totalPrice = Math.round(totalPrice * 100) / 100;
        // console.log(2233, this.totalPrice);
      },
      /**
       * @function订单份数变化
       *      wzx
       *   2019.05.09
       **/
      changeNum(val, idx, food) {
        if (food.foodOrder <= food.foodNum - food.foodUse) {
          this.totalPrice = 0;
          this.totalNum = 0;
          if (val === 0) {
            this.mealList.splice(idx, 1);
            let hash = {};
            /*es6数组去重*/
            const newArr = this.mealList.reduceRight((item, next) => {
              hash[next.mealId] ? '' : hash[next.mealId] = true && item.push(next);
              return item;
            }, []);
            this.meals = newArr.sort(this.compare('mealId'));
            /*if(this.mealList.length == 0){
              this.meals = [];
            }*/
          }
          let totalPrice = 0;
          for (let item of this.mealList) {
            totalPrice += parseFloat((item.foodPrice * item.foodOrder).toFixed(2));
            this.totalNum += item.foodOrder;
          }
          this.totalPrice = Math.round(totalPrice * 100) / 100;
          // console.log(2233, this.totalPrice);
        } else {
          this.$utils.Tools.toastShow('此菜份数已预订完！');
        }
      },
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
            this.nowTime = data.sysDate.substring(11, 16);
            this.getWeekList(this.timestamp);
            this.getMealDays(this.placeId);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function获取当前日期下的菜品列表
       *      wzx
       *   2019.05.05
       **/
      dayClick(day) {
        if (this.orderDays.indexOf(day.day) > -1) {
          if (this.cancelFlag === '0' && this.currDate !== day.day) {
            this.$utils.Tools.toastShow('现场订餐只可选择当天！');
          } else {
            this.emptyClick();
            this.currDate = day.day;
            this.getFoodList(this.currDate, this.mySearch, this.mealId, this.merchantId, this.placeId);
          }
        } else {
          this.$utils.Tools.toastShow('预订时间外不可预订！');
        }
      },
      /**
       * @function获取搜索的菜品列表
       *      wzx
       *   2019.05.05
       **/
      goSearch() {
        this.getFoodList(this.currDate, this.mySearch, this.mealId, this.merchantId, this.placeId);
      },
      /**
       * @function清空搜索内容后获取当前的菜品列表
       *      wzx
       *   2019.05.05
       **/
      clearSearch() {
        this.mySearch = '';
        $('.search-box .weui-cell .weui-cell__primary input').blur();
        this.goSearch();
        // this.getFoodList(this.currDate, this.mySearch, this.mealId, this.merchantId, this.placeId);
      },
      /**
       * @function获取当前日期选择的餐别
       *      wzx
       *   2019.05.05
       **/
      onItemClick(id, index) {
        this.foodScroll.refresh();
        this.menuScroll.refresh();
        this.mealId = id;
        this.curIndex = index;
        // this.scrollY = 0;
        // this.currentIndex = 0;
        this.listHeight = [];//每个菜单将要滑动的height
        this.scrollY = 0;
        this.getFoodList(this.currDate, this.mySearch, this.mealId, this.merchantId, this.placeId);
      },
      getMealDays(placeId) {
        this.$api.Meal.selectDayState({
          placeId: placeId,
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.orderDays = data;
            if (data.length > 0) {
              this.currDate = data[0];
              this.getWindowsList();
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function获取当前日期的餐别数组
       *      wzx
       *   2019.05.05
       **/
      getMealTypeList(date, merchantId, placeId) {
        this.$utils.Tools.loadShow();
        this.$api.Meal.getMealTypeList({
          date: date,
          // merchantId: merchantId,
          placeId: placeId,
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.mealTypeList = data;
            this.mealId = data[0].mealId;
            for (let i = 0; i < data.length; i++) {
              if (this.nowTime < data[i].orderEnd) {
                this.curIndex = i;
                this.mealId = data[i].mealId;
                break;
              }
            }
            this.getFoodList(this.currDate, this.mySearch, this.mealId, this.merchantId, this.placeId);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function获取当前日期下的菜品清单
       *      wzx
       *   2019.05.05
       **/
      getFoodList(date, foodName, mealId, merchantId, placeId) {
        this.goods = [];
        this.$utils.Tools.loadShow();
        this.$api.Meal.getFoodList({
          date: date,
          foodName: foodName,
          mealId: mealId,
          merchantId: merchantId,
          placeId: placeId,
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.goods = [];
            if (data.menuList.length > 0 && data.typeList.length > 0) {
              this.emptyShow = false;
              for (let type of data.typeList) {
                this.goods.push({typeCode: type.typeCode, typeName: type.typeName, meals: []});
              }
              // let foods = data.menuList;
              if (this.goods.length > 0) {
                for (let item of this.goods) {
                  for (let food of data.menuList) {
                    if (food.foodType === item.typeCode) {
                      item.meals.push({
                        foodId: food.foodId,
                        foodName: food.foodName,
                        foodNum: food.foodNum,
                        foodUse: food.foodUse,
                        foodPhoto: food.foodPhoto,
                        foodPrice: food.foodPrice,
                        foodType: food.foodType,
                        mealId: food.mealId,
                        mealName: food.mealName,
                        merchantId: food.merchantId,
                        operate: food.operate,
                        orderEnd: food.orderEnd,
                        placeId: food.placeId,
                      });
                    }
                  }
                }

                this.mealList = this.$store.getters.getterFoodList;
                let totalPrice = 0;
                this.totalNum = 0;
                this.meals = [];
                for (let item of this.mealList) {
                  for (let temp of data.menuList) {
                    if (temp.mealId === item.mealId && temp.foodId === item.foodId) {
                      item.foodOrder = Math.min(item.foodOrder, temp.foodNum - temp.foodUse);
                      break;
                    }
                  }
                  this.meals.push({mealId: item.mealId, mealName: item.mealName, orderEnd: item.orderEnd});
                  let hash = {};
                  /*es6数组去重*/
                  const newArr = this.meals.reduceRight((item, next) => {
                    hash[next.mealId] ? '' : hash[next.mealId] = true && item.push(next);
                    return item;
                  }, []);
                  this.meals = newArr.sort(this.compare('mealId'));

                  totalPrice += parseFloat((item.foodPrice * item.foodOrder).toFixed(2));
                  this.totalNum += item.foodOrder;
                }
                this.totalPrice = Math.round(totalPrice * 100) / 100;

                this.$nextTick(() => {
                  // this.scrollY = 0;
                  this._calculateHeight();
                });
              }
            } else {
              this.emptyShow = true;
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function获取订餐说明弹窗
       *      wzx
       *   2019.05.05
       **/
      showExplain() {
        this.alertFlag = true;
        this.$utils.Tools.loadShow();
        this.$api.Meal.getExplain(this.placeId).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.remark = data.dineShow;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /**
       * @function点击去结算
       *      wzx
       *   2019.05.09
       **/
      goPay() {
        // let mealList = JSON.stringify(this.mealList);
        this.$store.dispatch('actionFoodList', this.mealList);
        this.$router.push({
          path: '/OrderPay',
          query: {
            orderDate: this.currDate,
            placeId: this.placeId,
            cancelFlag: this.cancelFlag,
          },
        });
      },
      /**
       * @function查看订单记录
       *      wzx
       *   2019.05.09
       **/
      historyClick() {
        this.$router.push('/OrderRecord');
      },
      getWindowsList() {
        this.$api.AcDep.selectListByEntity({depDefine: 1, depParent: this.placeId}).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            if (data && data.length > 0) {
              this.windowList = [[]];
              for (let i = 0; i < data.length; i++) {
                if (i === 0) {
                  this.merchantId = data[0].depSerial;
                  this.merchantName = data[0].depName;
                  this.tempMerchantId = [data[0].depSerial + ''];
                }
                this.windowList[0].push({name: data[i].depName, value: data[i].depSerial + ''});
              }
              // this.getMealTypeList(this.currDate, this.merchantId, this.placeId);
            }
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      windowChange(value) {
        this.emptyClick();
        this.merchantId = value[0];
        this.getMealTypeList(this.currDate, this.merchantId, this.placeId);
      },
    },
    created() {
      this.placeId = this.$route.query.placeId;
      this.cancelFlag = this.$route.query.cancelFlag;
      this.getSysDate();
    },
    mounted() {
      this.$nextTick(() => {
        this._initScroll(); //页面渲染完毕，初始化better-scroll组件
      });
    },
    updated() {
      let foodList = this.$refs.foodsWrapper.getElementsByClassName('food-list-hook');
      if (foodList[foodList.length - 1]) {
        let foodHeight = foodList[foodList.length - 1].clientHeight;
        let outerHeight = this.$refs.foodsWrapper.clientHeight;
        if (foodHeight < outerHeight) {
          foodList[foodList.length - 1].style.height = outerHeight + 'px';
        }
      }
    },
  };
</script>

<style type="text/scss" lang="scss">
  .meal-ordering {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .header {
      display: flex;
      align-items: center;

      .window-select {
        font-size: 0.15rem;
        background-color: #3399ff;
        border-radius: 5px;
        margin-left: 0.1rem;

        .weui-cell {
          padding: 0.06rem;

          .weui-cell__ft:after {
            transform: translate(2px, 0px) rotate(135deg);
            border-color: #fff;
          }

          span {
            color: #fff;
          }
        }
      }

      .search-box {
        flex: 1;
        margin: 0.1rem;
        width: 60%;
        border: 1px solid #eaeaea;
        border-radius: 3px;
        padding: 0.05rem;
        box-sizing: border-box;

        .vux-x-input {
          font-size: 0.15rem;
          padding: 0;
        }

        .icon-sousuo {
          font-size: 0.2rem;
          color: #999;
        }
      }

      .icon-chakandingdan {
        color: #3399ff;
        font-size: 0.3rem;
      }
    }

    .date-box {
      display: flex;
      flex-direction: row;

      .month-box {
        flex-basis: 0.7rem;

        dt {
          height: 0.3rem;
          padding-top: 0.03rem;
          box-sizing: border-box;
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
      }

      .days-box {
        flex: 1;

        li {
          display: flex;
          flex-direction: row;

          &:first-of-type {
            height: 0.2rem;

            dt {
              flex: 1;
              font-size: 0.12rem;
              text-align: center;
              line-height: 0.2rem;
            }
          }

          &:last-of-type {
            height: 0.3rem;

            dd {
              flex: 1;
              font-size: 0.13rem;
              text-align: center;
              line-height: 0.28rem;

              span {
                width: 0.3rem;
                height: 0.3rem;
                display: block;
                margin: 0 auto;
                border-radius: 50%;
              }
            }
          }

          .ordered {
            span {
              border: 1px solid #CECECE;
            }
          }

          .ordering {
            span {
              background: #3399FF;
              color: #fff;
            }
          }

          .unorder {
            span {
              background: #F6F6F6;
            }
          }

          .curorder {
            span {
              background: #999999;
              color: #fff;
            }
          }
        }
      }
    }

    .meal-box {
      flex: 1;
      display: flex;
      flex-direction: column;
      height: 100%;

      .tab-box {
        * {
          font-size: 0.18rem !important;
        }
      }

      .show-box {
        flex: 1;
        display: flex;
        flex-direction: row;
        padding-top: 1px;
        box-sizing: border-box;
        overflow: hidden;

        .menu-wrapper {
          flex-basis: 0.7rem;
          background: #F6F6F6;
          border-right: 1px solid #eaeaea;
          overflow-y: scroll;
          display: flex;
          flex-direction: column;

          ul {
            li {
              height: 0.56rem;
              font-size: 0.14rem;
              line-height: 0.56rem;
              text-align: center;

              &.current {
                background: #3399FF;
                color: #fff;
              }
            }
          }
        }

        .food-wrapper {
          flex: 1;
          overflow-y: scroll;

          ul {
            .food-list {
              &:last-of-type {
                /*min-height: 4.75rem; !*最后一屏设置最小高度，实现左侧菜类滚动定位*!*/
              }

              h1 {
                font-size: 0.13rem;
                line-height: 0.3rem;
                background: #F6F6F6;
                text-align: center;
              }

              ul {
                padding: 0.05rem 0;
                box-sizing: border-box;

                li {
                  display: flex;
                  flex-direction: row;
                  padding: 0.05rem 0.2rem;
                  box-sizing: border-box;
                  align-items: center;

                  .food-pic {
                    flex-basis: 0.6rem;
                    margin-right: 0.2rem;

                    img {
                      width: 0.6rem;
                      height: 0.6rem;
                      display: block;
                      border: 1px solid #eaeaea;
                      border-radius: 3px;
                    }

                    i {
                      font-size: 0.6rem;
                      display: block;
                      color: #999999;
                    }
                  }

                  .content {
                    flex: 1;

                    h2 {
                      font-size: 0.15rem;
                      line-height: 0.2rem;
                      font-weight: normal;
                    }

                    p {
                      font-size: 0.12rem;
                      line-height: 0.2rem;

                      &.price {
                        font-size: 0.13rem;
                        color: #FF6600;

                        span {
                          padding: 0 3px;
                        }
                      }

                      &.desc {
                        font-size: 0.11rem;
                        color: #999;

                        span {
                          padding: 0 3px;
                          box-sizing: border-box;
                        }
                      }
                    }
                  }

                  .add-box {
                    flex-basis: 0.5rem;
                    padding: 0.15rem 0.05rem;
                    box-sizing: border-box;

                    .weui-btn {
                      width: 0.3rem;
                      height: 0.3rem;
                      position: relative;
                      border-radius: 50%;
                      padding: 0;
                      font-family: "iconfont";
                      font-style: normal;
                      -webkit-font-smoothing: antialiased;
                      -moz-osx-font-smoothing: grayscale;
                      color: rgba(255, 102, 0, 1);
                      font-size: 0.5rem;

                      &:after {
                        content: "\e646";
                        display: block;
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        margin: auto;
                        border: none;
                      }

                      &:active {
                        color: rgba(206, 60, 57, 0.6);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    .operate-box {
      background: #fff;
      display: flex;
      flex-direction: row;
      border-top: 1px solid #eaeaea;
      align-items: center;

      dd {
        padding: 0.1rem 0.05rem;
        box-sizing: border-box;
        font-size: 0.13rem;
        line-height: 0.45rem;
        text-align: center;

        &.desc {
          flex: 1.5;

          a {
            text-decoration: underline;
            color: #FF6600;
          }
        }

        &.countPrice {
          flex: 2;
          color: #999;

          span {
            padding: 0 3px;
            font-size: 0.18rem;
            color: #FF6600;
          }
        }

        &.countNum {
          flex: 1.5;
          color: #999;

          span {
            padding: 0 3px;
            font-size: 0.18rem;
            color: #3399ff;
          }
        }

        &.my-operate {
          flex: 1.6;

          .weui-btn {
            &:after {
              border: none;
            }
          }
        }
      }

      dl {
        flex: 0.8;
        padding: 0.15rem 0.05rem;
        position: relative;

        dt {
          width: 0.35rem;
          height: 0.35rem;
          text-align: center;

          i {
            font-size: 0.35rem;
            color: #3399ff;
            display: block;
            line-height: 0.35rem;
          }
        }

        .ball-container {
          position: absolute;
          top: 0;
          left: 0;
        }
      }
    }
  }

  .vux-popup-mask.vux-popup-show {
    background: rgba(0, 0, 0, .6)
  }

  .gouwuche {
    .vux-popup-dialog {
      background: #fff;

      .vux-popup-header {
        .vux-popup-header-right {
          padding-left: 0.3rem;
          color: #999;
          position: relative;
          font-size: 0.14rem;

          &:before {
            content: "\e668";
            position: absolute;
            left: 0;
            top: 0;
            font-family: "iconfont" !important;
            font-style: normal;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            font-size: 0.23rem;
          }
        }
      }

      .meal-list {
        width: 100%;
        height: 2.6rem;
        overflow-y: scroll;

        li {
          padding-left: 0.1rem;

          h1 {
            height: 0.2rem;
            font-size: 0.13rem;
            line-height: 0.2rem;
            padding-left: 0.1rem;
            position: relative;
            overflow: hidden;
            font-weight: normal;

            &:before {
              width: 3px;
              height: 0.2rem;
              content: "";
              background: #3399ff;
              position: absolute;
              left: 0;
            }

            &:after {
              width: 100%;
              height: 1px;
              content: "";
              background: #eaeaea;
              position: absolute;
              left: 0.1rem;
              bottom: 0;
              z-index: 1;
            }

            span {
              padding-right: 0.05rem;
              padding-bottom: 1px;
              position: absolute;
              z-index: 2;
              background: #fff;
              color: #999;
            }
          }

          .goods-list {
            margin: 0.1rem 0;

            .weui-cells {
              &:before, &:after {
                border: none;
              }

              .weui-cell {
                height: 0.66rem;
                padding: 0.03rem 0.1rem;

                &:before {
                  border: none;
                }

                .weui-cell__hd {
                  width: 20%;

                  img {
                    width: 0.6rem;
                    height: 0.6rem;
                  }

                  i {
                    font-size: 0.6rem;
                    display: block;
                    color: #999999;
                  }
                }

                .vux-cell-primary {
                  width: 40%;
                  padding-left: 0.05rem;

                  p {
                    color: #333 !important;
                    font-size: 0.15rem;
                  }

                  span {
                    color: #FF6600;
                    font-size: 0.11rem;
                  }
                }

                .vux-inline-x-number {
                  width: 40%;

                  > div {
                    padding: 0 0.1rem;

                    .vux-number-selector {
                      width: 0.3rem;
                      height: 0.3rem;
                      padding: 0;
                      text-align: center;
                      line-height: 0.3rem;
                      border: none;

                      &.vux-number-selector-sub {
                        position: relative;

                        &:after {
                          position: absolute;
                          left: 0;
                          top: 0;
                          content: "\e666";
                          font-family: "iconfont" !important;
                          font-style: normal;
                          -webkit-font-smoothing: antialiased;
                          -moz-osx-font-smoothing: grayscale;
                          font-size: 0.3rem;
                          color: #ccc;
                        }

                        > svg {
                          display: none;
                        }
                      }

                      &.vux-number-selector-plus {
                        position: relative;

                        &:after {
                          position: absolute;
                          left: 0;
                          top: 0;
                          content: "\e646";
                          font-family: "iconfont" !important;
                          font-style: normal;
                          -webkit-font-smoothing: antialiased;
                          -moz-osx-font-smoothing: grayscale;
                          font-size: 0.3rem;
                          color: #FF6600;
                        }

                        > svg {
                          display: none;
                        }

                        /*background:#FF6600;
                        border:none;
                        >svg{
                          fill:#fff;
                        }*/
                      }

                      &.vux-number-disabled {
                        position: relative;

                        &:after {
                          position: absolute;
                          left: 0;
                          top: 0;
                          content: "\e646";
                          font-family: "iconfont" !important;
                          font-style: normal;
                          -webkit-font-smoothing: antialiased;
                          -moz-osx-font-smoothing: grayscale;
                          font-size: 0.3rem;
                          color: #ccc;
                        }

                        > svg {
                          display: none;
                        }
                      }
                    }

                    .vux-number-input {
                      border: none;
                      font-size: 0.15rem;
                    }
                  }
                }
              }
            }
          }
        }
      }

      > dl {
        height: 2.3rem;
        background: #fff;
        position: relative;

        dt {
          text-align: center;
          padding-top: 0.3rem;

          svg.icon {
            font-size: 1.5rem;
            margin: 0 auto;
          }
        }

        dd {
          position: absolute;
          text-align: center;
          font-size: 0.13rem;
          line-height: 0.3rem;
          bottom: 0.2rem;
          left: 0;
          right: 0;
          margin: auto;
        }
      }

      .operate-box {
        flex-basis: 0.65rem;
        background: #fff;
        display: flex;
        flex-direction: row;
        border-top: 1px solid #eaeaea;
        align-items: center;

        dd {
          padding: 0.1rem 0.05rem;
          font-size: 0.13rem;
          line-height: 0.45rem;
          text-align: center;

          &.desc {
            flex: 1.5;

            a {
              text-decoration: underline;
              color: #FF6600;
            }
          }

          &.countPrice {
            flex: 2;
            color: #999;

            span {
              padding: 0 3px;
              font-size: 0.18rem;
              color: #FF6600;
            }
          }

          &.countNum {
            flex: 1.5;
            color: #999;

            span {
              padding: 0 3px;
              font-size: 0.18rem;
              color: #3399ff;
            }
          }

          &.my-operate {
            flex: 1.6;

            .weui-btn {
              &:after {
                border: none;
              }
            }
          }
        }

        dl {
          flex: 0.8;
          padding: 0.15rem 0.05rem;

          dt {
            width: 0.35rem;
            height: 0.35rem;
            text-align: center;

            i {
              font-size: 0.35rem;
              color: #3399ff;
              display: block;
              line-height: 0.35rem;
            }
          }
        }
      }
    }
  }
</style>
