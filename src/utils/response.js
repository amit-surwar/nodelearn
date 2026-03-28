const sendSuccess = (res, data, meta = {}, statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    data,
    error: null,
    meta,
  });
};

const sendError = (res, error, statusCode = 500, meta = {}) => {
  return res.status(statusCode).json({
    success: false,
    data: null,
    error,
    meta,
  });
};

module.exports = { sendSuccess, sendError };
