<template>
  <div class="replenish-wrappper" v-if="replenishShow">
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
    <van-button class="foot-operate-btn next-btn" type="primary" @click="nextStep">下一步</van-button>
    <van-button class="foot-operate-btn skip-btn" @click="skip">跳过</van-button>
  </div>
</template>
<script>
import imgUpload from '@/common/components/common/imgUpload';
import { saveAduitFiles } from '@/request/interface/impower/UserInfo.js';
import { FileItem } from '@/model/ApplyBaseInfo';

export default {
  /**
   * 一些补充照片的上传，可以直接跳过
   *
   * */
  name: 'gfReplenishFileUpload',
  components: {
    'img-upload': imgUpload
  },
  data() {
    return {
      housePropertyImgList: [],
      carPropertyImgList: [],
      securityImgList: [],
      bankFlowImgList: [],
      otherImgList: [],
      loading: false,
      replenishShow: false
    };
  },
  created() {
    this.init();
  },
  methods: {
    init() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      setTimeout(() => {
        this.$toasting.hide();
        this.replenishShow = true;
      }, 1000);
    },
    // 下一步
    nextStep() {
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
      this.$toasting.show({ message: '上传中', forbidClick: true });
      saveAduitFiles({ attachmentPoList })
        .then((res) => {
          if (res?.data?.success) {
            this.$toasting.success({ msg: '上传成功' });
            setTimeout(() => {
              this.$router.replace({ path: '/xwe_tax_info' });
            }, 1500);
          } else {
            this.$notify.error({
              msg: '上传失败！'
            });
          }
        })
        .catch((err) => {
          this.$notify.error({
            msg: err?.data?.msg || '上传失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    // 跳过
    skip() {
      this.$router.replace({ path: '/xwe_tax_info' });
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
    margin-top: 1.0625rem;
  }
}
.next-btn {
  width: 80%;
  margin-left: 10%;
  margin-top: 80px;
}
.skip-btn {
  border: 1px solid #d8d8d8;
  margin-bottom: 80px;
  margin-top: 40px;
  width: 80%;
  margin-left: 10%;
  ::v-deep(.van-button__text) {
    color: #333 !important;
  }
}
</style>
