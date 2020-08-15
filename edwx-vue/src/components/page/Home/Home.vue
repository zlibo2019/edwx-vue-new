<template>
  <div class="home">
    <router-view></router-view>
    <div class="footer">
      <tabbar>
        <tabbar-item v-for="(item, index) in navData" :key="item.iconUrlId"
                     @on-item-click="navClick(item.iconUrlId, index)"
                     :selected="index === selected">
          <img slot="icon" :src="getFunIcon(item.iconId).icon">
          <img slot="icon-active" :src="getFunIcon(item.iconId).iconActive">
          <span slot="label">{{item.menuName}}</span>
        </tabbar-item>
      </tabbar>
    </div>
  </div>
</template>
<script>
  import {Tabbar, TabbarItem} from 'vux';

  export default {
    name: 'Home',
    components: {
      Tabbar,
      TabbarItem,
    },
    data() {
      return {
        navData: [],
        tabData: [       //尾部导航数组
          {
            icon: require('@/assets/home_d.png'),
            iconActive: require('@/assets/home_s.png'),
            iconId: '9001',
          },
          {
            icon: require('@/assets/date_d.png'),
            iconActive: require('@/assets/date_s.png'),
            iconId: '9002',
          },
          {
            icon: require('@/assets/linkman_d.png'),
            iconActive: require('@/assets/linkman_s.png'),
            iconId: '9003',
          },
          {
            icon: require('@/assets/my_d.png'),
            iconActive: require('@/assets/my_s.png'),
            iconId: '9004',
          },
        ],
        selected: this.$utils.Store.getItem('selected') ? +this.$utils.Store.getItem('selected') : 0,   //选中的导航
      };
    },
    computed: {},
    watch: {
      $route: function () {
        this.selected = this.$utils.Store.getItem('selected') ? +this.$utils.Store.getItem('selected') : 0;
      },
    },
    methods: {
      getFunIcon(value) {
        for (let item of this.tabData) {
          if (item.iconId === value) {
            return item;
          }
        }
      },
      getHomeMenu() {
        this.$utils.Tools.loadShow();
        this.$api.Home.getHomeMenu({
          companyId: 0,
          userId: this.$utils.Store.getItem('userSerial'),
          spareCol2: 9,
        }).then(response => {
          const {code, msg, data} = response;
          if (+code !== this.$code.success) {
            this.$utils.Tools.loadHide();
            this.$utils.Tools.toastShow(msg);
          } else {
            this.navData = data;
            this.$utils.Store.setLocalItem('menuHome', JSON.stringify(data));
            this.$utils.Tools.loadHide();
          }
        }).catch(err => {
          this.$utils.Tools.httpError();
        });
      },
      navClick(value, index) {
        if (value === '' || value === null) {
          this.$utils.Tools.toastShow('功能暂未开放');
        } else {
          this.$utils.Store.setItem('selected', index);
          this.$router.push(value);
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
    },
    created() {
      this.navData = JSON.parse(this.$utils.Store.getLocalItem('menuHome'));
      this.getHomeMenu();
    },
    mounted() {
    },
    destroyed() {

    },
  };
</script>
<style type="text/scss" lang="scss">
  .home {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;

    .footer {
      flex-basis: 0.5rem;

      .weui-tabbar {
        background: #fff;

        .weui-tabbar__item {
          color: #999;
          padding: 0;

          .weui-tabbar__icon {
            height: 0.3rem;
            padding-top: 0.03rem;
          }
        }

        .weui-tabbar__item.weui-bar__item_on {
          .weui-tabbar__label {
            color: #529DFE;
          }
        }
      }
    }
  }
</style>
