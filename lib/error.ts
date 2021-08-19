export const HTTP_CODE = {
  /* 1xx informational response */
  /* 2xx success */
  SUCCESS_OK: 200,
  SUCCESS_CREATED: 201,
  SUCCESS_ACCEPTED: 202,
  NON_AUTHORITATIVE_INFORMATION:  203,
  NO_CONTENT:  204,
  RESET_CONTENT:  205,
  PARTIAL_CONTENT:  206,
  /* 3xx redirection */
  /* 4xx client errors */
  CLIENT_BAD_REQUEST: 400,
  CLIENT_UNAUTHORIZED: 401,
  CLIENT_FORBIDDEN: 403,
  CLIENT_NOT_FOUND: 404,
  CLIENT_METHOD_NOT_ALLOWED: 405,
  CLIENT_NOT_ACCEPTABLE: 406,
  CLIENT_PAYLOAD_TOO_LARGE: 413,
  /* 5xx server errors */
  SERVER_INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED:  501,
  BAD_GATEWAY:  502,
  SERVICE_UNAVAILABLE:  503,
  GATEWAY_TIMEOUT:  504,
  HTTP_VERSION_NOT_SUPPORTED:  505,
};

export const HTTP_CODE_MESSAGE = {
  200: '请求成功',
  201: '数据操作成功',
  202: '任务已经接受',
  203: '非权威内容', // 比如：代理收到成功响应，返回了修改后的响应，即响应非原始
  204: '请求已处理，无响应内容',
  205: '请求已处理，需重置内容',
  400: '异常请求',
  401: '未登录或者过期',
  403: '没有操作权限',
  404: '未找到资源',
  405: '请求方法错误',
  406: '响应格式不匹配',
  413: '请求内容过大',
  500: '服务器异常',
  502: '网关错误',
  501: '未实现', // 比如：Web 服务器太旧，未实现请求的 method
  503: '服务不可用',
  504: '网关超时',
  505: '协议版本不支持',
};

export const BIZ_CODE = {
  /* 默认 */
  FAIL: -1,
  SUCCESS: 0,
  /** 自定义业务 code */
};

/**
 * Base error object
 */
 export class BaseError extends Error {
  // custom error code
  code: number;
  // default error name
  name: string;

  constructor(message: string, code?: number) {
    super(message);
    this.code = code;
    this.name = this.constructor.name;
  }
}

/**
 * Business error object
 */
export declare type Code = { httpCode?: number; bizCode?: number; };
export class BizError extends BaseError {
  // http status code
  httpCode: number;
  // error timestamp (milliseconds)
  timestamp: number;

  constructor(message: string, codes: Code) {
    if (!codes) {
      codes = {};
    }
    let { httpCode, bizCode } = codes;
    // default ok
    if (!httpCode) {
      httpCode = HTTP_CODE.SUCCESS_OK;
    }
    // default or not ok, then fail
    if (!bizCode || httpCode !== HTTP_CODE.SUCCESS_OK) {
      bizCode = BIZ_CODE.FAIL;
    }

    super(message, bizCode);
    this.httpCode = httpCode;
    this.timestamp = new Date().getTime();
  }
}
