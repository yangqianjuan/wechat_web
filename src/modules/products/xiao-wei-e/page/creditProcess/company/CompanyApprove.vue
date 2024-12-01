<template>
  <div class="company-approve-wrapper reset-form" v-if="companyShow">
    <!-- 上传企业照片信息 当前页面，第一步 -->
    <div class="remind">{{isStepUpload ? '请使用本人为企业法人的营业执照照片' : '请核对企业信息'}}</div>
    <div v-if="isStepUpload">
      <div class="item-wrapper">
        <p class="sec-title">上传营业执照照片</p>
        <div class="img-wrapper" @click="chooseImg">
          <div v-if="picFace" class="company-wrapper">
            <img :class="frontNeedRoate ? 'select-img' : 'rotate-img'" :src="picFace" alt="营业执照" />
          </div>
          <div class="notice-wrapper" v-else>
            <img class="shoot-icon" :src="takePicIcon" alt="营业执照" />
            <span class="shoot-desc">点击拍照</span>
          </div>
        </div>
      </div>
    </div>

    <!--确认公司信息  当前页面 第二步-->
    <div class="info-sure" v-if="!isStepUpload">
      <van-form validate-first :label-width="130" ref="formDynamic">
        <van-field
          v-model="busindessLicense.corpName"
          name="corpName"
          label="企业名称"
          required
          placeholder="请输入企业名称"
          :rules="ruleValidate.corpName"
        />
        <van-field
          v-model="busindessLicense.corpId"
          name="corpId"
          label="社会统一信用代码"
          required
          placeholder="请输入社会统一信用代码"
          :rules="ruleValidate.corpId"
        />
        <!-- 地区选择 -->
        <van-field
          required
          v-model="busindessLicense.code"
          class="error-msg area-self"
          name="code"
          :rules="ruleValidate.code"
        >
          <div slot="input" style="width:100%" class="bank-name">
            <van-cell
              is-link
              arrow-direction="down"
              title="企业地址"
              :value="addressInfo.value"
              @click="clickShow('area')"
            />
            <van-action-sheet v-model="addressShow" v-if="addressShow">
              <van-area
                title="地区"
                :area-list="areaList"
                :value="addressInfo.code"
                :columns-placeholder="['请选择', '请选择', '请选择']"
                @confirm="addressConfirm"
                @cancel="addressCancel"
              />
            </van-action-sheet>
          </div>
        </van-field>
      </van-form>
      <p class="notice">请确认企业信息无误后，再提交！</p>
    </div>

    <!-- 协议列表 -->
    <div v-if="isShowProtocol" class="mask">
      <div class="protocol-wrapper">
        <p-protocol-list
          @closeProtocol="switchShowProtocol"
          @getProtocolText="getProtocolText"
          :protocolText="protocolText"
          :protocolList="protocolList"
        ></p-protocol-list>
      </div>
    </div>

    <!-- 协议展示 -->
    <div class="protocol-link-wrapper" v-if="!isShowProtocol && !isStepUpload">
      <input class="protocol-select-btn" type="radio" value="agree" v-model="isAgree" />
      <p @click="switchShowProtocol">
        请阅读并同意
        <span class="protocol">{{ ptotocolListShowText }}</span>
      </p>
    </div>

    <!-- 操作 -->
    <van-button
      v-if="!isShowProtocol"
      @click="isStepUpload ? uploadIdPic() : submitInfo('formDynamic')"
      class="btn-foot-fixed foot-operate-btn confirm-btn"
      type="primary"
    >{{isStepUpload ? '确认上传' : '下一步'}}</van-button>
    <van-button class="btn-foot-fixed foot-operate-btn reset-btn" v-if="!isStepUpload" @click="resetImgUrl">重新识别</van-button>
  </div>
</template>
<script>
import { chooseWxImage, getFileName } from '@/utils/wx/wxUtils';
import initUploadObj from '@/controller/upload';
import { dataURLtoFile, jdugeImgDirection } from '@/utils/common/common';
import BusindessLicense from '@/model/BusindessLicense';
import { saveCorpBaseInfo } from '@/request/interface/impower/UserInfo';
import { bizLicenseOCR } from '@/request/interface/txQrc/readerPci';
import { queryNextByUnionKeyAndProdId } from '@/utils/credit/jdugeNextPath.js';
import { jdugeNewUserRoute } from '@/controller/userController';
import MxProtocol from '@/common/mixin/MxProtocol.js';
import { COOKIE_ID } from '@/utils/common/config';
import { gfCreditSessionId } from '@/modules/products/xiao-wei-e/page/creditProcess/utils/utils.js';
import { gfAreaDictQuery, getGFCorpArea } from '@/request/interface/gf/common.js';

