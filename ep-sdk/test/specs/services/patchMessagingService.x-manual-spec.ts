import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import { TestUtils } from '../../lib/TestUtils';
import { 
  ApiError, 
  MessagingServicesService,
  MessagingServicesResponse,
  MessagingService,
  MessagingServiceResponse,
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError,
} from '../../../src';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecName = "msgsvc-spec";
const TestSpecId: string = TestUtils.getUUID();

const MessagingServiceList: Array<MessagingService> = [];

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should get all messaging services`, async () => {
      try {
        // assumes no more than 100 defined
        const messagingServicesResponse: MessagingServicesResponse = await MessagingServicesService.getMessagingServices({
          pageSize: 100
        });
        if(messagingServicesResponse.data === undefined) throw new Error('messagingServicesResponse.data === undefined');
        MessagingServiceList.push(...messagingServicesResponse.data);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should patch all messaging services`, async () => {
      try {
        for(const messagingService of MessagingServiceList) {
          const errMsg = `messasgingService = \n${JSON.stringify(messagingService, null, 2)}`;
          if(messagingService.id === undefined) throw new Error(`messagingService.id === undefined, \n${errMsg}`);
          if(messagingService.messagingServiceConnections) {
            for(const messagingServiceConnection of messagingService.messagingServiceConnections) {
              if(messagingServiceConnection.messagingServiceAuthentications === undefined) throw new Error(`messagingServiceConnection.messagingServiceAuthentications === undefined, \n${errMsg}`);
              if(messagingServiceConnection.messagingServiceAuthentications.length !== 0) {
                if(messagingServiceConnection.messagingServiceAuthentications.length !== 1) throw new Error(`messagingServiceConnection.messagingServiceAuthentications.length !== 1, \n${errMsg}`);
                if(messagingServiceConnection.messagingServiceAuthentications[0].authenticationDetails === undefined) throw new Error(`messagingServiceConnection.messagingServiceAuthentications[0].authenticationDetails === undefined, \n${errMsg}`);
                // // DEBUG              
                // expect(false, `messagingServiceConnection.messagingServiceAuthentications[0].authenticationDetails = \n${JSON.stringify(messagingServiceConnection.messagingServiceAuthentications[0].authenticationDetails, null, 2)}`).to.be.true;
                const properties:Array<any> = messagingServiceConnection.messagingServiceAuthentications[0].authenticationDetails['properties'];
                // // DEBUG              
                // expect(false, `properties = \n${JSON.stringify(properties, null, 2)}`).to.be.true;
                if(properties !== undefined && properties.length > 0) {
                  const typeProperty = properties.find( (x) => {
                    if('name' in x) return x.name === 'type';
                  });
                  // // DEBUG              
                  // expect(false, `typeProperty = \n${JSON.stringify(typeProperty, null, 2)}`).to.be.true;
                  expect(typeProperty).to.not.be.undefined;
                  const protocol: string = typeProperty.value;
                  // // DEBUG              
                  // expect(false, `protocol = ${JSON.stringify(protocol, null, 2)}`).to.be.true;
                  expect(protocol).to.not.be.undefined;
                  messagingServiceConnection.protocol = protocol.toUpperCase();
                  messagingServiceConnection.protocolVersion = 'version';  
                }  
              }
            }
          }
          const messagingServiceResponse: MessagingServiceResponse = await MessagingServicesService.updateMessagingService({
            id: messagingService.id,
            requestBody: {
              name: messagingService.name,
              messagingServiceConnections: messagingService.messagingServiceConnections
            }
          });
          // // DEBUG
          // expect(false, `messagingServiceResponse=\n${JSON.stringify(messagingServiceResponse, null, 2)}`).to.be.true;
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

