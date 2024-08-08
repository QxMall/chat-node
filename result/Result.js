const SuccessResult = (data) => {
  return {
    success: true,
    code: '000000',
    data: typeof data === 'string' || Array.isArray(data) ? data : {
      ...data,
    }
  };
};

const FailedResult = (data = {}) => {
  return {
    success: false,
    ...data,
  };
};

module.exports = {
  SuccessResult,
  FailedResult,
};