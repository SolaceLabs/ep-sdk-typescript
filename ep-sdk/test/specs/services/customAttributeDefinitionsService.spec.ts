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
  CustomAttributeDefinition, 
  CustomAttributeDefinitionResponse, 
  CustomAttributeDefinitionsService, 
  EnumsService, 
  TopicAddressEnumResponse
} from '@solace-labs/ep-openapi-node';
import { 
  EpSdkError,
  EpSdkApplicationDomainsService,
  EpSdkCustomAttributeDefinitionsService,
} from '../../../src';
import { EEpSdkCustomAttributeEntityTypes } from '../../../src/types/EpSdkObjectTypes';


const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");

const TestSpecId: string = TestUtils.getUUID();
const CustomAttributeDefinition_1_Name = 'CustomAttributeDefinition_1_Name';
const CustomAttributeDefinition_1_Value = 'CustomAttributeDefinition_1_Value';
const CustomAttributeDefinition_1_UpdateValue = "CustomAttributeDefinition_1_UpdateValue";
let CustomAttributeDefinition_1_Id: string | undefined;
const CustomAttributeDefinition_NameList = [
  "name-list-1",
  "name-list-2",
  "name-list-3",
  "name-list-4",
  "name-list-5",
  "name-list-6",
];
let CustomAttributeDefinition_IdList = [];

const ApplicationDomainName = `${TestConfig.getAppId()}/services/${TestSpecId}`;
let ApplicationDomainId: string | undefined;
const EnumName = `${TestConfig.getAppId()}-services-${TestSpecId}`;
let EnumId: string | undefined;

describe(`${scriptName}`, () => {

    beforeEach(() => {
      TestContext.newItId();
    });

    after(async() => {
      // delete custom attribute definition
      await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({
        id: CustomAttributeDefinition_1_Id
      });
      for(const id of CustomAttributeDefinition_IdList) {
        await CustomAttributeDefinitionsService.deleteCustomAttributeDefinition({
          id: id
        });  
      }
      // delete application domain
      await EpSdkApplicationDomainsService.deleteById({ applicationDomainId: ApplicationDomainId });
    });

    it(`${scriptName}: should not find custom attribute definition by name`, async () => {
      try {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name
        });
        expect(customAttributeDefinition, '').to.be.undefined;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create custom attribute definition`, async () => {
      try {
        const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinition({
          requestBody: {
            name: CustomAttributeDefinition_1_Name,
            associatedEntityTypes: [EEpSdkCustomAttributeEntityTypes.ENUM],
            valueType: CustomAttributeDefinition.valueType.STRING
          }
        });
        CustomAttributeDefinition_1_Id = customAttributeDefinitionResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get custom attribute definition by name`, async () => {
      try {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name
        });
        expect(customAttributeDefinition, `attribute ${CustomAttributeDefinition_1_Name} not found, undefined`).to.not.be.undefined;
        expect(customAttributeDefinition.associatedEntityTypes, '').to.include(EEpSdkCustomAttributeEntityTypes.ENUM);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should add all entity types to custom attribute definition`, async () => {
      try {
        const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.updateCustomAttributeDefinition({
          id: CustomAttributeDefinition_1_Id,
          requestBody: {
            associatedEntityTypes: Object.values(EEpSdkCustomAttributeEntityTypes),
          }
        });
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get custom attribute definition by name with all entity types`, async () => {
      try {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name
        });
        for(const value of Object.values(EEpSdkCustomAttributeEntityTypes) ) {
          expect(customAttributeDefinition.associatedEntityTypes, `entity not included: ${value}`).to.include(value);
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create custom attribute definition list`, async () => {
      try {
        for(const name of CustomAttributeDefinition_NameList) {
          const customAttributeDefinitionResponse: CustomAttributeDefinitionResponse = await CustomAttributeDefinitionsService.createCustomAttributeDefinition({
            requestBody: {
              name: name,
              associatedEntityTypes: Object.values(EEpSdkCustomAttributeEntityTypes),
              valueType: CustomAttributeDefinition.valueType.STRING
            }
          });
          CustomAttributeDefinition_IdList.push(customAttributeDefinitionResponse.data.id);
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get custom attribute definition by name with pageSize=1`, async () => {
      try {
        const customAttributeDefinition: CustomAttributeDefinition | undefined = await EpSdkCustomAttributeDefinitionsService.getByName({
          attributeName: CustomAttributeDefinition_1_Name,
          pageSize: 1
        });
        expect(customAttributeDefinition, `attribute ${CustomAttributeDefinition_1_Name} not found, undefined`).to.not.be.undefined;
        for(const value of Object.values(EEpSdkCustomAttributeEntityTypes) ) {
          expect(customAttributeDefinition.associatedEntityTypes, `entity not included: ${value}`).to.include(value);
        }
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
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
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should create enum with attribute`, async () => {
      try {
        const enumResponse: TopicAddressEnumResponse = await EnumsService.createEnum({
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EnumName,
            shared: false,
            customAttributes: [
              {
                customAttributeDefinitionId: CustomAttributeDefinition_1_Id,
                value: CustomAttributeDefinition_1_Value
              }
            ]
          }
        });
        EnumId = enumResponse.data.id;
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should get enum with attribute / value`, async () => {
      try {
        const enumResponse: TopicAddressEnumResponse = await EnumsService.getEnum({
          id: EnumId
        });
        expect(JSON.stringify(enumResponse.data.customAttributes), `enum does not include attribute name = ${CustomAttributeDefinition_1_Name}`).to.include(CustomAttributeDefinition_1_Name);
        expect(JSON.stringify(enumResponse.data.customAttributes), `enum does not include attribute value = ${CustomAttributeDefinition_1_Value}`).to.include(CustomAttributeDefinition_1_Value);
      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

    it(`${scriptName}: should update attribute value for enum`, async () => {
      try {
        const enumResponse: TopicAddressEnumResponse = await EnumsService.updateEnum({
          id: EnumId,
          requestBody: {
            applicationDomainId: ApplicationDomainId,
            name: EnumName,
            customAttributes: [
              {
                customAttributeDefinitionId: CustomAttributeDefinition_1_Id,
                value: CustomAttributeDefinition_1_UpdateValue
              }
            ]
          }
        });
        expect(JSON.stringify(enumResponse.data.customAttributes), `enum does not include attribute value = ${CustomAttributeDefinition_1_UpdateValue}`).to.include(CustomAttributeDefinition_1_UpdateValue);

      } catch(e) {
        if(e instanceof ApiError) expect(false, TestLogger.createApiTestFailMessage('failed')).to.be.true;
        expect(e instanceof EpSdkError, TestLogger.createNotEpSdkErrorMessage(e)).to.be.true;
        expect(false, TestLogger.createEpSdkTestFailMessage('failed', e)).to.be.true;
      }
    });

});

