import ApiConfig from '../../path/api';
import { RequestInstance as Http } from '@/core/request/core/index';

export const taxLoginInit = payload => {
  const api = ApiConfig.taxLoginInit;
  if ('applyUnionKey' in payload) {
    payload.applyUnionKey = String(payload.applyUnionKey);
  }
  const params = {
    webAuthorizeChannelCode: payload.part_org,
    creditNo: payload.credit_no,
    nonce: {
      code: 'XM-100001',
      data: { ...payload, part_org: undefined, credit_no: undefined }
    }
  };
  return Http.send(api, 'get', params);
};

export const getQrCode = payload => {
  const api = ApiConfig.getQrCode;
  return Http.send(api, 'get', payload);
};

export const getQrCodeStaus = payload => {
  const api = ApiConfig.getQrCodeStaus;
  return Http.send(api, 'get', payload);
};

export const modifyTaxRequestId = payload => {
  const api = ApiConfig.modifyTaxRequestId;
  return Http.send(api, 'put', payload, true);
};

export const getScTaxSmsCode = payload => {
  const api = ApiConfig.getScTaxSmsCode;
  return Http.send(api, 'get', payload);
};

export const scTaxLogin = payload => {
  const api = ApiConfig.scTaxLogin;
  return Http.send(api, 'get', payload);
};

// 四川
// 检查账号和密码
export const sichuanCheckPassword = payload => {
  const api = ApiConfig.sichuanCheckPassword;
  return Http.send(api, 'post', payload);
};
// 获取图片验证码
export const sichuanGetCaptcha = payload => {
  const api = ApiConfig.sichuanGetCaptcha;
  return Http.send(api, 'get', payload);
};
// 登录
export const sichuanLogin = payload => {
  const api = ApiConfig.sichuanLogin;
  return Http.send(api, 'post', payload);
};
// 发送手机验证码
export const sichuanSendSms = payload => {
  const api = ApiConfig.sichuanSendSms;
  return Http.send(api, 'post', payload);
};

export const getHbImgComput = payload => {
  const api = ApiConfig.getHbImgComput;
  return Http.send(api, 'get', payload);
};

export const hbTaxLogin = payload => {
  const api = ApiConfig.hbTaxLogin;
  return Http.send(api, 'post', payload);
};

export const getSHImgVerifyUrl = payload => {
  const api = ApiConfig.getSHImgVerifyUrl;
  return Http.send(api, 'get', payload);
};

export const getSHEmployeeList = payload => {
  const api = ApiConfig.getSHEmployeeList;
  return Http.send(api, 'post', payload);
};

export const getShSms = payload => {
  const api = ApiConfig.getShSms;
  return Http.send(api, 'post', payload);
};

export const shTaxLogin = payload => {
  const api = ApiConfig.shTaxLogin;
  return Http.send(api, 'post', payload);
};

//  重庆
export const getCQImgVerifyUrl = payload => {
  const api = ApiConfig.getCQImgVerifyUrl;
  return Http.send(api, 'get', payload);
};

export const cqTaxLogin = payload => {
  const api = ApiConfig.cqTaxLogin;
  return Http.send(api, 'post', payload);
};

export const cqTaxNsrChoose = payload => {
  const api = ApiConfig.cqTaxNsrChoose;
  return Http.send(api, 'post', payload);
};

export const getZJImgVerifyUrl = payload => {
  const api = ApiConfig.getZJImgVerifyUrl;
  return Http.send(api, 'get', payload);
};

export const queryZJempoyeeList = payload => {
  const api = ApiConfig.queryZJempoyeeList;
  return Http.send(api, 'post', payload);
};

export const zjTaxLogin = payload => {
  const api = ApiConfig.zjTaxLogin;
  return Http.send(api, 'post', payload);
};

export const hnTaxLogin = payload => {
  const api = ApiConfig.hnTaxLogin;
  return Http.send(api, 'post', payload);
};

// 云南
export const getYunNanVerify = payload => {
  const api = ApiConfig.getYunNanVerify;
  return Http.send(api, 'post', payload);
};

export const getYunNanEmployeeList = payload => {
  const api = ApiConfig.getYunNanEmployeeList;
  return Http.send(api, 'post', payload);
};

export const yunNanTaxLogin = payload => {
  const api = ApiConfig.yunNanTaxLogin;
  return Http.send(api, 'post', payload);
};

export const queryJSempoyeeList = payload => {
  const api = ApiConfig.queryJSempoyeeList;
  return Http.send(api, 'post', payload);
};

export const yunnanSendSms = payload => {
  const api = ApiConfig.yunnanSendSms;
  return Http.send(api, 'post', payload);
};

export const yunnansmsLogin = payload => {
  const api = ApiConfig.yunnansmsLogin;
  return Http.send(api, 'post', payload);
};

export const jsTaxLogin = payload => {
  const api = ApiConfig.jsTaxLogin;
  return Http.send(api, 'post', payload);
};

