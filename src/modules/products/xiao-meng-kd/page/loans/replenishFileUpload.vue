<template>
  <div class="replenish-wrappper">
    <div class="remind">请上传本人真实有效信息</div>
    <div>
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
    <Button class="sub-btn" :loading="loading" type="primary" @click="nextStep">下一步</Button>
    <Button class="sub-btn skip-btn" :loading="loading" @click="skip">跳过</Button>
  </div>
</template>
<script>
import imgUpload from '@/common/components/common/imgUpload';
import { saveAduitFiles } from '@/request/interface/impower/UserInfo.js';
import { FileItem } from '@/model/ApplyBaseInfo';

export default {
  /**
   * 用户车辆补充信息
   * */
  data() {
    return {
      housePropertyImgList: [],
      carPropertyImgList: [],
      securityImgList: [],
      bankFlowImgList: [],
      otherImgList: [],
      loading: false
    };
  },
  components: {
    'img-upload': imgUpload
  },
  methods: {
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
      saveAduitFiles({ attachmentPoList })
        .then((res) => {
          // 上传补充信息页面后 自动帮用户跳到绑定银行卡页面 不要停留在申请结果页面（就当作是帮用户点了一下去绑卡）
          this.$router.replace({ path: '/xm_bc_entry' });
        })
        .catch((err) => {
          this.$notify.error({ msg: err?.data?.msg });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    skip() {
      this.$router.replace({ path: '/credut_result' });
    }
  }
};
</script>
<style lang="scss" scoped>
.replenish-wrappper {
  min-height: 100vh;
  background: #f4f6f9;
  padding-bottom: 1.4375rem;

  .upalod-warpper {
    margin-top: 30px;
  }
}
.sub-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 30px;
}
.skip-btn {
  border: 1px solid #1b6ffb;
  color: #1b6ffb;
}
</style>
