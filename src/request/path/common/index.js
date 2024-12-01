/*
 * @Author: hsf
 * @Date: 2023-06-08 21:46:11
 * @LastEditors: hsf
 * @LastEditTime: 2024-05-28 15:09:57
 * @Description:
 */
// 请求域名
const apiDomain = process.env.VUE_APP_API_DOMAIN;

const commonApi = {
  // 退出登录
  logout: `${apiDomain}auth/logout`,
  // 查询身份证基本信息
  getPersonalInfo: `${apiDomain}app/baseInfo/findPersonBaseInfo`,
  getTokenByOpenid: `${apiDomain}auth/login`,
  // 微信公众号绑定
  weChatMpBind: `${apiDomain}auth/wxBind/weChatMpBind`,
  getJsTicket: `${apiDomain}auth/ticket/jsapi`,
  // 识别身份证信息
  idCardOCR: `${apiDomain}app/tencentOcr/iDCardOCR`,
  // 营业执照QRC识别
  bizLicenseOCR: `${apiDomain}app/tencentOcr/bizLicenseOCR`,
  bankCardOCR: `${apiDomain}app/tencentOcr/bankCardOCR`,
  // 获取用户授信基本信息的填写状态
  getUserBaseeinfoStatus: `${apiDomain}app/baseInfo/findBaseInfoCurrentStatus`,
  // cos腾讯云 上传密钥
  picUpload: `${apiDomain}auth/tencentCloudSecretKey/getCredential`,
  // 北京额度查询
  beijingQuotaQuery: `${apiDomain}app/borrowingApply/quotaQuery`,
  // 提款校验
  borrowVerifyApply: `${apiDomain}app/borrowingApply/borrowVerifyApply`,
  // 获取提款校验的结果
  getBorrowVerifyResult: `${apiDomain}app/borrowingApply/getBorrowVerifyResult`,
  // 三湘页面跳转准备信息
  sxPrepareMess: `${apiDomain}app/sanxiang/sxPrepareMess`,
  // 判断当前三湘借款是否已经额度确认了
  sxCheckAuditConfirm: `${apiDomain}app/sanxiang/checkAuditConfirm`,
  // 企企通记录跳转的接口
  qqtApplyRecord: `${apiDomain}public/app/app/qqt/queryScfAccessUrl`,
  // 获取图片验证码
  getCodeUrl: `${apiDomain}captcha/fresh`,
  // 获取租户的配置
  getInstNoConfig: `${apiDomain}saasPublic/config/public/queryTenantConfig`,
  // 独立产品信息列表
  openpGetProductInfos: `${apiDomain}saasPublic/mz-saas/saas/openp/getProductInfos`,
  // 获取当前位置
  getCurrentLocation: `${apiDomain}app/product/userLocation`,
  //推广海报
  getPoster: `${apiDomain}app/poster/posterBuilder?productId=`,

  // 开放平台中的申请单号登录信息获取
  getOpenUnionKeyInfo: `${apiDomain}public/app/app/applyUnionKey/openUnionKey`
};

export default {
  commonApi
};