export const gDTaxLogin = payload => {
  const api = ApiConfig.guanDongTaxLogin;
  return Http.send(api, 'post', payload);
};

// 陕西
export const sxTaxPreLogin = payload => {
  const api = ApiConfig.sxTaxPreLogin;
  return Http.send(api, 'post', payload);
};

export const sxVerifyUrl = payload => {
  const api = ApiConfig.sxVerifyUrl;
  return Http.send(api, 'get', payload);
};

export const sxTaxLogin = payload => {
  const api = ApiConfig.sxTaxLogin;
  return Http.send(api, 'get', payload);
};

export const sxSmsSend = payload => {
  const api = ApiConfig.sxSmsSend;
  return Http.send(api, 'post', payload);
};

export const shanxishanCheckWeak = payload => {
  const api = ApiConfig.shanxishanCheckWeak;
  return Http.send(api, 'post', payload);
};

// 青岛
export const qingdaosfChoose = payload => {
  const api = ApiConfig.qingdaosfChoose;
  return Http.send(api, 'post', payload);
};

export const qingdaosfzPassStepOne = payload => {
  const api = ApiConfig.qingdaosfzPassStepOne;
  return Http.send(api, 'post', payload);
};

export const qingdaosfzPassStepTwo = payload => {
  const api = ApiConfig.qingdaosfzPassStepTwo;
  return Http.send(api, 'post', payload);
};

export const qingdaosfzSendCode = payload => {
  const api = ApiConfig.qingdaosfzSendCode;
  return Http.send(api, 'post', payload);
};

// 北京
export const getBjImgVerifyUrl = payload => {
  const api = ApiConfig.getBjImgVerifyUrl;
  return Http.send(api, 'get', payload);
};

export const bjPreLogin = payload => {
  const api = ApiConfig.bjPreLogin;
  return Http.send(api, 'post', payload);
};

export const bjTaxLogin = payload => {
  const api = ApiConfig.bjTaxLogin;
  return Http.send(api, 'post', payload);
};

export const bjPhoneSms = payload => {
  const api = ApiConfig.bjPhoneSms;
  return Http.send(api, 'get', payload);
};

export const bjPhoneLogin = payload => {
  const api = ApiConfig.bjPhoneLogin;
  return Http.send(api, 'post', payload);
};

//福建
export const getFJVerifyImgUrl = payload => {
  const api = ApiConfig.getFJVerifyImgUrl;
  return Http.send(api, 'get', payload);
};

export const getFjEmployeeList = payload => {
  const api = ApiConfig.getFjEmployeeList;
  return Http.send(api, 'post', payload);
};
export const fjTaxLogin = payload => {
  const api = ApiConfig.fjTaxLogin;
  return Http.send(api, 'post', payload);
};
export const fjSendSmsCode = payload => {
  const api = ApiConfig.fjSendSmsCode;
  return Http.send(api, 'post', payload);
};
export const getTazPayer = payload => {
  const api = ApiConfig.getTazPayer;
  return Http.send(api, 'get', payload);
};
// 获取福建的图片的验证码
export const fuJianPreLogin = payload => {
  const api = ApiConfig.fuJianPreLogin;
  return Http.send(api, 'post', payload);
};

//贵州
export const guiZhouTaxLogin = payload => {
  const api = ApiConfig.guiZhouTaxLogin;
  return Http.send(api, 'post', payload);
};
export const guiZhousecondaryLogin = payload => {
  const api = ApiConfig.guiZhousecondaryLogin;
  return Http.send(api, 'post', payload);
};
export const guiZhouprimaryTaxLogin = payload => {
  const api = ApiConfig.guiZhouprimaryTaxLogin;
  return Http.send(api, 'post', payload);
};
export const guiZhouSendSmsCode = payload => {
  const api = ApiConfig.guiZhouSendSmsCode;
  return Http.send(api, 'post', payload);
};
export const guiZhousecondarySendSms = payload => {
  const api = ApiConfig.guiZhousecondarySendSms;
  return Http.send(api, 'post', payload);
};
export const guiZhouChooseTaxOrganization = payload => {
  const api = ApiConfig.guiZhouChooseTaxOrganization;
  return Http.send(api, 'get', payload);
};
// 获取图片验证码
export const guizhouGetCaptcha = payload => {
  const api = ApiConfig.guizhouGetCaptcha;
  return Http.send(api, 'get', payload);
};
export const guizhouClickWordCaptcha = payload => {
  const api = ApiConfig.guizhouClickWordCaptcha;
  return Http.send(api, 'get', payload);
};

// 山东
export const shanDongTaxLogin = payload => {
  const api = ApiConfig.shanDongTaxLogin;
  return Http.send(api, 'post', payload);
};

export const getShanDongImgVerifyUrl = payload => {
  const api = ApiConfig.getShanDongImgVerifyUrl;
  return Http.send(api, 'get', payload);
};

export const chooseqy = payload => {
  const api = ApiConfig.chooseqy;
  return Http.send(api, 'get', payload);
};

