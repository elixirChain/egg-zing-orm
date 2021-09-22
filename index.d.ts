/// <reference types="node" />
import 'egg';
import 'egg-onerror';
import 'egg-session';
import 'egg-i18n';
import 'egg-watcher';
import 'egg-multipart';
import 'egg-security';
import 'egg-development';
import 'egg-logrotator';
import 'egg-schedule';
import 'egg-static';
import 'egg-jsonp';
import 'egg-view';
import accepts = require('accepts');
import EggCookies = require('egg-cookies');
import KoaApplication = require('koa');
import KoaRouter = require('koa-router');
import { EventEmitter } from 'events'
import { Readable } from 'stream';
import { Socket } from 'net';
import { IncomingMessage, ServerResponse } from 'http';
import { HttpClient, RequestOptions2 as RequestOptions } from 'urllib';
import {
  EggCoreBase,
  FileLoaderOption,
  EggLoader as CoreLoader,
  EggCoreOptions as CoreOptions,
  EggLoaderOptions as CoreLoaderOptions,
  BaseContextClass as CoreBaseContextClass,
} from 'egg-core';
import { EggLogger as Logger, EggLoggers, LoggerLevel as EggLoggerLevel, EggLoggersOptions, EggLoggerOptions, EggContextLogger } from 'egg-logger';
import {
  DeepPartial,
  FindConditions,
  FindManyOptions,
  FindOneOptions,
  ObjectID,
  ObjectLiteral,
  QueryRunner,
  Repository,
  SaveOptions,
  UpdateResult,
  DeleteResult,
  OrderByCondition,
} from 'typeorm';
import { AnySchema } from 'joi';

declare type DATA_TYPE = 'String' | 'Number' | 'Boolean' | 'Date' | 'Array' | 'Undefined' | 'Null' |
  'Error' | 'Symbol' | 'Function' | 'Math' | 'RegExp' | 'HTMLDocument' | 'global';
declare type HTTP_CODE =
  /* 1xx informational response */
  /* 2xx success */
  'SUCCESS_OK' | 'SUCCESS_CREATED' | 'SUCCESS_ACCEPTED' |
  // 不常用
  'NON_AUTHORITATIVE_INFORMATION' | 'NO_CONTENT' | 'RESET_CONTENT' | 'PARTIAL_CONTENT' |
  /* 3xx redirection */
  /* 4xx client errors */
  'CLIENT_BAD_REQUEST' | 'CLIENT_UNAUTHORIZED' | 'CLIENT_FORBIDDEN' | 'CLIENT_NOT_FOUND' |
  'CLIENT_METHOD_NOT_ALLOWED' | 'CLIENT_NOT_ACCEPTABLE' | 'CLIENT_PAYLOAD_TOO_LARGE' |
  /* 5xx server errors */
  'SERVER_INTERNAL_SERVER_ERROR' |
  // 不常用
  'NOT_IMPLEMENTED' | 'BAD_GATEWAY' | 'SERVICE_UNAVAILABLE' | 'GATEWAY_TIMEOUT' | 'HTTP_VERSION_NOT_SUPPORTED';
declare type HTTP_CODE_MESSAGE = { 200: '请求成功' } |
{ 201: '数据操作成功' } |
{ 202: '任务已经接受' } |
{ 203: '非权威内容' } |
{ 204: '请求已处理，无响应内容' } |
{ 205: '请求已处理，需重置内容' } |
{ 400: '异常请求' } |
{ 401: '未登录或者过期' } |
{ 403: '没有操作权限' } |
{ 404: '未找到资源' } |
{ 405: '请求方法错误' } |
{ 406: '响应格式不匹配' } |
{ 413: '请求内容过大' } |
{ 500: '服务器异常' } |
{ 502: '网关错误' } |
{ 501: '未实现' } |
{ 503: '服务不可用' } |
{ 504: '网关超时' } |
{ 505: '协议版本不支持' };
declare type BIZ_CODE = 'FAIL' | 'SUCCESS';
declare type Code = { httpCode?: number; bizCode?: number; };
declare type OprValue = '!=' | '<' | '<=' | '>' | '>=' | '=' | '<>' | 'not in' | '!<>' |
  'not between' | 'not' | 'lessThan' | 'lessThanOrEqual' | 'moreThan' | 'moreThanOrEqual' |
  'equal' | 'between' | 'in' | 'any' | 'isNull' | 'iLike' | 'like' | 'raw';
declare type AdvanceCondition = {
  [key: string]: {
    opr: OprValue,
    val: any,
  };
};
declare type CriteriaParam<T> = string | string[] | number | number[] | Date | Date[] | ObjectID | ObjectID[] | FindConditions<T>;
declare type ListParam<T> = FindConditions<T>[] | FindConditions<T> | ObjectLiteral | string | FindManyOptions<T>;

/**
 * 分页参数
 * - current 默认 1
 * - pageSize 默认 10
 */
declare type PageParam = {
  current?: number;
  pageSize?: number;
  sort?: OrderByCondition;
};
// 成功标志
declare type SuccessFlag = {
  success: boolean;
};
// 分页对象
declare type PageProps<Entity> = {
  // Optional
  totalPage: number;
  current: number;
  pageSize: number;
  // Required
  total: number;
  data: Entity[];
  // AntD table required
  success: boolean;
};

declare module 'egg-zing-orm' {
  export type EggLogger = Logger;
  // plain object
  type PlainObject<T = any> = { [key: string]: T };

  // Remove specific property from the specific class
  type RemoveSpecProp<T, P> = Pick<T, Exclude<keyof T, P>>;

  export interface EggHttpClient extends HttpClient<RequestOptions> { }
  interface EggHttpConstructor {
    new(app: Application): EggHttpClient;
  }

  export interface EggContextHttpClient extends HttpClient<RequestOptions> { }
  interface EggContextHttpClientConstructor {
    new(ctx: Context): EggContextHttpClient;
  }

