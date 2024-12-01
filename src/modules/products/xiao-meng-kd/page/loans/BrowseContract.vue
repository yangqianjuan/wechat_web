<template>
  <div class="browse-contract">
    <div class="new-pdf-wrapper">
      <pdf ref="pdf" v-for="i in numPages" :key="i" :src="contractUrl" :page="i"></pdf>
    </div>
    <Button class="sub-btn" type="primary" @click="closeBrowse">关闭</Button>
  </div>
</template>
<script>
import pdf from 'vue-pdf';
import { guaranteeContractAddress } from '@/request/interface/impower/Bank';
export default {
  /**
   * pdf格式的合同预览
   * */
  name: 'BrowseContract',
  components: {
    pdf
  },
  data() {
    return {
      contractUrl: '',
      numPages: null
    };
  },
  created() {
    this.init();
  },
  methods: {
    /**
     * 初始化
     * */
    init() {
      let query = this.$route.query;
      this.contractUrl = query.contractUrl;
      this.getNumPages();
    },

    /**
     * pdf的初始化
     * */
    getNumPages() {
      let loadingTask = pdf.createLoadingTask(this.contractUrl);
      this.$toasting.show({ message: '加载中', forbidClick: true });
      loadingTask.promise
        .then((pdf) => {
          this.$toasting.hide();
          this.numPages = pdf.numPages;
        })
        .catch((err) => {
          this.$notify.error({ msg: '合同加载失败！' });
        });
    },

    /**
     * 关闭页面
     * */
    closeBrowse() {
      let query = this.$route.query;
      this.$router.replace({ path: query.prePage, query: { applyUnionKey: query.applyUnionKey } });
    }
  }
};
</script>
<style lang="scss" scoped>
.browse-contract {
  height: 100%;
  width: 100%;
  overflow: hidden;
  .new-pdf-wrapper {
    height: 80vh;
    overflow: scroll;
  }
  .sub-btn {
    position: relative;
    width: 80%;
    margin-left: 10vw;
    background: #3552d0;
    box-shadow: 0px 5px 6px 0px rgba(53, 82, 208, 0.3);
    margin-top: 60px;
  }
}
</style>
