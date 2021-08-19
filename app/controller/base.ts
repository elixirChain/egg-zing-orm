import { Context, Controller } from 'egg';
import { AnySchema } from 'joi';
import type { Code } from '../../lib/error';
import { HTTP_CODE, BIZ_CODE, BizError } from '../../lib/error';

/**
 * controller基类：
 * - 禁掉this.service访问，避免业务混乱;
 * - 提供统一的公共调用方法this.callService：校验参数和响应，传递参数;
 * - 提供this.success处理响应结果;
 */
class BaseController extends Controller {
  modelName: string;
  /**
   * Common error info.
   */
  HTTP_CODE: typeof HTTP_CODE;
  BIZ_CODE: typeof BIZ_CODE;
  BizError: (message: string, codes?: Code) => typeof BizError;

  /**
   * Call the service only with the same module name.
   */
  callService: (params?: any, paramsSchema?: AnySchema, methodName?: string, resultSchema?: AnySchema) => Promise<any>;

  constructor(_ctx: Context) {
    super(_ctx);
    this.modelName = this.constructor.name[0].toLowerCase() + this.constructor.name.substring(1, this.constructor.name.length - 10);
    this.HTTP_CODE = HTTP_CODE;
    this.BIZ_CODE = BIZ_CODE;
    this.BizError = (message, codes) => {
      if (process.env.NODE_ENV === 'development') {
        message = `${this.constructor.name} error:` + message;
      }
      throw new BizError(message, codes);
    };

    /**
     * Only use callService instead!
     */
    this.service = undefined;
    // this.ctx.repo = undefined;
    // this.ctx.connection = undefined;

    /**
     * 统一公共调用方法
     * @param {object} params 参数
     * @param {object} paramsSchema 参数校验Joi对象
     * @param {string} methodName 方法名称
     * @param {object} resultSchema 结果校验Joi对象
     * @return {object} result 原始dao响应对象
     */
    this.callService = async (params, paramsSchema, methodName, resultSchema) => {
      // controller 验证参数
      if (paramsSchema) {
        const { error } = paramsSchema.validate(params);
        if (!!error) {
          throw this.BizError('参数错误：' + error.message, { httpCode: this.HTTP_CODE.CLIENT_BAD_REQUEST });
        }
      }

      // 默认调用 controller 同名函数
      let newMethodName = methodName;
      if (!newMethodName) {
        newMethodName = this.ctx.request.path.split('/').slice(-1)[0];
      }
      const result = await this.ctx.service[this.modelName][newMethodName](params);
      // controller 验证响应结果
      if (resultSchema) {
        const { error } = resultSchema.validate(result);
        if (!!error) {
          throw this.BizError('结果错误：' + error.message, { httpCode: this.HTTP_CODE.SERVER_INTERNAL_SERVER_ERROR });
        }
      }
      return result;
    };
  }

  /**
   * 默认 统一处理响应结果（可自定义）
   * - 接口会自动过滤掉 undefined 的属性，则转换为 null
   * @param res 参数
   */
  success(res: any) {
    // 统一响应结构
    return {
      code: 0,
      data: !res ? null : res,
    };
  }

}

export { BaseController };