  /**
   * BaseContextClass is a base class that can be extended,
   * it's instantiated in context level,
   * {@link Helper}, {@link Service} is extending it.
   */
  export class BaseContextClass extends CoreBaseContextClass<Context, Application, EggAppConfig, IService> { // tslint:disable-line
    /**
     * logger
     */
    protected logger: EggLogger;
  }

  export class Boot {
    /**
     * logger
     * @member {EggLogger}
     */
    protected logger: EggLogger;

    /**
     * The configuration of application
     * @member {EggAppConfig}
     */
    protected config: EggAppConfig;

    /**
     * The instance of agent
     * @member {Agent}
     */
    protected agent: Agent;

    /**
     * The instance of app
     * @member {Application}
     */
    protected app: Application;
  }

  export type RequestArrayBody = any[];
  export type RequestObjectBody = PlainObject;
  export interface Request extends KoaApplication.Request { // tslint:disable-line
    /**
     * detect if response should be json
     * 1. url path ends with `.json`
     * 2. response type is set to json
     * 3. detect by request accept header
     *
     * @member {Boolean} Request#acceptJSON
     * @since 1.0.0
     */
    acceptJSON: boolean;

    /**
     * Request remote IPv4 address
     * @member {String} Request#ip
     * @example
     * ```js
     * this.request.ip
     * => '127.0.0.1'
     * => '111.10.2.1'
     * ```
     */
    ip: string;

    /**
     * Get all pass through ip addresses from the request.
     * Enable only on `app.config.proxy = true`
     *
     * @member {Array} Request#ips
     * @example
     * ```js
     * this.request.ips
     * => ['100.23.1.2', '201.10.10.2']
     * ```
     */
    ips: string[];

    protocol: string;

    /**
     * get params pass by querystring, all value are Array type. {@link Request#query}
     * @member {Array} Request#queries
     * @example
     * ```js
     * GET http://127.0.0.1:7001?a=b&a=c&o[foo]=bar&b[]=1&b[]=2&e=val
     * this.queries
     * =>
     * {
     *   "a": ["b", "c"],
     *   "o[foo]": ["bar"],
     *   "b[]": ["1", "2"],
     *   "e": ["val"]
     * }
     * ```
     */
    queries: PlainObject<string[]>;

    /**
     * get params pass by querystring, all value are String type.
     * @member {Object} Request#query
     * @example
     * ```js
     * GET http://127.0.0.1:7001?name=Foo&age=20&age=21
     * this.query
     * => { 'name': 'Foo', 'age': 20 }
     *
     * GET http://127.0.0.1:7001?a=b&a=c&o[foo]=bar&b[]=1&b[]=2&e=val
     * this.query
     * =>
     * {
     *   "a": "b",
     *   "o[foo]": "bar",
     *   "b[]": "1",
     *   "e": "val"
     * }
     * ```
     */
    query: PlainObject<string>;

    body: any;
  }

  export interface Response extends KoaApplication.Response { // tslint:disable-line
    /**
     * read response real status code.
     *
     * e.g.: Using 302 status redirect to the global error page
     * instead of show current 500 status page.
     * And access log should save 500 not 302,
     * then the `realStatus` can help us find out the real status code.
     * @member {Number} Context#realStatus
     */
    realStatus: number;
  }

  export type LoggerLevel = EggLoggerLevel;

  /**
   * egg app info
   * @example
   * ```js
   * // config/config.default.ts
   * import { EggAppInfo } from 'egg';
   *
   * export default (appInfo: EggAppInfo) => {
   *   return {
   *     keys: appInfo.name + '123456',
   *   };
   * }
   * ```
   */
  export interface EggAppInfo {
    pkg: any; // package.json
    name: string; // the application name from package.json
    baseDir: string; // current directory of application
    env: EggEnvType; // equals to serverEnv
    HOME: string; // home directory of the OS
    root: string; // baseDir when local and unittest, HOME when other environment
  }

  type IgnoreItem = string | RegExp | ((ctx: Context) => boolean);
  type IgnoreOrMatch = IgnoreItem | IgnoreItem[];

  /** logger config of egg */
  export interface EggLoggerConfig extends RemoveSpecProp<EggLoggersOptions, 'type'> {
    /** custom config of coreLogger */
    coreLogger?: Partial<EggLoggerOptions>;
    /** allow debug log at prod, defaults to true */
    allowDebugAtProd?: boolean;
    /** disable logger console after app ready. defaults to `false` on local and unittest env, others is `true`. */
    disableConsoleAfterReady?: boolean;
  }

  /** Custom Loader Configuration */
  export interface CustomLoaderConfig extends RemoveSpecProp<FileLoaderOption, 'inject' | 'target'> {
    /**
     * an object you wanner load to, value can only be 'ctx' or 'app'. default to app
     */
    inject?: 'ctx' | 'app';
    /**
     * whether need to load files in plugins or framework, default to false
     */
    loadunit?: boolean;
  }

  export interface HttpClientBaseConfig {
    /** Whether use http keepalive */
    keepAlive?: boolean;
    /** Free socket after keepalive timeout */
    freeSocketKeepAliveTimeout?: number;
    /** Free socket after request timeout */
    freeSocketTimeout?: number;
    /** Request timeout */
    timeout?: number;
    /** Determines how many concurrent sockets the agent can have open per origin */
    maxSockets?: number;
    /** The maximum number of sockets that will be left open in the free state */
    maxFreeSockets?: number;
  }

  /** HttpClient config */
  export interface HttpClientConfig extends HttpClientBaseConfig {
    /** http.Agent */
    httpAgent?: HttpClientBaseConfig;
    /** https.Agent */
    httpsAgent?: HttpClientBaseConfig;
    /** Default request args for httpClient */
    request?: RequestOptions;
    /** Whether enable dns cache */
    enableDNSCache?: boolean;
    /** Enable proxy request, default is false. */
    enableProxy?: boolean;
    /** proxy agent uri or options, default is null. */
    proxy?: string | { [key: string]: any };
    /** DNS cache lookup interval */
    dnsCacheLookupInterval?: number;
    /** DNS cache max age */
    dnsCacheMaxLength?: number;
  }

