import { getGfSessionId } from '@/controller/common.js';
import { SESSION_ID } from '@/utils/common/config';
import Vue from 'vue';
// 测试
import { gfFaceVerify } from '@/request/interface/gf/common.js';

const vueInstance = new Vue();

export const gfCreditSessionId = options => {
  let applyUnionKey = sessionStorage.getItem(SESSION_ID.unionKey) || sessionStorage.getItem('applyUnionKey_1155');
  let params = {
    applyUnionKey: applyUnionKey,
    // 1 是授信阶段
    type: 1
  };
  getGfSessionId(params)
    .then(res => {
      if (res.data.success && res.data.data) {
        if (options.isGet) {
          // test();
        }

        // vueInstance.$toasting.success({ msg: '会话成功' });
      } else {
        vueInstance.$notify.info({
          msg: '暂无会话记录, 请刷新页面重新会话！'
        });
      }
    })
    .catch(err => {
      let errmsg = err.data.msg ? err.data.msg : '会话失败！';
      vueInstance.$notify.error({
        msg: errmsg
      });
    })
    .finally(() => {
      vueInstance.$toasting.hide();
    });
};

function test() {
  let params = {
    applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
    imgUrl: 'https://dev-xm-1256921822.cos.ap-shanghai.myqcloud.com/faceid/135_W6Ptyy9xHi5oNyxp.jpg',
    // 1 是授信阶段
    scene: 1,
    sessionId: sessionStorage.getItem(SESSION_ID.creditSessionId)
  };
  gfFaceVerify(params)
    .then(async res => {
      // if(res.data.data){
      // } else {
      //   this.$notify.error({
      //     msg: "人脸识别失败！"
      //   });
      // }
    })
    .catch(() => {});
}
