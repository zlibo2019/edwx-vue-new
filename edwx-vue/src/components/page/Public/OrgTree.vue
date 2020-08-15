<template>
  <div class="org-detail">
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
          <span v-for="(item, i) in router" :key="i" v-if="!searchFlag">
            <span v-if="i!==0">></span>
            <span v-if="i===router.length-1">{{item.name}}</span>
            <router-link :to="item.path" v-else>
              {{item.name}}
            </router-link>
          </span>
          <span v-if="searchFlag">
            联系人
          </span>
        </div>
      </div>
      <div class="org-detail-body">
        <group class="org-detail-list" :gutter="0" v-if="searchFlag">
          <div class="org-line" style="border-bottom: none"></div>
          <checker v-model="userChecked" type="checkbox" default-item-class="check-item-class"
                   selected-item-class="check-item-selected" @on-change="onUserCheck">
            <checker-item v-for="(user, i) in searchList" :key="'user' + i" :value="user.userSerial">
              <cell>
                <div slot="title">
                  <i :class="[userCheck(user.userSerial) ? 'weui-icon-success': 'weui-icon-circle']"></i>
                  <span>{{user.userLname}}</span>
                </div>
              </cell>
            </checker-item>
          </checker>
        </group>
        <group class="org-detail-list" :gutter="0" v-if="!searchFlag">
          <div class="org-line" style="border-bottom: none" v-if="max!==1"></div>
          <cell @click.native="allCheck=!allCheck" class="org-all-check" v-if="max!==1">
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
                  <i :class="[depCheck(dep.depSerial) ? 'weui-icon-success': 'weui-icon-circle']" v-if="max!==1"></i>
                  <span>{{dep.depName}}</span>
                  <span>({{dep.userNums}}人)</span>
                </div>
                <div @click.self.stop="onJump(dep)" v-if="!depCheck(dep.depSerial) || max===1"
                     style="color: #3399ff">
                  下级
                </div>
                <div v-else>
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
                <div slot="title">
                  <i :class="[userCheck(user.userSerial) ? 'weui-icon-success': 'weui-icon-circle']" v-if="max!==1"></i>
                  <span>{{user.userLname}}</span>
                </div>
              </cell>
            </checker-item>
          </checker>
        </group>
      </div>
      <div slot="bottom" class="org-detail-bottom" v-if="max!==1">
        <div class="checked-user-sum" @click="onDetail">已选择{{userSum + depSum}}人</div>
        <x-button type="primary" @click.native="onSelect" mini class="org-bottom-btn">确定</x-button>
      </div>
    </view-box>
    <div v-transfer-dom>
      <popup v-model="detailFlag" position="right" width="80%" style="background: #F4F5F9">
        <div class="org-pop-title">联系人</div>
        <group>
          <cell v-for="(dep, i) in depSubList" :key="'dep'+i">
            <div slot="title">
              <span>{{JSON.parse(dep).depName}}</span>
              <span>({{JSON.parse(dep).userNums}}人)</span>
            </div>
            <div @click="delOrg(JSON.parse(dep).depSerial)" style="color: red">移除</div>
          </cell>
          <div class="org-line" style="border-bottom: none"
               v-if="depSubList.length > 0 && selectList.length > 0"></div>
          <cell v-for="(user, i) in userInfo" :key="'user'+i">
            <div slot="title">
              <span>{{user.userLname}}</span>
            </div>
            <div @click="delUser(user.userSerial)" style="color: red">移除</div>
          </cell>
        </group>
      </popup>
    </div>
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
    Popup
  } from "vux";

  export default {
    name: "OrgTree",
    directives: {
      TransferDom
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
      Popup
    },
    beforeRouteEnter(to, from, next) {
      window.vm.$utils.Store.removeItem("router");
      const router = [{path: to.path, name: to.query.depName}];
      window.vm.$utils.Store.setItem("router", JSON.stringify(router));
      next();
    },
    beforeRouteUpdate(to, from, next) {
      let router = JSON.parse(this.$utils.Store.getItem("router"));
      let flag = false;
      for (var index in router) {
        if (router[index].path === to.path) {
          flag = true;
          break;
        }
      }
      if (flag) {
        router.splice(+index + 1, router.length - index - 1);
      } else {
        router.push({path: to.path, name: to.query.depName});
      }
      this.router = router;
      this.$utils.Store.setItem("router", JSON.stringify(router));
      next();
    },
    beforeRouteLeave(to, from, next) {
      this.$utils.Store.removeItem("router");
      next();
    },
    data() {
      return {
        depList: [],
        userList: [],
        depChecked: [],
        userChecked: [],
        router: [],
        searchList: [],
        userSubList: [],
        depSubList: [],
        selectList: [],
        userInfo: [],
        allCheck: false,
        userSum: 0,
        depSum: 0,
        searchValue: '',
        depSerial: '',
        depName: '',
        searchFlag: false,
        detailFlag: false,
        choose: '0',  //选择类型  1：选审批人  2：选抄送人
        copyType: 0, //1:请假 2:出差 3:外出 4:加班 5:调班6:补出勤
        max: 9999
      };
    },
    computed: {
      bodyBottom: function () {
        return this.max !== 1 ? "0.41rem" : "0";
      },
      depCheck: function () {
        return function (obj) {
          let temp = this.depChecked.filter((item) => {
            return item === obj;
          });
          return temp.length > 0;
        }
      },
      userCheck: function () {
        return function (obj) {
          let temp = this.userChecked.filter((item) => {
            return item === obj;
          });
          return temp.length > 0;
        }
      }
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
        this.$router.push({path: '/OrgTree/' + dep.depSerial, query: {depName: dep.depName}});
      },
      onCancel: function () {
        this.searchFlag = false;
      },
      onSubmit: function (value) {
        this.searchFlag = true;
        this.$api.Org.getUserList(value).then(response => {
            this.$vux.loading.hide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.searchList = data;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          })
      },
      onDepCheck: function () {
        if (this.max === 1) {
          return;
        }

        let depTemp = this.depList.filter((dep) => {
          return this.depChecked.indexOf(dep.depSerial) > -1;
        });

        depTemp.filter((item) => {
          let obj = JSON.stringify({
            depSerial: item.depSerial,
            depName: item.depName,
            userNums: item.userNums
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

        if (this.max === 1) {
          this.onSelect();
        }
      },
      userSelect: function () {
        this.userInfo = [];
        if (this.userChecked.length > 0) {
          this.$api.Org.getUserInfo(JSON.stringify(this.userChecked)).then(response => {
              const {code, msg, data} = response;
              if (+code !== this.$code.success) {
                this.$utils.Tools.toastShow(msg);
              } else {
                this.userInfo = data;
              }
            }).catch(err => {
              this.$utils.Tools.httpError();
            })
        }
      },
      onSelect: function () {
        let _that = this;

        function userHandler() {
          let usersInfo = [];
          if (_that.userChecked.length > 0) { //先选择人员
            return _that.$api.Org.getUserInfo(JSON.stringify(_that.userChecked)).then(response => {
                const {code, msg, data} = response;
                if (+code !== _that.$code.success) {
                  _that.$utils.Tools.toastShow(msg);
                } else {
                  usersInfo.push(...data);
                  return usersInfo;
                }
              }).catch(err => {
                return Promise.reject();
              })
          } else {
            return Promise.resolve(usersInfo);
          }
        }

        function depHandler(usersInfo) {
          if (_that.depChecked.length > 0 && _that.max !== 1) { //再选择部门
            return _that.$api.Org.getUserByOrg(JSON.stringify(_that.depChecked)).then(response => {
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
              flag: 1
            });
          }
          let users = JSON.stringify(_that.selectList);
          if (+_that.choose === 1) {   //选择审批人
            _that.$utils.Store.setItem('approver', users);
          } else if (+_that.choose === 2) {   //选择抄送人
            _that.$utils.Store.setItem('customer', users)
          } else if (+_that.choose === 3) {   //选择同行人
            _that.$utils.Store.setItem('henchman', users)
          }
          _that.$router.replace('/' + _that.$utils.Store.getItem('curRouter'));
        }

        userHandler().then(depHandler).then(rtnHandler).catch(this.$utils.Tools.httpError);
      },
      getOrgList: function (depSerial) {
        this.$api.Org.getOrgList(depSerial).then(response => {
            this.$vux.loading.hide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.depList = data.depList;
              this.userList = data.userList;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      init: function () {
        this.$utils.Tools.loadShow();
        this.depSerial = this.$route.params.depSerial;
        this.depName = this.$route.query.depName;
        this.getOrgList(this.depSerial);
      }
    },
    created() {
      this.$utils.Store.removeItem('approver');
      if (this.$route.query.selectUser) {
        this.userChecked = JSON.parse(this.$route.query.selectUser);
      } else {
        this.userChecked = []
      }

      this.choose = this.$route.query.choose;
      this.copyType = this.$route.query.copyType;
      if (this.$route.query.max !== undefined) {
        this.max = this.$route.query.max;
      }
      this.router = JSON.parse(this.$utils.Store.getItem("router"));
      this.userSum = this.userChecked.length;
      // console.log(66666,this.userChecked)
      this.init();
    },
    watch: {
      '$route': function (to, from) {
        this.init();
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
            })
          }
        } else {
          if (this.depList.length > 0) {
            this.depList.filter((dep) => {
              for (let index in this.depChecked) {
                if (this.depChecked[index] === dep.depSerial) {
                  this.depChecked.splice(index, 1);
                }
              }
            })
          }

          if (this.userList.length > 0) {
            this.userList.filter((user) => {
              for (let index in this.userChecked) {
                if (this.userChecked[index] === user.userSerial) {
                  this.userChecked.splice(index, 1);
                }
              }
            })
          }
        }
      }
    }
  };
</script>

<style type="text/scss" lang="scss">
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

      .checked-user-sum {
        line-height: 0.29rem;
      }

      .org-bottom-btn {
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
