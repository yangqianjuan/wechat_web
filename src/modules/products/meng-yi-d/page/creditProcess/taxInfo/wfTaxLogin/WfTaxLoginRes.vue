<template>
  <div class="tax-wf-result">
    <van-empty
      v-if="loginStatus === 'pending'"
      description="授权正在处理中，可能需要等上一段时间，重新获取查询结果。"
    />
    <van-empty v-if="loginStatus === 'reject'" image="error" description="授权结果获取异常，请等待一段时间刷新页面。" />
    <van-empty
      class="login-success"
      v-if="loginStatus === 'resolve'"
      :image="loginSuccessIcon"
      description="授权成功，请点击下一步，完成后续操作。"
    />

    <!-- 合同列表  -->
    <div class="protocol-link-wrapper">
      <input class="protocol-select-btn" id="agree" type="radio" value="agree" v-model="isAgree" />
      <p>
        <label class="agree-text" for="agree">请阅读并同意协议</label>
        <span @click="switchShowProtocol" class="protocol">《授信合同》《数据使用授权书》</span>
      </p>
    </div>

    <div class="pdf-wrapper" v-if="isShowProtocol">
      <p-protocol-list
        @closeProtocol="switchShowProtocol"
        @getProtocolText="getProtocolText"
        :protocolText="protocolText"
        :protocolList="protocolList"
      ></p-protocol-list>
    </div>
    <van-button class="sub-btn refresh foot-operate-btn" v-if="loginStatus === 'pending'" @click="init('click')"
      >查询结果</van-button
    >
    <van-button class="sub-btn refresh foot-operate-btn" v-if="loginStatus === 'reject'" @click="init('click')"
      >重新获取</van-button
    >
    <van-button
      v-if="loginStatus === 'pending' || loginStatus === 'reject'"
      class="sub-btn foot-operate-btn"
      @click="exit"
      >退出</van-button
    >
    <van-button v-if="loginStatus === 'resolve'" class="sub-btn foot-operate-btn" @click="exit">下一步</van-button>
  </div>
</template>
<script>
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { quertProtocolUrl } from '@/controller/protocol.js';
import wfLoginResMixin from '@/common/components/taxInfo/wf/wfLoginResMixin';
import { commonMydMixin } from '@/modules/products/meng-yi-d/utils/common';

export default {
  name: 'WFMydTaxLoginResult',
  mixins: [wfLoginResMixin, commonMydMixin],
  components: {
    'p-protocol-list': ProtocolList
  },
  data() {
    return {
      isNeedUnionKey: true,
      protocolText: [],
      protocolList: [
        { code: '03', name: '授信合同', isNess: true, isReadOver: false },
        { code: '04', name: '数据使用授权书', isReadOver: false }
      ],
      callbackUrl: 'myd_tax_wf_res'
    };
  },

  methods: {
    async exit() {
      if (!this.jdeugeProtocoIsAgree()) {
        return;
      }
      let nextPath = await queryNextByUnionKeyAndProdId(this.creditPreInfo.productId, this.applyUnionKey);
      this.$router.replace({
        path: nextPath,
        query: { referrer: this.creditPreInfo.referrer, productId: this.creditPreInfo.productId }
      });
    },

    // 获取协议
    getProtocolText(protocol) {
      let fileType = protocol.code;
      let index = protocol.index;
      this.protocolText = [];
      let userInfo = this.userInfo;
      let params = {
        idCard: userInfo.idNo,
        userName: userInfo.name,
        corpName: this.companyName,
        applyUnionKey: this.applyUnionKey,
        fileType
      };
      quertProtocolUrl(params)
        .then(textArr => {
          this.protocolList[index].isReadOver = true;
          this.protocolText = textArr;
        })
        .catch(err => {
          this.$notify.error({
            msg: err.data.msg
          });
        });
    },

    /**
     * 税局采集方式的控制
     *      invoiceCollectionType 采票方式 null 不采 1 自有 2 微风企
     *      判断顺序 先判断是否跳过----》在判断是否可以采集----》在判断采集的方式
     */
    taxStatusControl(corpId, corpName) {
      this.taxStatusConfig(corpId, corpName, this.creditPreInfo.productId);
    }
  }
};
</script>
<style lang="scss" scoped>
.tax-wf-result {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  .status-icon {
    margin-top: 9vh;
    height: 8rem;
  }
  .login-status {
    margin-top: 50px;
    font-size: 32px;
    color: #333;
    text-align: center;
    font-weight: 500;
  }
  .sub-btn {
    width: 80%;
    margin-bottom: 18px;
    position: fixed;
    bottom: 8vh;
    background-color: #ff4a34;
  }
  /deep/.refresh {
    bottom: 18vh;
    /deep/ span {
      color: #333 !important;
    }
  }
}
/deep/.van-empty {
  .van-empty__description {
    text-indent: 2em;
    letter-spacing: 2px !important;
    line-height: 26px;
  }
}

.protocol-link-wrapper {
  display: flex;
  align-items: center;
  position: absolute;
  width: 650px;
  bottom: 30vh;
  .agree-text {
    color: #999999;
  }
  .protocol-select-btn {
    margin-right: 0.25rem;
  }
  .protocol {
    color: #ff4a34;
  }
}
.login-success {
  /deep/.van-empty__image {
    width: 180px;
    height: 180px;
  }
}
</style>
