<template>
  <div class="ed-select">
    <group gutter="0">
      <popup-picker title="订餐类型" :data="orderList" v-model="orderType" :columns="1" :show-name="true"></popup-picker>
      <cell title="就餐餐厅" :value="placeName" is-link @click.native="showFlag = true" class="dine-place"></cell>
    </group>
    <div class="dine-info">
      <img src="../../../assets/dine_back.png" style="width: 2rem">
      <p>请先选择订餐类型和就餐餐厅哦！</p>
    </div>

    <div class="place-button">
      <x-button type="primary" @click.native="placeSubmit">开始订餐</x-button>
      <div @click="historyClick" class="order-record">订餐记录
      </div>
    </div>
    <div v-transfer-dom>
      <pop-select :flag.sync="showFlag" :init="typeList" :getList="selectList"
                  @select-type="selectType"></pop-select>
    </div>
  </div>
</template>

<script>
  import {
    Group,
    Cell,
    XButton,
    PopupPicker,
    TransferDomDirective as TransferDom,
  } from 'vux';

  import PopSelect from '@/components/common/PopSelect/PopSelect';

  export default {
    name: 'PlaceSelect',
    directives: {
      TransferDom,
    },
    components: {
      Group,
      Cell,
      XButton,
      PopSelect,
      PopupPicker,
    },
    data() {
      return {
        placeName: '请选择',
        showFlag: false,
        typeList: [],
        orderList: [{
          name: '预约订餐',
          value: '1',
        }, {
          name: '现场订餐',
          value: '0',
        }],
        orderType: ['1'],
      };
    },
    computed: {},
    watch: {},
    methods: {
      historyClick() {
        this.$router.push('/OrderRecord');
      },
      getPlaceList: function (params, callback) {
        this.$api.AcDep.selectListByEntity(params).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            let list = [];
            for (const item of data) {
              list.push({
                name: item.depName,
                value: item.depSerial,
              });
            }
            callback(list);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      getAllPlaceList: function (callback) {
        this.$api.AcDep.selectDinePlace(callback).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            let list = [];
            for (const item of data) {
              list.push({
                name: item.depName,
                value: item.depSerial,
              });
            }
            callback(list);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      selectList: function (obj, type, callback) {
        this.$utils.Tools.loadShow();
        if (type === 0) {
          if (obj === null) {
            this.getAllPlaceList(callback);
          } else {
            this.getPlaceList({depDefine: 0, depSerial: obj.value}, callback);
          }
        } else {
          this.getPlaceList({depDefine: 0, depParent: obj.value}, callback);
        }
      },
      selectType: function (obj) {
        this.typeList = obj;
        this.$utils.Store.setItem('typeList', JSON.stringify(obj));
        let names = obj.map((item) => {
          return item.name;
        });
        this.placeName = names.join('-');
      },
      placeSubmit: function () {
        if (this.typeList === null || this.typeList.length === 0) {
          this.$utils.Tools.toastShow('请选择餐厅');
          return;
        }
        this.$router.push(
          {
            path: '/MealOrdering',
            query: {
              placeId: this.typeList[this.typeList.length - 1].value,
              cancelFlag: this.orderType[0],
              // this.$route.meta.cancelFlag,
            },
          },
        );
      },
    },
    created() {
      this.$store.dispatch('actionFoodList', []);
      this.typeList = JSON.parse(this.$utils.Store.getItem('typeList')) || [];
      if (this.typeList.length > 0) {
        let names = this.typeList.map((item) => {
          return item.name;
        });
        this.placeName = names.join('-');
      }
    },
    mounted() {
    },
  };
</script>

<style type="text/scss" lang="scss">
  .ed-select {
    height: 100%;
    width: 100%;

    .dine-place {
      .weui-cell__ft {
        color: initial;
      }
    }

    .dine-info {
      text-align: center;
      font-size: 0.15rem;
      color: #999999;
      margin-top: 0.8rem;

      p {
        margin-top: 0.2rem;
      }
    }

    .place-button {
      display: flex;
      flex-direction: column;
      position: absolute;
      bottom: 0;
      width: 100%;
      padding: 0.1rem 0;
      border-top: 1px #ECECEC solid;
      align-items: center;

      .order-record {
        padding-top: 0.1rem;
        height: 0.35rem;
        width: 100%;
        font-size: 0.15rem;
        text-align: center;
        text-decoration: underline;
        color: #FF6600;
      }

      button {
        width: 80%;
      }
    }
  }
</style>
