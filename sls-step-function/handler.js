module.exports.hello = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify(`hello ${event}`),
  };
};

module.exports.add = async ({ x, y }) => {
  return x + y;
};

module.exports.double = async (n) => {
  if (n > 50) {
    throw new NumberIsTooBig(n);
  }
  return n * 2;
};

class NumberIsTooBig extends Error {
  constructor(n) {
    super(`${n} is too big`);
    this.name = "NumberIsTooBig";
    Error.captureStackTrace(this, NumberIsTooBig);
  }
}
