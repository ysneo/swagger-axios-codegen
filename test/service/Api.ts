/** Generate by swagger-axios-codegen */
// tslint:disable
/* eslint-disable */
import axiosStatic, { AxiosInstance } from 'axios';

export interface IRequestOptions {
  headers?: any;
  baseURL?: string;
  responseType?: string;
}

export interface IRequestConfig {
  method?: any;
  headers?: any;
  url?: any;
  data?: any;
  params?: any;
}

// Add options interface
export interface ServiceOptions {
  axios?: AxiosInstance;
}

// Add default options
export const serviceOptions: ServiceOptions = {};

// Instance selector
export function axios(
  configs: IRequestConfig,
  resolve: (p: any) => void,
  reject: (p: any) => void
): Promise<any> {
  if (serviceOptions.axios) {
    return serviceOptions.axios
      .request(configs)
      .then(res => {
        const data = res.data;
        if (data.code === 200) {
          resolve(data.data);
        } else {
          reject(data.msg);
        }
      })
      .catch(err => {
        reject(err);
      });
  } else {
    throw new Error('please inject yourself instance like axios  ');
  }
}

export function getConfigs(
  method: string,
  contentType: string,
  url: string,
  options: any
): IRequestConfig {
  const configs: IRequestConfig = { ...options, method, url };
  configs.headers = {
    ...options.headers,
    'Content-Type': contentType,
  };
  return configs;
}

const basePath = '';

export interface IList<T> extends Array<T> {}
export interface List<T> extends Array<T> {}
export interface IDictionary<TValue> {
  [key: string]: TValue;
}
export interface Dictionary<TValue> extends IDictionary<TValue> {}

export interface IListResult<T> {
  items?: T[];
}

export class ListResultDto<T> implements IListResult<T> {
  items?: T[];
}

export interface IPagedResult<T> extends IListResult<T> {
  totalCount?: number;
  items?: T[];
}

export class PagedResultDto<T> implements IPagedResult<T> {
  totalCount?: number;
  items?: T[];
}

// customer definition
// empty

export class AreaInfo {
  /**
   * 增加分区
   */
  static addArea(
    params: {
      /** 分区对象 */
      area: AreaInfo;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/areas/addArea';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['area'];

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
  /**
   * 增加分区
   */
  static addAreas(
    params: {
      /** 分区对象List */
      areasList: AreaInfo[];
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<boolean> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/areas/addAreas';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['areasList'];

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据Id获取分区
   */
  static getAreasById(
    params: {
      /** 分区Id */
      parameter: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<AreaInfo> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/areas/getAreasById';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['parameter'];

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据类型、等级获取分区
   */
  static getAreasByTypeLevel(
    params: {
      /** 等级 */
      level: number;
      /** 类型 */
      type: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<AreaInfo[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/areas/getAreasByTypeLevel';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { level: params['level'], type: params['type'] };
      let data = null;

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
}

export class MonitorData {
  /**
   * 根据测站id查询最新监测数据
   */
  static getLatestDataByStations(
    params: {
      /** 测站Id */
      stationids: string[];
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<HashMap_string_double[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/monitorData/getLatestDataByStations';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['stationids'];

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据测站id、监测项以及时间查询监测数据
   */
  static getTsDataByStation(
    params: {
      /** 数据项 */
      dataType: string;
      /** 结束时间(yyyy-MM-dd HH:mm:ss) */
      end: string;
      /** 开始时间(yyyy-MM-dd HH:mm:ss) */
      start: string;
      /** 测站Id */
      stationid: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<TSData[]> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/monitorData/getTSDataByStation';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = {
        dataType: params['dataType'],
        end: params['end'],
        start: params['start'],
        stationid: params['stationid'],
      };
      let data = null;

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
}

export class StationInfo {
  /**
   * 获取所有测站信息
   */
  static addStation(
    params: {
      /** station */
      station: Station;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/station/addStation';

      const configs: IRequestConfig = getConfigs('post', 'application/json', url, options);

      let data = params['station'];

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
  /**
   * 获取所有测站信息
   */
  static getAllStations(options: IRequestOptions = {}): Promise<any> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/station/getAllStations';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);

      let data = null;

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
  /**
   * 根据id查询测站名称
   */
  static getstation(
    params: {
      /** 测站id */
      stationid: string;
    } = {} as any,
    options: IRequestOptions = {}
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      let url = basePath + '/station/getstation';

      const configs: IRequestConfig = getConfigs('get', 'application/json', url, options);
      configs.params = { stationid: params['stationid'] };
      let data = null;

      configs.data = data;
      axios(configs, resolve, reject);
    });
  }
}

export interface AreaInfo {
  /**  */
  area?: number;

  /**  */
  areaLevel?: number;

  /**  */
  areaType?: string;

  /**  */
  id?: number;

  /**  */
  isUse?: number;

  /**  */
  mark?: string;

  /**  */
  name?: string;

  /**  */
  operationUnit?: string;

  /**  */
  ownerUnit?: string;

  /**  */
  parentArea?: string;

  /**  */
  population?: number;

  /**  */
  shape?: any;

  /**  */
  stateInfo?: number;

  /** 修改时间 */
  timeModified?: string;
}

export interface HashMap_string_double {}

export interface Result {
  /** 返回代号 */
  code?: number;

  /** 返回对象 */
  data?: any;

  /** 错误信息 */
  msg?: string;
}

export interface Result_AreaInfo {
  /** 返回代号 */
  code?: number;

  /** 返回对象 */
  data?: AreaInfo;

  /** 错误信息 */
  msg?: string;
}

export interface Result_List_AreaInfo {
  /** 返回代号 */
  code?: number;

  /** 返回对象 */
  data?: AreaInfo[];

  /** 错误信息 */
  msg?: string;
}

export interface Result_List_HashMap_string_double {
  /** 返回代号 */
  code?: number;

  /** 返回对象 */
  data?: HashMap_string_double[];

  /** 错误信息 */
  msg?: string;
}

export interface Result_List_TSData {
  /** 返回代号 */
  code?: number;

  /** 返回对象 */
  data?: TSData[];

  /** 错误信息 */
  msg?: string;
}

export interface Result_boolean {
  /** 返回代号 */
  code?: number;

  /** 返回对象 */
  data?: boolean;

  /** 错误信息 */
  msg?: string;
}

export interface Station {
  /** ID */
  id?: number;

  /** 编码 */
  stcd?: string;
}

export interface TSData {
  /** 时间 */
  dt?: string;

  /** 值 */
  value?: number;
}