export default {
  /**
   * 企业信息上传
   * */
  name: 'XweCompanyApprove',
  mixins: [MxProtocol],
  data() {
    return {
      picFace: '',
      isStepUpload: true,
      busindessLicense: {
        corpName: '',
        corpId: '',
        code: ''
      },
      takePicIcon: require('@/assets/imgs/ic_shoot.png'),
      userId: '',
      userInfo: {},
      ruleValidate: {
        corpName: [{ required: true, message: '请填写企业名称', trigger: 'onBlur' }],
        corpId: [{ required: true, message: '请填写社会统一信用代码', trigger: 'onBlur' }],
        code: [{ required: true, message: '请选择地区', trigger: 'onBlur' }]
      },
      protocolText: [],
      frontNeedRoate: false,
      isShowProtocol: false,
      isLoading: false,
      isAgree: '',
      applyUnionKey: '',
      companyShow: false,

      // 地区
      areaList: {},
      // 区code前4位集合
      countyKeysFourList: [],
      // 默认是区不可以跳过
      isSkipArea: false,
      addressInfo: {
        value: '',
        obj: [],
        code: ''
      },
      addressShow: false
    };
  },

  created() {
    this.init();
  },

  mounted() {
    this.isStepUpload = true;
    // 获取用户信息
    jdugeNewUserRoute().then((user) => {
      this.userInfo = user;
    });
  },

  methods: {
    /**
     * 初始化
     * */
    init() {
      this.setWechatTitle('企业认证');
      this.$toasting.show({ message: '加载中', forbidClick: true });
      setTimeout(() => {
        this.$toasting.hide();
        this.companyShow = true;
        this.userId = this.getCookie('wecaheat_xm_userid');
        this.applyUnionKey = this.getCookie(COOKIE_ID.applyUnionKey);
        Promise.all([this.getProtocolList('1035'), gfCreditSessionId(), this.getgfAreaDictQuery()]);
      }, 1000);
    },

    // 图片选择，识别数据
    chooseImg() {
      let japiList = ['chooseImage', 'uploadImage', 'getLocalImgData', 'previewImage'];
      chooseWxImage(japiList)
        .then((res) => {
          this.$toasting.show({ message: '读取中', forbidClick: true });
          this.picFace = res;
          jdugeImgDirection(res).then((res) => {
            this.frontNeedRoate = res;
          });
        })
        .catch((err) => {
          this.$notify.error({
            msg: '图片读取失败！'
          });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    },

    // 上传企业照片
    uploadIdPic() {
      if (this.picFace) {
        // this.isLoading = true;
        let picFace = dataURLtoFile(this.picFace, getFileName());
        // 文件上传-url的链接上传
        this.$toasting.show({ message: '上传中', forbidClick: true });
        this.uploadUtil(picFace)
          .then((res) => {
            // url的链接上传
            return bizLicenseOCR({ imageUrl: res });
          })
          .then((res) => {
            this.setWechatTitle('企业信息确认');
            if (res?.data?.data) {
              let busindessLicense = new BusindessLicense(res.data.data);
              // console.log("图片信息", busindessLicense);
              if (!busindessLicense.isIntact) {
                this.$toasting.info({ msg: '图片清晰度过低，请重新识别' });
                this.qcrErrHandle();
              } else {
                this.$toasting.success({ msg: '成功' });
                setTimeout(() => {
                  this.isStepUpload = false;
                  this.busindessLicense = busindessLicense;
                  getGFCorpArea({ corpId: busindessLicense.corpId })
                    .then((res) => {
                      if (res?.data?.data) {
                        let resShow = [];
                        let resObj = [];
                        // console.log("nadoe1", res.data, this.areaList);
                        // this.addressInfo.code = res.data.countyCode;

                        // 选择其中一个code 即可
                        if (res.data.data.countyCode) {
                          // 区
                          this.addressInfo.code = res.data.data.countyCode;
                          this.busindessLicense.code = res.data.data.countyCode;
                        } else if (res.data.data.cityCode) {
                          // 地区是否跳过录入
                          let secondAreaPreFour = res.data.data.cityCode.slice(0, 4);

                          // console.log("dddddd", secondAreaPreFour, this.countyKeysFourList);
                          if (!this.countyKeysFourList.includes(secondAreaPreFour)) {
                            // 跳过
                            this.isSkipArea = true;
                          }
                          // 市
                          this.addressInfo.code = res.data.data.cityCode;
                          this.busindessLicense.code = res.data.data.cityCode;
                        } else {
                          // 省
                          this.addressInfo.code = res.data.data.provinceCode;
                          this.busindessLicense.code = res.data.data.provinceCode;
                        }

                        // name 的连接
                        if (res.data.data.countyCode) {
                          resShow.unshift(this.areaList.county_list[res.data.data.countyCode]);
                          resObj.unshift({
                            name: this.areaList.county_list[res.data.data.countyCode],
                            code: res.data.data.countyCode
                          });
                        } else {
                          resObj.unshift({
                            name: '',
                            code: ''
                          });
                        }
                        if (res.data.data.cityCode) {
                          resShow.unshift(this.areaList.city_list[res.data.data.cityCode]);
                          resObj.unshift({
                            name: this.areaList.city_list[res.data.data.cityCode],
                            code: res.data.data.cityCode
                          });
                        } else {
                          resObj.unshift({
                            name: '',
                            code: ''
                          });
                        }
                        if (res.data.data.provinceCode) {
                          resShow.unshift(this.areaList.province_list[res.data.data.provinceCode]);
                          resObj.unshift({
                            name: this.areaList.province_list[res.data.data.provinceCode],
                            code: res.data.data.provinceCode
                          });
                        } else {
                          resObj.unshift({
                            name: '',
                            code: ''
                          });
                        }

                        this.addressInfo.value = resShow.join('-');
                        this.addressInfo.obj = resObj;
                      } else {
                        this.$notify.info({
                          msg: '未获取到企业的地址信息！'
                        });
                      }
                      // console.log("拿到的侧首", this.addressInfo);
                    })
                    .catch((err) => {
                      let msg = err?.data?.msg || '企业的地址信息，获取失败！';
                      this.$notify.error({
                        msg: msg
                      });
                    });
                }, 1500);
              }
            } else {
              this.$notify.info({
                msg: '未获取到企业图片上传的信息！'
              });
            }
          })
          .catch((err) => {
            this.$toasting.error({ msg: '识别失败' });
            this.qcrErrHandle();
          })
          .finally(() => {
            this.$toasting.hide();
            this.isLoading = false;
          });
      } else {
        this.$notify.info({
          msg: '请上传营业执照照片！'
        });
      }
    },

    qcrErrHandle() {
      this.picFace = '';
      this.isStepUpload = true;
    },

    resetImgUrl() {
      this.isStepUpload = true;
      this.picFace = '';
    },

    getProtocolText(protocol) {
      let fileType = protocol.code || this.protocolList[0].code;
      this.protocolText = [];
      let index = protocol.index,
        params = {
          corpName: this.busindessLicense.corpName,
          idCard: this.userInfo.idNo,
          userName: this.userInfo.name,
          applyUnionKey: this.applyUnionKey,
          fileType
        };
      this.queryProtocolText(params, index);
    },

    uploadUtil(picFace) {
      let that = this;
      return new Promise((resolve, reject) => {
        initUploadObj(
          that,
          new Date().getTime(),
          picFace,
          'image',
          (res) => {
            resolve(res.pic);
          },
          'biz_license'
        );
      });
    },

    switchShowPdf() {
      this.isShowProtocol = !this.isShowProtocol;
    },

    // 确认提交
    submitInfo(name) {
      this.$refs[name].validate(['corpName', 'corpId', 'code']).then((valid) => {
        if (!valid) {
          if (!this.isAgree) {
            this.$notify.info({
              msg: '请阅读并同意协议！'
            });
            return;
          }

          // 一级二级区域是必选的
          if (
            !this.addressInfo.obj[0] ||
            !this.addressInfo.obj[0].code ||
            !this.addressInfo.obj[1] ||
            !this.addressInfo.obj[1].code
          ) {
            this.$notify.info({
              msg: '请将地区选择完整！'
            });
            return;
          }

          // 三级区域的判断  没有三级的市，也可以过
          if (!this.isSkipArea && (!this.addressInfo.obj[2] || !this.addressInfo.obj[2].code)) {
            this.$notify.info({
              msg: '请将地区选择完整！'
            });
            return;
          }

          this.isLoading = true;
          let busindessLicense = this.busindessLicense;
          let referrer = localStorage.referrer;
          let productId = localStorage.productId ? localStorage.productId : '1035';
          this.$store.commit('setProductId', productId);
          this.$store.commit('setReferrer', referrer);
          busindessLicense.referrer = referrer;
          busindessLicense.productId = productId;
          if (this.isSkipArea) {
            busindessLicense.areaCode = `${this.addressInfo.obj[0].code},${this.addressInfo.obj[1].code}`;
          } else {
            busindessLicense.areaCode = `${this.addressInfo.obj[0].code},${this.addressInfo.obj[1].code},${this.addressInfo.obj[2].code}`;
          }

          this.$toasting.show({ message: '上传中', forbidClick: true });
          // 保存企业的基本信息
          saveCorpBaseInfo(busindessLicense)
            .then(async (res) => {
              if (res?.data?.success) {
                let nextPath = await queryNextByUnionKeyAndProdId('1035');
                if (nextPath !== '/xwe_company_approve') {
                  this.$toasting.success({ msg: '成功' });
                  setTimeout(() => {
                    this.$router.replace({ path: nextPath, query: { comeFrom: 'xwe_company_approve' } });
                  }, 1500);
                } else {
                  this.$toasting.error({ msg: '信息录入失败' });
                }
              } else {
                this.$toasting.error({ msg: '信息录入失败' });
              }
            })
            .catch((err) => {
              this.$toasting.hide();
              let msg = err?.data?.msg || '企业认证失败！';
              let code = err?.data?.code;
              if (code && code === '80000') {
                // 风控审核中，拒绝下一步，直接跳转到申请结果, 流程图中有
                this.riskFailHandle();
              } else if (code && code === '80101') {
                this.$notify.error({
                  msg: '服务错误，请重试！'
                });
              } else {
                this.$notify.error({
                  msg: msg
                });
                this.resetImgUrl();
                this.isLoading = false;
              }
            })
            .finally(() => {
              this.$toasting.hide();
            });
        }
      });
    },

    //
    riskFailHandle() {
      this.$toasting.show({ message: '风控审核中', forbidClick: true });
      setTimeout(() => {
        this.isLoading = false;
        this.$toasting.error({ msg: '审核拒绝' });
        // 申请结果页
        this.$router.replace({ path: '/xwe_credut_result' });
      }, 3000);
    },

    clickShow(type) {
      if (type === 'area') {
        if (!Object.keys(this.areaList).length) {
          this.$notify.info({ msg: '暂无区域信息！' });
        } else {
          this.addressShow = true;
        }
      }
    },

    // 地区选择提交
    addressConfirm(item) {
      console.log('addressConfirm', item, item.includes(undefined));

      if (Array.isArray(item) && item.length) {
        let res = [];
        item.forEach((ele, index) => {
          if (ele && ele.name) {
            res.push(ele.name);
          }
        });
        this.addressInfo.value = res.join('-');
        this.addressInfo.obj = item;

        // 区别用户会选择省、市、区
        if (item[2] && item[2].code) {
          this.addressInfo.code = item[2].code;
          this.busindessLicense.code = item[2].code;
        } else if (item[1] && item[1].code) {
          // 查找三级区域 (是否跳过三级区域的验证)
          let secondAreaPreFour = item[1].code.slice(0, 4);
          if (!this.countyKeysFourList.includes(secondAreaPreFour)) {
            this.isSkipArea = true;
          }

          this.addressInfo.code = item[1].code;
          this.busindessLicense.code = item[1].code;
        } else if (item[0] && item[0].code) {
          this.addressInfo.code = item[0].code;
          this.busindessLicense.code = item[0].code;
        }

        // console.log("dddd", this.addressInfo);
        this.$notify.success({
          msg: '地址选取成功！'
        });
        this.addressShow = false;
      } else {
        this.$notify.error({
          msg: '地址选取失败！'
        });
      }
    },

    // 取消地址选取
    addressCancel() {
      this.addressShow = false;
    },

    // 获取省市区的接口
    getgfAreaDictQuery() {
      gfAreaDictQuery()
        .then((res) => {
          if (res?.data?.data) {
            this.areaList.province_list = res.data.data.provinceList || {};
            this.areaList.city_list = res.data.data.cityList || {};
            this.areaList.county_list = res.data.data.countyList || {};

            // 取地区的code的前四位
            let countyKeysList = Object.keys(this.areaList.county_list);
            let countyKeysFourList = [];
            if (countyKeysList.length) {
              countyKeysFourList = countyKeysList.map((key) => {
                return key ? key.slice(0, 4) : '';
              });
              this.countyKeysFourList = countyKeysFourList;
            }
          } else {
            this.$notify.info({ msg: '未获取到地区信息！' });
          }
        })
        .catch(() => {
          this.$toasting.error({ msg: '获取区域信息失败' });
        })
        .finally(() => {
          this.$toasting.hide();
        });
    }
  }
};
</script>
<style lang="scss" scoped>
.item-wrapper {
  padding-top: 30px;
  margin-bottom: 80px;
}

.sec-title {
  font-size: 30px;
  font-weight: 600;
  margin-bottom: 30px;
  color: rgba(51, 51, 51, 1);
  text-align: center;
}
.img-wrapper {
  width: 56.3vw;
  height: 79.5vw;
  margin: 0 auto;
  margin-top: 30px;
  margin-bottom: 30px;
  background-image: url('../../../../../../assets/imgs/company_approve.png');
  background-repeat: no-repeat;
  background-size: contain;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: center;
}
/deep/.area-self {
  .van-cell {
    padding: 0;
    .van-cell__title {
      span {
        white-space: nowrap;
        font-size: 28px;
        font-weight: 500;
        white-space: nowrap;
        color: #333333;
      }
    }
    .van-cell__right-icon {
      font-size: 36px;
      margin-left: 12px;
      padding-top: 6px;
    }
    .van-cell__value {
      span {
        white-space: nowrap;
        font-size: 28px;
        font-weight: 500;
        white-space: nowrap;
        color: #333333;
      }
    }
  }
  .van-cell::after {
    border-bottom: 0px !important;
  }
}
.notice-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.notice {
  text-align: center;
  margin-top: 30px;
  font-size: 24px;
  font-weight: 400;
  color: rgba(219, 43, 19, 1);
}
.shoot-icon {
  width: 100px;
  height: 100px;
}
.shoot-desc {
  margin-top: 30px;
  font-size: 30px;
  font-weight: 600;
  color: rgba(42, 118, 254, 1);
}
.reset-btn {
  margin-bottom: 60px;
  border: 1px solid #d8d8d8;
  // z-index: -1;
  /deep/.van-button__text {
    color: #333 !important;
  }
}
.confirm-btn {
  margin-bottom: 170px;
}
.show-container {
  padding: 0 20px 0 20px;
}
.company-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
}
.select-img {
  width: 100%;
  object-fit: cover;
}
.rotate-img {
  height: 56.3vw;
  width: 79.5vw;
  margin-top: 2.5rem;
  transform: rotate(-90deg);
}
.mask {
  position: fixed;
  top: 0;
  bottom: 0;
  width: 100vw;
  z-index: 1000;
  text-align: center;
  background: rgba(0, 0, 0, 0.5);
  .protocol-wrapper {
    position: absolute;
    bottom: 0;
  }
}
.protocol-link-wrapper {
  padding: 0.875rem 0 1.25rem 1.25rem;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  .protocol-select-btn {
    margin-top: 0.25rem;
    margin-right: 0.25rem;
  }
  .protocol {
    color: #1b6ffb;
  }
}
/deep/.van-area {
  .van-picker__toolbar {
    padding: 16px 12px;
    .van-picker__cancel {
      font-size: 30px;
    }
    .van-picker__confirm {
      font-size: 30px;
      color: #333333;
    }
    .van-picker__title {
      font-size: 36px;
    }
  }
  .van-picker-column__item--selected {
    background-color: #f2f4f8;
    color: #333333;
  }
  .van-picker-column__wrapper {
    .van-picker-column__item {
      .van-ellipsis {
        font-size: 30px;
        color: #333333;
      }
    }
  }
}
.error-msg {
  /deep/.van-field__error-message {
    margin-left: 130px;
  }
}
</style>
