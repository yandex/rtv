/**
 * webOS ipk packager
 */
import path from 'path';
import fs from 'fs-extra';
import { execCmd } from '../../helpers/cli';
import { WebosPackAppOptions } from '.';

export const packIpkApp = async (
  inputPath: string,
  outputPath: string,
  { resolution, noMinify = false }: WebosPackAppOptions
) => {
  const appInfo = await fs.readFile(`${inputPath}/appinfo.json`, 'utf8');
  const { id, version } = JSON.parse(appInfo);

  const outputFile = `${outputPath}/${id}_${version}_all.ipk`;
  await patchAppInfoFile(`${inputPath}/appinfo.json`, { resolution });
  await execCmd(`ares-package -o ${outputPath} ${noMinify ? '-n' : ''} ${inputPath}`);

  // appId_1.1.0_all.ipk -> appId_1.1.0_1280x720_bdb9d744-3685-43d7-b0e0-cdaa12f1e745.ipk
  const finalIpkFile = outputFile.replace(
    /_all\.ipk$/,
    `_${resolution}${noMinify ? '_n' : ''}_${path.basename(inputPath)}.ipk`
  );
  await execCmd(`mv ${outputFile} ${finalIpkFile}`);

  return finalIpkFile;
};

async function patchAppInfoFile(filepath: string, patch: Record<string, unknown>) {
  try {
    const file = await fs.readFile(filepath, 'utf8');
    const appInfo = JSON.parse(file);
    await fs.writeFile(filepath, JSON.stringify({ ...appInfo, ...patch }, null, ' '));
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Cannot patch appinfo file: ${error.message}`);
    }
    throw error;
  }
}
