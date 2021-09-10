import type { Application } from 'egg';
import { join } from 'path';
import { find } from 'fs-jetpack';
import * as fs from 'fs-extra';

export async function loadInstance(app: Application, matching: string) {
  const { baseDir } = app;
  const entityDir = join(baseDir, 'app', 'entity');

  if (!fs.existsSync(entityDir)) {
    app.logger.error('[egg-zing-orm] Error: Entity dir is not found in app dir.');
    return;
  }
  const files = find(entityDir, { matching });
  try {
    for (const file of files) {
      const entityPath = join(baseDir, file);
      console.log('entityPath: ', entityPath);
      import(entityPath);
    }
  } catch (e) {
    app.logger.error('[egg-zing-orm] [loadInstance] ERROR:', e);
  }
}
