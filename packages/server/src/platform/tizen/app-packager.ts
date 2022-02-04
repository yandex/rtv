/**
 * Tizen wgt packager
 */
import path from 'path';
import Loggee from 'loggee';
import { throwIf } from '../../helpers';
import { execCmd } from '../../helpers/cli';
import { parseTable } from '../../helpers/parsers';
import TizenApp from './app';

const logger = Loggee.create('app-packager');

export type TizenPackAppOptions = {
  tizenSecurityProfile?: string;
};

export const packWgtApp = async (inputPath: string, outputPath: string, options: TizenPackAppOptions = {}) => {
  const { appId, appName } = await TizenApp.extractAppInfo(inputPath);
  const outputFile = `${appName}.wgt`;

  const securityProfile = await getSecurityProfile(options.tizenSecurityProfile);
  await deleteOldFiles(inputPath, outputPath);

  const stdout = await execCmd(`tizen package -t wgt -s ${securityProfile} -- ${inputPath} -o ${outputPath}`);

  // tizen cli does not fail in case of non-existing security profile / author certificate.
  // So, check string presence (note typo in word "certficate").
  throwIf(
    !stdout.includes('Author certficate'),
    `Security profile "${securityProfile}" does not have author certificate.`
  );

  const finalWgtFile = `${appId}_${path.basename(inputPath)}.wgt`;
  const pathToFinalWgtFile = path.join(outputPath, finalWgtFile);
  await execCmd(`mv '${path.join(outputPath, outputFile)}' '${pathToFinalWgtFile}'`);
  logger.log(`Rename: ${outputFile} --> ${finalWgtFile}`);

  return pathToFinalWgtFile;
};

async function deleteOldFiles(inputPath: string, outputPath: string) {
  const tempFiles = ['.manifest.tmp', 'author-signature.xml', 'signature1.xml'];
  await execCmd(`rm -f ${tempFiles.map((file) => path.join(inputPath, file)).join(' ')}`);
  await execCmd(`rm -f ${path.join(outputPath, '*.wgt')}`);
}

async function getSecurityProfile(providedSecurityProfile?: string) {
  const securityProfiles = await getTizenSecurityProfiles();
  throwIf(securityProfiles.length === 0, `No security profiles available.`);

  if (providedSecurityProfile) {
    const availableNames = securityProfiles.map((p) => p.name);
    throwIf(
      !availableNames.includes(providedSecurityProfile),
      `Security profile not found: ${providedSecurityProfile}. Available profiles: ${availableNames}`
    );
    return providedSecurityProfile;
  } else {
    const activeSecurityProfile = securityProfiles.find((profile) => profile.active);

    if (!activeSecurityProfile) {
      throw new Error(`No active security profile.`);
    }

    return activeSecurityProfile.name;
  }
}

async function getTizenSecurityProfiles() {
  return parseTable(await execCmd(`tizen security-profiles list`))
    .slice(2)
    .map((row) => ({ name: row[0], active: row[1] === 'O' }));
}
