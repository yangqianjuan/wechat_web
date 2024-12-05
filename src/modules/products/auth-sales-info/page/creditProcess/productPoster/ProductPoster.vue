<template>
  <div class="loans-result-wrapper" v-if="isLoadOver">
    <div class="title-wrapper" slot="title">
      <img class="status-icon" :src="approveIconCode[approve]" alt />
      <p class="loans-result">{{ approveStatus }}</p>
      <p class="desc">{{ approveDesc }}</p>
    </div>
    <div class="sub-btn-wrapper">
      <van-button class="sub-btn foot-operate-btn" type="primary" v-if="approve === 'FAIL'" @click="sureHandler"
        >完成
      </van-button>
      <!--      <van-button class="sub-btn reset-auth" v-if="approve === 'FAIL'" @click="resetAuthHandler">重新认证</van-button>-->
      <van-button class="sub-btn bg foot-operate-btn" v-if="approve === 'PASS'" @click="sureHandler">确认</van-button>
    </div>
  </div>
</template>
<script>
let wx = require('weixin-js-sdk');
import { getUserBaseInfo } from '@/request/interface/impower/UserInfo'; // import { jdugeNewUserRoute } from '@/controller/userController';
// import { jdugeNewUserRoute } from '@/controller/userController';

export default {
  /**
   * 产品海报
   * */
  name: 'ProductPoster',
  data() {
    return {
      approve: '',
      approveIconCode: {
        FAIL: require('@/assets/imgs/icon/ic_cre_fail.png'),
        PASS: require('@/assets/imgs/icon/ic_result.png')
      },
      approveStatus: '',
      approveDesc: '',
      productId: '',
      referrer: '',
      isLoadOver: false,
      // 人脸识别
      faceIdStatusTxt: {
        '00': '未进行授信人脸识别',
        '01': '授信人脸识别一致',
        '02': '授信人脸识别不一致',
        '03': '销售人脸识别不一致'
      },
      // 三要素
      threeMainStatusTxt: {
        '00': '未进行三要素鉴权',
        '01': '三要素鉴权通过',
        '02': '三要素鉴权未通过',
        '03': '身份证已被占用',
        '04': '手机号已被占用'
      },
      // 用户
      userStatusTxt: {
        N: '正常',
        L: '您的账号目前已冻结，请走线下人工批复流程！',
        D: '您的账号目前已被注销！',
        PASS: '实名认证已经完成，请联系运营人员！'
      },
      userInfo: {}
    };
  },
  created() {
    this.init();
  },

  methods: {
    init() {
      this.productId = this.$route.query.productId;
      this.referrer = this.$route.query.referrer;
      this.getAuthResult();
      // jdugeNewUserRoute();
    },

    getAuthResult() {
      this.$toasting.show({ message: '加载中', forbidClick: true });
      getUserBaseInfo()
        .then(res => {
          if (res?.data?.success && res?.data?.data) {
            const result = res.data.data;
            this.userInfo = result;
            if (window.__wxjs_environment === 'miniprogram') {
              if (result.userStatus === 'L') {
                this.approveDesc = this.userStatusTxt[result.userStatus];
                this.approveStatus = '认证失败';
                this.approve = 'FAIL';
              } else if (result.userStatus === 'D') {
                this.approveDesc = this.userStatusTxt[result.userStatus];
                this.approveStatus = '认证失败';
                this.approve = 'FAIL';
              } else if (result.userStatus === 'N') {
                if (result.threeMainStatus !== '01') {
                  this.approveDesc = this.threeMainStatusTxt[result.threeMainStatus];
                  this.approveStatus = '认证失败';
                  this.approve = 'FAIL';
                } else {
                  this.approve = 'PASS';
                  this.approveStatus = '已完成';
                  if (window.__wxjs_environment === 'miniprogram') {
                    wx.miniProgram.postMessage({
                      data: {
                        productId: this.productId,
                        userid: this.userInfo.userId,
                        fromEnv: 'h5',
                        path: `/pages/productposter/index?productId=${this.productId}&userid=${res.data.data?.userId}`
                      }
                    });
                    wx.miniProgram.navigateTo({
                      url:
                        '/pages/productposter/index?productId=' +
                        this.productId +
                        '&userid=' +
                        res.data.data?.userId +
                        '&fromEnv=h5'
                    });
                  }
                  // if (result.faceIdStatus !== '01') {
                  //   this.approveDesc = this.faceIdStatusTxt[result.faceIdStatus];
                  //   this.approveStatus = '认证失败';
                  //   this.approve = 'FAIL';
                  // } else {
                  //   this.approve = 'PASS';
                  //   this.approveStatus = '已完成';
                  //   if (window.__wxjs_environment === 'miniprogram') {
                  //     wx.miniProgram.reLaunch({
                  //       url: '/pages/productdetail/index?productId=' + this.productId
                  //     });
                  //   }
                  // }
                }
              }
            } else {
              if (result.threeMainStatus === '01' && result.faceIdStatus === '01') {
                this.approveDesc = this.userStatusTxt['PASS'];
                this.approve = 'PASS';
                this.approveStatus = '已完成';
              } else {
                this.approveDesc = this.userStatusTxt[result.userStatus];
                this.approveStatus = '认证失败';
                this.approve = 'FAIL';
              }
            }
            this.isLoadOver = true;
          }
        })
        .catch(err => {
          this.$notify.error({
            msg: err?.data?.msg || '认证信息获取失败！'
          });
        })
        .finally(_ => {
          this.$toasting.hide();
        });
    },
    sureHandler() {
      if (window.__wxjs_environment === 'miniprogram') {
        wx.miniProgram.reLaunch({
          url: '/pages/productdetail/index?productId=' + this.productId
        });
      } else {
        wx.closeWindow();
      }
      // if (window.__wxjs_environment === 'miniprogram') {
      //   wx.miniProgram.postMessage({
      //     data: {
      //       productId: this.productId,
      //       userid: this.userInfo.userId,
      //       fromEnv: 'h5',
      //       path: `/pages/productposter/index?productId=${this.productId}&userid=${this.userInfo.userId}`
      //     }
      //   });
      //
      //   wx.miniProgram.navigateTo({
      //     url:
      //       '/pages/productposter/index?productId=' + this.productId + '&userid=' + this.userInfo.userId + '&fromEnv=h5'
      //   });
      // } else {
      //   wx.closeWindow();
      // }
    },
    resetAuthHandler() {
      this.$toasting.show({ message: '跳转中', forbidClick: true });
      setTimeout(() => {
        this.$router.replace({
          path: '/auth_upload_idcard',
          query: {
            productId: this.productId,
            referrer: this.referrer
          }
        });
      }, 1500);
    }
  }
};
</script>

