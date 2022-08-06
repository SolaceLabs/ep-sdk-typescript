/**
 * This is the doc comment for EpSdkUtils.ts
 *
 * @module utils/EpSdkUtils
 */
 import { 
  isUndefined as _isUndefined,
  keys as _keys,
  entries as _entries,
  has as _has,
  get as _get,
  isObjectLike as _isObjectLike,
  isEqual as _isEqual
} from 'lodash';
import { v4 as uuidv4 } from 'uuid';

export type TEpSdkDeepDiffFromTo = {
  from: any;
  to: any;
}

export interface IEpSdkDeepCompareResult {
  isEqual: boolean;
  difference: Record<string, TEpSdkDeepDiffFromTo> | undefined;
}

export class EpSdkUtils {

  public static assertNever = (extLogName: string, x: never): never => {
    const funcName = 'assertNever';
    const logName = `${EpSdkUtils.name}.${funcName}()`;
    throw new Error(`${logName}:${extLogName}: unexpected object: ${JSON.stringify(x)}`);
  }

  public static getUUID = (): string => {
    return uuidv4();
  }

  public static isEqualDeep = (one: any, two: any): boolean => {
    return _isEqual(one, two);
  }

  /**
   * Deep diff between two object-likes
   * @param  {Object} fromObject the original object
   * @param  {Object} toObject   the updated object
   * @return {Object}            a new object which represents the diff
   */
  public static deepDiff(fromObject: any, toObject: any): Record<string, TEpSdkDeepDiffFromTo> {
    const changes: any = {};

    const buildPath = (obj: any, key: string, path?: string) => {
      obj;
      return _isUndefined(path) ? key : `${path}.${key}`;
    }

    const walk = (fromObject: any, toObject: any, path?: string) => {
        for (const key of _keys(fromObject)) {
            const currentPath = buildPath(fromObject, key, path);
            if (!_has(toObject, key)) {
                changes[currentPath] = {from: _get(fromObject, key)};
            }
        }

        for (const [key, to] of _entries(toObject)) {
            const currentPath = buildPath(toObject, key, path);
            if (!_has(fromObject, key)) {
                changes[currentPath] = {to};
            } else {
                const from = _get(fromObject, key);
                if (!_isEqual(from, to)) {
                    if (_isObjectLike(to) && _isObjectLike(from)) {
                        walk(from, to, currentPath);
                    } else {
                        changes[currentPath] = {from, to};
                    }
                }
            }
        }
    };

    walk(fromObject, toObject);

    return changes;
  }

  public static deepSortStringArraysInObject(obj: any): any {
    if(typeof(obj) !== 'object') throw new TypeError('expected obj to be an object');
    for(const key in obj) {
      const value = obj[key];
      if(typeof(value) === 'object') {
        obj[key] = EpSdkUtils.deepSortStringArraysInObject(obj[key]);
      } else if(Array.isArray(value)) {
        if(value.length > 0 && typeof(value[0]) === 'string') {
          value.sort();
        }
        obj[key] = value;
      }
    }
    return obj;
  }

  public static prepareCompareObject4Output(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (_k,v) => {
      if(v === undefined) return 'undefined';
      return v;
    }));
  }

  private static createCleanCompareObject(obj: any): any {
    return JSON.parse(JSON.stringify(obj, (_k, v) => {
      if(v === null) return undefined;
      return v;
    }));
  }

  public static deepCompareObjects({ existingObject, requestedObject }:{
    existingObject: any;
    requestedObject: any;
  }): IEpSdkDeepCompareResult {
    const cleanExistingObject = EpSdkUtils.deepSortStringArraysInObject(EpSdkUtils.createCleanCompareObject(existingObject));
    const cleanRequestedObject = EpSdkUtils.deepSortStringArraysInObject(EpSdkUtils.createCleanCompareObject(requestedObject));
    const isEqual = EpSdkUtils.isEqualDeep(cleanExistingObject, cleanRequestedObject);
    let deepDiffResult: Record<string, TEpSdkDeepDiffFromTo> | undefined = undefined;
    if(!isEqual) {
      deepDiffResult = EpSdkUtils.deepDiff(cleanExistingObject, cleanRequestedObject);
    }
    return {
      isEqual: isEqual,
      difference: deepDiffResult
    };
  }

}