/**
 * 身份证的校验
 * */

// 验证身份证的数据是否正确
export const validateIdCard = (value, rule) => {
  let _IDRe18 = /^([1-6][1-9]|50)\d{4}(18|19|20)\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/;
  let _IDre15 = /^([1-6][1-9]|50)\d{4}\d{2}((0[1-9])|10|11|12)(([0-2][1-9])|10|20|30|31)\d{3}$/;
  const regIdNum18 = new RegExp(_IDRe18);
  const regIdNum15 = new RegExp(_IDre15);
  if (regIdNum18.test(value) || regIdNum15.test(value)) {
    return true;
  } else {
    return false;
  }
};

/**
 * 验证手机号
 * */
export const validatePhoneNo = (value, rule) => {
  const regPhone = new RegExp(/^1\d{10}$/);
  if (regPhone.test(value)) {
    return true;
  } else {
    return false;
  }
};
