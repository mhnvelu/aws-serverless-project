let response;
exports.lambdaHandler = async (event, context) => {
    try {
        response = {
            'statusCode': 200,
            'body': JSON.stringify({
                message: 'Object created in S3',
            })
        }
    } catch (err) {
        console.log(err);
        return err;
    }

    return response;
};
