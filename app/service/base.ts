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
  options: any;
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

  constructor(_ctx: Context, _entity: any, _options: any) {

    if (!_entity) {
      console.warn(`BaseService Error: dbService must provide 'super(_ctx: Context, _entity: any)' !!!`);
    }

    super(_ctx);
    // not use this.modelName
    this.modelName = this.constructor.name.substring(0, this.constructor.name.length - 7);
    //todo check this.modelName 是否是 key : _entity
    this.options = _options;
    this.entity = _entity;
    // this.entityClass = this.entity[this.modelName];
    if (!!_entity) {
      if (!!_options && !!_options.connectionName) {
        if (!!this.ctx.connections && this.ctx.connections[_options.connectionName]) {
          this.model = this.ctx.connections[_options.connectionName].getRepository(this.entity);
        } else {
          throw Error(`BaseService Error: this.ctx.connections[${_options.connectionName}] is undefined!!!`);
        }
      } else {
        if (!!this.ctx.connection) {
          this.model = this.ctx.connection.getRepository(this.entity);
        } else {
          throw Error(`BaseService Error: this.ctx.connection is undefined!!!`);
        }
      }
    }
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
