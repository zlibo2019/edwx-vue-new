<template>
  <div class="all-programs">
    <div class="my-box">
      <div class="my-header">
        <span>我的应用</span>
        <span @click="myEdit" v-if="showEdit">编辑</span>
        <span @click="mySave" v-else>保存</span>
      </div>
      <div :class="['my-programs', {'body-scroll':showFlag}]">
        <draggable class="programs-box" v-model="myMenu" :options="options" @choose="choose">
          <transition-group>
          <div class="my-program" v-for="(item, i) in myMenu" :key="i" v-if="item.spareCol1==='1'" @click="myMenuClick(item.iconUrlId)">
            <div class="icon-box" :style="{'background':item.spareCol3}">
              <i :class="item.iconId"></i>
            </div>
            <span>{{item.menuName}}</span>
            <div slot="icon" class="point" @click="deleteMenu(item,i)" v-if="showFlag">
              <i class="iconfont icon-jujue"></i>
            </div>
          </div>
          </transition-group>
        </draggable>
      </div>
    </div>
    <div class="all-box">
      <p>全部应用</p>
      <div class="all-menu">
        <grid :show-lr-borders="false" :show-vertical-dividers="false" :cols="4">
          <grid-item v-for="(menu,index) in allMenu" :key="index" @click.native="allMenuClick(menu.iconUrlId)">
            <div class="weui-grid__icon" :style="{'background':menu.spareCol3}">
              <i :class="menu.iconId"></i>
            </div>
            <span>{{menu.menuName}}</span>
            <div class="point" @click="operateMenu(menu,index)" v-if="showFlag">
              <i :class="['iconfont',menu.sign?'icon-tianjia':'icon-jujue']"></i>
            </div>
          </grid-item>
        </grid>
      </div>
    </div>
    <div v-transfer-dom>
      <confirm v-model="showToast"
               title="操作提示"
               @on-cancel="onCancel"
               @on-confirm="onConfirm"
               @on-show="onShow"
               @on-hide="onHide">
        <p style="text-align:center;">确认要放弃编辑吗？</p>
      </confirm>
    </div>
  </div>
