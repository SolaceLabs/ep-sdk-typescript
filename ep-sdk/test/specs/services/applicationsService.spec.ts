import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { ApiError, ApplicationDomainResponse, ApplicationDomainsService, Application, ApplicationResponse, ApplicationsService } from '@solace-labs/ep-openapi-node';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import EpSdkApplicationsService from '../../../src/services/EpSdkApplicationsService';
import { EpSdkError, EpSdkServiceError } from '../../../src/utils/EpSdkErrors';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const ApplicationName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
let ApplicationId: string | undefined;

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    after(async() => {
      // delete application domain
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
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
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create application`, async () => {
      try {
        const applicationResponse: ApplicationResponse = await ApplicationsService.createApplication({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: ApplicationName,
            applicationType: "standard",
            brokerType: Application.brokerType.SOLACE
          }
        });
        ApplicationId = applicationResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get application by name`, async () => {
      try {
        const epApplication: Application |ApplicationResponse = await EpSdkApplicationsService.getByName({ applicationDomainId: ApplicationDomainId, applicationName: ApplicationName });
        expect(epApplication, TestLogger.createApiTestFailMessage('epApplication === undefined')).to.not.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get application by id`, async () => {
      try {
        const epApplication: Application = await EpSdkApplicationsService.getById({ applicationDomainId: ApplicationDomainId, applicationId: ApplicationId });
        expect(epApplication.id, TestLogger.createApiTestFailMessage(`epApplication.id !== ${ApplicationId}`)).to.eq(ApplicationId);
        expect(epApplication.applicationDomainId, TestLogger.createApiTestFailMessage(`applicationDomainId !== ${ApplicationDomainId}`)).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete application by id`, async () => {
      try {
        const epApplication: Application = await EpSdkApplicationsService.deleteById({ applicationDomainId: ApplicationDomainId, applicationId: ApplicationId });
        expect(epApplication.id, TestLogger.createApiTestFailMessage(`epApplication.id !== ${ApplicationId}`)).to.eq(ApplicationId);
        expect(epApplication.applicationDomainId, TestLogger.createApiTestFailMessage(`applicationDomainId !== ${ApplicationDomainId}`)).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create application`, async () => {
      try {
        const applicationResponse: ApplicationResponse = await ApplicationsService.createApplication({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: ApplicationName,
            applicationType: "standard",
            brokerType: Application.brokerType.SOLACE
          }
        });
        ApplicationId = applicationResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete application by name`, async () => {
      try {
        const epApplication: Application = await EpSdkApplicationsService.deleteByName({ applicationDomainId: ApplicationDomainId, applicationName: ApplicationName });
        expect(epApplication.name, TestLogger.createApiTestFailMessage(`epApplication.name !== ${ApplicationName}`)).to.eq(ApplicationName);
        expect(epApplication.id, TestLogger.createApiTestFailMessage(`epApplication.id !== ${ApplicationId}`)).to.eq(ApplicationId);
        expect(epApplication.applicationDomainId, TestLogger.createApiTestFailMessage(`applicationDomainId !== ${ApplicationDomainId}`)).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should catch delete application by name that doesn't exist`, async () => {
      const NonExistentName = 'non-existent';
      try {
        const epApplication: Application = await EpSdkApplicationsService.deleteByName({ applicationDomainId: ApplicationDomainId, applicationName: NonExistentName });
        expect(false, TestLogger.createApiTestFailMessage('must never get here')).to.be.true;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        const epSdkServiceError: EpSdkServiceError = e;
        expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
      }
    });

});

