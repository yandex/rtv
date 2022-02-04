/**
 * Handles uploaded files.
 */

import path from 'path';
import fs from 'fs-extra';
import unzipper from 'unzipper';
import { values as config } from '../config';

export const extractZipToTempDir = async function (zipPath: string) {
  const destPath = path.join(config.workDirPath, path.basename(zipPath, '.zip'));
  await fs.emptyDir(destPath);
  await fs
    .createReadStream(zipPath)
    .pipe(unzipper.Extract({ path: destPath }))
    .promise();

  await fs.remove(zipPath);
  return destPath;
};
