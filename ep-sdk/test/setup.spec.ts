import "mocha";
import path from 'path';
import { expect } from 'chai';
import { TestLogger } from "./lib/TestLogger";
import TestConfig from "./lib/TestConfig";
import { TestContext } from "./lib/TestContext";
import { EpSdkClient } from "../src/EpSdkClient";
import { EpSdkConsoleLogger } from "../src/EpSdkConsoleLogger";
import { EEpSdkLogLevel, EpSdkLogger } from "../src/EpSdkLogger";

// load test stub
const x = require('./lib/TestStub');

// ensure any unhandled exception cause exit = 1
function onUncaught(err: any){
  console.log(err);
  process.exit(1);
}
process.on('unhandledRejection', onUncaught);

const scriptName: string = path.basename(__filename);
const scriptDir: string = path.dirname(__filename);

TestLogger.setLogging(true);
TestLogger.logMessage(scriptName, ">>> initializing ...");

before(async() => {
  TestContext.newItId();
});

after(async() => {
  TestContext.newItId();
  // put general cleanup code here if required
});

describe(`${scriptName}`, () => {
  context(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize test config & logger`, async () => {
      try {
        TestConfig.initialize();
        const epSdkConsoleLogger: EpSdkConsoleLogger = new EpSdkConsoleLogger(TestConfig.getAppId(), EEpSdkLogLevel.Trace);
        EpSdkLogger.initialize({ epSdkLoggerInstance: epSdkConsoleLogger });
      } catch (e) {
        expect(false, TestLogger.createTestFailMessageForError('intitializing test config failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should initialize EP client`, async () => {
      try {
        EpSdkClient.initialize({
          token: TestConfig.getSolaceCloudToken(),
          baseUrl: TestConfig.getConfig().epBaseUrl,
        });
      } catch (e) {
        expect(false, TestLogger.createTestFailMessageForError('initializing ep client', e)).to.be.true;
      }
    });

  });
});

