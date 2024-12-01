import { infoRegister, infoGet } from '@/utils/common/common';
import productConfig from '@/config/product/product';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
export default {
  methods: {
    async gotoDetailSanXian(apply) {
      if (apply?.applyStatus === 'APPLYING') {
        let getInfo = infoGet(productConfig.productId['myd']);
        const saveObj = { referrer: apply.saleManId, productId: apply.productId, entryType: '0002' };
        infoRegister(productConfig.productId['myd'], { ...getInfo, ...saveObj });
        // let nextPath = await queryNextByUnionKeyAndProdId(apply.productId);
        this.$router.replace({ path: '/prod_myd', query: { referrer: apply.saleManId, productId: apply.productId } });
      }
    }
  }
};
