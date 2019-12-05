/**
 * Node gRPC client for TensorFlow Serving server.
 */

const grpc = require('grpc');

const PROTO_PATH = __dirname + '/protos/prediction_service.proto';

/**
 * Exports client.
 *
 * @param      {string}  connection  Tensorflow Serving connection string. E.g., localhost:9000
 */
module.exports = (connection) => {
  
  // loading service proto
  var tensorflow_serving = grpc.load(PROTO_PATH).tensorflow.serving;

  // creating gRPC service client
  var client = new tensorflow_serving.PredictionService(
    connection, grpc.credentials.createInsecure()
  );

  return {

    /**
     * Calls predict gRPC method on TensorFlow Serving server.
     *
     * @param      {Buffer|Array<Buffer>}  buffer  JPEG data buffer to classify.
     * @param      {Function}              fn      Callback.
     */
    predict: (buffer, fn) => {

      var buffers;
      if (buffer.constructor === Array) {
        buffers = buffer;
      } else {
        buffers = [buffer];
      }

      // building PredictRequest proto message
      const msg = {
        model_spec: { name: 'inception', signature_name: 'predict_images' },
        inputs: {
          images: {
            dtype: 'DT_STRING',
            tensor_shape: {
              dim: {
                size: buffers.length
              }
            },
            string_val: buffers
          }
        }
      };

      // calling gRPC method
      client.predict(msg, (err, response) => {
        if (err) return fn(err);

        // decoding response
        const classes = response.outputs.classes.string_val.map((b) => b.toString('utf8'));

        // splitting results
        var i,
            len = classes.length,
            chunk = 5,
            results = [];
        for (i = 0; i < len; i+=chunk) {
          results.push(classes.slice(i, i+chunk));
        }

        fn(null, results)
      });
      
    }
  }
};