  export interface EggAppConfig {
    workerStartTimeout: number;
    baseDir: string;
    middleware: string[];

    /**
     * The option of `bodyParser` middleware
     *
     * @member Config#bodyParser
     * @property {Boolean} enable - enable bodyParser or not, default to true
     * @property {String | RegExp | Function | Array} ignore - won't parse request body when url path hit ignore pattern, can not set `ignore` when `match` presented
     * @property {String | RegExp | Function | Array} match - will parse request body only when url path hit match pattern
     * @property {String} encoding - body encoding config, default utf8
     * @property {String} formLimit - form body size limit, default 1mb
     * @property {String} jsonLimit - json body size limit, default 1mb
     * @property {String} textLimit - json body size limit, default 1mb
     * @property {Boolean} strict - json body strict mode, if set strict value true, then only receive object and array json body
     * @property {Number} queryString.arrayLimit - from item array length limit, default 100
     * @property {Number} queryString.depth - json value deep length, default 5
     * @property {Number} queryString.parameterLimit - paramter number limit ,default 1000
     * @property {string[]} enableTypes - parser will only parse when request type hits enableTypes, default is ['json', 'form']
     * @property {any} extendTypes - support extend types
     */
    bodyParser: {
      enable: boolean;
      encoding: string;
      formLimit: string;
      jsonLimit: string;
      textLimit: string;
      strict: boolean;
      queryString: {
        arrayLimit: number;
        depth: number;
        parameterLimit: number;
      };
      ignore: IgnoreOrMatch;
      match: IgnoreOrMatch;
      enableTypes: string[];
      extendTypes: {
        json: string[];
        form: string[];
        text: string[];
      };
    };

    /**
     * logger options
     * @member Config#logger
     * @property {String} dir - directory of log files
     * @property {String} encoding - log file encoding, defaults to utf8
     * @property {String} level - default log level, could be: DEBUG, INFO, WARN, ERROR or NONE, defaults to INFO in production
     * @property {String} consoleLevel - log level of stdout, defaults to INFO in local serverEnv, defaults to WARN in unittest, defaults to NONE else wise
     * @property {Boolean} disableConsoleAfterReady - disable logger console after app ready. defaults to `false` on local and unittest env, others is `true`.
     * @property {Boolean} outputJSON - log as JSON or not, defaults to false
     * @property {Boolean} buffer - if enabled, flush logs to disk at a certain frequency to improve performance, defaults to true
     * @property {String} errorLogName - file name of errorLogger
     * @property {String} coreLogName - file name of coreLogger
     * @property {String} agentLogName - file name of agent worker log
     * @property {Object} coreLogger - custom config of coreLogger
     * @property {Boolean} allowDebugAtProd - allow debug log at prod, defaults to true
     */
    logger: EggLoggerConfig;

    /** custom logger of egg */
    customLogger: {
      [key: string]: EggLoggerOptions;
    };

    /** Configuration of httpClient in egg. */
    httpClient: HttpClientConfig;

    development: {
      /**
       * dirs needed watch, when files under these change, application will reload, use relative path
       */
      watchDirs: string[];
      /**
       * dirs don't need watch, including subdirectories, use relative path
       */
      ignoreDirs: string[];
      /**
       * don't wait all plugins ready, default is true.
       */
      fastReady: boolean;
      /**
       * whether reload on debug, default is true.
       */
      reloadOnDebug: boolean;
      /**
       * whether override default watchDirs, default is false.
       */
      overrideDefault: boolean;
      /**
       * whether to reload, use https://github.com/sindresorhus/multimatch
       */
      reloadPattern: string[] | string;
    };

    /**
     * customLoader config
     */
    customLoader: {
      [key: string]: CustomLoaderConfig;
    };

    /**
     * It will ignore special keys when dumpConfig
     */
    dump: {
      ignore: Set<string>;
    };

    /**
     * The environment of egg
     */
    env: EggEnvType;

    /**
     * The current HOME directory
     */
    HOME: string;

    hostHeaders: string;

    /**
     * I18n options
     */
    i18n: {
      /**
       * default value EN_US
       */
      defaultLocale: string;
      /**
       * i18n resource file dir, not recommend to change default value
       */
      dir: string;
      /**
       * custom the locale value field, default `query.locale`, you can modify this config, such as `query.lang`
       */
      queryField: string;
      /**
       * The locale value key in the cookie, default is locale.
       */
      cookieField: string;
      /**
       * Locale cookie expire time, default `1y`, If pass number value, the unit will be ms
       */
      cookieMaxAge: string | number;
    };

    /**
     * Detect request' ip from specified headers, not case-sensitive. Only worked when config.proxy set to true.
     */
    ipHeaders: string;

    /**
     * jsonp options
     * @member Config#jsonp
     * @property {String} callback - jsonp callback method key, default to `_callback`
     * @property {Number} limit - callback method name's max length, default to `50`
     * @property {Boolean} csrf - enable csrf check or not. default to false
     * @property {String|RegExp|Array} whiteList - referrer white list
     */
    jsonp: {
      limit: number;
      callback: string;
      csrf: boolean;
      whiteList: string | RegExp | Array<string | RegExp>;
    };

    /**
     * The key that signing cookies. It can contain multiple keys separated by .
     */
    keys: string;

    /**
     * The name of the application
     */
    name: string;

    /**
     * package.json
     */
    pkg: any;

    rundir: string;

    security: {
      domainWhiteList: string[];
      protocolWhiteList: string[];
      defaultMiddleware: string;
      csrf: any;
      xframe: {
        enable: boolean;
        value: 'SAMEORIGIN' | 'DENY' | 'ALLOW-FROM';
      };
      hsts: any;
      methodnoallow: { enable: boolean };
      noopen: { enable: boolean; }
      xssProtection: any;
      csp: any;
    };

    siteFile: PlainObject<string | Buffer>;

    watcher: PlainObject;

