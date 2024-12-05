<!--
 * @Author: hsf
 * @Date: 2023-06-08 21:46:11
 * @LastEditors: hsf
 * @LastEditTime: 2023-08-10 17:18:42
 * @Description:
-->
<template>
  <div class="pdf-com-wrapper">
    <!-- 标题 -->
    <div v-if="title">
      <div class="title">{{ title }}</div>
      <img class="ic-close" @click="agree" :src="icClose" />
    </div>

    <!-- loading -->
    <div class="loading-status" v-if="loadingStatus">
      <van-loading />
    </div>

    <!-- 非pdf格式 -->
    <div v-if="!isPdf && !loadingStatus && !isShowDoc" :class="!title ? 'no-title-margin' : ''">
      <div class="protocol-content-wrapper">
        <p
          class="protocol-content"
          v-for="(protocolItem, index) in protocolText"
          :key="index"
          v-html="protocolItem"
        ></p>
        <!-- <p class="protocol-content" v-for="(protocolItem, index) in protocolText" :key="index" v-text="protocolItem"></p> -->
      </div>
    </div>

    <!-- pdf格式 -->
    <div v-if="isPdf && !loadingStatus && !isShowDoc" class="new-pdf-wrapper">
      <pdf ref="pdf" :source="src" v-for="i in numPages" :key="i" :page="i"></pdf>
    </div>

    <!-- word 格式 -->
    <div v-if="isShowDoc" class="protocol-content-wrapper" :class="!title ? 'no-title-margin' : ''">
      <div class="doc-show" ref="file"></div>
    </div>

    <!-- 操作 -->
    <van-button
      class="agree-btn foot-operate-btn"
      v-if="!loadingStatus"
      :class="btnCanClick ? '' : 'cannot-click'"
      @click="agree"
      >{{ btnDesc }}</van-button
    >

    <slot></slot>
  </div>
</template>
<script>
import pdf from 'vue-pdf-embed';
// 解决部分文字不显示的问题
// import CMapReaderFactory from 'vue-pdf-embed/src/CMapReaderFactory.js';

let docx = require('docx-preview');

