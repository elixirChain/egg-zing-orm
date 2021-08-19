import { sep } from 'path';
import * as prettier from 'prettier';

declare type DATA_TYPE = 'String' | 'Number' | 'Boolean' | 'Date' | 'Array' | 'Undefined' | 'Null' |
  'Error' | 'Symbol' | 'Function' | 'Math' | 'RegExp' | 'HTMLDocument' | 'global';

export function getModelName(file: string) {
  const filename = file.split(sep).pop() || '';
  return upperFirst(filename.replace(/\.ts$|\.js$/g, ''));
}

export function formatPaths(files: string[]) {
  return files.map(file => {
    const name = getModelName(file);
    file = file.split(sep).join('/');
    
    const importPath = `../${file}`.replace(/\.ts$|\.js$/g, '');
      // .replace('test/fixtures/apps/orm-ts-test/', '');
    return {
      name,
      importPath,
    };
  });
}

export function formatCode(text: string) {
  return prettier.format(text, {
    semi: false,
    tabWidth: 2,
    singleQuote: true,
    parser: 'typescript',
    trailingComma: 'all',
  });
}

/**
 * 大/小驼峰式转下划线
 * @param str 字符串参数
 */
export function underlineCase(str: string) {
  // testTest/TestTest => test_test
  let res = str.replace(/[A-Z]/g, s => `_${ s[0].toLowerCase()}`);
  // 首字母大写
  if (res[0] === '_') {
    res = res.substring(1);
  }
  return res;
}

/**
 * 首字母转小写
 * @param str 字符串参数
 */
export function lowerFirst(str: string) {
  return str[0].toLowerCase() + str.substring(1);
}

/**
 * 首字母转大写
 * @param str 字符串参数
 */
export function upperFirst(str: string) {
  return str[0].toUpperCase() + str.substring(1);
}

/**
 * 小驼峰式
 * @param str 字符串参数
 */
export function lowerCamelize(str: string) {
  // test-test/test_test => testTest
  let res = str.replace(/[_-][a-z]/ig, s => s[1].toUpperCase());
  // user2role => user2Role
  res = res.replace(/[2][a-z]/ig, s => s[0] + s[1].toUpperCase());
  // 保证首字母为小写
  return lowerFirst(res);
}

/**
 * 大驼峰式（即帕斯卡命名法）
 * @param str 字符串参数
 */
export function upperCamelize(str: string) {
  // 小驼峰式
  const res = lowerCamelize(str);
  // 保证首字母为大写
  return upperFirst(res);
}

/**
 * 获取随机字符串
 * - 默认大小写字母和数字
 * @param len 长度 默认32
 * @param extraChr 额外字符串
 * @returns string
 */
export function getRandomStr(len?: number, extraChr?: string) {
  const num = !len ? 32 : len;
  let baseChars = 'ABCDEFJHIJKLMNOPQRSTUVWXYZabcdefjhijklmnopqrstuvwxyz0123456789';
  if (!extraChr) {
    baseChars += extraChr;
  }

  const bLen = baseChars.length;
  let randomStr = '';
  for (let i = 0; i < num; i++) {
    randomStr += baseChars.charAt(Math.floor(Math.random() * bLen));
  }
  return randomStr;
}

/**
 * 脱敏字符串
 * - 小于两位，则脱敏最后一位
 * @param str 字符串
 * @param start 开始位数
 * @param end 结束位数
 * @returns string
 */
export function desensitize(str: string, start: number, end: number) {
  let star = str.length - start - end + 1;
  if (star <= 1) {
    star = 2;
    end = 0;
  }
  return str.substr(0, start) + new Array(star).join('*') + str.substr(str.length - end);
}

// 左补齐
export function padStart(val: any, len: number, chr = '0') {
  if (!val || !len) {
    return val;
  }
  return (Array(len).join(chr) + val).slice(-(!len ? 1 : len));
}

/**
 * 判断合法值（非空）
 * - null, undefined, '', NaN, 0
 * @param val 参数
 * @returns boolean
 */
 export function isValid(val: any) {
  // 判断空白字符(fnrtv)
  if (typeof val === 'string' && val.replace(/(^\s*)|(\s*$)/g, '').length === 0) {
    return false;
  }
  return !(!val && val !== 0 && typeof val !== 'boolean');
}

/**
 * 获取合法值
 * @param val 参数
 * @param defaultValue 指定默认值
 * @returns any
 */
 export function getValid(val: any, defaultValue: any) {
  if (isValid(val)) {
    return val;
  }
  return defaultValue;
}

/**
 * 判断数据类型
 * @param val 参数
 * @param type 判断类型
 * @returns boolean
 */
export function isType(val: any, type: DATA_TYPE) {
  if(typeof val != "object"){
    return (typeof val).toString() === type;
  }
  return Object.prototype.toString.call(val).replace(/^\[object (\S+)\]$/, '$1') === type;
}

/**
 * 获取文件类型
 * - 图片(image), 语音(voice), 视频(video), 普通文件(file）
 * - 钉钉/企业微信接口使用
 * @param fileName 文件名称
 * @returns fileType
 */
export function getFileType(fileName: string) {
  if (!isValid(fileName) || fileName.indexOf('.') === -1) {
    return 'file';
  }
  // 根据后缀判断类型
  let suffix = fileName.substring(fileName.indexOf('.') + 1);
  if (suffix) {
    suffix = suffix.toLowerCase();
  }
  if ('_png_jpg_jpeg_gif_'.indexOf(suffix) !== -1) {
    return 'image';
  } else if ('_wma_mp3_wav_amr_aud_'.indexOf(suffix) !== -1) {
    return 'voice';
  } else if ('_mp4_'.indexOf(suffix) !== -1) {
    return 'video';
  }
  return 'file';
}
