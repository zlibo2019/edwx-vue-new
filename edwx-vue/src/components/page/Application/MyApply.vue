<template>
    <div class="my-apply">
        <div class="tab-box">
            <tab>
                <tab-item :selected="active == index" v-for="(item, index) in tabList"
                          @on-item-click="onItemClick(index)" :key="index">{{item.title}}
                </tab-item>
            </tab>
        </div>
        <div class="info-list">
            <Scroll :pullup-padding-bottom="0" :pullUpLoad="pullUpLoad" @pullingUp="onPullingUp"
                    :pullDownRefresh="pullDownRefresh"
                    @pullingDown="onPullingDown" :empty-show="emptyShow" ref="scroll">
                <group class="spend-detail-list" gutter="0">
                    <cell v-for="(record, i) in list" :key="i" @click.native="cellClick(record.xh,record.type)">
                        <div class="info-box" slot="inline-desc">
                            <div class="info-pic">
                                <i class="iconfont icon-my"></i>
                            </div>
                            <div class="info-detail">
                                <i class="iconfont icon-shenhezhong check" v-if="record.lx == 0 || record.lx == 1"></i>
                                <i class="iconfont icon-tongguo agree" v-if="record.lx == 2"></i>
                                <i class="iconfont icon-bohui refuse" v-if="record.lx == 3"></i>
                                <i class="iconfont icon-yichexiao repeal" v-if="record.lx == 4"></i>
                                <dt>
                                    <span><a>{{ record.name }}</a>的申请</span>
                                    <span>{{ record.qjsj }}</span>
                                </dt>
                                <dd>
                                    <span>申请类型</span>
                                    <b>{{ record.qjlx }}</b>
                                </dd>
                                <dd v-if="record.kssj">
                                    <span v-if="record.bh == '00203'">上班时间</span>
                                    <span v-else>开始时间</span>
                                    <b>{{ record.kssj }}</b>
                                </dd>
                                <dd v-if="record.jssj">
                                    <span v-if="record.bh == '00203'">下班时间</span>
                                    <span v-else>结束时间</span>
                                    <b>{{ record.jssj }}</b>
                                </dd>
                                <dd v-if="record.rq">
                                    <span>{{record.qjlx}}时间</span>
                                    <b>{{ record.rq }}</b>
                                </dd>
                                <dd>
                                    <span>审批状态</span>
                                    <a class="wait" v-if="record.lx == 0 || record.lx == 1">待审批</a>
                                    <a class="agree" v-else-if="record.lx == 2">已通过</a>
                                    <a class="refuse" v-else-if="record.lx == 3">已驳回</a>
                                    <a class="repeal" v-else-if="record.lx == 4">已撤销</a>
                                </dd>
                            </div>
                        </div>
                    </cell>
                </group>
            </Scroll>
        </div>
    </div>
