import { RoomInfo } from 'rtv-server';
import ApiBase from './common/api-base';

export default class Room extends ApiBase {
  /**
   * Rooms list
   */
  async list(): Promise<RoomInfo[]> {
    return this._request({
      path: 'room/list',
    });
  }
}
