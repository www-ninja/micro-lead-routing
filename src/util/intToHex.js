// Mapping int Id of mysql to hex Id
const intToHex = (int, length) => {
  const hex = Number(int).toString(16);
  return '0'.repeat(length - hex.length) + hex;
};

module.exports = intToHex;