</template>
<script>
    import {
        Tab, TabItem, Cell, Group,
    } from "vux"
    import Scroll from '@/components/common/Scroll/Scroll';

    export default {
        name: "MyApply",
        components: {
            Tab, TabItem, Cell, Group, Scroll
        },
        data() {
            return {
                tabList: [
                    {
                        title: '待审核',
                        value: 1,
                    },
                    {
                        title: '已通过',
                        value: 2,
                    },
                    {
                        title: '未通过',
                        value: 3,
                    },
                    {
                        title: '已撤销',
                        value: 4,
                    },
                ],
                active: this.$utils.Store.getItem('applyItem')?this.$utils.Store.getItem('applyItem'):0,
                list: [      //type--0:事假   state--0:待审批
                    {
                        proposer: '上岛咖啡',
                        sj: '2018-06-28 09:18',
                        type: 0,
                        startTime: '2018-06-28 09:18',
                        endTime: '2018-06-28 09:18',
                        state: 0
                    },
                    {
                        proposer: '上岛咖啡',
                        sj: '2018-06-28 09:18',
                        type: 0,
                        changeTime: '2018-06-28',
                        state: 0
                    },
                ],
                list: [],    //申请记录数组
                curPage: 1,      //当前页
                totalPage:0,    //总页数
                pageNum: 20,    //每页条数
                lx:this.$utils.Store.getItem('applyLx')?this.$utils.Store.getItem('applyLx'):'0,1',          //类型，默认为待审核
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
            onPullingDown: function () {
                if (this.isPullDown) return;
                this.isPullDown = true; // 下拉刷新
                this.list = [];
                this.curPage = 1;
                this.getMyApplication();
            },
            onPullingUp: function () {
                if (this.isPullUp) return;
                this.isPullUp = true;
                this.curPage++;
                if (this.curPage > this.totalPage) {
                    this.updateScroll();
                    return;
                }
                this.getMyApplication();
            },
            // 刷新 Scroll 状态
            updateScroll: function (flag) {
                this.isPullDown = false;
                this.isPullUp = false;
                this.$refs.scroll.forceUpdate(flag);
            },
            getMyApplication() {
                this.emptyShow = false;
                this.$utils.Tools.loadShow();
                this.$api.Application.getMyApplication({
                    pageIndex: this.curPage,
                    pageSize: this.pageNum,
                    search: {
                        lx: this.lx,
                        userSerial: this.$utils.Store.getItem('userSerial'),
                    }
                }).then(response => {
                        this.$utils.Tools.loadHide();
                        // console.log(2222, response)
                        const {code, msg, data} = response;
                        if (+code !== this.$code.success) {
                            if (+code === 605) {
                                if (this.list.length === 0) {
                                    this.emptyShow = true;
                                }
                            }
                            this.updateScroll(false);
                        } else {
                            this.list.push(...data.records);
                            this.totalPage = data.totalPage;
                            // console.log(666, this.list)
                            if (this.list.length === 0) {
                                this.emptyShow = true;
                            }
                            this.updateScroll();
                        }
                    }).catch(err => {
                        this.$utils.Tools.httpError();
                    });
            },
            onItemClick(index) {
                this.active = index;
                this.$utils.Store.setItem('applyItem',this.active)
                if (index == 0) {
                    this.lx = '0,1';
                    this.curPage = 1;
                    this.list = [];
                    this.$utils.Store.setItem('applyLx',this.lx)
                    this.getMyApplication();
                } else if (index == 1) {
                    this.lx = '2';
                    this.curPage = 1;
                    this.list = [];
                    this.$utils.Store.setItem('applyLx',this.lx)
                    this.getMyApplication();
                } else if (index == 2) {
                    this.lx = '3';
                    this.curPage = 1;
                    this.list = [];
                    this.$utils.Store.setItem('applyLx',this.lx)
                    this.getMyApplication();
                } else {
                    this.lx = '4';
                    this.curPage = 1;
                    this.list = [];
                    this.$utils.Store.setItem('applyLx',this.lx)
                    this.getMyApplication();
                }
            },
            cellClick(xh, type) {        //type:假类   0 请假；1 出差；2 外出；3 加班；4 调班；5 补出勤; 6 合同
                let state = encodeURI(xh+",1");
                // console.log(888)
                // let state = encodeURI(xh)+","+encodeURI("1");
                switch(type){           //genre：类型  1：申请的  2：审批的  3：抄送的
                    case 0:
                        this.$router.push({name: 'LeaveDetail', params: {state: state}});
                        break;
                    case 1:
                        this.$router.push({name: 'MyApplyTrip', params: {state: state}});
                        break;
                    case 2:
                        this.$router.push({name: 'GoOutDetail', params: {state: state}});
                        break;
                    case 3:
                        this.$router.push({name: 'OverTimeDetail', params: {state: state}});
                        break;
                    case 4:
                        this.$router.push({name: 'ChangeShiftDetail', params: {state: state}});
                        break;
                    case 5:
                        this.$router.push({name: 'RepairAttendanceDetail', params: {state: state}});
                        break;
                    case 6:
                        this.$router.push({name: 'ContractDetail', params: {state: state}});
                        break;
                }
            },
        },
        created() {
            this.getMyApplication();
        },
        mounted() {

        },
        destroyed() {

        }
    }
</script>
<style type="text/scss" lang="scss">
    .my-apply {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        .tab-box {
            flex-basis: 0.5rem;
            padding:0;
            .vux-tab-wrap {
                width: 100%;
                height: 0.45rem;
                overflow: hidden;
                .vux-tab-container {
                    height: 0.45rem !important;
                    .vux-tab {
                        height: 0.45rem;
                        line-height: 0.45rem;
                        .vux-tab-item {
                            line-height: 0.45rem;
                            background: none;

                        }
                        .vux-tab-selected {
                            /*border-bottom: none;*/
                        }
                        .vux-tab-ink-bar {
                            /*display: none!important;*/
                        }
                    }
                }
            }
        }
        .info-list {
            flex: 1;
            overflow-y: scroll;
            > div {
                .scroll-wrapper {
                    .scroll-content {
                        .scroll-slot {
                            .spend-detail-list {
                                overflow-y: scroll;
                                .weui-cells {
                                    .weui-cell {
                                        height: auto;
                                        .vux-cell-primary {
                                            > p {
                                                font-size: 0.14rem;
                                                line-height: 0.2rem;
                                                span:last-of-type {
                                                    float: right;
                                                }
                                            }
                                            .vux-label-desc {
                                                .info-box {
                                                    width: 100%;
                                                    height: auto;
                                                    display: flex;
                                                    flex-direction: row;
                                                    .info-pic {
                                                        flex-basis: 0.4rem;
                                                        i {
                                                            font-size: 0.4rem;
                                                            color:#ccc;
                                                        }
                                                    }
                                                    .info-detail {
                                                        flex: 1;
                                                        margin-left: 0.1rem;
                                                        padding: 0.05rem 0;
                                                        position: relative;
                                                        i {
                                                            position: absolute;
                                                            top: -0.04rem;
                                                            right: 0;
                                                            font-size: 1rem;
                                                            &.check {
                                                                color: #3399FF;
                                                            }
                                                            &.agree {
                                                                color: #00CC66;
                                                            }
                                                            &.refuse {
                                                                color: #FF3333;
                                                            }
                                                            &.repeal {
                                                                color: #CCCCCC;
                                                            }
                                                        }
                                                        dt {
                                                            line-height: 0.35rem;
                                                            font-size: 0.13rem;
                                                            color: #888;
                                                            span {
                                                                a {
                                                                    color: #333;
                                                                    font-size: 0.16rem;
                                                                    margin-right: 0.1rem;
                                                                }
                                                                &:first-of-type {
                                                                    font-size: 0.14rem;
                                                                }
                                                                &:last-of-type {
                                                                    font-size: 0.12rem;
                                                                    float: right;
                                                                    color: #c8c8c8;
                                                                }
                                                            }
                                                        }
                                                        dd {
                                                            line-height: 0.25rem;
                                                            font-size: 0.13rem;
                                                            span {
                                                                color: #888;
                                                                margin-right: 0.1rem;
                                                            }
                                                            b {
                                                                font-weight: normal;
                                                                color: #333;
                                                            }
                                                            a.wait {
                                                                color: #3399FF;
                                                            }
                                                            a.agree {
                                                                color: #00CC66;
                                                            }
                                                            a.refuse {
                                                                color: #FF3333;
                                                            }
                                                            a.repeal {
                                                                color: #CCCCCC;
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
                    }
                }
            }
        }
    }
</style>
