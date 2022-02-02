const encodeToBase64 = (query, flags) => Buffer.from(JSON.stringify({
  ...query,
  ...flags,
})).toString('base64');

const decodeToUtf8 = (encoded) => Buffer.from(`${encoded}`, 'base64').toString('utf8');

module.exports = { encodeToBase64, decodeToUtf8 };
