module.exports = async (req, res, next) => {
  try {
    req.body = undefined;
    return next();
  } catch (error) {
    return next(error);
  }
};
