import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import Vue from 'vue';
import { COOKIE_ID } from '@/utils/common/config';

export default {
  methods: {
    async goNext() {
      let applyUnionKey = Vue.prototype.getCookie(COOKIE_ID.applyUnionKey) || sessionStorage.getItem('union_key');
      let nextPath = await queryNextByUnionKeyAndProdId(this.productId, applyUnionKey);
      this.$router.replace({ path: nextPath });
    }
  }
};
