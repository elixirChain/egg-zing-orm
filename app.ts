import { Application } from 'egg';
var { Connection } = require('zing-orm');
import { loadInstance } from './lib/entity';

export const hasTsLoader = (typeof require.extensions['.ts'] === 'function');

export default async (app: Application) => {
  const config = app.config.zingorm;
  if (!config) {
    throw new Error('[egg-zing-orm] Config of zingorm is needed.');
  }

  app.beforeStart(async () => {
    try {
      // Load typeorm query instance.
      const fileExt = hasTsLoader ? '*.ts' : '*.js';
      await loadInstance(app, fileExt);
      // Load config and connect to Database.
      const options = app.config.zingorm;
      if (!app.context.connection) {
        app.context.connection = await new Connection(options);
        app.logger.info('[egg-zing-orm] Successfully connected to the database.');
      } else {
        app.logger.info('[egg-zing-orm] app.context.connection has already been initialized.');
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