</template>
<script>
  import {
    XButton, XInput, Grid, GridItem,Confirm,TransferDomDirective as TransferDom
  } from "vux"
  import Draggable from 'vuedraggable';
  export default {
    name: "AllPrograms",
    directives: {
      TransferDom
    },
    components: {
      XButton, XInput, Grid, GridItem,Draggable,Confirm
    },
    beforeRouteLeave: function(to, from , next){
      if(this.showFlag){
        next(false)
        this.showToast = true;
      }else{
        next();
      }
    },
    data() {
      return {
        myMenu:[],
        allMenu:[],
        options: {
          // delay: 1000,
          disabled: true,
          animation: 150,
          scroll: true
        },
        showEdit:true,  //是否可编辑
        showFlag: false,
        menuIds:'',
        showToast:false
      }
    },
    watch: {

    },
    computed: {},
    methods: {
      /**
       * @function点击编辑按钮
       *      wzx
       *   2019.03.16
       **/
      myEdit(){
        this.showEdit = false;
        this.showFlag = true;
        this.options.disabled = false;
      },
      /**
       * @function点击保存按钮--保存已编辑的应用
       *      wzx
       *   2019.03.16
       **/
      mySave(){
        let menuIds='';
        for(let item of this.myMenu){
          menuIds += item.menuId+",";
        }
        this.menuIds = menuIds.substring(0,menuIds.length-1)
        // console.log(22,this.menuIds)
        this.$utils.Tools.loadShow();
        this.$api.Home.saveMyMenu({
          menuIds:this.menuIds,
          userId:this.$utils.Store.getItem("userSerial"),
          companyId:'0'
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.$utils.Tools.toastShow(msg);
              this.showEdit = true;
              this.showFlag = false;
              this.options.disabled = true;
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        // console.log(33,this.myMenu)
      },
      /**
       * @function点击所有应用中的某个应用添加/删除到我的应用里
       *      wzx
       *   2019.03.16
       **/
      operateMenu(obj,index){
        // console.log(66,obj)
        if(obj.sign){
          if(this.myMenu.length<11){
            this.myMenu.push(obj);
            for(var i=0;i<this.allMenu.length;i++){
              if(obj.menuId == this.allMenu[i].menuId){
                this.$set(this.allMenu[i],'sign',0)
              }
            }
          }else{
            this.$utils.Tools.toastShow("首页最多添加11个应用")
          }
        }else{
          this.$set(this.allMenu[index],'sign',1)
          for(var j=0;j<this.myMenu.length;j++){
            if(obj.menuId == this.myMenu[j].menuId){
              this.myMenu.splice(j, 1);
            }
          }
        }
      },
      /**
       * @function删除我的应用
       *      wzx
       *   2019.03.16
       **/
      deleteMenu(obj,index){
        if(this.myMenu.length>1){
          this.myMenu.splice(index, 1);
        }else{
          this.$utils.Tools.toastShow("首页最少要保留1个应用")
        }
        // console.log(88,this.myMenu.length)
        for(var i=0;i<this.allMenu.length;i++){
          if(obj.menuId == this.allMenu[i].menuId){
            this.$set(this.allMenu[i],'sign',1)
          }
        }
      },
      /**
       * @function获取我的应用
       *      wzx
       *   2019.03.16
       **/
      getMyMenu() {
        this.$utils.Tools.loadShow();
        this.$api.Home.getHomeMenu({
          companyId: 0,
          userId: this.$utils.Store.getItem("userSerial"),
          spareCol1: 1,
          spareCol2: 0,
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.myMenu = data;
              console.log(33,data,this.myMenu)
              this.myMenu.forEach((item,index) => {
                this.$set(this.myMenu[index],'sign',0);
              })
              this.$utils.Tools.loadHide();
              this.getAllMenu();
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      /**
       * @function获取所有应用
       *      wzx
       *   2019.03.16
       **/
      getAllMenu() {
        this.$utils.Tools.loadShow();
        this.$api.Home.getAllMenu({
          companyId: 0,
          useFlag:1,
          userSerial:this.$utils.Store.getItem("userSerial"),
          spareCol1: 1,
          spareCol2: 0,
          userId: this.$utils.Store.getItem("userSerial")
        }).then(response => {
            this.$utils.Tools.loadHide();
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              this.allMenu = data;
              this.allMenu.forEach((item,index) => {
                this.$set(this.allMenu[index],'sign',1);
              })
              if(this.myMenu.length>0 && this.allMenu.length>0){
                for(var i=0;i<this.allMenu.length;i++){
                  for(var j=0;j<this.myMenu.length;j++){
                    if(this.allMenu[i].menuId == this.myMenu[j].menuId){
                      this.$set(this.allMenu[i],'sign',0);
                    }
                  }
                }
              }
              this.$utils.Tools.loadHide();
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
      },
      /**
       * @function放弃编辑的应用
       *      wzx
       *   2019.03.16
       **/
      onConfirm(){
        this.showEdit = true;
        this.showFlag = false;
        this.getMyMenu();
      },
      onCancel(){

      },
      onShow(){

      },
      onHide(){

      },
      choose(evt) {
        // const ITEM_HEIGHT = 153;
        // console.log(33,evt)
        const ITEM_HEIGHT = evt.item.offsetHeight;
        let container = evt.path[1];
        let index = evt.oldIndex;
        if (index * ITEM_HEIGHT < container.scrollTop) {
          container.scrollTo({
            top: index * ITEM_HEIGHT
          });
        }
        else if ((index + 1) * ITEM_HEIGHT > container.scrollTop + container.offsetHeight) {
          container.scrollTo({
            top: (index + 1) * ITEM_HEIGHT - container.offsetHeight
          });
        }
      },
      /**
       * @function点击我的应用中某项
       *      wzx
       *   2019.03.27
       **/
      myMenuClick(value){
        if(!this.showFlag){
          this.$router.push(value);
        }

      },
      /**
       * @function点击所有应用中某项
       *      wzx
       *   2019.03.27
       **/
      allMenuClick(value){
        if(!this.showFlag){
          this.$router.push(value);
        }
      }
    },
    created(){
      this.getMyMenu();
      // this.getAllMenu();
    },
    mounted() {

    }
  }
</script>
<style type="text/scss" lang="scss">
  .all-programs {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    .my-box{
      /*flex-basis: 2.7rem;*/

      padding:0 0.1rem;
      border-bottom: 10px solid #F3F3F3;
      .my-header{
        height:0.3rem;
        display: block;
        line-height: 0.3rem;
        span{
          font-size: 0.13rem;
          &:first-child{
            float:left;
          }
          &:last-child{
            float:right;
            color:#32B3F1;
          }
        }
      }
      .my-programs{
        width:100%;
        height:auto;
        padding:0.05rem 0;
        .programs-box{
          width:100%;
          height:100%;
          .my-program{
            width:21%;
            height:0.7rem;
            float:left;
            margin:0.06rem 2%;
            padding:0.05rem 1%;
            position: relative;
            .icon-box{
              width:0.35rem;
              height:0.35rem;
              margin:0 auto;
              border-radius: 50%;
              position: relative;
              i{
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                margin: auto;
                font-size: 0.23rem;
                line-height: 0.35rem;
                text-align: center;
                color:#fff;
              }
            }
            span{
              font-size: 0.15rem;
              display: block;
              height:0.3rem;
              line-height: 0.3rem;
              color:#666666;
              text-align: center;
            }
            .point {
              width: 0.12rem;
              height: 0.12rem;
              display: block;
              position: absolute;
              top: 0;
              right: 0;
              i.icon-jujue {
                width: 100%;
                height: 100%;
                color: #FF0000;
                font-size: 0.15rem;
                &:before {
                  width: 100%;
                  height: 100%;
                  position: absolute;
                }
              }
            }
          }
        }
      }
    }
    .all-box{
      flex:1;
      display: flex;
      flex-direction: column;
      padding:0 0.1rem;
      >p{
        background:#fff;
        flex-basis: 0.3rem;
        line-height: 0.3rem;
        font-size: 0.13rem;
      }
      .all-menu{
        flex:1;
        overflow-y: scroll;
        .weui-grids {
          height:100%;
          overflow-y: scroll;
          /*display: grid;
          grid-template-columns: auto auto auto;
          grid-template-rows: auto auto auto;*/
          &:before {
            border-top: none;
          }
          .weui-grid {
            width: 25%;
            padding:0.05rem;
            margin:0.05rem 0;
            position: relative;
            .weui-grid__icon {
              width: 0.35rem;
              height: 0.35rem;
              border-radius: 50%;
              position: relative;
              text-align: center;
              >i {
                width: 0.23rem;
                height: 0.23rem;
                position: absolute;
                top: 0;
                bottom: 0;
                left: 0;
                right: 0;
                margin: auto;
                font-size: 0.23rem;
                color: #fff;
              }
            }
            .point {
              width: 0.12rem;
              height: 0.12rem;
              display: block;
              position: absolute;
              top: 0;
              right: 0.1rem;
              i.icon-tianjia {
                width: 100%;
                height: 100%;
                color: #1B8EDC;
                font-size: 0.13rem;
                &:before {
                  width: 100%;
                  height: 100%;
                  position: absolute;
                }
              }
              i.icon-jujue {
                width: 100%;
                height: 100%;
                color: #FF0000;
                font-size: 0.15rem;
                &:before {
                  width: 100%;
                  height: 100%;
                  position: absolute;
                }
              }
            }
            span{
              font-size: 0.15rem;
              display: block;
              height:0.3rem;
              line-height: 0.3rem;
              color:#666666;
              text-align: center;
            }
            &:after {
              border-bottom: none;
            }

            .weui-grid__icon {
              background: #BBB;
            }
          }
        }
      }
    }
  }
</style>
