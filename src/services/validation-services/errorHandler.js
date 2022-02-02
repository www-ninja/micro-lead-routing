/* eslint-disable curly, consistent-return */
module.exports = (message, code) => {
  const error = new Error();
  error.message = message;
  error.status = code;

  return error;
};