    onClientError(err: Error, socket: Socket, app: EggApplication): ClientErrorResponse | Promise<ClientErrorResponse>;

    /**
     * server timeout in milliseconds, default to 2 minutes.
     *
     * for special request, just use `ctx.req.setTimeout(ms)`
     *
     * @see https://nodejs.org/api/http.html#http_server_timeout
     */
    serverTimeout: number | null;

    [prop: string]: any;
  }

  export interface ClientErrorResponse {
    body: string | Buffer;
    status: number;
    headers: { [key: string]: string };
  }

  export interface Router extends KoaRouter<any, Context> {
    /**
     * restful router api
     */
    resources(name: string, prefix: string, ...middleware: any[]): Router;

    /**
     * @param {String} name - Router name
     * @param {Object} params - more parameters
     * @example
     * ```js
     * router.url('edit_post', { id: 1, name: 'foo', page: 2 })
     * => /posts/1/edit?name=foo&page=2
     * router.url('posts', { name: 'foo&1', page: 2 })
     * => /posts?name=foo%261&page=2
     * ```
     * @return {String} url by path name and query params.
     * @since 1.0.0
     */
    url(name: string, params: any): any;
  }

  export interface EggApplication extends EggCoreBase<EggAppConfig> { // tslint:disable-line
    /**
     * HttpClient instance
     */
    httpClient: EggHttpClient;

    /**
     * Logger for Application, wrapping app.coreLogger with context information
     *
     * @member {ContextLogger} Context#logger
     * @since 1.0.0
     * @example
     * ```js
     * this.logger.info('some request data: %j', this.request.body);
     * this.logger.warn('WARNING!!!!');
     * ```
     */
    logger: EggLogger;

    /**
     * core logger for framework and plugins, log file is $HOME/logs/{appName}/egg-web
     */
    coreLogger: EggLogger;

    /**
     * All loggers contain logger, coreLogger and customLogger
     */
    loggers: EggLoggers;

    /**
     * messenger instance
     */
    messenger: Messenger;

    /**
     * get router
     */
    router: Router;

    /**
     * create a singleton instance
     */
    addSingleton(name: string, create: any): void;

    runSchedule(schedulePath: string): Promise<any>;

    /**
     * http request helper base on httpClient, it will auto save httpClient log.
     * Keep the same api with httpClient.request(url, args).
     * See https://github.com/node-modules/urllib#api-doc for more details.
     */
    curl: EggHttpClient['request'];

    /**
     * Get logger by name, it's equal to app.loggers['name'], but you can extend it with your own logical
     */
    getLogger(name: string): EggLogger;

    /**
     * print the information when console.log(app)
     */
    inspect(): any;

    /**
     * Alias to Router#url
     */
    url(name: string, params: any): any;

    /**
     * Create an anonymous context, the context isn't request level, so the request is mocked.
     * then you can use context level API like `ctx.service`
     * @member {String} EggApplication#createAnonymousContext
     * @param {Request} req - if you want to mock request like querystring, you can pass an object to this function.
     * @return {Context} context
     */
    createAnonymousContext(req?: Request): Context;

    /**
     * export context base classes, let framework can impl sub class and over context extend easily.
     */
    ContextCookies: typeof EggCookies;
    ContextLogger: typeof EggContextLogger;
    ContextHttpClient: EggContextHttpClientConstructor;
    HttpClient: EggHttpConstructor;
    Subscription: typeof Subscription;
    Controller: typeof Controller;
    Service: typeof Service;
    /** lcj */
    BaseController: typeof BaseController;
    BaseService: typeof BaseService;
  }

  // compatible
  export class EggApplication {
    constructor(options?: CoreOptions);
  }

  export type RouterPath = string | RegExp;

  export class Application extends EggApplication {
    /**
     * global locals for view
     * @see Context#locals
     */
    locals: IApplicationLocals;

    /**
     * HTTP get method
     */
    get(path: RouterPath, fn: string): void;
    get(path: RouterPath, ...middleware: any[]): void;

    /**
     * HTTP post method
     */
    post(path: RouterPath, fn: string): void;
    post(path: RouterPath, ...middleware: any[]): void;

    /**
     * HTTP put method
     */
    put(path: RouterPath, fn: string): void;
    put(path: RouterPath, ...middleware: any[]): void;

    /**
     * HTTP patch method
     */
    patch(path: RouterPath, fn: string): void;
    patch(path: RouterPath, ...middleware: any[]): void;

    /**
     * HTTP delete method
     */
    delete(path: RouterPath, fn: string): void;
    delete(path: RouterPath, ...middleware: any[]): void;

    /**
     * restful router api
     */
    resources(name: string, prefix: string, fn: string): Router;
    resources(path: string, prefix: string, ...middleware: any[]): Router;

    redirect(path: string, redirectPath: string): void;

    controller: IController;

    middleware: KoaApplication.Middleware[] & IMiddleware;

    /**
     * Run async function in the background
     * @see Context#runInBackground
     * @param {Function} scope - the first args is an anonymous ctx
     */
    runInBackground(scope: (ctx: Context) => void): void;
  }

  export interface IApplicationLocals extends PlainObject { }

  export interface FileStream extends Readable { // tslint:disable-line
    fields: any;

    filename: string;

    fieldname: string;

    mime: string;

    mimeType: string;

    transferEncoding: string;

    encoding: string;

    truncated: boolean;
  }

  interface GetFileStreamOptions {
    requireFile?: boolean; // required file submit, default is true
    defCharset?: string;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    checkFile?(
      fieldname: string,
      file: any,
      filename: string,
      encoding: string,
      mimetype: string
    ): void | Error;
  }

  /**
  * KoaApplication's Context will carry the default 'cookie' property in
  * the egg's Context interface, which is wrong here because we have our own
  * special properties (e.g: encrypted). So we must remove this property and
  * create our own with the same name.
  * @see https://github.com/eggjs/egg/pull/2958
  *
  * However, the latest version of Koa has "[key: string]: any" on the
  * context, and there well be a type error for "keyof koa.Context".
  * So we have to directly inherit from "KoaApplication.BaseContext" and
  * rewrite all the properties to be compatible with types in Koa.
  * @see https://github.com/eggjs/egg/pull/3329
  */
  export interface Context extends KoaApplication.BaseContext {
    [key: string]: any;

