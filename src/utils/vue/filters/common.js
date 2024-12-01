/**
 * 银行卡的展示按照四位进行展示
 * */

const formatBankNo = (no) => {
  if (typeof no === 'number') {
    no = no + '';
  }
  if (no?.length) {
    let result = no;
    try {
      result = no.replace(/[\s]/g, '').replace(/(\d{4})(?=\d)/g, '$1 ');
    } catch (error) {
      console.log(error);
    }
    return result;
  } else {
    return '';
  }
};

/**
 * 银行卡展示后四位
 * */

const bankShowAfterFour = (data) => {
  return typeof data === 'string' && data.length && data.length > 4 ? data.substring(data.length - 4) : '';
};

export default {
  formatBankNo,
  bankShowAfterFour
};
