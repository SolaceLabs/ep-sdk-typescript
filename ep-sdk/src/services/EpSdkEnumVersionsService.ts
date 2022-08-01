import { EpSdkApiContentError } from "../EpSdkErrors";
import EpSdkSemVerUtils from "../EpSdkSemVerUtils";
import {
  Enum,
  EnumsService,
  EnumVersion,
  EnumVersionsResponse
} from "../sep-openapi-node";
import EpSdkEnumsService from "./EpSdkEnumsService";


class EpSdkEnumVersionsService {

  private getLatestVersionFromList = ({ enumVersionList }: {
    enumVersionList: Array<EnumVersion>;
  }): EnumVersion | undefined => {
    const funcName = 'getLatestVersionFromList';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    let latestEnumVersion: EnumVersion | undefined = undefined;
    let latestVersionString: string = '0.0.0';
    for (const enumVersion of enumVersionList) {
      if (enumVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'enumVersion.version === undefined', {
        enumVersion: enumVersion
      });
      const newVersionString: string = enumVersion.version;
      if (EpSdkSemVerUtils.is_NewVersion_GreaterThan_OldVersion({
        newVersionString: newVersionString,
        oldVersionString: latestVersionString,
      })) {
        latestVersionString = newVersionString;
        latestEnumVersion = enumVersion;
      }
    }
    return latestEnumVersion;
  }

  public getVersionByVersion = async ({ enumId, enumVersionString }: {
    enumId: string;
    enumVersionString: string;
  }): Promise<EnumVersion | undefined> => {
    const funcName = 'getVersionByVersion';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const enumVersionsResponse: EnumVersionsResponse = await EnumsService.getEnumVersionsForEnum({
      enumId: enumId,
      versions: [enumVersionString]
    });
    if (enumVersionsResponse.data === undefined || enumVersionsResponse.data.length === 0) return undefined;
    if (enumVersionsResponse.data.length > 1) throw new EpSdkApiContentError(logName, this.constructor.name, 'enumVersionsResponse.data.length > 1', {
      enumVersionsResponse: enumVersionsResponse
    });
    return enumVersionsResponse.data[0];
  }

  public getVersionsForEnumId = async ({ enumId }: {
    enumId: string;
  }): Promise<Array<EnumVersion>> => {
    const funcName = 'getVersionsForEnumId';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    // wrong call
    // const enumVersionsResponse: EnumVersionsResponse = await EnumsService.getEnumVersions({
    //   ids: [enumId]
    // });
    const enumVersionsResponse: EnumVersionsResponse = await EnumsService.getEnumVersionsForEnum({
      enumId: enumId,
    });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionsResponse: enumVersionsResponse
    // }}));
    if (enumVersionsResponse.data === undefined || enumVersionsResponse.data.length === 0) return [];
    return enumVersionsResponse.data;
  }

  public getVersionsForEnumName = async ({ enumName, applicationDomainId }: {
    applicationDomainId: string;
    enumName: string;
  }): Promise<Array<EnumVersion>> => {
    const funcName = 'getVersionsForEnumName';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const enumObject: Enum | undefined = await EpSdkEnumsService.getByName({
      applicationDomainId: applicationDomainId,
      enumName: enumName
    });
    if (enumObject === undefined) return [];
    if (enumObject.id === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'enumObject.id === undefined', {
      enumObject: enumObject
    });
    const enumVersionList: Array<EnumVersion> = await this.getVersionsForEnumId({ enumId: enumObject.id });
    return enumVersionList;
  }

  public getLastestVersionString = async ({ enumId }: {
    enumId: string;
  }): Promise<string | undefined> => {
    const funcName = 'getLastestVersionString';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const enumVersionList: Array<EnumVersion> = await this.getVersionsForEnumId({ enumId: enumId });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));
    const latestEnumVersion: EnumVersion | undefined = this.getLatestVersionFromList({ enumVersionList: enumVersionList });
    if (latestEnumVersion === undefined) return undefined;
    if (latestEnumVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'latestEnumVersion.version === undefined', {
      latestEnumVersion: latestEnumVersion
    });
    return latestEnumVersion.version;
  }

  public getLatestVersionForEnumId = async ({ enumId, applicationDomainId }: {
    applicationDomainId: string;
    enumId: string;
  }): Promise<EnumVersion | undefined> => {
    const funcName = 'getLatestVersionForEnumId';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    applicationDomainId;
    const enumVersionList: Array<EnumVersion> = await this.getVersionsForEnumId({
      enumId: enumId,
    });

    const latestEnumVersion: EnumVersion | undefined = this.getLatestVersionFromList({ enumVersionList: enumVersionList });
    return latestEnumVersion;
  }

  public getLastestVersionForEnumName = async ({ applicationDomainId, enumName }: {
    applicationDomainId: string;
    enumName: string;
  }): Promise<EnumVersion | undefined> => {
    const funcName = 'getLastestVersionForEnumName';
    const logName = `${EpSdkEnumVersionsService.name}.${funcName}()`;

    const enumVersionList: Array<EnumVersion> = await this.getVersionsForEnumName({
      enumName: enumName,
      applicationDomainId: applicationDomainId
    });
    // CliLogger.trace(CliLogger.createLogEntry(logName, { code: ECliStatusCodes.SERVICE, details: {
    //   enumVersionList: enumVersionList
    // }}));

    const latestEnumVersion: EnumVersion | undefined = this.getLatestVersionFromList({ enumVersionList: enumVersionList });
    return latestEnumVersion;

  }
}

export default new EpSdkEnumVersionsService();

