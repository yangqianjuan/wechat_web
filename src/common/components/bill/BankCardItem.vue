<template>
  <svg aria-hidden="true">
    <use :xlink:href="bankIconId" />
  </svg>
</template>
<script>
export default {
  props: {
    bankId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  computed: {
    bankIconId() {
      return `#icon${this.bankId}`;
    }
  },
  methods: {
    gotoDetail() {
      this.$emit('gotoDetail');
    }
  }
};
</script>
<style lang="scss" scoped>
.bank-logo-warpper {
  height: 100%;
  width: 100%;
}
</style>
