import s from 'shelljs';
import path from 'path';
// import fs from 'fs';
import { Constants } from './lib/Constants';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const CONSTANTS = new Constants(scriptDir);

const checkVersions = () => {
  const funcName = 'checkVersions';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const getNpmLatestVersion = (packageName: string): string => {
    const latestVersion = s.exec(`npm view ${packageName} version`).stdout.slice(0, -1);
    return latestVersion;
  }

  const checkVersion = (releaseDir: string) => {
    const funcName = 'checkVersions.checkVersion';
    const logName = `${scriptDir}/${scriptName}.${funcName}()`;
    console.log(`${logName}: starting ...`);
  
    const PackageJsonFile = `${releaseDir}/package.json`;
    const PackageJson = require(`${PackageJsonFile}`);
  
    const npmLatestVersion = getNpmLatestVersion(PackageJson.name);
    const newVersion = PackageJson.version;
    console.log(`${PackageJson.name}: npm latest version='${npmLatestVersion}', new version='${newVersion}'`);
    if(newVersion === npmLatestVersion) {
        console.log(`${logName}: [${CONSTANTS.Skipping}]: nothing to do.`);
        process.exit(2);
    }
    console.log(`${logName}: success.`);
  }
  
  // func main
  console.log(`${logName}: starting ...`);
  checkVersion(CONSTANTS.WorkingEpSdkDir);
  console.log(`${logName}: success.`);
}

const publishPackages = () => {
  const funcName = 'publishPackages';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  const publish = (releaseDir: string) => {
    s.cd(`${releaseDir}`);
    // if(s.exec('npm publish --dry-run').code !== 0) process.exit(1);  
    if(s.exec('npm publish').code !== 0) process.exit(1);
  }

  publish(CONSTANTS.WorkingEpSdkDir);

  console.log(`${logName}: success.`);

}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  CONSTANTS.log();

  checkVersions();
  publishPackages()

  console.log(`${logName}: success.`);
}

main();
