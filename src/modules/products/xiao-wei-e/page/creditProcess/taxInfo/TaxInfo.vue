<template>
  <div v-if="isPageOverLoad">
    <div v-if="taxCollect.normalFlag">
      <div v-if="taxCollect.pageType === 1">
        <div class="from-container" v-if="isPageOverLoad">
          <TaxWeb></TaxWeb>
        </div>
      </div>
      <div v-if="taxCollect.pageType === 2">
        <WfTaxInfo
          product="1035"
          :cropName="formItem.companyName"
          :invoiceCollectionType="taxCollect.invoiceCollectionType"
          :collectionType="taxCollect.collectionType"
          :taxCollectType="taxCollect.taxCollectType"
          :nsrsbh="formItem.acountNum"
          callbackUrl="xwe_tax_wf_res"
        ></WfTaxInfo>
      </div>
    </div>
    <div v-else>
      <van-empty image="error" description="维护中..." />
    </div>
  </div>
</template>
<script>
import { commonMixin, loginMixin } from '@/utils/tax/taxMixin';
import { taxProductConfigHandler } from '@/utils/tax/taxCommon';
import TaxWeb from '@/system/tax/TaxWeb.vue';
export default {
  name: 'XweTaxLogin',
  mixins: [commonMixin, loginMixin],
  components: {
    TaxWeb
  },
  data() {
    return {};
  },

  methods: {
    updateInfo() {
      this.buildParams.productId = '1035';
      this.buildParams.applyUnionKey = sessionStorage.getItem('union_key') || this.getCookie('union_key');
    },

    taxStatusControl() {
      taxProductConfigHandler(
        {
          taxId: this.formItem.acountNum,
          productId: '1035'
        },
        this,
        config => {
          this.taxStatusConfigHandler(config);
        }
      );
    }
  }
};
</script>
<style lang="scss" scoped>
.from-container {
  min-height: 100vh;
  max-width: 100vw;
  overflow-x: hidden;
  background: #ffffff;
}
</style>
