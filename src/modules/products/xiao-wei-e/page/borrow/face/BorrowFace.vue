<template>
  <div class="borrow-face"></div>
</template>
<script>
import { getFacePToken } from '@/controller/faceP.js';
import { getVerification } from '@/request/interface/txQrc/faceP.js';
import { gfFaceVerify } from '@/request/interface/gf/common.js';
import { SESSION_ID } from '@/utils/common/config.js';
import { faceErrorMessage } from '@/utils/common/common';
let wx = require('weixin-js-sdk');

/**
 * 人脸识别 借款
 *
 * */
export default {
  data() {
    return {
      liveVerifyTime: 0,
      applyUnionKey: '',
      productId: ''
    };
  },

  created() {
    this.init();
    // this.test();
  },

  methods: {
    test() {
      let params = {
        applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
        // 3 是提款阶段
        scene: 3,
        sessionId: sessionStorage.getItem(SESSION_ID.withdrawSessionId),
        imgUrl: 'https://dev-xm-1256921822.cos.ap-shanghai.myqcloud.com/faceid/cxc_test_gf_faceid.png'
      };
      gfFaceVerify(params)
        .then(async res => {
          if (res?.data?.data) {
            this.$router.replace({ path: '/xwe_confirm_loans_info' });
          } else {
            this.$notify.error({
              msg: '人脸识别失败！'
            });
          }
        })
        .catch(() => {});
    },

    init() {
      let faceType = sessionStorage.getItem('face_type_b');
      this.productId = '1035';
      this.liveVerifyTime = localStorage.borrowLiveVerifyTime ? parseInt(localStorage.borrowLiveVerifyTime) : 0;
      if (this.liveVerifyTime && faceType === 'borrow') {
        /**
         *
         * liveVerifyTime（验证的次数是否不为0）全局通用 5次机会，当次数不为0的时候，默认去获取结果
         *
         * 人脸识别结束之后，回到这个页面，就会进行人脸识别的结果的获取，（对应的场景，对应的获取类型）
         *
         *   场景分为，开户、借款、提款、还款
         *
         * */
        this.getVerifyResult();
      } else {
        this.gotoLivingVerify();
      }
    },
    /**
     * 获取人脸的跳转路径，对接腾讯的人脸识别
     * 获取的结果中有跳转到人脸识别的连接地址（url， BizToken， "RequestId）
     * */
    gotoLivingVerify() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      // 人脸识别不能超过5次
      if (this.liveVerifyTime >= 5) {
        this.$toasting.hide();
        this.$notify.error({
          msg: '活体识别次数过多，请明天再尝试！'
        });
        return false;
      }
      window.localStorage.setItem('borrowLiveVerifyTime', this.liveVerifyTime + 1);
      // type: "withdraw" 提款
      getFacePToken({ type: 'withdraw' })
        .then(res => {
          if (res?.url) {
            this.redirectUrl = res.url;
            setTimeout(() => {
              window.location.href = res.url;
            }, 200);
          }
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    /**
     * 获取人脸识别的结果
     *
     */
    getVerifyResult() {
      this.$toasting.show({ message: '获取结果中', forbidClick: true });
      // let bizToken = sessionStorage.getItem(SESSION_ID.withdrawBizToken);
      let faceStage = 'LOAN';

      // CREDIT 是用户授信的时候获取人脸识别结果的标识，LOAN是借款的时候的标识
      // { bizToken, faceStage }
      getVerification({ faceStage })
        .then(async res => {
          if (res?.data?.success && res?.data?.data) {
            let params = {
              applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
              imgUrl: res.data.data.bestFrameUrl,
              // 3 是提款阶段
              scene: 3,
              sessionId: sessionStorage.getItem(SESSION_ID.withdrawSessionId)
            };
            gfFaceVerify(params)
              .then(res => {
                if (res.data.data) {
                  this.$toasting.success({ msg: '获取成功' });
                  this.clear();
                  setTimeout(() => {
                    this.$router.replace({ path: '/xwe_confirm_loans_info' });
                  }, 1500);
                } else {
                  this.$toasting.error({ msg: '人脸识别上传失败，重新进行人脸识别！' });
                  faceErrorMessage()
                    .then(res => {
                      if (res === 'ok') {
                        this.gotoLivingVerify();
                      }
                    })
                    .catch(err => {
                      if (err === 'no') {
                        wx.closeWindow();
                      }
                    });
                }
              })
              .catch(() => {
                this.$toasting.error({ msg: '获取失败' });
                faceErrorMessage()
                  .then(res => {
                    if (res === 'ok') {
                      this.gotoLivingVerify();
                    }
                  })
                  .catch(err => {
                    if (err === 'no') {
                      wx.closeWindow();
                    }
                  });
              });
          } else {
            // 验证失败重新验证
            this.$toasting.error({ msg: '获取失败，请重新识别' });
            faceErrorMessage()
              .then(res => {
                if (res === 'ok') {
                  this.gotoLivingVerify();
                }
              })
              .catch(err => {
                if (err === 'no') {
                  wx.closeWindow();
                }
              });
          }
          // if (res?.data?.data) {
          //   let detail = res.data.data.detail;
          //   let bestFrameUrl = res.data.data.bestFrameUrl;
          //   let result = JSON.parse(detail.replace(new RegExp('\\\\', 'gm'), ''));
          //   let isPass = false;
          //   result.LivenessData.forEach(LiveneItem => {
          //     if (LiveneItem.ErrMsg === '成功') {
          //       isPass = true;
          //     }
          //   });
          //   if (isPass && bestFrameUrl) {
          //     let params = {
          //       applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
          //       imgUrl: bestFrameUrl,
          //       // 3 是提款阶段
          //       scene: 3,
          //       sessionId: sessionStorage.getItem(SESSION_ID.withdrawSessionId)
          //     };
          //     gfFaceVerify(params)
          //       .then(res => {
          //         if (res.data.data) {
          //           this.$toasting.success({ msg: '获取成功' });
          //           this.clear();
          //           setTimeout(() => {
          //             this.$router.replace({ path: '/xwe_confirm_loans_info' });
          //           }, 1500);
          //         } else {
          //           this.$toasting.error({ msg: '人脸识别上传失败，重新进行人脸识别！' });
          //           setTimeout(() => {
          //             this.gotoLivingVerify();
          //           }, 1500);
          //         }
          //       })
          //       .catch(() => {
          //         this.$toasting.error({ msg: '获取失败' });
          //         setTimeout(() => {
          //           this.gotoLivingVerify();
          //         }, 1500);
          //       });
          //   } else {
          //     // 验证失败重新验证
          //     this.$toasting.error({ msg: '获取失败，请重新识别' });
          //     setTimeout(() => {
          //       this.gotoLivingVerify();
          //     }, 1500);
          //   }
          // }
        })
        .catch(err => {
          this.$toasting.error({ msg: err?.data?.msg || '获取信息失败' });
          faceErrorMessage()
            .then(res => {
              if (res === 'ok') {
                this.gotoLivingVerify();
              }
            })
            .catch(err => {
              if (err === 'no') {
                wx.closeWindow();
              }
            });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    clear() {
      // 清空
      window.localStorage.removeItem('borrowLiveVerifyTime');
      window.sessionStorage.removeItem('face_type_b');
      window.sessionStorage.removeItem(SESSION_ID.withdrawBizToken);
      window.sessionStorage.removeItem(SESSION_ID.withdrawBizUrl);
    }
  }
};
</script>