<style lang="scss" scoped>
.loans-result-wrapper {
  height: 100%;
  background: rgba(244, 246, 249, 1);
}

.sub-btn-wrapper {
  position: fixed;
  bottom: 20%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;

  .reset-auth {
    border-color: #cecece;

    ::v-deep .van-button__text {
      font-size: 30px;
      font-weight: 500;
      color: #333;
    }
  }

  .sub-btn {
    width: 80%;
    margin-left: 10%;
    margin-bottom: 18px;
  }

  .bg-blue {
    margin-bottom: 18px;
  }

  .bg {
    border: 1px solid #d8d8d8;

    ::v-deep .van-button__text {
      color: #333 !important;
      font-size: 28px;
    }
  }

  .tip {
    text-align: center;
    margin-top: 16px;
    color: #1b6ffb;
  }
}

.warning-text {
  padding: 0 5vw;
  font-size: 24px;
  font-weight: 400;
  color: #db2b13;
  margin-top: 0.9375rem;
  background: #ffffff;
}

.title-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 60px;
  background: #ffffff;

  .status-icon {
    height: 10rem;
  }

  .loans-result {
    margin-top: 20px;
    font-size: 26px;
    font-weight: 500;
    color: rgba(51, 51, 51, 1);
  }

  .desc {
    font-size: 26px;
    margin-top: 14px;
    font-weight: 400;
    color: #0e80ed;
  }
}
</style>