// 厦门
export const xiaMenTaxLogin = payload => {
  const api = ApiConfig.xiaMenTaxLogin;
  return Http.send(api, 'post', payload);
};

export const getXiaMenVerifyImgUrl = payload => {
  const api = ApiConfig.getXiaMenVerifyImgUrl;
  return Http.send(api, 'get', payload);
};

export const xiaMenSendSmsCode = payload => {
  const api = ApiConfig.xiaMenSendSmsCode;
  return Http.send(api, 'get', payload);
};

export const getXiaMenEmployeeList = payload => {
  const api = ApiConfig.getXiaMenEmployeeList;
  return Http.send(api, 'post', payload);
};

// 安徽
export const anHuiBifLogin = payload => {
  const api = ApiConfig.anHuiBifLogin;
  return Http.send(api, 'post', payload);
};

// 广西
// 获取广西的纳税人列表
export const guangxiGetEmployee = payload => {
  const api = ApiConfig.guangxiGetEmployee;
  return Http.send(api, 'post', payload);
};
// 发送验证码
export const guangxiSendSms = payload => {
  const api = ApiConfig.guangxiSendSms;
  return Http.send(api, 'post', payload);
};
// 登录
export const guangxiLogin = payload => {
  const api = ApiConfig.guangxiLogin;
  return Http.send(api, 'post', payload);
};

// 安徽
export const anHuiGetVerifyCode = payload => {
  const api = ApiConfig.anHuiGetVerifyCode;
  return Http.send(api, 'get', payload);
};

export const anHuiTaxLogin = payload => {
  const api = ApiConfig.anHuiTaxLogin;
  return Http.send(api, 'post', payload);
};

// 深圳

export const getShenZhenImgVerifyUrl = payload => {
  const api = ApiConfig.getShenZhenImgVerifyUrl;
  return Http.send(api, 'get', payload);
};

export const getShenZhenPubKey = payload => {
  const api = ApiConfig.getShenZhenPubKey;
  return Http.send(api, 'get', payload);
};

export const shenZhenPreLogin = payload => {
  const api = ApiConfig.shenZhenPreLogin;
  return Http.send(api, 'get', payload);
};

export const shenZhenCitTaxLogin = payload => {
  const api = ApiConfig.shenZhenTaxLogin;
  return Http.send(api, 'get', payload);
};

export const shenZhenSendSmsCode = payload => {
  const api = ApiConfig.shenZhenSendSmsCode;
  return Http.send(api, 'get', payload);
};

// 河南
export const heNanSendSmsCode = payload => {
  const api = ApiConfig.heNanSendSmsCode;
  return Http.send(api, 'post', payload);
};

export const heNanPreLogin = payload => {
  const api = ApiConfig.heNanPreLogin;
  return Http.send(api, 'post', payload);
};

export const heNanProvinceTaxLogin = payload => {
  const api = ApiConfig.heNanTaxLogin;
  return Http.send(api, 'post', payload);
};

export const getTianJinCaptcha = payload => {
  const api = ApiConfig.getTianJinCaptcha;
  return Http.send(api, 'get', payload);
};

export const tianJinTaxLogin = payload => {
  const api = ApiConfig.tianJinTaxLogin;
  return Http.send(api, 'post', payload);
};

export const shanXiGetSmsCode = payload => {
  const api = ApiConfig.shanXiGetSmsCode;
  return Http.send(api, 'post', payload);
};

export const shanXiTaxLogin = payload => {
  const api = ApiConfig.shanXiTaxLogin;
  return Http.send(api, 'post', payload);
};

// 甘肃税局获取手机验证码
export const ganSuGetSmsCode = payload => {
  // ApiConfig 是接口地址
  const api = ApiConfig.ganSuGetSmsCode;
  return Http.send(api, 'post', payload);
};

// 甘肃税务局登录
export const ganSuCitTaxLogin = payload => {
  // ApiConfig 是接口地址
  const api = ApiConfig.ganSuTaxLogin;
  return Http.send(api, 'post', payload);
};

// 甘肃税务局纳税人列表获取
export const ganSuNSRList = payload => {
  // ApiConfig 是接口地址
  const api = ApiConfig.ganSuNSRList;
  return Http.send(api, 'get', payload);
};

// 湖北
export const hubeiNsrChoose = payload => {
  const api = ApiConfig.hubeiNsrChoose;
  return Http.send(api, 'post', payload);
};

export const hubeiLogin = payload => {
  const api = ApiConfig.hubeiLogin;
  return Http.send(api, 'post', payload);
};
export const hubeiCaptcha = payload => {
  const api = ApiConfig.hubeiCaptcha;
  return Http.send(api, 'get', payload);
};

// 宁波
export const ningboLogin = payload => {
  const api = ApiConfig.ningboLogin;
  return Http.send(api, 'post', payload);
};
export const ningBoGetSmsCode = payload => {
  const api = ApiConfig.getNingBoCode;
  return Http.send(api, 'post', payload);
};
