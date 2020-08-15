<template>
  <div class="make-trip"><!-- :class="showFlag?'overf':''"-->
    <div style="padding-bottom: 0.9rem;height: 100%;overflow: auto">
      <group class="apply-boxs" label-width="7em" label-margin-right="1em">
        <div id="allmap" style="height:0"></div>
        <x-input title="申请人" v-model="applyMan" text-align="right" placeholder="请输入申请人姓名" readonly></x-input>
        <x-input title="出发地" v-model="inPlace" text-align="right" placeholder="请输入出发地"
                 @on-change="getInPlace"></x-input>
        <x-input title="目的地" v-model="outPlace" text-align="right" placeholder="请输入目的地"
                 @on-change="getOutPlace"></x-input>
        <datetime title="出行日期" v-model="kssj" format="YYYY-MM-DD"
                  placeholder="选择日期" @on-change="changeStartTime"></datetime>
        <datetime title="返回日期" v-model="jssj" format="YYYY-MM-DD"
                  placeholder="选择日期" @on-change="changeEndTime"></datetime>
        <popup-picker title="交通工具" :data="vehicleList" v-model="vehicle" placeholder="请选择交通工具"
                      @on-change="changeVehicle"></popup-picker>
        <x-input class="norequired" title="预借金额（元）" v-model="credit" type="text" text-align="right"
                 placeholder="请输入金额（如20或20.50）" @on-blur="changeCredit"></x-input>
        <popup-picker class="norequired" title="是否住宿" :data="stayList" :columns="1" :show-name="true" v-model="stay"
                      placeholder="请选择是否住宿" @on-change="changeStay"></popup-picker>
        <x-input class="norequired" title="入住天数" v-model="stayDays" type="text" text-align="right"
                 placeholder="请输入入住天数（如3或3.5）" @on-blur="getStayDays"></x-input>
        <x-textarea class="reason" :max="1000" name="description" placeholder="出差目的（最多输入1000字）" v-model="reason"
                    @on-change="getReason"></x-textarea>
        <!--<x-switch class="norequired" title="日程提醒" v-model="remind" @on-change="remindChange"></x-switch>-->
        <!--本期不推送-->
      </group>
      <UploadImage :limitNum="limitNum" :icon="icon" :imgList="imgList" @saveImages="saveImages"
                   @deleteImage="deleteImage" title="附件" style="padding-left: 0.2rem"></UploadImage>
      <div class="select-box with-whom">
        <p><span>同行人员</span></p>
        <div class="man-box">
          <dl v-for="(item,index) in henchman" :key="index">
            <dt>
              <i class="iconfont icon-touxiang"></i>
              <i class="iconfont icon-close" @click="deleteHenchman(index)"></i>
            </dt>
            <dd>{{item.userName}}</dd>
          </dl>
          <x-button mini plain @click.native="chooseHenchman" v-if="henchman.length<=10">+</x-button>
        </div>
      </div>
      <div class="select-box approver">
        <p><span>审批人</span><a v-if="approver.length == 0">没有审批规则或审批人，请手动选择审批人！</a></p>
        <div class="man-box">
          <dl v-for="(man,index) in approver" :key="index">
            <dt>
              <i class="iconfont icon-touxiang"></i>
              <i class="iconfont icon-close" @click="deleteApprover(index)" v-if="$params.approve === '1'"></i>
            </dt>
            <dd>{{man.userName}}</dd>
            <i class="iconfont icon-youjiantou"></i>
          </dl>
          <x-button mini plain @click.native="chooseApprover" v-if="approver.length < 10 && $params.approve === '1'">+
          </x-button>
        </div>
      </div>
      <div class="select-box copy-box" v-if="copyer.length > 0 || $params.copyuser === '1'">
        <p><span>抄送人</span>审批通过后，通知抄送人</p>
        <div class="man-box fixed" v-if="copyer.length > 0">
          <p>固定抄送人：</p>
          <dl v-for="(man,index) in copyer" :key="index">
            <dt>
              <i class="iconfont icon-touxiang"></i>
            </dt>
            <dd>{{man.userName}}</dd>
          </dl>
        </div>
        <div class="man-box custom" v-if="$params.copyuser === '1'">
          <p>自定义抄送人：</p>
          <dl v-for="(man,index) in customer" :key="index">
            <dt>
              <i class="iconfont icon-touxiang"></i>
              <i class="iconfont icon-close" @click="deleteCustomer(index)"></i>
            </dt>
            <dd>{{man.userName}}</dd>
          </dl>
          <x-button mini plain @click.native="chooseCopyer">+</x-button>
        </div>
      </div>
    </div>
    <div class="my-operate">
      <x-button :class="isDisabled?'disabled':''" type="primary" :disabled="isDisabled" @click.native="submitClick">提交
      </x-button>
    </div>
    <OrgTree v-model="showFlag" :selectType="selectType" dep-name="默认公司" dep-serial="10000" :info-checked="infoChecked"
             @onSelect="selectUsers"></OrgTree>
  </div>
