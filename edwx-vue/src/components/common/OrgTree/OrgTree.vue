<template>
  <div class="org-detail" v-if="showFlag">
    <popup v-model="showFlag" height="100%" position="right" width="100%">
      <view-box body-padding-top="0.83rem" :body-padding-bottom="bodyBottom">
        <div slot="header" class="org-detail-head">
          <search
            v-model="searchValue"
            placeholder="请输入姓名或者工号查询"
            :auto-fixed="false"
            @on-cancel="onCancel"
            @on-submit="onSubmit"
            ref="search"></search>
          <div class="org-title">
          <span v-for="(item, i) in pagePath" :key="i" v-if="!searchFlag">
            <span v-if="i!==0">></span>
            <span v-if="i!==pagePath.length-1" style="color: #3399ff"
                  @click="getOrgList(item.depSerial, item.depName, false)">{{item.depName}}</span>
             <span v-if="i===pagePath.length-1">{{item.depName}}</span>
          </span>
            <span v-if="searchFlag">
            联系人
          </span>
          </div>
        </div>
        <div class="org-detail-body">
          <group class="org-detail-list" :gutter="0" v-if="searchFlag">
            <div class="org-line" style="border-bottom: none;border-top: #ECECEC 1px solid;"></div>
            <checker v-model="userChecked" type="checkbox" default-item-class="check-item-class"
                     selected-item-class="check-item-selected" @on-change="onUserCheck">
              <checker-item v-for="(user, i) in searchList" :key="'user' + i" :value="user.userSerial">
                <cell>
                  <div slot="title" class="cell-title">
                    <i :class="[userCheck(user.userSerial) ? 'weui-icon-success': 'weui-icon-circle', 'cell-icon']"></i>
                    <div>
                      <span>{{user.userLname}}</span>
                      <span class="title-remark" v-if="user.userDuty">{{user.userDuty}}</span>
                      <div class="title-desc">{{user.userDepname}}</div>
                    </div>
                  </div>
                </cell>
              </checker-item>
            </checker>
          </group>
          <group class="org-detail-list" :gutter="0" v-if="!searchFlag">
            <div class="org-line" style="border-bottom: none" v-if="selectType!==1"></div>
            <cell @click.native="allCheck=!allCheck" class="org-all-check" v-if="selectType!==1">
              <div slot="title">
                <check-icon :value.sync="allCheck" @click.native="allCheck=!allCheck"></check-icon>
                <span>全选</span>
              </div>
            </cell>
            <div class="org-line"></div>
            <checker v-model="depChecked" type="checkbox" default-item-class="check-item-class"
                     selected-item-class="check-item-selected" @on-change="onDepCheck">
              <checker-item v-for="(dep, i) in depList" :key="'dep' + i" :value="dep.depSerial">
                <cell>
                  <div slot="title">
                    <i :class="[depCheck(dep.depSerial) ? 'weui-icon-success': 'weui-icon-circle', 'cell-icon']"
                       v-if="selectType!==1"></i>
                    <span>{{dep.depName}}</span>
                    <span>({{dep.userNums}}人)</span>
                  </div>
                  <div @click.self.stop="onJump(dep)" v-if="!depCheck(dep.depSerial) || selectType===1"
                       style="color: #3399ff; padding-right:0.1rem">
                    下级
                  </div>
                  <div style="padding-right:0.1rem" v-else>
                    下级
                  </div>
                </cell>
              </checker-item>
            </checker>
            <div class="org-line" v-if="userList.length > 0 && depList.length > 0"></div>
            <checker v-model="userChecked" type="checkbox" default-item-class="check-item-class"
                     selected-item-class="check-item-selected" @on-change="onUserCheck">
              <checker-item v-for="(user, i) in userList" :key="'user' + i" :value="user.userSerial">
                <cell>
                  <div slot="title" class="cell-title">
                    <i :class="[userCheck(user.userSerial) ? 'weui-icon-success': 'weui-icon-circle', 'cell-icon']"
                       v-if="selectType!==1"></i>
                    <div>
                      <span>{{user.userLname}}</span>
                      <span class="title-remark" v-if="user.userDuty">{{user.userDuty}}</span>
                      <div class="title-desc">{{user.userDepname}}</div>
                    </div>
                  </div>
                </cell>
              </checker-item>
            </checker>
          </group>
        </div>
        <div slot="bottom" class="org-detail-bottom" :style="btnBottom">
          <x-button type="primary" @click.native="onClose" mini class="org-bottom-btn-left">取消</x-button>
          <div class="checked-user-sum" @click="onDetail" v-if="selectType!==1">已选择{{userSum + depSum}}人</div>
          <x-button type="primary" @click.native="onSelect" mini class="org-bottom-btn-right" v-if="selectType!==1">确定
          </x-button>
        </div>
      </view-box>
      <div v-transfer-dom>
        <popup v-model="detailFlag" height="100%" style="z-index:10000" position="right" width="100%">
          <popup-header title="联系人" left-text="取消" right-text="确定" @on-click-right="detailFlag=false"
                        @on-click-left="detailFlag=false"></popup-header>
          <group>
            <cell v-for="(dep, i) in depSubList" :key="'dep'+i">
              <div slot="title">
                <span>{{JSON.parse(dep).depName}}</span>
                <span>({{JSON.parse(dep).userNums}}人)</span>
              </div>
              <div @click="delOrg(JSON.parse(dep).depSerial)" style="color: red">移除</div>
            </cell>
            <div class="org-line" style="border-bottom: none;border-top: #ECECEC 1px solid;"
                 v-if="depSubList.length > 0 && userInfo.length > 0"></div>
            <cell v-for="(user, i) in userInfo" :key="'user'+i">
              <div slot="title">
                <span>{{user.userLname}}</span>
                <span class="title-remark" v-if="user.userDuty">{{user.userDuty}}</span>
                <div class="title-desc">{{user.userDepname}}</div>
              </div>
              <div @click="delUser(user.userSerial)" style="color: red">移除</div>
            </cell>
          </group>
        </popup>
      </div>
    </popup>
  </div>
