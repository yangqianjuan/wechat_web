import CryptoJS from 'crypto-js';
const key = CryptoJS.enc.Utf8.parse('1234123412ABCDEF'); //十六位十六进制数作为密钥
const iv = CryptoJS.enc.Utf8.parse('ABCDEF1234123412'); //十六位十六进制数作为密钥偏移量

/**
 * AES 解密
 * @param String
 */
const AES_Decrypt = str => {
  let base64 = CryptoJS.enc.Base64.parse(str);
  let src = CryptoJS.enc.Base64.stringify(base64);
  var decrypt = CryptoJS.AES.decrypt(src, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  var decryptedStr = decrypt.toString(CryptoJS.enc.Utf8);
  return decryptedStr.toString();
};

/**
 * AES 加密
 * @param String
 */
const AES_Encrypt = str => {
  if (str instanceof Object) {
    str = JSON.stringify(str);
  }
  let srcs = CryptoJS.enc.Utf8.parse(str);
  var encrypted = CryptoJS.AES.encrypt(srcs, key, {
    iv: iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });
  return CryptoJS.enc.Base64.stringify(encrypted.ciphertext);
};

export const aesUtil = {
  // 加密函數
  encrypt: AES_Encrypt,
  // 解密函數
  decrypt: AES_Decrypt
};
