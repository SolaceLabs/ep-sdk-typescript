import s from 'shelljs';
import path from 'path';
import fs from 'fs';

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

// files & dirs
const EP_OPENAPI_NODE_SRC_DIR = "./node_modules/@solace-labs/ep-openapi-node";
const EP_OPENAPI_NODE_DEST_DIR = "./src/@solace-labs/ep-openapi-node";
const EP_OPENAPI_NODE_DEST_TS_CONFIG_FILE = `${EP_OPENAPI_NODE_DEST_DIR}/dist/tsconfig.json`;
const EP_OPENAPI_NODE_DEST_TS_CONFIG_CONTENT = `
{
  "compilerOptions": {
    "declaration": true,
    "target": "es5",
    "module": "commonjs",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "composite": true,
    "rootDir": "."
  }
}
`;
const EP_SDK_CLIENT_FILE = './src/utils/EpSdkClient.ts';
const EP_SDK_CLIENT_BACKUP_FILE = './src/utils/EpSdkClient.ts.backup';


const prepare = () => {
  const funcName = 'prepare';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: cleaning ${EP_OPENAPI_NODE_DEST_DIR} ...`);
  if(s.rm('-rf', EP_OPENAPI_NODE_DEST_DIR).code !== 0) process.exit(1);
  if(s.mkdir('-p', EP_OPENAPI_NODE_DEST_DIR).code !== 0) process.exit(1);
  console.log(`${logName}: success.`);
}

const buildOpenApiDir = () => {
  const funcName = 'buildOpenApiDir';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  // copy node_modules/@solace-labs/ep-openapi-node/dist to src/@solace-labs/ep-openapi-node/dist
  console.log(`${logName}: copy ${EP_OPENAPI_NODE_SRC_DIR} ...`);
  if(s.cp('-rf', `${EP_OPENAPI_NODE_SRC_DIR}/*`, `${EP_OPENAPI_NODE_DEST_DIR}`).code !== 0) process.exit(1);
  // write tsconfig
  console.log(`${logName}: write ${EP_OPENAPI_NODE_DEST_TS_CONFIG_FILE} ...`);
  fs.writeFileSync(EP_OPENAPI_NODE_DEST_TS_CONFIG_FILE, EP_OPENAPI_NODE_DEST_TS_CONFIG_CONTENT);  
  console.log(`${logName}: success.`);
}

const modifySources4TsDocs = () => {
  const funcName = 'modifySources4TsDocs';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  // create backup file
  const code = s.cp(EP_SDK_CLIENT_FILE, EP_SDK_CLIENT_BACKUP_FILE).code;
  if(code !== 0) throw new Error(`${logName}: code=${code}`);
  // load file to string
  const epSdkClientBuffer: Buffer = fs.readFileSync(EP_SDK_CLIENT_FILE);
  const epSdkClientString: string = epSdkClientBuffer.toString('utf-8');
  // replace @solace-labs/ep-openapi-node with ../@solace-labs/ep-openapi-node
  const newEpSdkClientString: string = epSdkClientString.replace('@solace-labs/ep-openapi-node', '../@solace-labs/ep-openapi-node');
  fs.writeFileSync(EP_SDK_CLIENT_FILE, newEpSdkClientString);  
  console.log(`${logName}: success.`);
}

const runTypedoc = () => {
  const funcName = 'runTypedoc';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  const code = s.exec(`npx typedoc`).code;
  if(code !== 0) throw new Error(`${logName}: code=${code}`);
  console.log(`${logName}: success.`);
}

const undoModifySources4TsDocs = () => {
  const funcName = 'undoModifySources4TsDocs';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  console.log(`${logName}: starting ...`);
  // mv original back
  const code = s.mv(EP_SDK_CLIENT_BACKUP_FILE, EP_SDK_CLIENT_FILE).code;
  if(code !== 0) throw new Error(`${logName}: mv(${EP_SDK_CLIENT_BACKUP_FILE}, ${EP_SDK_CLIENT_FILE}) failed - fix manually`);
  console.log(`${logName}: success.`);
}

const main = () => {
  const funcName = 'main';
  const logName = `${scriptDir}/${scriptName}.${funcName}()`;
  prepare();
  buildOpenApiDir();
  let error: any | undefined = undefined;
  try {
    modifySources4TsDocs();
    runTypedoc();
  } catch(e) {
    error = e;
    console.error(`${logName}: error = ${e}`);
  } finally {
    undoModifySources4TsDocs();
    if(error) throw error;
  }
}

main();