    app: Application;

    // properties of koa.Context
    req: IncomingMessage;
    res: ServerResponse;
    originalUrl: string;
    respond?: boolean;

    service: IService;

    request: Request;

    response: Response;

    // The new 'cookies' instead of Koa's.
    cookies: EggCookies;

    helper: IHelper;

    /**
     * Resource Parameters
     * @example
     * ##### ctx.params.id {string}
     *
     * `GET /api/users/1` => `'1'`
     *
     * ##### ctx.params.ids {Array<String>}
     *
     * `GET /api/users/1,2,3` => `['1', '2', '3']`
     *
     * ##### ctx.params.fields {Array<String>}
     *
     * Expect request return data fields, for example
     * `GET /api/users/1?fields=name,title` => `['name', 'title']`.
     *
     * ##### ctx.params.data {Object}
     *
     * Tht request data object
     *
     * ##### ctx.params.page {Number}
     *
     * Page number, `GET /api/users?page=10` => `10`
     *
     * ##### ctx.params.per_page {Number}
     *
     * The number of every page, `GET /api/users?per_page=20` => `20`
     */
    params: any;

    /**
     * @see Request#accept
     */
    queries: PlainObject<string[]>;

    /**
     * @see Request#accept
     */
    accept: accepts.Accepts;

    /**
     * @see Request#acceptJSON
     */
    acceptJSON: boolean;

    /**
     * @see Request#ip
     */
    ip: string;

    /**
     * @see Response#realStatus
     */
    realStatus: number;

    /**
     * Set the ctx.body.data value
     *
     * @member {Object} Context#data=
     * @example
     * ```js
     * ctx.data = {
     *   id: 1,
     *   name: 'fol'
     * };
     * ```
     *
     * will get response
     *
     * ```js
     * HTTP/1.1 200 OK
     *
     * {
     *   "data": {
     *     "id": 1,
     *     "name": "fol"
     *   }
     * }
     * ```
     */
    data: any;

    /**
     * set ctx.body.meta value
     *
     * @example
     * ```js
     * ctx.meta = {
     *   count: 100
     * };
     * ```
     * will get response
     *
     * ```js
     * HTTP/1.1 200 OK
     *
     * {
     *   "meta": {
     *     "count": 100
     *   }
     * }
     * ```
     */
    meta: any;

    /**
     * locals is an object for view, you can use `app.locals` and `ctx.locals` to set variables,
     * which will be used as data when view is rendering.
     * The difference between `app.locals` and `ctx.locals` is the context level, `app.locals` is global level, and `ctx.locals` is request level. when you get `ctx.locals`, it will merge `app.locals`.
     *
     * when you set locals, only object is available
     *
     * ```js
     * this.locals = {
     *   a: 1
     * };
     * this.locals = {
     *   b: 1
     * };
     * this.locals.c = 1;
     * console.log(this.locals);
     * {
     *   a: 1,
     *   b: 1,
     *   c: 1,
     * };
     * ```
     *
     * `ctx.locals` has cache, it only merges `app.locals` once in one request.
     *
     * @member {Object} Context#locals
     */
    locals: IApplicationLocals & IContextLocals;

    /**
     * alias to {@link locals}, compatible with koa that use this variable
     */
    state: any;

    /**
     * Logger for Application, wrapping app.coreLogger with context information
     *
     * @member {ContextLogger} Context#logger
     * @since 1.0.0
     * @example
     * ```js
     * this.logger.info('some request data: %j', this.request.body);
     * this.logger.warn('WARNING!!!!');
     * ```
     */
    logger: EggLogger;

    /**
     * Get logger by name, it's equal to app.loggers['name'], but you can extend it with your own logical
     */
    getLogger(name: string): EggLogger;

    /**
     * Request start time
     */
    starttime: number;

    /**
     * http request helper base on httpClient, it will auto save httpClient log.
     * Keep the same api with httpClient.request(url, args).
     * See https://github.com/node-modules/urllib#api-doc for more details.
     */
    curl: EggHttpClient['request'];

    __(key: string, ...values: string[]): string;
    gettext(key: string, ...values: string[]): string;

    /**
     * get upload file stream
     * @example
     * ```js
     * const stream = await this.getFileStream();
     * // get other fields
     * console.log(stream.fields);
     * ```
     * @method Context#getFileStream
     * @param {Object} options
     * @return {ReadStream} stream
     * @since 1.0.0
     */
    getFileStream(options?: GetFileStreamOptions): Promise<FileStream>;

    /**
     * @see Response.redirect
     */
    redirect(url: string, alt?: string): void;

    httpClient: EggContextHttpClient;
  }

  export interface IContextLocals extends PlainObject { }

  export class Controller extends BaseContextClass { }

  export class Service extends BaseContextClass { }

  export class Subscription extends BaseContextClass { }

  /** egg-zing-orm */
  export class BaseController extends Controller {
    /**
     * 统一公共调用方法
     * @param {object} params 参数
     * @param {object} paramsSchema 参数校验Joi对象
     * @param {string} methodName 方法名称
     * @param {object} resultSchema 结果校验Joi对象
     * @return {object} result 原始dao响应对象
     */
    protected callService(params?: any, paramsSchema?: AnySchema, methodName?: string, resultSchema?: AnySchema, serviceName?: string): any;

    /**
     * 默认 统一处理响应结果（可自定义）
     * - 接口会自动过滤掉 undefined 的属性，则转换为 null
     * @param res 参数
     */
    protected success(res: any): any;
  }

  export class BaseService<Entity extends ObjectLiteral> extends Service {
    /**
     * Repository of this model.
     */
    modelName: string;
    model: Repository<Entity>;
    /**
      * Repository of this connection.
      * @see https://github.com/typeorm/typeorm#using-repositories
      */
    repo: { [key: string]: Repository<any> };
    OPR: { [key: string]: any };
    FIND_OPTIONS_KEYS: string[];

