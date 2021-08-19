import { Context, Service } from 'egg';
import type { Code } from '../../lib/error';
import { HTTP_CODE, BIZ_CODE, BizError } from '../../lib/error';

/**
 * Service基类：
 * - 提供通用的基本业务处理方法
 */
class BaseService extends Service {
  /**
   * Repository of this model.
   */
  modelName: string;
  entity: any;

  model: any;
  /**
   * Repository of this connection.
   * @see https://github.com/elixirChain/zing-orm
   */

  /**
   * Common error info.
   */
  HTTP_CODE: typeof HTTP_CODE;
  BIZ_CODE: typeof BIZ_CODE;
  BizError: (message: string, codes?: Code) => typeof BizError;

  constructor(_ctx: Context, _entity: any) {

    if (!_entity) {
      throw Error(`BaseService Error: must provide 'super(_ctx: Context, _entity: any)' !!!`);
    }

    super(_ctx);
    this.modelName = this.constructor.name.substring(0, this.constructor.name.length - 7);
    //todo check this.modelName 是否是 key : _entity
    this.entity = _entity;
    // this.entityClass = this.entity[this.modelName];
    this.model = this.ctx.connection.getRepository(this.entity);
    // TODO: 提示

    this.HTTP_CODE = HTTP_CODE;
    this.BIZ_CODE = BIZ_CODE;
    this.BizError = (message, codes) => {
      // if (process.env.NODE_ENV === 'development') {
      message = `${this.constructor.name} error:` + message;
      // }
      throw new BizError(message, codes);
    };
  }

  /**
   * 增加额外标志
   * - 默认只判断 update or delete
   * @param res 响应
   * @returns 
   */
  addSuccessFlag(res: any) {
    // affected: undefined, null, 0
    let success = true;
    if (!res || !res.affected) {
      success = false;
    }
    return { ...res, success };
  }

}

export { BaseService };
