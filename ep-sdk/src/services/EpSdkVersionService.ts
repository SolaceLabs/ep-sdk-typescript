import { SemVer } from "semver";
import { EpSdkApiContentError } from "../utils/EpSdkErrors";
import EpSdkSemVerUtils from "../utils/EpSdkSemVerUtils";
import { EpSdkService } from "./EpSdkService";

export class EpSdkVersionService extends EpSdkService {

  public getLatestEpObjectVersionFromList = ({ epObjectVersionList }: {
    epObjectVersionList: Array<any>;
  }): any | undefined => {
    const funcName = 'getLatestEpObjectVersionFromList';
    const logName = `${EpSdkVersionService.name}.${funcName}()`;

    if(epObjectVersionList.length === 0) return undefined;
    // sort the list
    const sortedList = this.sortEpObjectVersionListByVersion({ epObjectVersionList: epObjectVersionList });
    // get the latest
    return sortedList[0];

    // let latestEpObjectVersion: any | undefined = undefined;
    // let latestEpObjectVersionString: string = '0.0.0';
    // for (const epObjectVersion of epObjectVersionList) {
    //   /* istanbul ignore next */
    //   if(epObjectVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObjectVersion.version === undefined', {
    //     epObjectVersion: epObjectVersion
    //   });
    //   const newEpObjectVersionString: string = epObjectVersion.version;
    //   if (EpSdkSemVerUtils.is_NewVersion_GreaterThan_OldVersion({
    //     newVersionString: newEpObjectVersionString,
    //     oldVersionString: latestEpObjectVersionString,
    //   })) {
    //     latestEpObjectVersionString = newEpObjectVersionString;
    //     latestEpObjectVersion = epObjectVersion;
    //   }
    // }
    // return latestEpObjectVersion;
  }

  /**
   * Returns sorted list by version in semVer format. 
   * Sorts descending, i.e. latest version is the first element in the returned list.
   */
  public sortEpObjectVersionListByVersion = ({ epObjectVersionList }: {
    epObjectVersionList: Array<any>;
  }): any | undefined => {
    const funcName = 'sortEpObjectVersionListByVersion';
    const logName = `${EpSdkVersionService.name}.${funcName}()`;
    return epObjectVersionList.sort( (e1, e2) => {
      /* istanbul ignore next */
      if(e1.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'e1.version === undefined', {
        epObjectVersion: e1
      });
      /* istanbul ignore next */
      if(e2.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'e2.version === undefined', {
        epObjectVersion: e2
      });
      const e1SemVer = new SemVer(e1.version);
      const e2SemVer = new SemVer(e2.version);
      return e2SemVer.compare(e1SemVer);
    });
  }

  protected getEpObjectVersionFromList = ({ epObjectVersionList, versionString }: {
    epObjectVersionList: Array<any>;
    versionString: string;
  }): any | undefined => {
    const funcName = 'getEpObjectVersionFromList';
    const logName = `${EpSdkVersionService.name}.${funcName}()`;
    const found = epObjectVersionList.find( (epObjectVersion) => {
      /* istanbul ignore next */
      if(epObjectVersion.version === undefined) throw new EpSdkApiContentError(logName, this.constructor.name, 'epObjectVersion.version === undefined', {
        epObjectVersion: epObjectVersion
      });
      return epObjectVersion.version === versionString;
    });
    return found;
  }


}


