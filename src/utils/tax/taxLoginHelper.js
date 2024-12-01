const qrLoginProvincesArr = ['32'];
const accountLoginProvincesArr = ['hebei'];
const siChuanSmsLoginProvincesArr = ['51'];
const heBeiImgComputProvincessArr = ['13'];
const shangHaiTaxProvinceArr = ['31'];
const chongQingTaxProvinceArr = ['50'];
const zheJiangTaxProvinceArr = ['33'];
const huNanTaxProvinceArr = ['43'];
const yunNanTaxProvinceArr = ['53'];
const guangDongTaxProvinceArr = ['44'];
const shanXiTaxProvinceArr = ['61'];
const beiJingTaxProvinceArr = ['11'];
const guiZhouTaxProvinceArr = ['52'];
const fuJianTaxProvinceArr = ['35'];
const shanDongProvinveArr = ['37'];
const anHuiProvinceArr = ['34'];
const heNanProvince = ['41'];
const tianJinProvince = ['12'];
const shanXiProvinceCode = '14';
const gansuProvince = ['62'];
// 广西省的识别码
const guangxiProvince = ['45'];
// 湖北
const hubeiProvince = ['42'];
// const qingdaoProvince = ['45'];

export const TAX_LOGIN_TYPE = {
  qrLogin: 'qr_login',
  accountLogin: 'account_login',
  scSmsLogin: 'sc_sms_login',
  hbImgComputLogin: 'hb_img_comput_login',
  shTaxLogin: 'sh_tax_login',
  cqTaxLogin: 'ch_tax_login',
  zjTaxLogin: 'zj_tax_login',
  hnTaxLogin: 'hn_tax_login',
  ynTaxLogin: 'yn_tax_login',
  gdTaxLogin: 'gd_tax_login',
  sxTaxLogin: 'sx_tax_login',
  bjTaxLogin: 'bj_tax_login',
  gzTaxLogin: 'gz_tax_login',
  qdTaxLogin: 'qd_tax_login',
  fuJianTaxLogin: 'fujian_tax_login',
  shanDongTaxLogin: 'shandong_tax_login',
  xiaMenTaxLogin: 'xiameng_tax_login',
  anHuiTaxLogin: 'anhui_tax_login',
  shenZhenTaxLogin: 'shenzhen_tax_loing',
  heNanTaxLogin: 'henan_tax_login',
  tianJinTaxLogin: 'tianjin_tax_login',
  shanXiTaxLogin: 'shanxi_tax_login',
  gansuTaxLogin: 'ganshu_tax_login',
  guangxiTaxLogin: 'guangxi_tax_login',
  hubeiTaxLogin: 'hubei_tax_login',
  ningboTaxLogin: 'ningbo_tax_login'
};

export const getLoginStyle = (nationalTaxAccount) => {
  let provinceId = nationalTaxAccount.substr(2, 2);
  let cityId = nationalTaxAccount.substr(4, 2);
  if (qrLoginProvincesArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.qrLogin;
  } else if (siChuanSmsLoginProvincesArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.scSmsLogin;
  } else if (heBeiImgComputProvincessArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.hbImgComputLogin;
  } else if (beiJingTaxProvinceArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.bjTaxLogin;
  } else if (shangHaiTaxProvinceArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.shTaxLogin;
  } else if (chongQingTaxProvinceArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.cqTaxLogin;
  } else if (zheJiangTaxProvinceArr.includes(provinceId)) {
    if (cityId === '02') {
      // return TAX_LOGIN_TYPE.accountLogin;
      return TAX_LOGIN_TYPE.ningboTaxLogin;
    } else {
      return TAX_LOGIN_TYPE.zjTaxLogin;
    }
  } else if (huNanTaxProvinceArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.hnTaxLogin;
  } else if (yunNanTaxProvinceArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.ynTaxLogin;
  } else if (guangDongTaxProvinceArr.includes(provinceId)) {
    if (cityId === '03') {
      return TAX_LOGIN_TYPE.shenZhenTaxLogin;
    } else {
      return TAX_LOGIN_TYPE.gdTaxLogin;
    }
  } else if (shanXiTaxProvinceArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.sxTaxLogin;
  } else if (beiJingTaxProvinceArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.accountLogin; // 隐藏
  } else if (guiZhouTaxProvinceArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.gzTaxLogin;
  } else if (fuJianTaxProvinceArr.includes(provinceId)) {
    if (cityId === '02') {
      return TAX_LOGIN_TYPE.xiaMenTaxLogin;
    } else {
      return TAX_LOGIN_TYPE.fuJianTaxLogin;
    }
  } else if (shanDongProvinveArr.includes(provinceId)) {
    if (cityId === '02') {
      // return TAX_LOGIN_TYPE.accountLogin;
      return TAX_LOGIN_TYPE.qdTaxLogin;
    } else {
      return TAX_LOGIN_TYPE.shanDongTaxLogin;
    }
  } else if (anHuiProvinceArr.includes(provinceId)) {
    return TAX_LOGIN_TYPE.anHuiTaxLogin;
  } else if (heNanProvince.includes(provinceId)) {
    return TAX_LOGIN_TYPE.heNanTaxLogin;
  } else if (tianJinProvince.includes(provinceId)) {
    return TAX_LOGIN_TYPE.tianJinTaxLogin;
  } else if (gansuProvince.includes(provinceId)) {
    return TAX_LOGIN_TYPE.gansuTaxLogin;
  } else if (shanXiProvinceCode === provinceId) {
    return TAX_LOGIN_TYPE.shanXiTaxLogin;
  } else if (guangxiProvince.includes(provinceId)) {
    // 广西
    return TAX_LOGIN_TYPE.guangxiTaxLogin;
  } else if (hubeiProvince.includes(provinceId)) {
    // 湖北
    return TAX_LOGIN_TYPE.hubeiTaxLogin;
  } else {
    return TAX_LOGIN_TYPE.accountLogin;
  }
};
