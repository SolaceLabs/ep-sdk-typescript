import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { ApiError, ApplicationDomain, ApplicationDomainResponse, ApplicationDomainsService } from '@solace-iot-team/ep-openapi-node';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EpSdkError } from '../../../src/EpSdkErrors';
import { EpSdkPinoLogger } from '../../lib/EpSdkPinoLogger';
import { EEpSdkLogLevel, EpSdkLogger } from '../../../src/EpSdkLogger';
import { EpSdkConsoleLogger } from '../../../src/EpSdkConsoleLogger';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");


const ApplicationDomainName = `${TestConfig.getAppId()}/misc/${TestUtils.getUUID()}`;
let ApplicationDomainId: string | undefined;

describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should initialize logger with pino`, async () => {
      try {
        const epSdkPinoLogger: EpSdkPinoLogger = new EpSdkPinoLogger(TestConfig.getAppId(), EEpSdkLogLevel.Trace);
        EpSdkLogger.initialize({ epSdkLoggerInstance: epSdkPinoLogger });
        EpSdkLogger.info(EpSdkLogger.createLogEntry(scriptName, { code: 'TEST_INFO', module: scriptName, details: {
          hello: 'world'
        }}));
        // expect(false, TestLogger.createLogMessage('check logging')).to.be.true;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create application domain`, async () => {
      try {
        const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
          requestBody: {
            name: ApplicationDomainName,
          }
        });
        ApplicationDomainId = applicationDomainResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get application domain by name`, async () => {
      try {
        const applicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: ApplicationDomainName });
        // expect(false, TestLogger.createLogMessage('check logging')).to.be.true;
        expect(applicationDomain, TestLogger.createApiTestFailMessage('applicationDomain === undefined')).to.not.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should set default logger`, async () => {
      try {
        const epSdkConsoleLogger: EpSdkConsoleLogger = new EpSdkConsoleLogger(TestConfig.getAppId(), EEpSdkLogLevel.Trace);
        EpSdkLogger.initialize({ epSdkLoggerInstance: epSdkConsoleLogger });
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get application domain by name`, async () => {
      try {
        const applicationDomain: ApplicationDomain | undefined = await EpSdkApplicationDomainsService.getByName({ applicationDomainName: ApplicationDomainName });
        // DEBUG
        // expect(false, TestLogger.createLogMessage('check logging with default logger')).to.be.true;
        expect(applicationDomain, TestLogger.createApiTestFailMessage('applicationDomain === undefined')).to.not.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete application domain by id`, async () => {
      try {
        const applicationDomain: ApplicationDomain = await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
        expect(applicationDomain, TestLogger.createApiTestFailMessage('applicationDomain === undefined')).to.not.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