export default {
  /**
   * 文本和pdf格式的内容展示
   * */

  name: 'CommonTextOrPDFShow',
  props: {
    // pdf的url
    pdfSrc: String,
    // 标题
    title: String,

    // 协议的文本
    protocolText: {
      type: [Array, String, Blob]
    },
    // 是否需要10s的知晓展示
    isNess: {
      type: Boolean,
      default: false
    },
    // 是否已读
    isRead: {
      type: Boolean,
      default: false
    },
    // 是否是pdf格式
    isPdf: {
      type: Boolean,
      default: false
    },

    // word是否展示
    isShowDoc: {
      type: Boolean,
      default: () => {
        return false;
      }
    },
    isNeedCloseLoading: {
      type: Boolean,
      default: () => {
        return false;
      }
    }
  },
  data() {
    return {
      loadingStatus: true,
      src: '',
      numPages: '',
      icClose: require('@/assets/imgs/icon/ic_close.png'),
      leftSec: 9,
      btnDesc: '',
      btnCanClick: true,
      testPdfUrl:
        'https://dev-xm-1256921822.cos.ap-shanghai.myqcloud.com/contracts/20200917/287/LOANCJ0000322020091564247065/%E4%BA%92%E8%81%94%E7%BD%91%E4%B8%AA%E4%BA%BA%E7%BB%8F%E8%90%A5%E6%80%A7%E8%B4%B7%E6%AC%BE%E5%80%9F%E6%AC%BE%E5%90%88%E5%90%8C_LOANCJ0000322020091564247065.pdf'
    };
  },
  watch: {
    protocolText: {
      handler(newVal, oldVal) {
        // if (newVal) {
        //   this.loadingStatus = false;
        // }

        // common response data is string array && newVal[0] && newVal[1]
        if (newVal && Array.isArray(newVal) && newVal.length) {
          this.init();
        }

        if (newVal && typeof newVal === 'string') {
          this.init();
        }
        if (newVal && Object.prototype.toString.call(newVal) === '[object Blob]') {
          this.init();
        }

        // 展示pdf文档
        try {
          if (newVal && this.isPdf) {
            if (newVal.indexOf('JVBERi0xL') !== -1) {
              // let pdfData = 'data:application/pdf;base64,' + newVal;
              this.src = newVal;
            } else {
              this.src = newVal;
            }
            this.src.promise.then(pdf => {
              this.numPages = pdf.numPages;
            });
          }
        } catch (error) {
          console.log(error);
        }

        // 控制显示word
        if (newVal && this.isShowDoc) {
          this.$nextTick(() => {
            docx.renderAsync(newVal, this.$refs.file);
          });
        }
      },
      immediate: true,
      deep: true
    },
    isNeedCloseLoading(newVal, oldVal) {
      if (newVal) {
        this.loadingStatus = false;
      }
    }
  },
  components: {
    pdf
  },

  created() {
    // this.init();
  },

  // mounted() {
  //   this.pdfInit();
  // },

  methods: {
    // 初始化
    init() {
      this.loadingStatus = false;
      if (this.isNess && !this.isRead) {
        this.btnDesc = '知晓并同意（10)s';
        this.countDown();
      } else {
        this.btnDesc = '知晓并同意';
      }
    },

    /**
     * 关闭，并同意协议
     * */
    agree() {
      if (!this.btnCanClick) {
        return;
      }
      this.$emit('closePdf');
    },

    /**
     * 知晓状态下的定时展示，在时间内没有走完，是不可以点击同意安妮的，btnCanClick = false
     *
     * */
    countDown() {
      if (this.time) {
        clearInterval(this.time);
      }
      this.btnCanClick = false;
      let that = this;
      this.time = setInterval(() => {
        if (that.leftSec >= 0) {
          that.btnDesc = `知晓并同意（${that.leftSec}s)`;
          that.leftSec -= 1;
        } else {
          this.btnCanClick = true;
          this.btnDesc = '知晓并同意';
        }
      }, 1000);
    },

    /**
     * pdf格式下的初始化
     * */
    pdfInit() {
      if (this.isPdf && this.protocolText) {
        this.src = pdf.createLoadingTask(this.protocolText);
        this.src.promise.then(pdf => {
          this.numPages = pdf.numPages;
        });
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.pdf-com-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
  overflow: scroll;
  background: #ffffff;
  border-radius: 6px 6px 0px 0px;
}
.title {
  padding: 20px 45px;
  text-align: center;
  background: #ffffff;
  font-size: 30px;
  font-weight: 500;
  border-bottom: 1px solid #dce1ec;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.no-title-margin {
  margin-top: 1.125rem;
  padding: 0 0.625rem;
}
.ic-close {
  height: 24px;
  width: 24px;
  position: absolute;
  top: 10px;
  right: 14px;
}
.agree-btn {
  width: 64vw;
  height: unset;
  padding: 14px 0;
  background: #1c6ffb;
  border-radius: 5px;
  margin: 1.25rem 5vw;
  color: #ffffff;
  border: none;
}
.cannot-click {
  opacity: 0.4;
}
.new-pdf-wrapper {
  height: 70vh;
  overflow: scroll;
}
.loading-status {
  max-height: 70vh;
  min-height: 30vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
}
.protocol-content-wrapper {
  max-height: 70vh;
  min-height: 30vh;
  color: #343434;
  padding: 8px 20px;
  overflow: scroll;
  .protocol-content {
    text-align: left;
    margin-top: 12px;
    font-size: 24px;
    color: #000000;
    letter-spacing: 1.5px;
    padding: 0 12px;
  }
}
::v-deep .doc-show {
  width: 100%;
  height: 100%;
  overflow: auto;
  .docx-wrapper {
    background: gray;
    padding: 0px !important;
    display: flex;
    justify-content: center;
    overflow: hidden;
    .docx {
      font-family: unset !important;
      color: unset !important;
      column-count: 1;
      column-gap: 21.25pt;
      overflow: auto;
    }
    section.docx {
      padding: 10px 25px !important;
    }
  }
}
</style>
