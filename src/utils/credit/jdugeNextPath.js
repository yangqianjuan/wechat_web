import { getUserBaseeinfoStatus, getUserSaleBaseeinfoStatus } from '@/request/interface/impower/UserInfo.js';
import Vue from 'vue';
import { COOKIE_ID } from '@/utils/common/config';

export const queryNextByUnionKeyAndProdId = async (prodId, applyUnionKey = '') => {
  try {
    let path, result;
    if (prodId === 1000000) {
      result = await getUserSaleBaseeinfoStatus();
    } else {
      applyUnionKey = applyUnionKey || Vue.prototype.getCookie(COOKIE_ID.applyUnionKey);
      result = applyUnionKey ? await getUserBaseeinfoStatus({ applyUnionKey }) : await getUserBaseeinfoStatus();
    }
    path = nextPathObj[parseInt(prodId)](result?.data?.data || {});
    return path;
  } catch (e) {
    return e;
  }
};

// 销售实名认证
export const salesAuthApplyRoute = baseInfoStatus => {
  let [isNotFillOut, isFillOut] = ['N', 'Y'];
  let nextPath = '/auth_upload_idcard';

  if (window.__wxjs_environment === 'miniprogram') {
    if (baseInfoStatus.personBaseStatus === isNotFillOut) {
      nextPath = '/auth_upload_idcard';
    } else if (baseInfoStatus.threeMainStatus === isNotFillOut) {
      nextPath = '/auth_idno_name_phone_verify';
    } else {
      nextPath = '/auth_product_poster';
    }
  } else {
    if (baseInfoStatus.personBaseStatus === isNotFillOut) {
      nextPath = '/auth_upload_idcard';
    } else if (baseInfoStatus.threeMainStatus === isNotFillOut) {
      nextPath = '/auth_idno_name_phone_verify';
    } else if (baseInfoStatus.faceIdStatus === isNotFillOut) {
      // 活体（人脸）识别
      nextPath = '/auth_face_pp';
    } else {
      nextPath = '/auth_product_poster';
    }
  }

  return nextPath;
};

// sass进件
export const judgeSassZgcApplyRoute = baseInfoStatus => {
  // applyPersonBaseStatus: "Y"  信息补充
  // contactStatus: "Y"   联系人信息
  // corpBaseStatus: "Y"  企业认证
  // faceIdStatus: "Y"    人脸识别
  // finishStatus: "N"   是否认证结束
  // isOpenAccunt: "1001"
  // loanFaceIdStatus: "N"
  // nationalTaxStatus: "N"
  // personBaseStatus: "Y"  个人身份证信息上传
  // queryAuthContractStatus: "N"  saas销售合同
  // saleContractStatus: "-1"
  // threeMainStatus: "Y"   三要素
  let [isNotFillOut, isFillOut] = ['N', 'Y'];
  // saas的第一步 上传身份证照片
  let nextPath = '/upload_idcard';
  if (baseInfoStatus.finishStatus === isFillOut) {
    nextPath = '/';
  } else if (baseInfoStatus.personBaseStatus === isNotFillOut) {
    nextPath = '/upload_idcard';
  } else if (baseInfoStatus.threeMainStatus === isNotFillOut) {
    // 绑定手机号
    nextPath = '/idno_name_phone_verify';
  } else if (baseInfoStatus.faceIdStatus === isNotFillOut) {
    // 人脸识别
    nextPath = '/face_pp';
  } else if (baseInfoStatus.corpBaseStatus === isNotFillOut) {
    // 企业认证
    nextPath = '/company_approve';
  } else if (baseInfoStatus.applyPersonBaseStatus === isNotFillOut) {
    // 信息补充
    nextPath = '/sass_replenish';
  } else if (baseInfoStatus.contactStatus === isNotFillOut && baseInfoStatus.saleContractStatus === '-1') {
    // 上传身份证信息
    nextPath = '/sass_replenish_id_card';
  } else if (
    baseInfoStatus.saleContractStatus === '-1' ||
    baseInfoStatus.saleContractStatus === '00' ||
    baseInfoStatus.saleContractStatus === '02'
  ) {
    nextPath = saleContractStatusRouterObj[baseInfoStatus.saleContractStatus];
  } else if (baseInfoStatus.isOpenAccunt === '1001') {
    nextPath = '/sass_bind_card'; // 跳到开户页面（绑定银行卡）
  } else if (baseInfoStatus.isOpenAccunt === '1002') {
    nextPath = '/sass_bind_card?isOpenAccunt===1002'; // 已存在可使用电子账户，跳到开户确认页面，自动开户
  } else if (baseInfoStatus.queryAuthContractStatus === isNotFillOut) {
    // saas销售合同
    nextPath = '/sign_sass_contract';
  } else {
    // saas的申请结果
    nextPath = '/sass_credit_result';
  }
  return nextPath;
};

