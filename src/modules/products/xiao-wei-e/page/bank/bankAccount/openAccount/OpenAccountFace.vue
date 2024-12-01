<template>
  <div class="open-face"></div>
</template>
<script>
import { getFacePToken } from '@/controller/faceP.js';
import { getVerification } from '@/request/interface/txQrc/faceP.js';
import { gfFaceVerify } from '@/request/interface/gf/common.js';
import { SESSION_ID } from '@/utils/common/config.js';
import { getGfSessionId } from '@/controller/common.js';
import { getUnionKey } from '@/request/interface/common/index';
import { faceErrorMessage } from '@/utils/common/common';
let wx = require('weixin-js-sdk');

export default {
  /**
   * 人脸识别（开户流程）
   *
   * */
  data() {
    return {
      // 今天验证的次数
      liveVerifyTime: 0,
      applyUnionKey: '',
      productId: ''
    };
  },

  created() {
    this.init();
  },

  methods: {
    test() {
      this.$toasting.show({ message: '获取结果中', forbidClick: true });
      let params = {
        applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
        // 4 是开户阶段
        scene: 4,
        sessionId: sessionStorage.getItem(SESSION_ID.openSessionId),
        imgUrl: 'https://dev-xm-1256921822.cos.ap-shanghai.myqcloud.com/faceid/cxc_test_gf_faceid.png'
      };
      gfFaceVerify(params)
        .then(async res => {
          if (res?.data?.data) {
            this.$router.replace({
              path: '/xwe_open_bind_bank_card',
              query: {
                isBorrow: true,
                productId: this.productId,
                applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
                userNewOpen: this.$route.query.userNewOpen,
                bancardInfo: this.$route.query.bancardInfo
              }
            });
          } else {
            this.$notify.error({
              msg: '人脸识别失败！'
            });
          }
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },
    /**
     *  初始化
     * */
    init() {
      let faceType = sessionStorage.getItem('face_type_o');
      this.productId = localStorage.productId;
      this.liveVerifyTime = localStorage.openLiveVerifyTime ? parseInt(localStorage.openLiveVerifyTime) : 0;
      if (this.liveVerifyTime && faceType === 'open') {
        /**
         *
         * liveVerifyTime（验证的次数是否不为0）全局通用 5次机会，当次数不为0的时候，默认去获取结果
         *
         * 人脸识别结束之后，回到这个页面，就会进行人脸识别的结果的获取，（对应的场景，对应的获取类型）
         *
         *   场景分为，开户、借款、提款、还款
         *
         * */
        if (sessionStorage.getItem(SESSION_ID.unionKey)) {
          this.beforeGetResult();
        } else {
          this.getApplyUnionKey();
        }
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
      if (this.liveVerifyTime >= 50) {
        this.$toasting.hide();
        this.$notify.error({
          msg: '活体识别次数过多，请明天再尝试！'
        });
        return false;
      }
      window.localStorage.setItem('openLiveVerifyTime', this.liveVerifyTime + 1);
      // type: "open" 开户
      getFacePToken({ type: 'open' })
        .then(res => {
          this.redirectUrl = res.url;
          setTimeout(() => {
            window.location.href = res.url;
          }, 200);
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    beforeGetResult() {
      let applyUnionKey = sessionStorage.getItem(SESSION_ID.unionKey);
      let params = {
        applyUnionKey: applyUnionKey,
        // 4 是开户阶段
        type: 4
      };
      getGfSessionId(params)
        .then(res => {
          if (res?.data?.data) {
            this.getVerifyResult();
          } else {
            this.$notify.error({
              msg: '会话失败, 请刷新页面！'
            });
          }
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg || '会话失败, 请刷新页面！'
          });
        });
    },

    /**
     * 获取人脸识别的结果
     *
     */
    getVerifyResult() {
      this.$toasting.show({ message: '获取结果', forbidClick: true });
      // let bizToken = sessionStorage.getItem(SESSION_ID.openACBizToken);
      let faceStage = 'OPENACT';
      // CREDIT 是用户授信的时候获取人脸识别结果的标识，LOAN是借款的时候的标识 开户:OPENACT 还款:REPAY
      getVerification({ faceStage })
        .then(async res => {
          if (res?.data?.success && res?.data?.data) {
            let params = {
              applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
              imgUrl: res.data.data.bestFrameUrl,
              // 4 是开户阶段
              scene: 4,
              sessionId: sessionStorage.getItem(SESSION_ID.openSessionId)
            };

            // 广发的人脸识别信息传输接口
            gfFaceVerify(params)
              .then(res => {
                if (res?.data?.data) {
                  this.$toasting.success({ msg: '成功' });
                  this.clear();
                  setTimeout(() => {
                    this.$router.replace({
                      path: '/xwe_open_bind_bank_card',
                      query: {
                        isBorrow: true,
                        productId: this.productId,
                        applyUnionKey: this.applyUnionKey,
                        userNewOpen: this.$route.query.userNewOpen,
                        bancardInfo: this.$route.query.bancardInfo
                      }
                    });
                  }, 1500);
                } else {
                  this.$toasting.error({ msg: '失败' });
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
                this.$toasting.error({ msg: '失败' });
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
            this.$toasting.error({ msg: '失败' });
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
        .catch(err => {
          // console.log("人脸识别错误!", err);
          this.$toasting.error({ msg: '失败' });
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
      // if (bizToken) {
      //   // CREDIT 是用户授信的时候获取人脸识别结果的标识，LOAN是借款的时候的标识 开户:OPENACT 还款:REPAY
      //   getVerification({ bizToken, faceStage })
      //     .then(async (res) => {
      //       let detail = res?.data?.data?.detail;
      //       let bestFrameUrl = res.data.data.bestFrameUrl;
      //       let result = JSON.parse(detail.replace(new RegExp('\\\\', 'gm'), ''));
      //       let isPass = false;
      //       result.LivenessData.forEach((LiveneItem) => {
      //         if (LiveneItem.ErrMsg === '成功') {
      //           isPass = true;
      //         }
      //       });
      //       if (isPass && bestFrameUrl) {
      //         let params = {
      //           applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
      //           imgUrl: bestFrameUrl,
      //           // 4 是开户阶段
      //           scene: 4,
      //           sessionId: sessionStorage.getItem(SESSION_ID.openSessionId)
      //         };

      //         // 广发的人脸识别信息传输接口
      //         gfFaceVerify(params)
      //           .then((res) => {
      //             if (res?.data?.data) {
      //               this.$toasting.success({ msg: '成功' });
      //               this.clear();
      //               setTimeout(() => {
      //                 this.$router.replace({
      //                   path: '/xwe_open_bind_bank_card',
      //                   query: {
      //                     isBorrow: true,
      //                     productId: this.productId,
      //                     applyUnionKey: this.applyUnionKey,
      //                     userNewOpen: this.$route.query.userNewOpen,
      //                     bancardInfo: this.$route.query.bancardInfo
      //                   }
      //                 });
      //               }, 1500);
      //             } else {
      //               this.$toasting.error({ msg: '失败' });
      //               setTimeout(() => {
      //                 this.gotoLivingVerify();
      //               }, 1500);
      //             }
      //           })
      //           .catch(() => {
      //             this.$toasting.error({ msg: '失败' });
      //             setTimeout(() => {
      //               this.gotoLivingVerify();
      //             }, 1500);
      //           });
      //       } else {
      //         // 验证失败重新验证
      //         this.$toasting.error({ msg: '失败' });
      //         setTimeout(() => {
      //           this.gotoLivingVerify();
      //         }, 1500);
      //       }
      //     })
      //     .catch((err) => {
      //       // console.log("人脸识别错误!", err);
      //       this.$toasting.error({ msg: '失败' });
      //       setTimeout(() => {
      //         this.gotoLivingVerify();
      //       }, 1500);
      //     })
      //     .finally(() => {
      //       this.$toasting.hide();
      //     });
      // } else {
      //   this.$toasting.error({ msg: '失败' });
      //   setTimeout(() => {
      //     this.gotoLivingVerify();
      //   }, 1500);
      // }
    },
    // 清除
    clear() {
      // 清空
      window.localStorage.removeItem('openLiveVerifyTime');
      window.sessionStorage.removeItem('face_type_o');
      window.sessionStorage.removeItem(SESSION_ID.openACBizToken);
      window.sessionStorage.removeItem(SESSION_ID.openACBizUrl);
    },

    /**
     * 获取用户申请信息的标识
     *
     * */
    getApplyUnionKey() {
      let payload = {};
      payload.referrer = this.$store.state.referrer;
      payload.productId = this.$store.state.productId;
      getUnionKey(payload)
        .then(res => {
          if (res.data && res.data.data) {
            this.applyUnionKey = res.data.data;
            sessionStorage.setItem(SESSION_ID.unionKey, this.applyUnionKey);
            sessionStorage.setItem('applyUnionKey_1035', this.applyUnionKey);
            this.beforeGetResult();
          } else {
            this.$notify.error({ msg: '未获取到用户申请信息！' });
          }
        })
        .catch(err => {
          this.$notify.error({ msg: err?.data?.msg || '未获取到用户申请信息！' });
        });
    }
  }
};
</script>
