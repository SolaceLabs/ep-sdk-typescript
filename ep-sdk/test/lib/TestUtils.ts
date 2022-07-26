import { v4 as uuidv4 } from 'uuid';

export class TestUtils {

  public static getUUID = (): string => {
    return uuidv4();
  }

}