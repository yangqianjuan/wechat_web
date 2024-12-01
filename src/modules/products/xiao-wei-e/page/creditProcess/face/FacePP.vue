<template>
  <div class="credit-face">
    <van-empty v-if="identifying" :description="identifyText" />
  </div>
</template>
<script>
import { getFacePToken } from '@/controller/faceP.js';
import { getVerification } from '@/request/interface/txQrc/faceP.js';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { gfFaceVerify } from '@/request/interface/gf/common.js';
import { SESSION_ID } from '@/utils/common/config.js';
import { getGfSessionId } from '@/controller/common.js';
import { faceErrorMessage } from '@/utils/common/common';
let wx = require('weixin-js-sdk');

export default {
  /**
   * 人脸识别（授信流程）
   *
   * */
  data() {
    return {
      // 今天验证的次数
      liveVerifyTime: 0,
      applyUnionKey: '',
      productId: '',
      identifying: false,
      identifyText: '识别中...'
    };
  },

  created() {
    this.init();
    // this.test();
  },

  methods: {
    test() {
      this.identifying = true;
      let applyUnionKey = sessionStorage.getItem(SESSION_ID.unionKey);
      let params = {
        applyUnionKey: applyUnionKey,
        // 1 是授信阶段
        type: 1
      };
      getGfSessionId(params)
        .then(res => {
          let params = {
            applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
            imgUrl: 'https://dev-xm-1256921822.cos.ap-shanghai.myqcloud.com/faceid/cxc_test_gf_faceid.png',
            // 1 是授信阶段
            scene: 1,
            sessionId: sessionStorage.getItem(SESSION_ID.creditSessionId)
          };
          gfFaceVerify(params)
            .then(async res => {
              if (res.data.data) {
                this.identifying = false;
                // 人脸识别结果获取成功之后
                let productId = localStorage.getItem('productId');
                let nextPath = await queryNextByUnionKeyAndProdId(productId);
                this.$router.replace({ path: nextPath });
              } else {
                this.identifyText = '识别失败！';
                this.$notify.error({
                  msg: '人脸识别失败！'
                });
              }
            })
            .catch(() => {
              this.identifyText = '识别失败！';
            });
        })
        .catch(() => {
          this.identifyText = '识别失败！';
        });
    },
    init() {
      let faceType = sessionStorage.getItem('face_type_c');
      let creditInfo = JSON.parse(sessionStorage.getItem('single_credit_info'));
      this.productId = creditInfo.productId ? creditInfo.productId : '1035';
      this.liveVerifyTime = localStorage.creditLiveVerifyTime ? parseInt(localStorage.creditLiveVerifyTime) : 0;
      if (this.liveVerifyTime && faceType === 'credit') {
        /**
         * liveVerifyTime（验证的次数是否不为0）全局通用 5次机会，当次数不为0的时候，默认去获取结果
         * 人脸识别结束之后，回到这个页面，就会进行人脸识别的结果的获取，（对应的场景，对应的获取类型）
         * */
        let applyUnionKey = sessionStorage.getItem(SESSION_ID.unionKey);
        let params = {
          applyUnionKey: applyUnionKey,
          // 1 是授信阶段
          type: 1
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
      let liveVerifyTime = this.liveVerifyTime;
      window.localStorage.setItem('creditLiveVerifyTime', liveVerifyTime + 1);
      getFacePToken()
        .then(res => {
          this.redirectUrl = res?.url;
          this.redirectUrl &&
            setTimeout(() => {
              window.location.href = this.redirectUrl;
            }, 500);
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg || '获取人脸识别链接失败！'
          });
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
      // let bizToken = this.getCookie('tencent_biz_token');
      let faceStage = 'CREDIT';
      // CREDIT 是用户授信的时候获取人脸识别结果的标识，LOAN是借款的时候的标识
      // { bizToken, faceStage }
      getVerification({ faceStage })
        .then(async res => {
          if (res?.data?.success && res?.data?.data) {
            let params = {
              applyUnionKey: sessionStorage.getItem(SESSION_ID.unionKey),
              imgUrl: res.data.data.bestFrameUrl,
              // 1 是授信阶段
              scene: 1,
              sessionId: sessionStorage.getItem(SESSION_ID.creditSessionId)
            };
            gfFaceVerify(params)
              .then(async res => {
                if (res?.data?.data) {
                  this.clear();
                  // 人脸识别结果获取成功之后
                  let productId = localStorage.getItem('productId') || '1035';
                  let nextPath = await queryNextByUnionKeyAndProdId(productId);
                  if (nextPath !== '/xwe_face_pp') {
                    this.$toasting.success({ msg: '获取成功' });
                    setTimeout(() => {
                      this.$router.replace({ path: nextPath });
                    }, 1500);
                  } else {
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
                  }
                } else {
                  this.$toasting.error({ msg: '人脸识别上传失败！' });
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
          }
          // if (res?.data?.data) {
          //   let detail = res?.data?.data?.detail;
          //   let bestFrameUrl = res?.data?.data?.bestFrameUrl;
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
          //       // 1 是授信阶段
          //       scene: 1,
          //       sessionId: sessionStorage.getItem(SESSION_ID.creditSessionId)
          //     };
          //     gfFaceVerify(params)
          //       .then(async res => {
          //         if (res?.data?.data) {
          //           this.clear();
          //           // 人脸识别结果获取成功之后
          //           let productId = localStorage.getItem('productId') || '1035';
          //           let nextPath = await queryNextByUnionKeyAndProdId(productId);
          //           if (nextPath !== '/xwe_face_pp') {
          //             this.$toasting.success({ msg: '获取成功' });
          //             setTimeout(() => {
          //               this.$router.replace({ path: nextPath });
          //             }, 1500);
          //           } else {
          //             this.$toasting.error({ msg: '获取失败' });
          //             setTimeout(() => {
          //               this.gotoLivingVerify();
          //             }, 1500);
          //           }
          //         } else {
          //           this.$toasting.error({ msg: '人脸识别上传失败！' });
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
          // } else {
          //   this.$toasting.error({ msg: '获取失败' });
          //   setTimeout(() => {
          //     this.gotoLivingVerify();
          //   }, 1500);
          // }
        })
        .catch(err => {
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
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 清除
    clear() {
      // 清空
      window.localStorage.removeItem('creditLiveVerifyTime');
      window.sessionStorage.removeItem('face_type_c');
      this.setCookie('tencent_biz_token', '');
      window.sessionStorage.removeItem(SESSION_ID.bizUrl);
    }
  }
};
</script>
