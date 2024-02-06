const { default: axios } = require('axios');
const A3mConnect = require('./a3mConnect');
const { ApiErrorType } = require('./helper');
const fs = require('fs');
const FormData = require('form-data');
// https://dev.aimped.ai/pub/backend/get_pod_log?model_id=17&instance_id=&is_dedicated= //GET
// https://dev.aimped.ai/pub/backend/api/v1/model_run_prediction/{id}/ //POST
// https://dev.aimped.ai/pub/backend/api/v1/file_upload/{model_id} //POST
// https://dev.aimped.ai/pub/backend/api/v1/file_download //GET
const defaultPayload = {
  data_type: [],
  instance_id: 0,
  is_dedicated: false,
  extra_fields: {
    masked: true,
    faked: true,
    entity: [],
  },
  data_json: {},
  data_image: [],
  data_file: [],
  data_dicom: [],
  data_audio: [],
  data_txt: [],
};
class Aimped extends A3mConnect {
  /**
   * @constructor
   * @param {string} userKey
   * @param {string} userSecret
   * @param {{
   *  baseUrl,
   *  scope
   * }} options
   */
  constructor(userKey, userSecret, options) {
    super(userKey, userSecret, options);
  }
  /**
   * @async
   * @param {number} modelId - ID of the model to run
   * @param {defaultPayload} payload - model input data
   * @returns - Model output data
   */
  async runModel(modelId, payload) {
    try {
      if (await this.isConnected()) {
        const result = await axios.post(
          `${this.options.baseUrl}/pub/backend/api/v1/model_run_prediction/${modelId}/`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${this.tokenData.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return await result.data;
      }
    } catch (error) {
      throw error;
    }
  }
  /**
   * @async
   * @param {number} modelId - ID of the model to run
   * @param {defaultPayload} payload  - model input data
   * @param {function} callback
   */
  async runModelCallback(modelId, payload, callback) {
    try {
      if (await this.isConnected()) {
        callback({
          event: 'start',
          message: 'start model run',
          time: new Date(),
        });
        const result = await this.runModel(modelId, payload);

        if (result?.message) {
          callback({
            event: 'proccess',
            message: 'Model is not hot. Waiting for hot',
            time: new Date(),
          });

          const interval = setInterval(async () => {
            const result = await axios.get(
              `${this.options.baseUrl}/pub/backend/get_pod_log?model_id=${modelId}&instance_id=&is_dedicated=`
            );
            const { waiting, running, error } = result.data;
            const xwaiting = waiting
              ? waiting.replace('Container', '')
              : undefined;
            if (xwaiting) {
              if (xwaiting === 'CrashLoopBackOff') {
                clearInterval(interval);
                callback({
                  event: 'error',
                  message: 'Model is CrashLoopBackOff.',
                  time: new Date(),
                });
              } else {
                callback({
                  event: 'proccess',
                  message: `Model is ${xwaiting}`,
                  time: new Date(),
                });
              }
            } else if (error) {
              clearInterval(interval);
              callback({
                event: 'error',
                message: ApiErrorType(error),
                time: new Date(),
              });
            } else if (running) {
              clearInterval(interval);
              const xresult = await this.runModel(modelId, payload);
              callback({
                event: 'end',
                message: 'ok',
                data: await xresult,
                time: new Date(),
              });
            }
          }, 15000);
        } else {
          callback({
            event: 'end',
            message: 'ok',
            data: await result,
            time: new Date(),
          });
        }
      }
    } catch (error) {
      callback({
        event: 'error',
        message: ApiErrorType(error),
        time: new Date(),
      });
    }
  }

  /**
   * @async
   * @param {number} modelId - ID of the model in which the file will be used
   * @param {string} filepath - local file path
   * @returns {{url:"..."}} - Uploaded file link
   */
  async fileUpload(modelId, filepath) {
    try {
      if (await this.isConnected()) {
        let data = new FormData();
        data.append('file', fs.createReadStream(filepath));
        let config = {
          method: 'post',
          maxBodyLength: Infinity,
          url: `${this.options.baseUrl}/pub/backend/api/v1/file_upload/${modelId}`,
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: 'Bearer ' + this.tokenData.access_token,
            ...data.getHeaders(),
          },
          data: data,
        };
        const result = await axios.request(config);
        return await result.data;
      }
    } catch (error) {
      throw error;
    }
  }

  /**
   * @async
   * @param {string} filepath - Uploaded file link
   * @param {string} destination - path to the file to save
   * @returns {string}  - path to the file to save
   */
  async fileDownloadAndSave(filepath, destination) {
    try {
      if (await this.isConnected()) {
        const writer = fs.createWriteStream(destination);
        const response = await axios.get(
          `${this.options.baseUrl}/pub/backend/api/v1/file_download?file=${filepath}`,
          {
            responseType: 'stream',
            headers: {
              Authorization: 'Bearer ' + this.tokenData.access_token,
            },
          }
        );
        response.data.pipe(writer);
        return filepath;
      }
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Aimped;