</template>

<script>
  import {Group, Cell, XInput, Selector, PopupPicker, Datetime, XTextarea, XSwitch, XButton} from 'vux';
  import UploadImage from '@/components/common/UploadImage/UploadImage';
  import OrgTree from '@/components/common/OrgTree/OrgTree';

  export default {
    name: 'MakeTrip',
    components: {
      Group, Cell, XInput, Selector, PopupPicker, Datetime, XTextarea, OrgTree, XSwitch, XButton, UploadImage,
    },
    beforeRouteLeave(to, from, next) {
      if (this.showFlag) {
        next(false);
        this.showFlag = false;
      } else {
        this.$utils.Store.removeItem('kssj');
        this.$utils.Store.removeItem('jssj');
        this.$utils.Store.removeItem('inPlace');
        this.$utils.Store.removeItem('outPlace');
        this.$utils.Store.removeItem('reason');
        this.$utils.Store.removeItem('vehicle');
        this.$utils.Store.removeItem('credit');
        this.$utils.Store.removeItem('stayDays');
        this.$utils.Store.removeItem('stay');
        next();
      }
    },
    data() {
      return {
        actions: this.$api.Base.dev + '/management/insertPhoto',
        applyMan: this.$utils.Store.getItem('userLname'),       //申请人
        reason: this.$utils.Store.getItem('reason') ? this.$utils.Store.getItem('reason') : '',   //出差目的
        inPlace: '',          //出发地
        outPlace: this.$utils.Store.getItem('outPlace') ? this.$utils.Store.getItem('outPlace') : '',     //目的地
        startDate: '',   //开始日期
        endDate: '',     //截止日期
        kssj: this.$utils.Store.getItem('kssj') ? this.$utils.Store.getItem('kssj') : '',   //开始时间
        jssj: this.$utils.Store.getItem('jssj') ? this.$utils.Store.getItem('jssj') : '',   //结束时间
        credit: '',  //预借金额
        vehicleList: [['飞机', '火车', '高铁', '动车', '客车', '汽车', '轮船', '其他']], //交通工具数组
        vehicle: this.$utils.Store.getItem('vehicle') ? JSON.parse(this.$utils.Store.getItem('vehicle')) : [],     //选择的交通工具
        stayList: [
          {
            name: '是',
            value: '1',
          },
          {
            name: '否',
            value: '0',
          },
        ],
        stay: this.$utils.Store.getItem('stay') ? JSON.parse(this.$utils.Store.getItem('stay')) : [],
        stayDays: '',
        remind: true,      //日程提醒
        approver: this.$utils.Store.getItem('oldVal') ? JSON.parse(this.$utils.Store.getItem('oldVal')) : [],    //审批人
        approverChecked: [], //审批人序号
        copyer: [],  //固定抄送人数组
        customer: [],  //自定义抄送人数组
        henchman: [],  //同行人数组
        copyerChecked: [],  //抄送人序号
        henchmanChecked: [],  //同行人序号
        inputParam: [
          {
            name: 'att_id',
            value: 0,
          }, {
            name: 'base64String',
            value: '',
          }, {
            name: 'typeId',
            value: -1,
          },
        ],
        imgList: [],   //图片列表数组
        limitNum: 5,     //最多上传图片张数
        bh: '00103',    //假类编号
        depSerial: this.$utils.Store.getItem('orgId'),    //企业ID
        depName: localStorage.getItem('orgName'),    //企业名称
        approverString: '', //审批人序号--字符串
        customerString: '', //抄送人序号--字符串
        henchmanString: '', //同行人序号--字符串
        imgPath: [], //图片地址
        imgIndex: 0, //图片数组下标
        choose: this.$utils.Store.getItem('choose') ? this.$utils.Store.getItem('choose') : 0,   //添加人员类型   1：审批人  2：抄送人  3：同行人
        showFlag: false, //是否显示组织架构弹窗
        selectType: 0,   //组织架构选择类型
        infoChecked: [], //
        approverChecked: [], //审批人选中
        customerChecked: [], //自定义抄送人选中
        flag: true,   //可以提交
        icon: 'icon-jiahao', //icon加号
        interval: '',
      };
    },
    computed: {
      isDisabled() {
        if (this.kssj != '' && this.jssj != '' && this.inPlace != '' && this.outPlace != '' && this.reason != '' && this.vehicle.length > 0 && this.approver.length > 0 && this.flag == true) {    /**/
          return false;
        } else {
          return true;
        }
      },
      infoChecked() {
        if (this.selectType == 1 && this.approverChecked.length > 0) {
          return this.approverChecked;
        } else if (this.selectType == 9999 && this.customerChecked.length > 0) {
          return this.customerChecked;
        } else if (this.selectType == 9999 && this.henchmanChecked.length > 0) {
          return this.henchmanChecked;
        }
      },
    },
    methods: {
      /** function 获取服务器时间---今日日期
       *   wzx
       *   2019-01-11
       **/
      getSysDate() {
        this.$utils.Tools.loadShow();
        this.$api.Sys.getSystemDate(this.$params.mode).then(response => {
          // this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.startDate = data.sysDate.substring(0, 10);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 获取出发地
       *   wzx
       *   2019-01-05
       **/
      getInPlace(val) {
        this.inPlace = val;
        this.$utils.Store.setItem('inPlace', val);
      },
      /** function 获取目的地
       *   wzx
       *   2019-01-05
       **/
      getOutPlace(val) {
        this.outPlace = val;
        this.$utils.Store.setItem('outPlace', val);
      },
      /** function 获取出差开始时间
       *   wzx
       *   2019-01-05
       **/
      changeStartTime(val) {
        this.kssj = val;
        this.$utils.Store.setItem('kssj', val);
        this.startDate = val;
        /*if(this.jssj != '' && this.kssj>this.jssj){
            this.$utils.Tools.toastShow("出行日期不能大于返回日期");
            setTimeout(()=>{
                this.kssj = '';
            },2000)
        }*/
      },
      /** function 获取出差结束时间
       *   wzx
       *   2019-01-05
       **/
      changeEndTime(val) {
        this.jssj = val;
        this.$utils.Store.setItem('jssj', val);
        this.endDate = val;
        /*if(this.kssj != '' && this.jssj<this.kssj){
            this.$utils.Tools.toastShow("返回日期不能小于出行日期");
            setTimeout(()=>{
                this.jssj = '';
            },2000)
        }*/
      },
      /** function 获取交通工具
       *   wzx
       *   2019-01-05
       **/
      changeVehicle(val) {
        this.vehicle = val;
        this.$utils.Store.setItem('vehicle', JSON.stringify(val));
        // console.log(7777,this.$utils.Store.getItem('vehicle'))
      },
      /** function 获取是否住宿
       *   wzx
       *   2019-01-05
       **/
      changeStay(val) {
        this.stay = val;
        this.$utils.Store.setItem('stay', JSON.stringify(val));
        // console.log(7777,val)
      },
      getStayDays(val) {
        let reg = /(^[0-9]+$)|(^[0-9]+[\.]{1}[0-9]{0,1}$)/;
        if (reg.test(val)) {
          this.stayDays = val;
          this.$utils.Store.setItem('stayDays', val);
        } else {
          this.$utils.Tools.toastShow('必须为数字格式，且天数小数位最多1位');
        }
      },
      /** function 获取住宿天数
       *   wzx
       *   2019-01-05
       **/
      changeStayDays(e) {
        // this.stayDays = val;
        if (e != '') {
          setTimeout(() => {
            this.stayDays = (e.match(/^\d*(\.?\d{0,1})/g)[0]) || 0;
            // this.$utils.Store.setItem('stayDays',this.stayDays);
          }, 1);
        }
      },
      /** function 获取预借金额
       *   wzx
       *   2019-01-05
       **/
      getCredit(val) {
        // console.log(66,val)
        /*if(val != ''){
            let regPos = /^\d+(\.\d+)?$/; //非负浮点数
            if(regPos.test(val)){
                this.flag = true;
                this.credit = val;
                this.$utils.Store.setItem('credit', val);
            }else{
                this.$utils.Tools.toastShow("格式非法，请重新输入");
                this.flag = false;
            }
        }*/
      },
      /** function 获取预借金额
       *   wzx
       *   2019-01-05
       **/
      changeCredit(val) {
        if (val != '') {
          let reg = /(^[0-9]+$)|(^[0-9]+[\.]{1}[0-9]{0,2}$)/;
          if (reg.test(val)) {
            this.credit = val;
            this.$utils.Store.setItem('credit', val);
          } else {
            this.$utils.Tools.toastShow('必须为数字格式，且金额小数位最多2位');
          }
          /*setTimeout(() => {
              this.credit = (val.match(/^\d{0,5}(\.\d{0,2})?/g)[0])
          }, 0)*/
        }
      },
      /** function 获取出差事由
       *   wzx
       *   2019-01-05
       **/
      getReason(val) {
        this.reason = val;
        this.$utils.Store.setItem('reason', val);
      },
      /** function 是否开启日程提醒
       *   wzx
       *   2019-01-05
       **/
      remindChange(val) {
        this.remind = val;
        console.log(1212, this.remind);
      },
      onChange(val) {
        console.log('val change', val);
      },
      onShow() {
        console.log('on show');
      },
      onHide(type) {
        console.log('on hide', type);
      },
      /** function 获取审批人数组
       *   wzx
       *   2018-12-26
       * */
      selectUsers(val) {
        if (this.selectType == 1) {
          if (this.approver.length > 0) {
            let result = this.approver.some(item => {
              if (item.userSerial == val[0].userSerial) {
                return true;
              }
            });
            if (result) {
              this.$utils.Tools.toastShow('审批人不可重复');
            } else {
              this.approver.push(...val);
            }
          } else {
            this.approver.push(...val);
          }
        } else if (this.selectType == 9999) {
          if (this.customer.length > 0) {
            this.customer = [];
            this.customer.push(...val);
            let hash = {};
            /*es6数组去重*/
            const newArr = this.customer.reduceRight((item, next) => {
              hash[next.userSerial] ? '' : hash[next.userSerial] = true && item.push(next);
              return item;
            }, []);
            this.customer = newArr;
            for (const b of this.customer) {
              this.customerChecked.push(b.userSerial);
            }
          } else {
            this.customer.push(...val);
            for (const b of this.customer) {
              this.customerChecked.push(b.userSerial);
            }
          }
        } else if (this.selectType == 9998) {
          if (this.henchman.length > 0) {
            this.henchman = [];
            this.henchman.push(...val);
            let hash = {};
            /*es6数组去重*/
            const newArr = this.henchman.reduceRight((item, next) => {
              hash[next.userSerial] ? '' : hash[next.userSerial] = true && item.push(next);
              return item;
            }, []);
            this.henchman = newArr;
            for (const b of this.henchman) {
              this.henchmanChecked.push(b.userSerial);
            }
          } else {
            this.henchman.push(...val);
            for (const b of this.henchman) {
              this.henchmanChecked.push(b.userSerial);
            }
          }
        }
      },
      selectApprovalUser() {
        // this.$utils.Tools.loadShow();
        this.$api.Approver.selectApprovalUser({
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          // this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            // this.$utils.Tools.toastShow(msg);
          } else {
            this.approver = [];
            this.approver.push(...data);
            this.$utils.Store.setItem('oldVal', JSON.stringify(data[0]));
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 删除审批人
       *   wzx
       *   2018-12-28
       * */
      deleteApprover(index) {
        this.approver.splice(index, 1);
      },
      /** function 获取固定抄送人数组
       *   wzx
       *   2018-12-27
       **/
      selectCopyUser() {
        this.$api.Copyer.selectCopyUser({
          lx: 1,    //0:请假  1:出差  2:外出  3:加班  4:调班  5:补出勤 6:合同
          userSerial: this.$utils.Store.getItem('userSerial'),
        }).then(response => {
          const {code, msg, data} = response;
          // console.log(666,response)
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.copyer.push(...data);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      /** function 删除自定义抄送人
       *   wzx
       *   2019-01-04
       * */
      deleteCustomer(index) {
        this.customer.splice(index, 1);
      },
      /** function 添加审批人
       *   wzx
       *   2018-12-29
       * */
      chooseApprover() {       //copyType----1:请假 2:出差 3:外出 4:加班 5:调班6:补出勤  choose---1:审批人 2：抄送人  3：同行人
        this.infoChecked = [];
        this.selectType = 1;
        this.showFlag = true;
      },
      /** function 添加抄送人
       *   wzx
       *   2018-12-29
       * */
      chooseCopyer() {       //copyType----1:请假 2:出差 3:外出 4:加班 5:调班6:补出勤  choose---1:审批人 2：抄送人  3：同行人
        this.infoChecked = [];
        this.selectType = 9999;
        this.showFlag = true;
        for (const b of this.customer) {
          this.infoChecked.push(b.userSerial);
        }
      },
      /** function 获取同行人数组
       *   wzx
       *   2019-01-05
       * */
      getHenchman() {
        if (this.$utils.Store.getItem('henchman')) {
          // console.log(6868,this.$utils.Store.getItem('customer'))
          let apprData = JSON.parse(this.$utils.Store.getItem('henchman'));
          this.henchman.push(...apprData);
          for (const i of apprData) {
            this.henchmanChecked.push(i.userSerial);
          }
        }
      },
      /** function 删除同行人
       *   wzx
       *   2019-01-05
       * */
      deleteHenchman(index) {
        this.henchman.splice(index, 1);
      },
      /** function 添加同行人
       *   wzx
       *   2019-01-05
       * */
      chooseHenchman() {       //copyType----1:请假 2:出差 3:外出 4:加班 5:调班6:补出勤  choose---1:审批人 2：抄送人  3：同行人
        this.infoChecked = [];
        this.selectType = 9998;
        this.showFlag = true;
        for (const b of this.henchman) {
          this.infoChecked.push(b.userSerial);
        }
      },
      /** function 提交出差申请
       *   wzx
       *   2019-01-05
       * */
      submitClick() {
        let reg = /(^[0-9]+$)|(^[0-9]+[\.]{1}[0-9]{0,2}$)/;
        let regs = /(^[0-9]+$)|(^[0-9]+[\.]{1}[0-9]{0,1}$)/;
        if (this.kssj > this.jssj) {
          this.$utils.Tools.toastShow('出行日期不能大于返回日期');
        } else if (this.credit && !reg.test(this.credit)) {
          this.$utils.Tools.toastShow('必须为数字格式，且金额小数位最多2位');
        } else if (this.stayDays && !regs.test(this.stayDays)) {
          this.$utils.Tools.toastShow('必须为数字格式，且天数小数位最多1位');
        } else {
          this.approverChecked = [];
          this.imgPath = [];
          for (const i of this.approver) {
            this.approverChecked.push(i.userSerial);
          }
          let myapprover = JSON.stringify(this.approverChecked).replace(/\[|]|"/g, '');
          this.approverString = myapprover;
          let mycopyer = JSON.stringify(this.customerChecked).replace(/\[|]|"/g, '');
          this.customerString = mycopyer;
          let myhenchman = JSON.stringify(this.henchmanChecked).replace(/\[|]|"/g, '');
          this.henchmanString = myhenchman;
          let accommodation = JSON.stringify(this.stay).replace(/\[|]|"/g, '');
          let outVehicle = JSON.stringify(this.vehicle).replace(/\[|]|"/g, '');
          for (var imgs of this.imgList) {
            this.imgPath.push(imgs.serverId);
          }
          // console.log(6666,this.imgPath)
          let imgPath = JSON.stringify(this.imgPath).replace(/\[|]|"/g, '');
          // console.log(333,accommodation)
          this.$utils.Tools.loadShow();
          this.$api.Trip.insertTrip({
            bh: this.bh,
            accommodation: accommodation,
            accommodationDays: this.stayDays,
            businessPurposes: this.reason,
            outMoney: this.credit,
            imgPath: imgPath,
            kssj: this.kssj,
            jssj: this.jssj,
            inPlace: this.inPlace,
            outPlace: this.outPlace,
            outVehicle: outVehicle,
            processId: '',
            qjlx: 1,
            userSerial: this.$utils.Store.getItem('userSerial'),
            xh: '',
            approver: this.approverString,
            copyUser: this.customerString,
            travelPeople: this.henchmanString,
          }).then(response => {
            this.$utils.Tools.loadHide();
            console.log(2222, response);
            const {code, msg, data} = response;
            if (+code !== this.$code.success) {
              this.$utils.Tools.toastShow(msg);
            } else {
              /*let state = encodeURI(data.xh+",1");
              this.$router.replace({name:'MyApplyTrip', params: {state: state}})*/
              this.$utils.Tools.toastShow('提交成功');
              this.$router.go(-1);
            }
          }).catch(err => {
            this.$utils.Tools.httpError();
          });
        }
      },
      /** 函数function 设定当前页面
       *  wzx
       *  2019.01.09
       **/
      pushHistory() {
        var state = {
          title: 'title',
          url: '',
        };
        window.history.pushState(state, state.title, state.url);
      },
      setDtConfig: function () {
        let localUrl = window.location.href.split('#')[0];
        this.$api.DingTalk.getDtConfig(localUrl).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.toastShow(msg);
          } else {
            this.$utils.DingTalk.getConfig(data);
            setTimeout(() => {
              this.onDtPosition();
            }, 500);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      onDtPosition: function () {
        this.$utils.Tools.loadShow();
        let that = this;
        that.$utils.DingTalk.dtGetLocationCity('allmap', 14, false, resp => {
          this.$utils.Tools.loadHide();
          if (resp.flag === true) {
            that.inPlace = resp.city;
          } else {
            that.$utils.Tools.toastShow(i18n.t('location.failed'));
          }
        });
      },
      onPosition() {
        this.$utils.Tools.loadShow();
        let localUrl = window.location.href.split('#')[0];
        let that = this;
        this.$api.Sys.getConfig(localUrl, this.$params.mode).then(response => {
            const {code, msg, data} = response;
            if (+code !== that.$code.success) {
              that.$utils.Tools.toastShow(msg);
            } else {
              // that.$utils.WeiXin.wxConfig(data); 上传图片功能中已调用微信接口，此处可不调用
              that.$utils.Tools.loadShow('正在定位');
              that.$utils.WeiXin.wxGetLocationCity('allmap', 14, false, resp => {
                if (resp.flag === true) {
                  that.inPlace = resp.city;
                } else {
                  that.$utils.Tools.toastShow(i18n.t('location.failed'));
                }
                that.$utils.Tools.loadHide();
              });
            }
          },
        ).catch(err => {
          that.$utils.Tools.httpError();
        });
      },
      getSysApproveUser() {
        this.approver = [];
        this.$api.DepUser.selectListByEntity({
          userSerial: this.$utils.Store.getItem('userSerial'),
          lx: 1,
        }).then(response => {
          this.$utils.Tools.loadHide();
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            // this.$utils.Tools.toastShow(msg);
          } else {
            this.approver.push(...data);
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
    },
    created() {
      this.$utils.Tools.loadShow();
      this.$utils.Store.removeItem('oldVal');
      this.getSysDate();
      if (this.$params.approve === '1') {
        this.selectApprovalUser();
      } else {
        this.getSysApproveUser();
      }
      this.selectCopyUser();
    },
    mounted() {
      this.$utils.Tools.getEnv(res => {
        if (res === 0 || res === 1) {
          this.onPosition();
          this.interval = setInterval(() => {
            this.onPosition();
          }, 60000);
        } else {
          this.setDtConfig();
          this.interval = setInterval(() => {
            // this.setConfig();
            this.onDtPosition();
          }, 60000);
        }
      });

      // this.pushHistory();
      // window.onpopstate = () => {
      //     this.$router.push('/Application')  //输入要返回的上一级路由地址
      // }
    },
    destroyed() {
      this.$utils.Store.removeItem('oldVal');
      clearInterval(this.interval);
      this.$utils.Tools.loadHide();
    },
  };
</script>

<style type="text/scss" lang="scss">
  .make-trip {
    width: 100%;
    height: 100%;
    /*min-height:100%;*/
    &.overf {
      overflow: hidden;
    }

    .apply-boxs {
      width: 100%;
      height: auto;

      .weui-cells {
        margin: 0;

        .weui-cell {
          height: 0.5rem;
          padding-left: 0.3rem;
          position: relative;

          &:after {
            width: 0.2rem;
            height: 0.5rem;
            content: "*";
            position: absolute;
            top: 0.15rem;
            left: 0.15rem;
            font-size: 0.2rem;
            color: red;
            border: none;
            transform: scaleY(1);
          }

          .vux-cell-primary {
            text-align: right;

            .vux-x-switch {
              padding: 0;

              .weui-cell__bd {
                .weui-label {
                  float: right;
                }
              }
            }
          }

          &.reason {
            height: auto;
            min-height: 1rem;
            padding: 0.1rem 0.2rem 0.1rem 0.3rem;
            overflow-y: scroll;

            &:after {
              top: 0.1rem;
            }

            .weui-cell__bd {
              height: 0.6rem;

              textarea {
                height: 0.6rem;
                line-height: 0.2rem;
                /*font-size: 0.13rem;*/
              }
            }
          }
        }

        .norequired {
          &:after {
            content: "";
          }

          .weui-cell {
            &:after {
              content: "";
            }
          }
        }

        .vux-datetime {
          > div {
            p {
              color: #999;
            }
          }

          .vux-cell-primary {
            .vux-cell-value {
              color: #333;
            }
          }
        }
      }
    }

    .upload-boxs {
      width: 100%;
      height: 1.2rem;
      padding: 0.1rem;
      background: #fff;
      border-top: 0.1rem solid #F4F5F9;

      p {
        font-size: 0.13rem;
        line-height: 0.3rem;
        padding-left: 0.1rem;
      }

      .upload-box {
        height: auto;

        input, img {
          float: left;
        }

        .upload-warp-img-div {
          width: 20%;
        }

        .upload-dd {
          width: 20% !important;
          float: left;
        }
      }
    }

    .select-box {
      width: 100%;
      height: auto;
      padding: 0.1rem 0.2rem 0.02rem 0.3rem;
      border-top: 10px solid #F4F5F9;
      background: #fff;
      position: relative;

      &:before {
        width: 0.2rem;
        height: 0.4rem;
        content: "*";
        position: absolute;
        top: 0.1rem;
        left: 0.15rem;
        font-size: 0.2rem;
        color: red;
        border: none;
        transform: scaleY(1);
      }

      &.approver {
        > p {
          a {
            color: red;
          }
        }

        .man-box {
          dl {
            margin-right: 0.2rem;
            position: relative;

            i.icon-youjiantou {
              font-size: 0.15rem;
              position: absolute;
              top: 0.2rem;
              margin: auto;
              right: -0.2rem;
              color: #D2D5DD;
            }

            &:last-of-type {
              i.icon-youjiantou {
                display: none;
              }
            }
          }
        }
      }

      &.with-whom, &.copy-box {
        &:before {
          content: "";
        }
      }

      &.copy-box {
      }

      > p {
        font-size: 0.12rem;
        line-height: 0.2rem;
        color: #A7A9A8;

        span {
          font-size: 0.14rem;
          margin-right: 0.1rem;
          color: #666;
        }
      }

      .man-box {
        width: 100%;
        height: auto;
        min-height: 0.6rem;
        overflow: hidden;
        padding: 0.05rem 0;

        p {
          font-size: 0.13rem;
          line-height: 0.3rem;
        }

        dl {
          width: 0.6rem;
          height: 0.65rem;
          float: left;
          text-align: center;
          margin-right: 0.05rem;
          margin-bottom: 0.06rem;

          dt {
            position: relative;

            i {
              font-size: 0.4rem;
              display: block;
              color: #ccc;

              &.icon-close {
                position: absolute;
                top: -0.02rem;
                right: 0.05rem;
                font-size: 0.18rem;
                color: red;
              }
            }
          }

          dd {
            height: 0.2rem;
            font-size: 0.12rem;
            line-height: 0.2rem;
            overflow: hidden;
          }
        }

        .weui-btn_mini {
          width: 0.4rem;
          height: 0.4rem;
          padding: 0;
          background: #3399ff;
          text-align: center;
          line-height: 0.4rem;
          font-size: 0.3rem;
          color: #fff;
          border-radius: 50%;
          border: none;
          float: left;
          box-shadow: 0 2px 8px 2px rgba(51, 153, 255, .3);
        }
      }
    }

    .my-operate {
      width: 100%;
      height: 0.86rem;
      padding: 0.2rem 0;
      background: #fff;
      position: fixed;
      bottom: 0;
      left: 0;
      z-index: 30;
      border-top: 1px solid #e5e5e5;

      .weui-btn {
        width: 80%;
        height: 0.46rem;
        font-size: 0.18rem;

        &.disabled {
          background: #A2A2A2;
        }
      }
    }
  }
</style>