    /**
      * Common error info.
      */
    HTTP_CODE: { [key in HTTP_CODE]: number };
    BIZ_CODE: { [key in BIZ_CODE]: number };
    BizError: (message: string, codes?: Code) => any;

    /**
     * Utils API
     */

    /**
     * 唯一性校验
     * - 必须使用 await 调用
     * - 支持排除当前 id
     * - 至少一个属性不为空才判断重复
     * @param params 校验参数对象
     * @param message 提示信息（不传则使用默认值）
     */
    protected checkUnique(params: FindConditions<Entity>, message: string): void;

    /**
     * Executes raw SQL query and returns raw database results
     */
    protected query(sql: string, params?: any[], runner?: QueryRunner): Promise<any>;

    /**
     * Base API
     * - Default api, should overwrite if need.
     * - Others use repo, model or manager to implement.
     */
    //  protected save<T extends DeepPartial<Entity>>(entity: T, options?: SaveOptions): Promise<T & Entity & SuccessFlag>;
    protected save<T extends DeepPartial<Entity>>(entity: T, options?: SaveOptions): Promise<{
      success: boolean;
      data: T & Entity & SuccessFlag;
    }>;;
    protected get(id: string | number | Date | ObjectID, options?: FindOneOptions<Entity>): Promise<Entity>;
    protected getOne(conditions?: FindConditions<Entity> | ObjectLiteral, options?: FindOneOptions<Entity>): Promise<Entity>;
    protected getListByIds(ids: any[], options?: FindConditions<Entity> | FindManyOptions<Entity> | ObjectLiteral): Promise<Entity[]>;

    /**
      * Find with pagination and condition.
      */
    protected getPage(params?: PageParam & ListParam<Entity>, dataFunc?: (arg: Entity[]) => void): Promise<PageProps<Entity>>;

    /**
     * Update with id only (not use criteria).
     * @param params param
     * @param params.id primary key
     * @param params.partialEntity new data
     */
    protected updateMix(params: DeepPartial<Entity> | any): Promise<UpdateResult & SuccessFlag>;
    protected update(criteria: CriteriaParam<Entity>, partialEntity: DeepPartial<Entity>): Promise<UpdateResult & SuccessFlag>;

    protected delete(criteria: CriteriaParam<Entity>): Promise<DeleteResult & SuccessFlag>;

    // protected saveList<T extends DeepPartial<Entity>>(entities: T[], options?: SaveOptions): Promise<(T & Entity & SuccessFlag)[]>;
    protected saveList<T extends DeepPartial<Entity>>(entities: T[], options?: SaveOptions): Promise<{
      success: boolean;
      data: (T & Entity & SuccessFlag)[];
    }>;

    /**
     * 查询列表
     * @param params 参数
     * @param dataFunc 数据处理函数
     * @returns 
     */
    protected getList(conditions?: ListParam<Entity>, dataFunc?: (arg: Entity[]) => void): Promise<Entity[]>;

    /**
     * Update with ids only (not use criteria).
     * @param params param
     * @param params.id primary key
     * @param params.partialEntity new data
     */
    protected updateListMix(params: { ids: any[] } & (DeepPartial<Entity> | any)): Promise<UpdateResult & SuccessFlag>;
    protected updateList(criteria: CriteriaParam<Entity>, partialEntity: DeepPartial<Entity>): Promise<UpdateResult & SuccessFlag>;

    protected deleteList(criteria: CriteriaParam<Entity>): Promise<DeleteResult & SuccessFlag>;

    /**
    * Utils function.
    */

    /**
     * 转换 Find*Options
     * @param params 查询条件
     * @returns 
     */
    getOptions(params: any): any;

    /**
      * 转换条件
      * @param params 查询条件
      * @returns 
      */
    getWhere(params: any): any;

    /**
      * 转换排序条件
      * - 合并 order 和 sort（AntD 默认）参数
      * @param params 
      * @returns 
      */
    getOrders(params: any): any;

    // 合并参数
    combineParams(first: any, second: any): any;

    /**
      * deal mix params
      * @param params 参数
      */
    getAndDelete(params: any, label: string, defaultValue?: any): any;
  }

  /**
   * 工具类
   */
  export class BaseError {
    protected code: number;
    protected name: string;
    constructor(message: string, code?: number);
  }
  export class BizError extends BaseError {
    protected httpCode: number;
    protected timestamp: number;
    constructor(message: string, codes: Code);
  }
  export const ErrorUtils: {
    HTTP_CODE: { [key in HTTP_CODE]: number };
    HTTP_CODE_MESSAGE: HTTP_CODE_MESSAGE;
    BIZ_CODE: { [key in BIZ_CODE]: number };

    /**
     * base error object
     */
    BaseError: typeof BaseError;
    /**
     * Business error object
     */
    BizError: typeof BizError;
  }

  export type Batch = (_obj: any, _fn: any) => any;
  export const ObjectUtils: {
    batch: Batch,
    modifyValues: (_obj: any, _fn: (arg0: any) => any) => any,

    /**
     * 判断空对象
     * - null 或者 {}
     * - 没有一个合法属性(allFlag: false/undefined) 或 有一个非法属性(allFlag: true)
     * @param obj 参数
     * @param allFlag 判断属性标志
     * @returns boolean
     */
    isEmptyObject: (obj: any, allFlag?: boolean) => boolean;

    /**
     * 判断空数组
     * - null, undefined 或者 空数组,
     * - 数据元素全部为非法;
     * @param arr 数组对象
     * @returns boolean
     */
    isEmptyArray: (arr: any) => boolean;

    /**
     * 对象数组 转 指定属性的值的数组
     * @param arrayList 对象数组 [{}]
     * @param key 对象属性
     * @returns array
     */
    getValuesByKey: (arrayList: any[], key: string) => any[];

    /**
     * 对象数组 转 指定属性的值的 map
     * @param arrayList 对象数组 [{}]
     * @param key 对象属性
     * @returns object
     */
    getMapByKey: (arrayList: any[], key: string | number) => object;

    /**
     * 转换list[{parent_[attr], [attr]}] 为 树结构数据
     * @param dataList 边表节点数组
     * @param rootAttrValue 根节点（如果未指定则返回分类列表）
     * @param attr 属性值，默认 id
     * @returns any
     */
    convertListToTree: (dataList: any[], rootAttrValue: string | number, attr?: string) => any;
  };

