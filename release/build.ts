import s from 'shelljs';
import path from 'path';
import { Constants } from './lib/Constants';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

const CONSTANTS = new Constants(scriptDir);

const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  if(s.rm('-rf', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.mkdir('-p', `${CONSTANTS.WorkingDir}/resources`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const copySourcesToWorkingDir = () => {
  const funcName = 'copySourcesToWorkingDir';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);

  console.log(`${logName}: copying ep-sdk sources to working dir ...`);
  if(s.cp('-rf', CONSTANTS.EpSdkDir, CONSTANTS.WorkingDir).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.WorkingEpSdkDir}/dist`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.WorkingEpSdkDir}/node_modules`).code !== 0) process.exit(1);
  if(s.rm('-rf', `${CONSTANTS.WorkingEpSdkDir}/src/sep-openapi-node`).code !== 0) process.exit(1);
  
  // copy the spec file
  const specFile = "/sep-openapi-spec.json";
  if(s.cp('-L', `${CONSTANTS.EpSdkResourcesDir}/sep-openapi-spec.json`, `${CONSTANTS.WorkingDir}/resources`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const devBuild = () => {
  const funcName = 'devBuild';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  s.cd(`${CONSTANTS.WorkingEpSdkDir}`);
  console.log(`${logName}: directory = ${s.exec(`pwd`)}`);
  if(s.exec('npm install').code !== 0) process.exit(1);
  if(s.exec('npm run dev:build').code !== 0) process.exit(1);
  if(s.cd(`${scriptDir}`).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

// const copyAssets = () => {
//   const funcName = 'copyAssets';
//   const logName = `${scriptDir}/${scriptName}.${funcName}()`;

//   const copySrcs = (srcDir: string, outDir: string) => {
//     console.log(`${logName}: copy ${srcDir}`);
//     if(s.rm('-rf', `${outDir}`).code !== 0) process.exit(1);
//     if(s.mkdir('-p', outDir).code !== 0) process.exit(1);
//     if(s.cp('-r', `${srcDir}/*`, `${outDir}`).code !== 0) process.exit(1);  
//   }

//   const SrcDirBrowser: string = `${CONSTANTS.WorkingApimServerDir}/src/@solace-iot-team/apim-server-openapi-browser`;
//   const OutDirBrowser: string = `${CONSTANTS.ReleaseDirBrowser}/src`;
//   const SrcDirNode: string = `${CONSTANTS.WorkingApimServerDir}/src/@solace-iot-team/apim-server-openapi-node`;
//   const OutDirNode: string = `${CONSTANTS.ReleaseDirNode}/src`;

//   console.log(`${logName}: starting ...`);

//   copySrcs(SrcDirBrowser, OutDirBrowser);
//   copySrcs(SrcDirNode, OutDirNode);

//   console.log(`${logName}: success.`);
// }

const compileSrcs = () => {
  const funcName = 'compileSrcs';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;

  s.cd(`${CONSTANTS.WorkingEpSdkDir}`);
  if(s.rm('-rf', `./dist`).code !== 0) process.exit(1);
  if(s.exec('npx tsc').code !== 0) process.exit(1);

  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  CONSTANTS.log();
  
  prepare();
  copySourcesToWorkingDir();
  devBuild();
  // copyAssets();
  compileSrcs();

  console.log(`${logName}: success.`);
}

main();
