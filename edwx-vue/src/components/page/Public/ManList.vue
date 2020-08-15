<template>
    <div class="man-list">
        <tab>
            <tab-item :selected="active == index" v-for="(item,index) in tabData" :key="index" @on-item-click="onItemClick(index)">{{ item.title }}</tab-item>
        </tab>
        <div class="list-boxs">
            <div class="often" v-if="active == 0">
                <check-icon :value.sync="checkAll">全选</check-icon>
                <checklist :label-position="labelPosition" required :options="commonList" v-model="checklist" @on-change="changeList"></checklist>
            </div>
            <div class="department" v-else>22</div>
        </div>
    </div>
</template>
<script>
    import { Tab, TabItem, Group,CheckIcon,Checklist } from "vux"
    export default {
    	name:"ManList",
        components:{
	        Tab,TabItem,Group,CheckIcon,Checklist
        },
        data(){
    		return {
                tabData:[
                    {
                    	title:'常用',
                    },
                    {
                    	title:'部门',
                    },
                ],
                active:0,
			    checkAll:false,
			    labelPosition:'',
			    commonList:[
                    {

                    },
                ],
			    checklist:[]
            }
        },
        computed:{

        },
        methods:{
	        onItemClick(index){
	        	this.active = index;
            },
	        changeList(){

            }
        },
        created(){

        },
        mounted(){

        },
        destroyed(){

        }
    }
</script>
<style type="text/scss" lang="scss">
.man-list{
    width:100%;
    height:100%;
    display: flex;
    flex-direction: column;
    .vux-tab-wrap{
        flex-basis: 0.5rem;
        .vux-tab-container{
            height:100%!important;
            .vux-tab{
                height:100%;
                .vux-tab-item{
                    font-size: 0.16rem;
                }
            }
        }
    }
    .list-boxs{
        flex:1;
        overflow: hidden;
        .often{
            width:100%;
            height:100%;
            padding:0.1rem;
            overflow-y: scroll;
            .vux-check-icon{
                height:0.4rem;
                display: block;
                i{
                    font-size: 0.2rem;
                    float:left;
                    line-height: 0.4rem;
                }
                span{
                    font-size: 0.15rem;
                    float:left;
                    line-height: 0.4rem;
                }
            }
        }
    }
}
</style>