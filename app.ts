import { Application } from 'egg';
var { Connection } = require('zing-orm');
import { loadInstance } from './lib/entity';

export const hasTsLoader = (typeof require.extensions['.ts'] === 'function');

export default async (app: Application) => {
  //todo joi check, zing-orm should export joi schema
  const config = app.config.zingorm;
  if (!config) {
    throw new Error('[egg-zing-orm] Config of zingorm is needed.');
  }

  app.beforeStart(async () => {
    try {
      // Load zingorm query instance. entity
      const fileExt = hasTsLoader ? '*.ts' : '*.js';
      await loadInstance(app, fileExt);
      // Load config and connect to Database.
      const config = app.config.zingorm;
      if (Object.prototype.toString.call(config) === '[object Object]') {
        if (!app.context.connection) {
          app.context.connection = await new Connection({
            type: config.type,
            user: config.user,
            password: config.password,
            host: config.host,
            port: config.port,
            database: config.database,
            extraOptions: config.extraOptions,
          });
          if (!!app.context.connection.connection) {
            app.logger.info('[egg-zing-orm] Successfully connected to the database.');
          } else {
            app.logger.error('[egg-zing-orm] Failed to connected to the database.');
          }
        } else {
          app.logger.info('[egg-zing-orm] app.context.connection has already been initialized.');
        }
      } else if (Array.isArray(config)) {
        if (!app.context.connections) {
          app.context.connections = {};
          for (let i = 0; i < config.length; i++) {
            let name = config[i].name;
            app.context.connections[name] = await new Connection({
              type: config[i].type,
              user: config[i].user,
              password: config[i].password,
              host: config[i].host,
              port: config[i].port,
              database: config[i].database,
              extraOptions: config[i].extraOptions,
            });
            if (!!app.context.connections[name].connection) {
              app.logger.info(`[egg-zing-orm] Successfully connected to the database: ${name}`);
            } else {
              app.logger.error(`[egg-zing-orm] Failed to connected to the database: ${name}`);
            }
          }
        } else {
          app.logger.info('[egg-zing-orm] app.context.connections has already been initialized.');
        }
      } else {
        app.logger.error('[egg-zing-orm] Config error, please check it!');
      }


    } catch (e) {
      app.logger.error('[egg-zing-orm] Error connecting to the database:', e);
    }
  })

  app.beforeClose(async () => {
    try {
      await app.context.connection.closeConnection();
      app.logger.info('[egg-zing-orm] Successfully close the database.');
    } catch (e) {
      app.logger.error('[egg-zing-orm] Error close the database:', e);
    }
  })

}
