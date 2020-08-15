<template>
  <popup v-model="showFlag" height="60%" class="ed-select-content" @on-show="onShow">
    <popup-header
      :title="title"
      left-text="取消"
      right-text="确定"
      :show-bottom-border="true"
      @on-click-left="handleCancel"
      @on-click-right="handleAction"></popup-header>
    <ul class="ed-select-type" v-if="typeList.length > 0">
      <li v-for="(item, index) in typeList" :key="index">
        <div :class="[item.value === null ? 'ed-select-type-circle-last' : 'ed-select-type-circle']"></div>
        <div class="ed-select-type-tail"></div>
        <div class="ed-select-type-content" :class="{'ed-select-active':item.select}"
             @click="typeSelect(item, index)">{{item.name}}
        </div>
      </li>
    </ul>
    <ul class="ed-select-list" v-if="selectList.length > 0">
      <li>{{listTitle}}</li>
      <li v-for="(item, index) in selectList" :key="index">
        <div class="ed-select-list-content" :class="{'ed-select-active':item.select}"
             @click="listSelect(item, index)">{{item.name}}
        </div>
        <div class="ed-select-list-active" v-if="item.select"></div>
      </li>
    </ul>
  </popup>
</template>

<script>
  import {
    Popup,
    PopupHeader,
  } from 'vux';

  export default {
    name: 'PopSelect',
    components: {
      Popup,
      PopupHeader,
    },
    props: {
      init: Array,
      flag: {
        type: Boolean,
        default: false,
      },
      getList: {
        type: Function,
        default: (obj, type, callback) => {
          return callback([]);
        },
      },
    },
    data() {
      return {
        showFlag: false,
        tempFlag: false,
        title: '请选择',
        typeTitle: '',
        listTitle: '选择场所',
        typeIndex: -1,
        typeList: [],
        selectList: [],
      };
    },
    computed: {},
    watch: {
      flag: {
        handler: function (val) {
          this.showFlag = val;
        },
        immediate: true,
      },
      showFlag: function (val) {
        this.$emit('update:flag', val);
      },
    },
    methods: {
      onShow: function () {
        if (this.init !== null && this.init.length > 0) {
          this.typeSelect(this.init[this.init.length - 1], this.init.length - 1);
        }
      },
      handleCancel: function () {
        this.showFlag = false;
      },
      handleAction: function () {
        for (const item of this.typeList) {
          if (item.value === null) {
            this.$utils.Tools.toastShow('请选择场所');
            return;
          }
        }

        if (this.typeList === null || this.typeList.length === 0) {
          this.$utils.Tools.toastShow('请选择场所');
          return;
        }

        this.showFlag = false;
        this.$emit('select-type', this.typeList);
      },
      handleList: function (data) {
        if (data !== null) {
          this.selectList = data;
          if (data.length > 0) {
            if (this.tempFlag && this.typeIndex > -1) {
              for (const item of this.selectList) {
                if (item.value === this.typeList[this.typeIndex].value) {
                  this.$set(item, 'select', true);
                  break;
                }
              }
            }

            if (this.typeList.length > 0 && !this.tempFlag) {
              this.typeList.push({
                name: '请选择',
                value: null,
                select: true,
              });
            }
          } else {
            // this.showFlag = false;
          }
        } else {
          this.showFlag = false;
        }
      },
      typeSelect: function (obj, index) {
        this.tempFlag = true;
        this.typeIndex = index;
        for (let item of this.typeList) {
          item.select = false;
        }
        this.typeList[index].select = true;

        if (obj.value === null) {
          this.getList(this.typeList[index - 1], 1, (data) => {
            this.handleList(data);
          });
          return;
        }
        if (index === 0) {
          this.getList(null, 0, (data) => {
            this.handleList(data);
          });
        } else {
          this.getList(obj, 0, (data) => {
            this.handleList(data);
          });
        }
      },
      listSelect: function (obj, index) {
        if (this.typeList.length === 0) {
          this.typeList.push(obj);
        } else {
          if (this.tempFlag && obj.value === this.typeList[this.typeIndex].value) {
            this.tempFlag = true;
            if (this.typeIndex < this.typeList.length - 1) {
              this.typeIndex = this.typeIndex + 1;

              for (let item of this.typeList) {
                item.select = false;
              }
              this.typeList[this.typeIndex].select = true;
            }
            this.getList(obj, 1, (data) => {
              this.handleList(data);
            });
            return;
          } else {
            if (this.tempFlag && this.typeList[this.typeIndex].value !== null) {
              this.typeList.splice(this.typeIndex, this.typeList.length);
            }
            this.typeList = this.typeList.filter(item => {
              return item.value !== null;
            });
            this.typeList.push(obj);
          }
        }

        this.tempFlag = false;
        this.getList(obj, 1, (data) => {
          this.handleList(data);
        });
      },
    },
    created() {
      if (this.init !== null && this.init.length > 0) {
        this.typeList = this.init;
        this.typeSelect(this.init[this.init.length - 1], this.init.length - 1);
      } else {
        this.getList(null, 0, (data) => {
          this.handleList(data);
        });
      }
    },
    mounted() {
    },
  };
</script>

<style type="text/scss" lang="scss">
  .ed-select-content {
    font-size: 0.15rem;
    background-color: #ffffff !important;
    display: flex;
    flex-direction: column;

    .ed-select-active {
      color: #FF9900;
    }

    .ed-select-title {
      text-align: center;
      padding: 0.1rem 0;
    }

    .ed-select-type {
      padding-top: 0.1rem;
      background: #ffffff;

      li {
        position: relative;
        margin-left: 0.1rem;

        .ed-select-type-circle-last {
          position: absolute;
          width: 10px;
          height: 10px;
          top: 5px;
          left: 1px;
          border-radius: 5px;
          background-color: #ffffff;
          border: 1px #FF9900 solid;
        }

        &:last-child {
          .ed-select-type-tail {
            display: none;
          }

          .ed-select-type-content {
            /*padding: 0 0 0 0.3rem;*/
          }
        }

        .ed-select-type-circle {
          position: absolute;
          width: 10px;
          height: 10px;
          top: 5px;
          left: 1px;
          border-radius: 5px;
          background-color: #FF9900;
        }

        .ed-select-type-tail {
          position: absolute;
          content: '';
          height: 100%;
          width: 2px;
          left: 5px;
          top: 5px;
          background-color: #FF9900;
        }

        .ed-select-type-content {
          padding: 0 0 0.2rem 0.2rem;
        }
      }
    }

    .ed-select-list {
      border-top: 1px #ececec solid;
      flex: 1;
      font-size: 0.15rem;
      padding-left: 0.1rem;
      padding-top: 0.1rem;
      overflow-y: scroll;

      li {
        position: relative;

        .ed-select-list-content {
          padding: 0 0 0.2rem 0;
        }

        .ed-select-list-active {
          position: absolute;
          top: 0;
          right: 0.2rem;
          width: 8px;
          height: 16px;
          border-color: #FF9900;
          border-style: solid;
          border-width: 0 3px 3px 0;
          transform: rotate(45deg);
        }

        &:first-child {
          color: #828282;
          padding-bottom: 0.2rem;
        }
      }
    }
  }
</style>
