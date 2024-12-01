<!--
 * @Author: hsf
 * @Date: 2023-06-08 21:46:11
 * @LastEditors: hsf
 * @LastEditTime: 2023-07-31 11:02:40
 * @Description:
-->
<template>
  <!-- mask -->
  <div class="pdf-container">
    <div class="mask"></div>
    <div class="pdf-co-wrapper">
      <!-- 标题 -->
      <div v-if="!isShowPdf">
        <div class="title">请阅读以下协议</div>
        <img class="ic-close" @click="closeProtocol" :src="icClose" />
      </div>

      <!-- 协议名的列表 -->
      <div v-if="!isShowPdf" class="protocol-wrapper">
        <div
          class="protocol-item"
          v-for="(protocol, index) in protocolList"
          :key="index"
          @click="getProtocolDetail(index)"
        >
          <div class="protocol-name-wrapper">
            <p>《{{ protocol.name }}》</p>
            <!-- <div v-if="!protocol.isReadOver" class="unread-circle"></div>
            <img v-if="protocol.isReadOver" :src="icReadOver" class="icon-read-over" /> -->
            <!-- class="unread-circle" -->
            <!-- checked-color="#9F0400" -->
            <van-checkbox v-model="protocol.isReadOver" class="row-protocol-right-check" icon-size="13"></van-checkbox>
          </div>
        </div>
      </div>

      <!-- 文本展示 -->
      <div v-if="isShowPdf" class="pdf-warpper">
        <p-read-prf
          :title="title"
          :protocolText="isShowDoc ? protocoldoc : protocolText"
          :isPdf="isPdf"
          :isShowDoc="isShowDoc"
          :isNess="isNess"
          :isRead="isRead"
          @closePdf="switchShowPdf"
        ></p-read-prf>
      </div>
      <slot v-if="!isShowPdf"></slot>
    </div>
  </div>
</template>
<script>
import ReadPdf from '@/common/components/common/ReadPdf.vue';

export default {
  name: 'ProtocolList',
  props: {
    protocolList: Array,
    protocolText: [Array, String],
    // word的文档流
    protocoldoc: [Array, String, Blob],
    isShowDoc: {
      type: Boolean,
      default: () => {
        return false;
      }
    }
  },

  data() {
    return {
      pdfSrc: '',
      isShowPdf: false,
      title: '',
      icClose: require('../../../assets/imgs/icon/ic_close.png'),
      icReadOver: require('../../../assets/imgs/icon/ic_ok.png'),
      isNess: false,
      isRead: false,
      isPdf: false
    };
  },
  components: {
    'p-read-prf': ReadPdf
  },

  methods: {
    /**
     * 获取协议详情
     * */
    getProtocolDetail(index) {
      let protocol = this.protocolList[index];
      this.isNess = protocol.isNess ? true : false;
      this.isRead = protocol.isReadOver ? true : false;
      this.isPdf = protocol.isPdf;
      let code = protocol.code;
      this.title = protocol.name;
      this.$emit('getProtocolText', { code, index });
      this.switchShowPdf();
    },

    switchShowPdf() {
      this.isShowPdf = !this.isShowPdf;
    },

    // 关闭
    closeProtocol() {
      this.$emit('closeProtocol');
    }
  }
};
</script>
<style lang="scss" scoped>
.mask {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100vw;
  z-index: 1000000;
  background: rgba(0, 0, 0, 0.5);
  pointer-events: none;
  overflow: hidden;
}
.pdf-container {
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 100vw;
  text-align: center;
  z-index: 1000001;
  font-size: 26px;
  // background: rgba(0, 0, 0, 0.5);

  .pdf-co-wrapper {
    position: absolute;
    bottom: 0;
    width: 100vw;
    z-index: 1000001;
  }
  .title {
    padding: 30px 0;
    background: #ffffff;
    font-size: 32px;
    font-weight: 600;
    border-bottom: 1px solid rgba(219, 225, 236, 1);
  }
  .ic-close {
    height: 26px;
    width: 26px;
    position: absolute;
    top: 10px;
    right: 14px;
  }
  .protocol-wrapper {
    background: #ffffff;
    .protocol-item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100px;
      border-bottom: 1px solid rgba(219, 225, 236, 1);
      .protocol-name-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        .row-protocol-right-check {
          margin-top: -14px;
        }
      }
      .unread-circle {
        position: relative;
        top: -10px;
        height: 24px;
        width: 24px;
        border: 1px solid #dbe1ec;
        border-radius: 50%;
      }
    }
  }
  .pdf-warpper {
    background: #ffffff;
  }
}
.read-over {
  color: #1b6ffb;
}
.icon-read-over {
  height: 24px;
  width: 24px;
  border-radius: 0.3125rem;
  position: relative;
  top: -10px;
}
</style>
