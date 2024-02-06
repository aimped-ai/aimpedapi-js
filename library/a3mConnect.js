/**
 * This class was written to receive access tokens and refresh tokens from A3M.
 */
const { default: axios } = require('axios');
const dayjs = require('dayjs');
const { jwtDecode } = require('jwt-decode');
const { ApiErrorType } = require('./helper');
const defaultOption = {
  baseUrl: 'baseurl',
  scope: 'scope',
 
};
const defaultTokenData = {
  access_token: '',
  refresh_token: '',
  token_type: '',
  expires_in: 0,
  scope: '',
};
/**
 * A3M token is used for transactions
 * @class
 */
class A3mConnect {
  userKey = '';
  userSecret = '';
  isInit = false;
  options = {
    baseUrl: '',
    scope: '',
   
  };
  tokenData = {
    access_token: '',
    refresh_token: '',
    token_type: '',
    expires_in: 0,
    scope: '',
  };

  timeData = {
    tokenTime: undefined,
    refTokenTime: undefined,
  };

  /**
   * @constructor
   * @param {string} userKey - A3M userKey from A3M
   * @param {string} userSecret - A3M userKey from A3M
   * @param {defaultOption} options
   */
  constructor(userKey, userSecret, options) {
    this.userKey = userKey;
    this.userSecret = userSecret;
    this.options = { ...options };
  }
  /**
   *
   * @returns {object} - Returns the userKey and User Secret entered with the class creator
   */
  getUserKeys() {
    return {
      userKey: this.userKey,
      userSecret: this.userSecret,
    };
  }
  /**
   *
   * @returns {defaultOption} -Returns option entered with the class creator
   */
  getOptions() {
    return this.options;
  }
  /**
   * @async
   * @returns {defaultTokenData} -Returns token information received from A3M
   */
  async getTokenData() {
    if (!this.isInit) await this.init();
    return this.tokenData;
  }
  /**
   * @async
   * @returns {Object} - Returns decoded access token
   */
  async getDecodedToken() {
    if (!this.isInit) await this.init();
    return this.decodedToken;
  }
  /**
   *
   * @returns {Boolean} - Returns true if access token is expired
   */
  isTokenExpired() {
    const curDate = dayjs();
    return (
      curDate.diff(this.timeData.tokenTime, 'second') >
      this.tokenData.expires_in - 180
    );
  }
  /**
   *
   * @returns {Boolean} - Returns if refresh token is expired
   */
  isRefTokenExpired() {
    const curDate = dayjs();
    return curDate.diff(this.timeData.refTokenTime, 'day') > 6;
  }
  /**
   * @async
   * @returns {object} - Returns all fields data in class
   */
  async getAllData() {
    if (!this.isInit) await this.init();
    return this;
  }
  /**
   * @async
   * @returns {A3mConnect} - If the token information received from A3M is expired, it returns itself by taking it again.
   */
  async isConnected() {
    try {
      if (!this.isInit) {
        return await this.init();
      } else if (this.isRefTokenExpired()) {
        return await this.init();
      } else if (this.isTokenExpired()) {
        return await this.refreshAccesToken();
      } else {
        return this;
      }
    } catch (error) {
      throw error;
    }
  }
  /**
   * @async
   * @returns {A3mConnect} - It receives new token and refresh token information from A3M and returns itself.
   */
  async init() {
    try {
      const params = {
        grant_type: 'password',
        username: this.userKey,
        password: this.userSecret,
      };

      const response = await axios.post(
        this.options.baseUrl + '/token',
        new URLSearchParams({ ...params })
      );

      this.tokenData = await response.data;
      const dectoken = jwtDecode(await response.data.access_token);
      this.decodedToken = { ...dectoken };
      this.timeData = {
        tokenTime: dayjs(),
        refTokenTime: dayjs(),
      };

      this.isInit = true;
      return this;
    } catch (error) {
      throw new Error(ApiErrorType(error));
    }
  }
  /**
   *
   * @returns {A3mConnect} - It receives new access_token from A3M and returns itself.
   */
  async refreshAccesToken() {
    try {
      const params = {
        grant_type: 'refresh_token',
        refresh_token: this.tokenData.refresh_token,
      };

      const response = await axios.post(
        this.options.baseUrl + '/token',
        new URLSearchParams({ ...params })
      );
      this.tokenData = await response.data;
      this.timeData.tokenTime = dayjs();
      return this;
    } catch (error) {
      throw new Error(ApiErrorType(error));
    }
  }
}
module.exports = A3mConnect;
