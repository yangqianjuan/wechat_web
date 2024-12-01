<template>
  <div class="myd-replenish-wrappper">
    <div class="remind">请上传本人真实有效信息</div>
    <div class="upalod-warpper">
      <img-upload title="上传房产信息" v-model="housePropertyImgList"></img-upload>
    </div>
    <div class="upalod-warpper">
      <img-upload title="上传车辆信息" v-model="carPropertyImgList"></img-upload>
    </div>
    <div class="upalod-warpper">
      <img-upload title="上传场地经营信息" v-model="securityImgList"></img-upload>
    </div>
    <div class="upalod-warpper">
      <img-upload title="上传银行收入流水信息" v-model="bankFlowImgList"></img-upload>
    </div>
    <div class="upalod-warpper">
      <img-upload title="上传其他补充信息" v-model="otherImgList"></img-upload>
    </div>
    <div class="common-submit-btn">
      <div class="submit-btn">
        <Button @click="nextStep">确认提交</Button>
      </div>
      <div class="clear-btn">
        <Button class="skip-btn" @click="skip">跳过</Button>
      </div>
    </div>
  </div>
</template>
<script>
import imgUpload from '../common/imgUpload.vue';
import { saveAduitFiles } from '@/request/interface/impower/UserInfo.js';
import { FileItem } from '@/model/ApplyBaseInfo';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';

export default {
  name: 'MYDReplenishFIleUpload',
  mixins: [commonMydMixin],
  data() {
    return {
      housePropertyImgList: [],
      carPropertyImgList: [],
      securityImgList: [],
      bankFlowImgList: [],
      otherImgList: []
    };
  },
  components: {
    'img-upload': imgUpload
  },
  created() {
    this.init();
  },
  methods: {
    async init() {
      this.getMydUnionKey();
    },
    nextStep() {
      this.$toasting.show({ message: '上传中', forbidClick: true });
      let attachmentPoList = [];
      if (this.housePropertyImgList.length) {
        attachmentPoList.push(new FileItem({ fileList: this.housePropertyImgList, status: 12 }));
      }
      if (this.carPropertyImgList.length) {
        attachmentPoList.push(new FileItem({ fileList: this.carPropertyImgList, status: 13 }));
      }
      if (this.securityImgList.length) {
        attachmentPoList.push(new FileItem({ fileList: this.securityImgList, status: 14 }));
      }
      if (this.bankFlowImgList.length) {
        attachmentPoList.push(new FileItem({ fileList: this.bankFlowImgList, status: 15 }));
      }
      if (this.otherImgList.length) {
        attachmentPoList.push(new FileItem({ fileList: this.otherImgList, status: 16 }));
      }
      saveAduitFiles({ attachmentPoList, applyUnionKey: this.applyUnionKey })
        .then(async (res) => {
          if (res?.data?.success) {
            let nextPath = await queryNextByUnionKeyAndProdId(this.creditPreInfo.productId, this.applyUnionKey);
            this.$router.replace({
              path: nextPath,
              query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
            });
          }
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg || '信息上传失败！' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    skip() {
      this.$router.replace({
        path: '/myd_credit_result',
        query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
      });
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../assets/css/common.scss';
.myd-replenish-wrappper {
  min-height: 100vh;
  background: $bg-color-2;
  .upalod-warpper {
    margin-bottom: 16px;
    display: flex;
    justify-content: center;
    background: $white;
  }
}
.skip-btn {
  margin-bottom: 100px;
}
</style>