// else if (baseInfoStatus.frontPreCredit === isNotFillOut) {
//   // 到预授信结果页
//   nextPath = '/xm_front_pre_credit';
// }
// 小萌快贷进件
export const judgeXMDApplyRoute = baseInfoStatus => {
  let [isNotFillOut, isFillOut] = ['N', 'Y'];
  let nextPath = '/upload_idcard';
  if (baseInfoStatus.finishStatus === isFillOut) {
    nextPath = '/apply_record';
  } else if (baseInfoStatus.personBaseStatus === isNotFillOut) {
    nextPath = '/upload_idcard';
  } else if (baseInfoStatus.threeMainStatus === isNotFillOut) {
    nextPath = '/idno_name_phone_verify';
  } else if (baseInfoStatus.faceIdStatus === isNotFillOut) {
    // 活体（人脸）识别
    nextPath = '/face_pp';
  } else if (baseInfoStatus.corpBaseStatus === isNotFillOut) {
    nextPath = '/xm_company_approve';
  } else if (baseInfoStatus.applyPersonBaseStatus === isNotFillOut) {
    nextPath = '/base_info';
  } else if (baseInfoStatus.xmContactStatus === isNotFillOut) {
    // 增加的信息收集
    nextPath = '/xm_common_info';
  } else if (baseInfoStatus.nationalTaxStatus === isNotFillOut) {
    // 税务信息
    nextPath = '/tax_info';
  } else if (baseInfoStatus.isOpenAccunt === '101' || baseInfoStatus.isOpenAccunt === '103') {
    nextPath = '/xm_bc_entry';
  } else if (baseInfoStatus.isOpenAccunt === '102') {
    nextPath = '/credut_result';
  } else {
    nextPath = '/credut_result';
  }
  return nextPath;
};

// 小微e秒贷进件
export const judgeXWEApplyRoute = baseInfoStatus => {
  let [isNotFillOut, isFillOut] = ['N', 'Y'];
  let nextPath = '/xwe_upload_idcard';
  if (baseInfoStatus.finishStatus === isFillOut) {
    // 申请记录页面
    nextPath = '/';
  } else if (baseInfoStatus.personBaseStatus === isNotFillOut) {
    // 身份证识别
    nextPath = '/xwe_upload_idcard';
  } else if (baseInfoStatus.threeMainStatus === isNotFillOut) {
    nextPath = '/xwe_idno_name_phone_verify';
  } else if (baseInfoStatus.faceIdStatus === isNotFillOut) {
    // 活体（人脸）识别
    nextPath = '/xwe_face_pp';
  } else if (baseInfoStatus.corpBaseStatus === isNotFillOut) {
    // 企业认证信息
    nextPath = '/xwe_company_approve';
  } else if (baseInfoStatus.fourMainStatus === isNotFillOut) {
    // 四要素基本信息的输入
    nextPath = '/xwe_bankCard_info_entry';
  } else if (baseInfoStatus.applyPersonBaseStatus === isNotFillOut) {
    // 个人地址信息
    nextPath = '/xwe_base_info';
  } else if (baseInfoStatus.nationalTaxStatus === isNotFillOut) {
    // 税务信息登录
    nextPath = '/xwe_tax_info';
  } else {
    // 进件的申请结果
    nextPath = '/xwe_credut_result';
  }
  return nextPath;
};

// 萌壹贷
export const judgeMYDApplyRoute = baseInfoStatus => {
  let [isNotFillOut, isFillOut] = ['N', 'Y'];
  let nextPath = '/myd_upload_idcard';
  if (baseInfoStatus.finishStatus === isFillOut) {
    nextPath = '/myd_apply_record';
  } else if (baseInfoStatus.personBaseStatus === isNotFillOut) {
    nextPath = '/myd_upload_idcard';
  } else if (baseInfoStatus.threeMainStatus === isNotFillOut) {
    nextPath = '/myd_idno_name_phone_verify';
  } else if (baseInfoStatus.faceIdStatus === isNotFillOut) {
    nextPath = '/myd_face_pp';
  } else if (baseInfoStatus.corpBaseStatus === isNotFillOut) {
    nextPath = '/myd_company_approve';
  } else if (baseInfoStatus.applyPersonBaseStatus === isNotFillOut) {
    nextPath = '/myd_base_info';
  } else if (baseInfoStatus.nationalTaxStatus === isNotFillOut) {
    nextPath = '/myd_tax_info';
  } else {
    nextPath = '/myd_credit_result';
  }
  return nextPath;
};

// 萌 e 贷
export const judgeMEDApplyRoute = baseInfoStatus => {
  let [isNotFillOut, isFillOut] = ['N', 'Y'];
  let nextPath = '/bjb_upload_idcard';
  if (baseInfoStatus.finishStatus === isFillOut) {
    nextPath = '/bjb_credit_result';
  } else if (baseInfoStatus.personBaseStatus === isNotFillOut) {
    // 信息采集
    nextPath = '/bjb_upload_idcard';
  } else if (baseInfoStatus.faceIdStatus === isNotFillOut) {
    // 人脸识别
    nextPath = '/bjb_face_pp';
  } else if (baseInfoStatus.corpBaseStatus === isNotFillOut) {
    // 企业信息采集
    nextPath = '/bjb_company_approve';
  } else if (baseInfoStatus.nationalTaxStatus === isNotFillOut) {
    // 税务采集
    nextPath = '/bjb_tax_info';
  } else if (baseInfoStatus.xmContactStatus === isNotFillOut) {
    // 补充信息收集
    nextPath = '/bjb_base_info';
  } else {
    nextPath = '/bjb_credit_result';
  }
  return nextPath;
};

const nextPathObj = {
  // 小萌快贷
  1000: judgeXMDApplyRoute,
  // saas
  1023: judgeSassZgcApplyRoute,
  // 小微e秒贷
  1035: judgeXWEApplyRoute,
  // 萌壹贷
  1038: judgeMYDApplyRoute,
  // 萌 e 贷
  1155: judgeMEDApplyRoute,
  // 销售认证
  1000000: salesAuthApplyRoute
};

// NULL("-1","未上传"),
// UNCONFIRMED("00", "未确认"),
// CONFIRMED("01", "已确认"),
// RETURN("02", "驳回")
const saleContractStatusRouterObj = {
  '-1': '/sass_contract_upload',
  '00': '/sass_contract_result',
  '02': '/sass_contract_upload'
};