  export const StringUtils: {
    getModelName: (file: string) => string;
    formatPaths: (files: string[]) => {
      name: string;
      importPath: string;
    };
    formatCode: (text: string) => any;

    /**
     * 大/小驼峰式转下划线
     * @param str 字符串参数
     */
    underlineCase: (str: string) => string;
    /**
     * 首字母转小写
     * @param str 字符串参数
     */
    lowerFirst: (str: string) => string;
    /**
     * 首字母转大写
     * @param str 字符串参数
     */
    upperFirst: (str: string) => string;
    /**
     * 小驼峰式
     * @param str 字符串参数
     */
    lowerCamelize: (str: string) => string;
    /**
     * 大驼峰式（即帕斯卡命名法）
     * @param str 字符串参数
     */
    upperCamelize: (str: string) => string;

    /**
     * 随机字符串
     * - 默认大小写字母和数字
     * @param len 长度 默认32
     * @param extraChr 额外字符串
     * @returns string
     */
    getRandomStr: (len?: number, extraChr?: string) => string;

    /**
     * 脱敏字符串
     * - 小于两位，则脱敏最后一位
     * @param str 字符串
     * @param start 开始位数
     * @param end 结束位数
     * @returns string
     */
    desensitize: (str: string, start: number, end: number) => string;

    /**
     * 左补齐
     * @param val 原值，默认为 ''
     * @param len 位数，默认 1
     * @param chr 补位字符，默认‘0’
     * @returns string
     */
    padStart: (val: any, len: number, chr?: string) => string;

    /**
    * 判断合法值（非空）
    * - 非 null, undefined, '', NaN, 0
    * @param val 参数
    * @returns boolean
    */
    isValid: (val: any) => boolean;

    /**
     * 获取合法值
     * @param val 参数
     * @param defaultValue 指定默认值
     * @returns any
     */
    getValid: (val: any, defaultValue: any) => any;

    /**
     * 判断数据类型
     * @param val 参数
     * @param type 判断类型
     * @returns boolean
     */
    isType: (val: any, type: DATA_TYPE) => boolean;

    /**
     * 获取文件类型
     * - 图片(image), 语音(voice), 视频(video), 普通文件(file）
     * - 钉钉/企业微信接口使用
     * @param fileName 文件名称
     * @returns fileType
     */
    getFileType: (fileName: string) => string;
  }

  /**
   * The empty interface `IService` is a placeholder, for egg
   * to auto injection service to ctx.service
   *
   * @example
   *
   * import { Service } from 'egg';
   * class FooService extends Service {
   *   async bar() {}
   * }
   *
   * declare module 'egg' {
   *   export interface IService {
   *     foo: FooService;
   *   }
   * }
   *
   * Now I can get ctx.service.foo at controller and other service file.
   */
  export interface IService extends PlainObject { } // tslint:disable-line

  export interface IController extends PlainObject { } // tslint:disable-line

  export interface IDao extends PlainObject { } // tslint:disable-line

  export interface IMiddleware extends PlainObject { } // tslint:disable-line

  export interface IHelper extends PlainObject, BaseContextClass {
    /**
     * Generate URL path(without host) for route. Takes the route name and a map of named params.
     * @method Helper#pathFor
     * @param {String} name - Router Name
     * @param {Object} params - Other params
     *
     * @example
     * ```js
     * app.get('home', '/index.htm', 'home.index');
     * ctx.helper.pathFor('home', { by: 'recent', limit: 20 })
     * => /index.htm?by=recent&limit=20
     * ```
     * @return {String} url path(without host)
     */
    pathFor(name: string, params?: PlainObject): string;

    /**
     * Generate full URL(with host) for route. Takes the route name and a map of named params.
     * @method Helper#urlFor
     * @param {String} name - Router name
     * @param {Object} params - Other params
     * @example
     * ```js
     * app.get('home', '/index.htm', 'home.index');
     * ctx.helper.urlFor('home', { by: 'recent', limit: 20 })
     * => http://127.0.0.1:7001/index.htm?by=recent&limit=20
     * ```
     * @return {String} full url(with host)
     */
    urlFor(name: string, params?: PlainObject): string;
  }

  // egg env type
  export type EggEnvType = 'local' | 'unittest' | 'prod' | string;

  /**
   * plugin config item interface
   */
  export interface IEggPluginItem {
    env?: EggEnvType[];
    path?: string;
    package?: string;
    enable?: boolean;
  }

  export type EggPluginItem = IEggPluginItem | boolean;

  /**
   * build-in plugin list
   */
  export interface EggPlugin {
    [key: string]: EggPluginItem | undefined;
    onerror?: EggPluginItem;
    session?: EggPluginItem;
    i18n?: EggPluginItem;
    watcher?: EggPluginItem;
    multipart?: EggPluginItem;
    security?: EggPluginItem;
    development?: EggPluginItem;
    logrotator?: EggPluginItem;
    schedule?: EggPluginItem;
    static?: EggPluginItem;
    jsonp?: EggPluginItem;
    view?: EggPluginItem;
  }

  /**
   * Singleton instance in Agent Worker, extend {@link EggApplication}
   */
  export class Agent extends EggApplication {
  }

