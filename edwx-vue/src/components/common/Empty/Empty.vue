<template>
  <div class="empty-wrap" v-if="show===true" @click="emptyClick">
      <svg class="icon" aria-hidden="true">
          <use xlink:href="#icon-zanwushuju"></use>
      </svg>
    <p v-text="tip"></p>
  </div>
</template>

<script>
  export default {
    name: "Empty",
    props: {
      show: {
        type: Boolean,
        default: false
      },
      tip: {
        type: String,
        default: "暂无记录"
      }
    },
    methods: {
      emptyClick() {
        this.$emit('emptyClick');
      }
    }
  };
</script>
<style lang="scss">
  .empty-wrap {
    text-align: center;
    font-size: 0.16rem;
    padding-top: 1rem;

    .icon {
      font-size: 1.5rem;
    }
  }
</style>
