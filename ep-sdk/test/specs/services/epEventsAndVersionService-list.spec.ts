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
  EventsService,
  EventResponse,
  EventsResponse,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkEpEventsService,
  EpSdkApplicationDomainsService,
  EpSdkEpEventVersionsService,
  EpSdkEpEventAndVersionList,
  EpSdkEpEventAndVersionListResponse,
  EpSdkEpEventAndVersionResponse,
} from '../../../src';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const NumApplicationDomains = 2;
const getApplicationDomainNameList = (): Array<string> => {
  const list: Array<string> = [];;
  for(let i=0; i < NumApplicationDomains; i++) {
    list.push(`${TestConfig.getAppId()}/${scriptName}/${TestSpecId}/domain-${i}`);
  }
  return list;
}
let ApplicationDomainIdList: Array<string> = [];

const EventName = `${TestConfig.getAppId()}-event-${TestSpecId}`;
const EventShared = true;
const EventVersionString_1 = "1.0.0";
const EventVersionString_2 = "1.1.0";

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    before(async() => {
      // create all application domains
      const applicationDomainNameList = getApplicationDomainNameList();
      for(const applicationDomainName of applicationDomainNameList) {
        const applicationDomainResponse: ApplicationDomainResponse = await ApplicationDomainsService.createApplicationDomain({
          requestBody: {
            name: applicationDomainName,
          }
        });
        ApplicationDomainIdList.push(applicationDomainResponse.data.id);
      }
    });
  
    after(async() => {
      // delete all application domains
      for(const applicationDomainId of ApplicationDomainIdList) {
        await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: applicationDomainId });
      }
    });

    it(`${scriptName}: should create event & two versions in every application domain`, async () => {
      try {
        for(const applicationDomainId of ApplicationDomainIdList) {
          // create the event
          const eventResponse: EventResponse = await EventsService.createEvent({
            requestBody: {
              applicationDomainId: applicationDomainId,
              name: EventName,
              shared: EventShared
            }
          });
          const eventId = eventResponse.data.id;
          // create version 1
          const version1 = await EventsService.createEventVersionForEvent({
            eventId: eventId,
            requestBody: {
              eventId: eventId,
              version: EventVersionString_1
            }
          });
          // create version 2
          const version2 = await EventsService.createEventVersionForEvent({
            eventId: eventId,
            requestBody: {
              eventId: eventId,
              version: EventVersionString_2
            }
          });
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get complete list of events`, async () => {
      try {
        const eventsResponse: EventsResponse = await EpSdkEpEventsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventShared,
        });
        expect(eventsResponse.data.length, TestLogger.createApiTestFailMessage('eventsResponse.data.length')).to.equal(NumApplicationDomains);
        expect(eventsResponse.meta.pagination.count, TestLogger.createApiTestFailMessage('eventsResponse.meta.pagination.count')).to.equal(NumApplicationDomains);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get complete list of latest event versions`, async () => {
      try {
        const epSdkEpEventAndVersionListResponse: EpSdkEpEventAndVersionListResponse = await EpSdkEpEventVersionsService.listLatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          shared: true,
          pageNumber: 1,
          pageSize: 100
        });
        const epSdkEpEventAndVersionList: EpSdkEpEventAndVersionList = epSdkEpEventAndVersionListResponse.data;

        const message = `epSdkEpEventAndVersionList=\n${JSON.stringify(epSdkEpEventAndVersionList, null, 2)}`;        
        expect(epSdkEpEventAndVersionList.length, message).to.equal(NumApplicationDomains);
        expect(epSdkEpEventAndVersionListResponse.meta.pagination.count, message).to.equal(NumApplicationDomains);
        for(const epSdkEpEventAndVersion of epSdkEpEventAndVersionList) {
          expect(epSdkEpEventAndVersion.eventVersion.version, TestLogger.createApiTestFailMessage('wrong version')).to.equal(EventVersionString_2);
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should test paging of latest event versions`, async () => {
      const PageSize = 1;
      let nextPage: number | undefined | null = 1;
      try {
        while(nextPage !== undefined && nextPage !== null) {
          const epSdkEpEventAndVersionListResponse: EpSdkEpEventAndVersionListResponse = await EpSdkEpEventVersionsService.listLatestVersions({
            applicationDomainIds: ApplicationDomainIdList,
            shared: true,
            pageNumber: nextPage,
            pageSize: PageSize
          });
          const epSdkEpEventAndVersionList: EpSdkEpEventAndVersionList = epSdkEpEventAndVersionListResponse.data;
  
          const message = `epSdkEpEventAndVersionListResponse=\n${JSON.stringify(epSdkEpEventAndVersionListResponse, null, 2)}`;        
          expect(epSdkEpEventAndVersionList.length, message).to.equal(PageSize);
          expect(epSdkEpEventAndVersionListResponse.meta.pagination.count, message).to.equal(NumApplicationDomains);
          if(nextPage < NumApplicationDomains) {
            expect(epSdkEpEventAndVersionListResponse.meta.pagination.nextPage, message).to.equal(nextPage + 1);
          } else {
            expect(epSdkEpEventAndVersionListResponse.meta.pagination.nextPage, message).to.be.undefined;
          }
          for(const epSdkEpEventAndVersion of epSdkEpEventAndVersionList) {
            expect(epSdkEpEventAndVersion.eventVersion.version, TestLogger.createApiTestFailMessage('wrong version')).to.equal(EventVersionString_2);
          }
          nextPage = epSdkEpEventAndVersionListResponse.meta.pagination.nextPage;  
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get complete list of latest event versions for any application domain`, async () => {
      try {
        const epSdkEpEventAndVersionListResponse: EpSdkEpEventAndVersionListResponse = await EpSdkEpEventVersionsService.listLatestVersions({
          applicationDomainIds: ApplicationDomainIdList,
          shared: true,
          pageNumber: 1,
          pageSize: 100
        });
        const epSdkEpEventAndVersionList: EpSdkEpEventAndVersionList = epSdkEpEventAndVersionListResponse.data;
        expect(epSdkEpEventAndVersionList.length, TestLogger.createApiTestFailMessage('no versions found')).to.be.greaterThan(0);
        const message = TestLogger.createLogMessage('epSdkEpEventAndVersionList', epSdkEpEventAndVersionList);
        TestLogger.logMessageWithId(message);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get the latest version of for all events`, async () => {
      try {
        const eventsResponse: EventsResponse = await EpSdkEpEventsService.listAll({
          applicationDomainIds: ApplicationDomainIdList,
          shared: EventShared,
        });
        let message = `eventsResponse=\n${JSON.stringify(eventsResponse, null, 2)}`;        
        expect(eventsResponse.data, message).to.not.be.undefined;
        expect(eventsResponse.data.length, message).to.equal(NumApplicationDomains);
        for(const epEvent of eventsResponse.data) {
          // get the latest object & version for each event 
          const latest_EpSdkEpEventAndVersionResponse: EpSdkEpEventAndVersionResponse = await EpSdkEpEventVersionsService.getObjectAndVersionForEventId({ 
            eventId: epEvent.id,
            stateId: undefined
          });
          message = `latest_EpSdkEpEventAndVersionResponse=\n${JSON.stringify(latest_EpSdkEpEventAndVersionResponse, null, 2)}`;    
          expect(latest_EpSdkEpEventAndVersionResponse.event.id, message).to.equal(epEvent.id);
          expect(latest_EpSdkEpEventAndVersionResponse.eventVersion.version, message).to.equal(EventVersionString_2);
          expect(JSON.stringify(latest_EpSdkEpEventAndVersionResponse.meta.versionStringList), message).to.include(EventVersionString_1);    
          expect(JSON.stringify(latest_EpSdkEpEventAndVersionResponse.meta.versionStringList), message).to.include(EventVersionString_2);    
          // get the version 1 for each event object
          const version1_EpSdkEpEventAndVersionResponse: EpSdkEpEventAndVersionResponse = await EpSdkEpEventVersionsService.getObjectAndVersionForEventId({ 
            eventId: epEvent.id,
            stateId: undefined,
            versionString: EventVersionString_1
          });
          message = `version1_EpSdkEpEventAndVersionResponse=\n${JSON.stringify(version1_EpSdkEpEventAndVersionResponse, null, 2)}`;    
          expect(version1_EpSdkEpEventAndVersionResponse.event.id, message).to.equal(epEvent.id);
          expect(version1_EpSdkEpEventAndVersionResponse.eventVersion.version, message).to.equal(EventVersionString_1);
          expect(JSON.stringify(version1_EpSdkEpEventAndVersionResponse.meta.versionStringList), message).to.include(EventVersionString_1);    
          expect(JSON.stringify(version1_EpSdkEpEventAndVersionResponse.meta.versionStringList), message).to.include(EventVersionString_2);    
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });


});