  export interface ClusterOptions {
    /** specify framework that can be absolute path or npm package */
    framework?: string;
    /** directory of application, default to `process.cwd()` */
    baseDir?: string;
    /** customized plugins, for unittest */
    plugins?: object | null;
    /** numbers of app workers, default to `os.cpus().length` */
    workers?: number;
    /** listening port, default to 7001(http) or 8443(https) */
    port?: number;
    /** https or not */
    https?: boolean;
    /** ssl key */
    key?: string;
    /** ssl cert */
    cert?: string;
    [prop: string]: any;
  }

  export function startCluster(options: ClusterOptions, callback: (...args: any[]) => any): void;

  export interface StartOptions {
    /** specify framework that can be absolute path or npm package */
    framework?: string;
    /** directory of application, default to `process.cwd()` */
    baseDir?: string;
    /** ignore single process mode warning */
    ignoreWarning?: boolean;
  }

  export function start(options?: StartOptions): Promise<Application>

  /**
   * Powerful Partial, Support adding ? modifier to a mapped property in deep level
   * @example
   * import { PowerPartial, EggAppConfig } from 'egg';
   *
   * // { view: { defaultEngines: string } } => { view?: { defaultEngines?: string } }
   * type EggConfig = PowerPartial<EggAppConfig>
   */
  export type PowerPartial<T> = {
    [U in keyof T]?: T[U] extends object
    ? PowerPartial<T[U]>
    : T[U]
  };

  // send data can be number|string|boolean|object but not Set|Map
  export interface Messenger extends EventEmitter {
    /**
     * broadcast to all agent/app processes including itself
     */
    broadcast(action: string, data: any): void;

    /**
     * send to agent from the app,
     * send to an random app from the agent
     */
    sendRandom(action: string, data: any): void;

    /**
     * send to specified process
     */
    sendTo(pid: number, action: string, data: any): void;

    /**
     * send to agent from the app,
     * send to itself from the agent
     */
    sendToAgent(action: string, data: any): void;

    /**
     * send to all app including itself from the app,
     * send to all app from the agent
     */
    sendToApp(action: string, data: any): void;
  }

  // compatible
  export interface EggLoaderOptions extends CoreLoaderOptions { }
  export interface EggLoader extends CoreLoader { }

  /**
   * App worker process Loader, will load plugins
   * @see https://github.com/eggjs/egg-core
   */
  export class AppWorkerLoader extends CoreLoader {
    loadConfig(): void;
    load(): void;
  }

  /**
   * Agent worker process loader
   * @see https://github.com/eggjs/egg-loader
   */
  export class AgentWorkerLoader extends CoreLoader {
    loadConfig(): void;
    load(): void;
  }

  export interface IBoot {
    /**
     * Ready to call configDidLoad,
     * Config, plugin files are referred,
     * this is the last chance to modify the config.
     */
    configWillLoad?(): void;

    /**
     * Config, plugin files have loaded
     */
    configDidLoad?(): void;

    /**
     * All files have loaded, start plugin here
     */
    didLoad?(): Promise<void>;

    /**
     * All plugins have started, can do some thing before app ready
     */
    willReady?(): Promise<void>;

    /**
     * Worker is ready, can do some things,
     * don't need to block the app boot
     */
    didReady?(): Promise<void>;

    /**
     * Server is listening
     */
    serverDidReady?(): Promise<void>;

    /**
     * Do some thing before app close
     */
    beforeClose?(): Promise<void>;
  }

  export interface Singleton<T> {
    get(id: string): T;
  }

  /**
   * egg-multipart
   */

  interface EggFile {
    field: string;
    filename: string;
    encoding: string;
    mime: string;
    filepath: string;
  }

  interface MultipartOptions {
    requireFile?: boolean; // required file submit, default is true
    defCharset?: string;
    limits?: {
      fieldNameSize?: number;
      fieldSize?: number;
      fields?: number;
      fileSize?: number;
      files?: number;
      parts?: number;
      headerPairs?: number;
    };
    checkFile?(
      fieldname: string,
      file: any,
      filename: string,
      encoding: string,
      mimetype: string
    ): void | Error;
  }

  interface MultipartFileStream extends Readable {
    fields: any;
    filename: string;
    fieldname: string;
    mime: string;
    mimeType: string;
    transferEncoding: string;
    encoding: string;
    truncated: boolean;
  }

  interface ScheduleOptions {
    type?: string;
    cron?: string;
    cronOptions?: {
      tz?: string;
      utc?: boolean;
      iterator?: boolean;
      currentDate?: string | number | Date;
      endDate?: string | number | Date;
    };
    interval?: number | string;
    immediate?: boolean;
    disable?: boolean;
    env?: string[];
  }

  // egg 
  interface Context {
    /**
     * clean up request tmp files helper
     * @param {EggFile[]} files file paths need to clenup, default is `ctx.request.files`.
     * @return {Promise<void>}
     */
    cleanupRequestFiles(files?: EggFile[]): Promise<void>;

    /**
     * save request multipart data and files to `ctx.request`
     * @return {Promise<void>}
     */
    saveRequestFiles(): Promise<void>;

    /**
     * create multipart.parts instance, to get separated files.
     * @param {MultipartOptions} options
     * @return {Function} return a function which return a Promise
     */
    multipart(options?: MultipartOptions): (fn?: Function) => Promise<any>;

    /**
     * get upload file stream
     * @param {MultipartOptions} options
     * @return {Promise<MultipartFileStream>}
     */
    getFileStream(options?: MultipartOptions): Promise<MultipartFileStream>
  }

  interface Request {
    /**
     * Files Object Array
     */
    files: EggFile[];
  }

  type MatchItem = string | RegExp | ((ctx: Context) => boolean);

  interface EggAppConfig {
    multipart: {
      mode?: string;
      fileModeMatch?: MatchItem | MatchItem[];
      autoFields?: boolean;
      defaultCharset?: string;
      fieldNameSize?: number;
      fieldSize?: string | number;
      fields?: number;
      fileSize?: string | number;
      files?: number;
      whitelist?: ((filename: string) => boolean) | string[];
      fileExtensions?: string[];
      tmpdir?: string;
      cleanSchedule?: ScheduleOptions;
    }
  }
}
