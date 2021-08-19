import { Application } from 'egg';
var { Connection } = require('zing-orm');

export default async (app: Application) => {
  const config = app.config.zingorm;
  if (!config) {
    throw new Error('[egg-zing-orm] Config of zingorm is needed.');
  }

  app.beforeStart(async () => {
    try {

      // Load config and connect to Database.
      const options = app.config.zingorm;
      app.context.connection = await await new Connection(options);
      app.logger.info('[egg-zing-orm] Successfully connected to the database.');
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
