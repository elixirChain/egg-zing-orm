import { Context, EggAppConfig, EggAppInfo, PowerPartial } from 'egg';
import { BIZ_CODE, BizError } from '../lib/error';

export default (app: EggAppInfo) => {

  const config = {} as PowerPartial<EggAppConfig>;

  // config for DB
  config.typeorm = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'dba_test',
    password: '123456',
    database: 'test',
    synchronize: false,
    logging: false,
    entities: [ 'app/entity/**/*.ts' ],
    cli: {
      entitiesDir: 'app/entity',
    },
  };

  // use for cookie sign key, should change to your own and keep security
  config.keys = app.name + '_1580572800001_0420';

  // onerror 主要处理全局异常，即未捕获异常
  function convertError(err: BizError, ctx: Context) {
    // 打印错误请求信息
    ctx.logger.error(`@PARAM: ${JSON.stringify(ctx.request.query)} @PARAM: ${JSON.stringify(ctx.request.body)}`);
    // 转换错误格式
    return {
      status: !err.httpCode ? ctx.status : err.httpCode,
      errorRes: {
        code: !err.code ? BIZ_CODE.FAIL : err.code,
        name: err.name,
        msg: err.message,
        timestamp: err.timestamp,
      },
    };
  }
  // onerror 配置
  config.onerror = {
    // 针对所有响应类型的错误处理方法，配置all后其他类型处理失效
    json(err: BizError, ctx: Context) {
      const { status, errorRes } = convertError(err, ctx);
      ctx.status = status;
      ctx.body = errorRes;
    },
    html(err: BizError, ctx: Context) {
      const { status, errorRes } = convertError(err, ctx);
      ctx.status = status;
      ctx.body = JSON.stringify(errorRes);
    },
  };

  return config;
};