</template>

<script>
  import {
    Cell,
    Group,
    ViewBox,
    Search,
    XButton,
    CheckIcon,
    Checker,
    CheckerItem,
    TransferDom,
    PopupHeader,
    Popup,
    Flexbox,
    FlexboxItem,
  } from 'vux';

  export default {
    name: 'OrgTree',
    directives: {
      TransferDom,
    },
    components: {
      Cell,
      Group,
      ViewBox,
      Search,
      XButton,
      CheckIcon,
      Checker,
      CheckerItem,
      PopupHeader,
      Popup,
      Flexbox,
      FlexboxItem,
    },
    props: {
      value: Boolean,
      depSerial: String,
      depName: String,
      selectType: {
        type: Number,
        default: 9999,
      },
      infoChecked: {
        type: Array,
        default: [],
      },
    },
    data() {
      return {
        depList: [],
        userList: [],
        depChecked: [],
        userChecked: [],
        searchList: [],
        userSubList: [],
        depSubList: [],
        selectList: [],
        userInfo: [],
        userSum: 0,
        depSum: 0,
        allCheck: false,
        searchValue: '',
        searchFlag: false,
        detailFlag: false,
        showFlag: false,
        pagePath: [],
        initFlag: false,
      };
    },
    computed: {
      bodyBottom: function () {
        return this.selectType !== 1 ? '0.41rem' : '0.41rem';
      },
      btnBottom: function () {
        return this.selectType !== 1 ? 'padding-bottom:0.065rem' : 'padding-bottom:0.355rem';
      },
      depCheck: function () {
        return function (obj) {
          let temp = this.depChecked.filter((item) => {
            return item === obj;
          });
          return temp.length > 0;
        };
      },
      userCheck: function () {
        return function (obj) {
          let temp = this.userChecked.filter((item) => {
            return item === obj;
          });
          return temp.length > 0;
        };
      },
    },
    methods: {
      delUser: function (obj) {
        let index = this.userChecked.indexOf(obj);
        if (index > -1) {
          this.userChecked.splice(index, 1);
        }

        this.userInfo = this.userInfo.filter((user) => {
          return user.userSerial !== obj;
        });
      },
      delOrg: function (obj) {
        let index = this.depChecked.indexOf(obj);
        if (index > -1) {
          this.depChecked.splice(index, 1);
        }
      },
      onDetail: function () {
        if (this.userSum + this.depSum === 0) {
          return;
        }
        this.userSelect();
        this.detailFlag = true;
      },
      onJump: function (dep) {
        this.getOrgList(dep.depSerial, dep.depName, true);
      },
      onCancel: function () {
        this.searchFlag = false;
      },
      onSubmit: function (value) {
        this.searchFlag = true;
        this.$utils.Tools.loadShow();
        this.$api.Org.getUserList(value).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.searchList = data;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      onDepCheck: function () {
        if (this.selectType === 1) {
          return;
        }

        let depTemp = this.depList.filter((dep) => {
          return this.depChecked.indexOf(dep.depSerial) > -1;
        });

        depTemp.filter((item) => {
          let obj = JSON.stringify({
            depSerial: item.depSerial,
            depName: item.depName,
            userNums: item.userNums,
          });
          let index = this.depSubList.indexOf(obj);
          if (index > -1) {
            this.depSubList.splice(index, 1);
          }
          this.depSubList.push(obj);
        });

        this.depSubList = this.depSubList.filter((item) => {
          let obj = JSON.parse(item);
          return this.depChecked.indexOf(obj.depSerial) > -1;
        });

        this.depSum = 0;

        this.depSubList.filter((item) => {
          let obj = JSON.parse(item);
          this.depSum = this.depSum + obj.userNums;
        });
      },
      onUserCheck: function () {
        this.userSum = 0;
        this.userChecked.filter(() => {
          this.userSum = this.userSum + 1;
        });

        if (this.initFlag && this.selectType === 1) {
          this.onSelect();
        }
      },
      userSelect: function () {
        this.userInfo = [];
        if (this.userChecked.length > 0) {
          this.$utils.Tools.loadShow();
          this.$api.Org.getUserInfo(JSON.stringify(this.userChecked)).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.userInfo = data;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
      },
      onClose: function () {
        this.showFlag = false;
      },
      onSelect: function () {
        let _that = this;

        function userHandler() {
          let usersInfo = [];
          if (_that.userChecked.length > 0) { //先选择人员
            _that.$utils.Tools.loadShow();
            return _that.$api.Org.getUserInfo(JSON.stringify(_that.userChecked)).then(response => {
              _that.$utils.Tools.loadHide();
              const {code, msg, data} = response;
              if (+code !== _that.$code.success) {
                _that.$utils.Tools.toastShow(msg);
              } else {
                usersInfo.push(...data);
                return usersInfo;
              }
            }).catch(err => {
              return Promise.reject();
            });
          } else {
            return Promise.resolve(usersInfo);
          }
        }

        function depHandler(usersInfo) {
          if (_that.depChecked.length > 0 && _that.selectType !== 1) { //再选择部门
            _that.$utils.Tools.loadShow();
            return _that.$api.Org.getUserByOrg(JSON.stringify(_that.depChecked)).then(response => {
              _that.$utils.Tools.loadHide();
              const {code, msg, data} = response;
              if (+code !== _that.$code.success) {
                _that.$utils.Tools.toastShow(msg);
              } else {
                usersInfo.push(...data);
                return usersInfo;
              }
            }).catch(err => {
              return Promise.reject();
            });
          } else {
            return Promise.resolve(usersInfo);
          }
        }

        function rtnHandler(usersInfo) {
          for (const item of usersInfo) {
            _that.selectList.push({
              userName: item.userLname,
              userSerial: item.userSerial,
            });
          }
          _that.showFlag = false;
          _that.$emit('onSelect', _that.selectList);
        }

        userHandler().then(depHandler).then(rtnHandler).catch(this.$utils.Tools.httpError);
      },
      getOrgList: function (depSerial, depName, flag) {
        if (flag) {
          const dep = {depSerial: depSerial, depName: depName};
          this.pagePath.push(dep);
        } else {
          let _flag = false;
          for (var index in this.pagePath) {
            if (this.pagePath[index].depSerial === depSerial) {
              _flag = true;
              break;
            }
          }
          if (_flag) {
            this.pagePath.splice(+index + 1, this.pagePath.length - index - 1);
          }
        }
        this.$utils.Tools.loadShow();
        this.$api.Org.getOrgList(depSerial).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.depList = data.depList;
            this.userList = data.userList;
            this.initFlag = true;
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.$utils.Tools.loadShow();
      this.getOrgList(this.depSerial, this.depName, true);
    },
    watch: {
      showFlag: function (val) {
        this.$emit('input', val);
        if (val) {
          this.depList = [];
          this.userList = [];
          this.depChecked = [];
          this.userChecked = [];
          this.searchList = [];
          this.userSubList = [];
          this.depSubList = [];
          this.selectList = [];
          this.userInfo = [];
          this.allCheck = false;
          this.userSum = 0;
          this.depSum = 0;
          this.searchValue = '';
          this.searchFlag = false;
          this.detailFlag = false;
          this.pagePath = [];
          this.initFlag = false;

          this.userChecked.push(...this.infoChecked);
          this.userSum = this.userChecked.length;
          this.getOrgList(this.depSerial, this.depName, true);
        }
      },
      value: {
        handler: function (val) {
          this.showFlag = val;
        },
        immediate: true,
      },
      allCheck: function (check) {
        if (check) {
          if (this.depList.length > 0) {
            this.depList.filter((dep) => {
              if (this.depChecked.indexOf(dep.depSerial) === -1) {
                this.depChecked.push(dep.depSerial);
              }
            });
          }

          if (this.userList.length > 0) {
            this.userList.filter((user) => {
              if (this.userChecked.indexOf(user.userSerial) === -1) {
                this.userChecked.push(user.userSerial);
              }
            });
          }
        } else {
          if (this.depList.length > 0) {
            this.depList.filter((dep) => {
              for (let index in this.depChecked) {
                if (this.depChecked[index] === dep.depSerial) {
                  this.depChecked.splice(index, 1);
                }
              }
            });
          }

          if (this.userList.length > 0) {
            this.userList.filter((user) => {
              for (let index in this.userChecked) {
                if (this.userChecked[index] === user.userSerial) {
                  this.userChecked.splice(index, 1);
                }
              }
            });
          }
        }
      },
    },
  };
</script>

<style type="text/scss" lang="scss">
  .cell-title {
    display: flex;
    align-items: center;

    .cell-icon {
      padding-right: 5px;
    }
  }

  .title-remark {
    border: 1px #FF832A solid;
    border-radius: 4px;
    color: #FF832A;
    font-size: 0.10rem;
    margin-left: 0.1rem;
    padding: 2px;
  }

  .title-desc {
    font-size: 0.13rem;
    color: black;
  }

  .org-detail {
    position: relative;
    height: 100%;
    font-size: 0.16rem;

    .org-detail-head {
      width: 100%;
      position: absolute;
      top: 0;
      left: 0;
      z-index: 100;

      .org-title {
        font-size: 0.14rem;
        padding: 0.1rem 0.15rem;
        border-bottom: #ECECEC 1px solid;

        a {
          color: #3399ff;
        }
      }
    }

    .org-detail-body {
      height: 100%;
      overflow: hidden;

      .org-detail-list {
        height: 100%;
        overflow-y: scroll;

        .org-all-check {
          border-bottom: #ECECEC 1px solid;
        }

        .check-item-class {
          display: block;
          border-bottom: #ECECEC 1px solid;
        }

        .check-item-selected {
          .weui-icon-success {
            color: #3399FF;
          }
        }
      }
    }

    .org-detail-bottom {
      display: flex;
      position: absolute;
      z-index: 500;
      bottom: 0;
      width: 100%;
      padding: 0.065rem 0.2rem;
      background-color: #F4F5F9;
      line-height: 0.29rem;

      .checked-user-sum {
        margin: 0 auto;
      }

      .org-bottom-btn-left {
        position: absolute;
        left: 0.2rem;
      }

      .org-bottom-btn-right {
        position: absolute;
        right: 0.2rem;
      }
    }
  }

  .org-pop-title {
    width: 100%;
    font-size: 0.14rem;
    background: #ffffff;
    line-height: 0.5rem;
    padding: 0 0.15rem;
  }

  .org-line {
    height: 0.1rem;
    background: #F4F5F9;
    border-bottom: #ECECEC 1px solid;
  }
</style>
