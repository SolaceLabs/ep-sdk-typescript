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
  EventResponse, 
  EventsService, 
  Event as EPEvent,
} from '../../../src/sep-openapi-node';
import EpSdkApplicationDomainsService from '../../../src/services/EpSdkApplicationDomainsService';
import { EpSdkError, EpSdkServiceError } from '../../../src/EpSdkErrors';
import EpSdkEpEventsService from '../../../src/services/EpSdkEpEventsService';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const EpEventName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
let EpEventId: string | undefined;

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

    it(`${scriptName}: should create epEvent`, async () => {
      try {
        const eventResponse: EventResponse = await EventsService.createEvent({ 
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EpEventName,
          }
        });
        EpEventId = eventResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get epEvent by name`, async () => {
      try {
        const epEvent: EPEvent | undefined = await EpSdkEpEventsService.getByName({
          applicationDomainId: ApplicationDomainId,
          eventName: EpEventName
        })
        expect(epEvent, TestLogger.createApiTestFailMessage('epEvent === undefined')).to.not.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get epEvent by id`, async () => {
      try {
        const epEvent: EPEvent | undefined = await EpSdkEpEventsService.getById({
          applicationDomainId: ApplicationDomainId,
          eventId: EpEventId
        });
        expect(epEvent.id, TestLogger.createApiTestFailMessage('failed')).to.eq(EpEventId);
        expect(epEvent.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete epEvent by id`, async () => {
      try {
        const epEvent: EPEvent | undefined = await EpSdkEpEventsService.deleteById({
          applicationDomainId: ApplicationDomainId,
          eventId: EpEventId
        });
        expect(epEvent.id, TestLogger.createApiTestFailMessage('failed')).to.eq(EpEventId);
        expect(epEvent.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create epEvent`, async () => {
      try {
        const eventResponse: EventResponse = await EventsService.createEvent({ 
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EpEventName,
          }
        });
        EpEventId = eventResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should delete epEvent by name`, async () => {
      try {
        const epEvent: EPEvent | undefined = await EpSdkEpEventsService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          eventName: EpEventName
        });
        expect(epEvent.name, TestLogger.createApiTestFailMessage('failed')).to.eq(EpEventName);
        expect(epEvent.id, TestLogger.createApiTestFailMessage('failed')).to.eq(EpEventId);
        expect(epEvent.applicationDomainId, TestLogger.createApiTestFailMessage('failed')).to.eq(ApplicationDomainId);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should catch delete epEvent by name that doesn't exist`, async () => {
      const NonExistentName = 'non-existent';
      try {
        const epEvent: EPEvent | undefined = await EpSdkEpEventsService.deleteByName({
          applicationDomainId: ApplicationDomainId,
          eventName: NonExistentName
        });
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkServiceError, TestLogger.createNotEpSdkErrorMesssage(e)).to.be.true;
        const epSdkServiceError: EpSdkServiceError = e;
        expect(epSdkServiceError.toString(), TestLogger.createApiTestFailMessage(`error does not contain ${NonExistentName}`)).to.contain(NonExistentName);
      }
    });

    it(`${scriptName}: should catch delete epEvent by id that doesn't exist`, async () => {
      const NonExistentId = 'non-existent';
      try {
        const epEvent: EPEvent | undefined = await EpSdkEpEventsService.deleteById({
          applicationDomainId: ApplicationDomainId,
          eventId: NonExistentId
        });
      } catch(e) {
        expect(e instanceof ApiError, TestLogger.createApiTestFailMessage('not ApiError')).to.be.true;
        const apiError: ApiError = e;
        expect(apiError.status, TestLogger.createApiTestFailMessage('wrong status')).to.eq(404);
      }
    });

});

