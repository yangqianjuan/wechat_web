/*
 * @Author: yanpeng peng.yan01@weimob.com
 * @Date: 2023-06-13 17:35:11
 * @LastEditors: hsf
 * @LastEditTime: 2024-11-05 16:45:30
 * @FilePath: \mz-front\src\common\mixin\MxProtocol.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import ProtocolList from '@/common/components/common/ProtocolList.vue';
import { PROTOCOL_FUN, PROTOCOL_OBJ } from '@/utils/procotol/procotol';
import { COOKIE_ID } from '@/utils/common/config';

export default {
  data() {
    return {
      protocolText: [],
      protocolList: [],
      ptotocolListShowText: '',
      isShowProtocol: false
    };
  },
  components: {
    'p-protocol-list': ProtocolList
  },
  methods: {
    getProtocolList(prodId) {
      let nowPath = this.$route.path;
      console.log('nowPath', nowPath, prodId);
      let protocolList = PROTOCOL_OBJ[nowPath][prodId];
      this.protocolList = protocolList;
      let ptotocolListShowText = '';
      protocolList.forEach(protocol => {
        ptotocolListShowText = `${ptotocolListShowText}《${protocol.name}》`;
      });
      this.ptotocolListShowText = ptotocolListShowText;
    },
    switchShowProtocol() {
      this.isShowProtocol = !this.isShowProtocol;
    },
    queryProtocolText(params = {}, protocolIndex = 0) {
      return new Promise((resolve, reject) => {
        let applyUnionKey =
          this.getCookie(COOKIE_ID.applyUnionKey) ||
          sessionStorage.applyUnionKey ||
          sessionStorage.getItem('union_key');
        !params.applyUnionKey && (params.applyUnionKey = applyUnionKey);
        let productId = this.$store.state.productId || localStorage.productId;
        let getProtocolFun = PROTOCOL_FUN[productId] ? PROTOCOL_FUN[productId] : PROTOCOL_FUN['sales'];
        getProtocolFun(params)
          .then(textArr => {
            this.protocolList[protocolIndex].isReadOver = true;
            this.protocolText = textArr;
            resolve(true);
          })
          .catch(err => {
            this.$notify.error({
              msg: err?.data?.msg
            });
            reject(false);
          });
      });
    },

    clearStatusRead(path, prodId, formatProtocol) {
      PROTOCOL_OBJ[path][prodId] = formatProtocol;
    }
  }
};
