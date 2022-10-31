import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError, 
  ApplicationDomainResponse, 
  ApplicationDomainsService, 
  EventApIsService,
  EventApiResponse,
  EventApi,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkServiceError,
  EpSdkApplicationDomainsService,
  EpSdkEventApisService,
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecId}`;
let ApplicationDomainId: string | undefined;

const EventApiName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
let EventApiId: string | undefined;

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    before(async() => {
      const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
        requestBody: {
          name: ApplicationDomainName,
        }
      });
      ApplicationDomainId = applicationDomainResponse.data.id;
    });
  
    after(async() => {
      // delete application domain
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
    });

    it(`${scriptName}: should create eventApi`, async () => {
      try {
        const eventApiResponse: EventApiResponse = await EventApIsService.createEventApi({ 
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EventApiName,
            brokerType: EventApi.brokerType.SOLACE
          }
        });
        EventApiId = eventApiResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get eventApi by name`, async () => {
      try {
        const eventApi: EventApi | undefined = await EpSdkEventApisService.getByName({
          applicationDomainId: ApplicationDomainId,
          eventApiName: EventApiName
        });
        expect(eventApi, TestLogger.createApiTestFailMessage('eventApi === undefined')).to.not.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get eventApi by id`, async () => {
      try {
        const eventApi: EventApi | undefined = await EpSdkEventApisService.getById({
          applicationDomainId: ApplicationDomainId,
          eventApiId: EventApiId
        });

        expect(eventApi.id, TestLogger.createApiTestFailMessage('failed')).to.eq(EventApiId);
        expect(eventApi.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete eventApi by id`, async () => {
      try {
        const eventApi: EventApi | undefined = await EpSdkEventApisService.deleteById({
          applicationDomainId: ApplicationDomainId,
          eventApiId: EventApiId
        });
        expect(eventApi.id, TestLogger.createApiTestFailMessage('failed')).to.eq(EventApiId);
        expect(eventApi.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create eventApi`, async () => {
      try {
        const eventApiResponse: EventApiResponse = await EventApIsService.createEventApi({ 
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EventApiName,
            brokerType: EventApi.brokerType.SOLACE
          }
        });
        EventApiId = eventApiResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete eventApi by name`, async () => {
      try {
        const eventApi: EventApi | undefined = await EpSdkEventApisService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          eventApiName: EventApiName
        });
        expect(eventApi.name, TestLogger.createApiTestFailMessage('failed')).to.eq(EventApiName);
        expect(eventApi.id, TestLogger.createApiTestFailMessage('failed')).to.eq(EventApiId);
        expect(eventApi.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should catch delete eventApi by name that doesn't exist`, async () => {
      const NonExistentName = 'non-existent';
      try {
        const eventApi: EventApi | undefined = await EpSdkEventApisService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          eventApiName: NonExistentName
        });
        expect(false, TestLogger.createApiTestFailMessage('must never get here')).to.be.true;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        const epSdkServiceError: EpSdkServiceError = e;
        expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
      }
    });

    it(`${scriptName}: should catch delete eventApi by id that doesn't exist`, async () => {
      const NonExistentId = 'non-existent';
      try {
        const eventApi: EventApi | undefined = await EpSdkEventApisService.deleteById({
          applicationDomainId: ApplicationDomainId,
          eventApiId: NonExistentId
        });
        expect(false, TestLogger.createApiTestFailMessage('must never get here')).to.be.true;
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createApiTestFailMessage('not ApiError')).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createApiTestFailMessage('wrong status')).to.eq(404);
      }
    });

});

