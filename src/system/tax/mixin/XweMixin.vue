<template>
  <div class="tax-xwe-mixin">
    <p-protocol-list
      @closeProtocol="switchShowProtocol"
      @getProtocolText="getProtocolText"
      :isShowDoc="true"
      :protocoldoc="protocolText"
      :protocolList="protocolList"
    ></p-protocol-list>
  </div>
</template>
<script>
import { getGFCreditContract } from '@/request/interface/gf/common.js';
import ProtocolList from '@/common/components/common/ProtocolList';
export default {
  name: 'XweMixin',
  components: {
    'p-protocol-list': ProtocolList
  },
  data() {
    return {
      protocolText: '',
      protocolList: [{ code: '03', name: '广发银行贷款合同及相关授权协议', isNess: true, isReadOver: false }]
    };
  },
  methods: {
    switchShowProtocol() {
      this.$emit('isRead');
    },
    getProtocolText(protocol) {
      let index = protocol.index;
      this.protocolText = '';
      let params = {
        applyUnionKey: sessionStorage.getItem('union_key')
      };
      getGFCreditContract(params)
        .then(res => {
          if (res) {
            this.protocolList[index].isReadOver = true;
            this.protocolText = res;
          } else {
            this.$notify.error({
              msg: '文件获取失败！'
            });
          }
        })
        .catch(err => {
          this.$notify.error({
            msg: '文件获取失败！'
          });
        });
    }
  }
};
</script>
