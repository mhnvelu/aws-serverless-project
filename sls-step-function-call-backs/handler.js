const AWS = require("aws-sdk");
const SFN = new AWS.StepFunctions();

module.exports.sqs = async (event) => {
  console.log(JSON.stringify(event));

  const record = event.Records[0];
  const body = JSON.parse(record.body);

  await SFN.sendTaskSuccess({
    output: JSON.stringify("Hello From sf-sqs-lambda"),
    taskToken: body.Token,
  }).promise();
};

module.exports.lambda = async (event) => {
  console.log(JSON.stringify(event));

  await SFN.sendTaskSuccess({
    output: JSON.stringify("Hello From sf-lambda"),
    taskToken: event.Token,
  }).promise();
};

module.exports.sns = async (event) => {
  console.log(JSON.stringify(event));

  const record = event.Records[0];
  const message = JSON.parse(record.Sns.Message);

  await SFN.sendTaskSuccess({
    output: JSON.stringify("Hello From sf-sns-lambda"),
    taskToken: message.Token,
  }).promise();
};
