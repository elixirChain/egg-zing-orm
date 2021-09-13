import { Application } from 'egg';
var { Connection } = require('zing-orm');
import { loadInstance } from './lib/entity';

export const hasTsLoader = (typeof require.extensions['.ts'] === 'function');

export default async (app: Application) => {
  //todo joi check 
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
      if (Object.prototype.toString.call(config) === '[Object Object]') {
        if (!app.context.connection) {
          app.context.connection = await new Connection(config);
          app.logger.info('[egg-zing-orm] Successfully connected to the database.');
        } else {
          app.logger.info('[egg-zing-orm] app.context.connection has already been initialized.');
        }
      } else if (Array.isArray(config)) {
        if (!app.context.connections) {
          for (let i = 0; i < config.length; i++) {
            let name = config[i];
            app.context.connections[name] = await new Connection(config[i]);
            app.logger.info(`[egg-zing-orm] Successfully connected to the database: ${name}.`);
          }
        } else {
          app.logger.info('[egg-zing-orm] app.context.connections has already been initialized.');
        }
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
