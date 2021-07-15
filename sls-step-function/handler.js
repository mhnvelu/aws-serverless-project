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
  return n * 2;
};
