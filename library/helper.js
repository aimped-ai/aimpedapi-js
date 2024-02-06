const ApiErrorType = (err) => {
  if (err.response) {
    const errors = Array.isArray(err.response.data.error)
      ? err.response.data.error.join('\n')
      : err.response.data.error;
    return errors || err.response.statusText || 'Response Error';
  } else if (err.request) {
    return 'Bad Request';
  } else if (err.message) {
    const errorMsg = err.message.startsWith('detail:')
      ? err.message.replace('detail:', '')
      : err.message;
    return errorMsg;
  } else {
    const errorMsg = err.startsWith('detail:')
      ? err.replace('detail:', '')
      : err;
    return errorMsg;
  }
};
const streamAsPromise = (stream) => {
  return new Promise((resolve, reject) => {
    let data = '';
    stream.on('data', (chunk) => (data += chunk));
    stream.on('end', () => resolve(data));
    stream.on('error', (error) => reject(error));
  });
};
module.exports = {
  streamAsPromise,
  ApiErrorType,
};
