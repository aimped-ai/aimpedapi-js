# aimped

aimped is a Nodejs library used for Aimped Api integrations.

## Installation

Use the package manager [npm](https://www.npmjs.com/) to install aimped.

```bash
npm install aimpedapi-js
```

## Documentation

A folder named docs will be genereated. You can examine the documentation by selecting the `index.html` in this folder.

```bash
npm i -g jsdoc
yarn doc
```

## Clone

Use the [git]() to clone aimpedapijs.

```bash
git clone https://github.com/aimped-ai/aimpedapi-js.git
```

## Configuration of the Library

```javascript
// require aimped
const Aimped = require('aimpedapi-js');

// Create new class Aimped
const userKey = ''; // Userkey received from A3M.
const userSecret = ''; // userSecret received from A3M.
const BASE_URL = 'https://aimped.ai', // Aimped domain url

const AIMPED = new Aimped(userKey, userSecret, {
  baseUrl: BASE_URL,
});
```

## Preparation of the model input data

```javascript
const modelId = "" ; // id of the model to run
const inputData = {...} ;// input information, can be checked from model description
```

## Usage of API Function

```javascript
const runModel = async () => {
  try {
    const result = await AIMPED.runModel(modelId, inputData);
    console.log(JSON.stringify(result));
  } catch (error) {
    console.log(error);
  }
};
```

## Usage of API Callback Function

```javascript
// return callback function

const runModelCallback = async () => {
  AIMPED.runModelCallback(modelId, inputData, (e) => {
    const { event, message, time, data } = e;
    switch (event) {
      case 'start':
        console.log(modelId, time, message);
        break;

      case 'proccess':
        console.log(modelId, time, message);
        break;

      case 'error':
        console.log(modelId, time, message);
        break;
      case 'end':
        console.log(modelId, time, message, JSON.stringify(data));
        break;

      default:
        break;
    }
  });
};
```

## Usage of API File Upload

Some of the models supports file inputs. These inputs are accepted as URIs. Here is the usage of API for file uploads.

```javascript
const runModelFileUpload = async () => {
  await AIMPED.getAllData();
  const result = await AIMPED.fileUpload(
    modelId,
    '/Users/joe/Downloads/xyz.pdf' // sample file path to upload
  );
  console.log(await result);
};
```

## Usage of API File Download

Some of the models supports file outputs as result. These outputs are created as URIs. Here is the usage of API for file downloads.

```javascript
const runModelFileDownload = async () => {
  const result = await AIMPED.fileDownloadAndSave(
    'input/application/model_{{modelId}}/user_{{userId}}/file_name', // URI of the model input file or model run output file in the result
    `/Users/joe/Downloads/${new Date().getTime()}file_name` // sample local file path to save
  );
  console.log(await result);
};
```

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License

[MIT](https://choosealicense.com/licenses/mit/)
