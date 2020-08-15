<template>
    <div class="select-men">
        <OrgTree :orgId="orgId"></OrgTree>
    </div>
</template>
<script>
    import {

    } from "vux"
    import OrgTree from '@/components/common/OrgTree/OrgTree'
    export default {
    	name:"SelectMen",
        components:{
            OrgTree
        },
        data(){
    		return {
                orgId:this.$utils.Store.getItem("orgId"),
            }
        },
        computed:{

        },
        methods:{

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
.select-men{
    width:100%;
    height:100%;
}
</style>
