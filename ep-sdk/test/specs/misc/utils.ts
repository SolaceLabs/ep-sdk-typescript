import 'mocha';
import { expect } from 'chai';
import path from 'path';
import { TestLogger } from '../../lib/TestLogger';
import { TestContext } from '../../lib/TestContext';
import TestConfig from '../../lib/TestConfig';
import { TestUtils } from '../../lib/TestUtils';
import { EpSdkUtils } from '../../../src/utils/EpSdkUtils';

const scriptName: string = path.basename(__filename);
TestLogger.logMessage(scriptName, ">>> starting ...");


const ApplicationDomainName = `${TestConfig.getAppId()}/misc/${TestUtils.getUUID()}`;
let ApplicationDomainId: string | undefined;

enum TestEnum {
  one = "one",
  two = "two"
};
let EnumValue: TestEnum;


describe(`${scriptName}`, () => {
    
    beforeEach(() => {
      TestContext.newItId();
    });

    it(`${scriptName}: should assertNever`, async () => {
      try {
        switch(EnumValue) {
          case TestEnum.one:
            break;
          case TestEnum.two:
            break;  
          default:
            EpSdkUtils.assertNever(scriptName, EnumValue);    
        }
        expect(false, "should never get here").to.be.true;
      } catch(e) {
        expect(e.message, 'wrong error').to.include(scriptName);
      }
    });

});

