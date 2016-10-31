# tensorflow-serving-node-client
Node gRPC client for TensorFlow Serving server

```
const fs = require('fs');
const client = require('tensorflow-serving-node-client')('localhost:9000');

const IMAGE_PATH = './cat.jpg';
const buffer = fs.readFileSync(IMAGE_PATH);

client.predict(buffer, (err, res) => {
  if (err) {
    return console.error(err);
  }

  console.log(res);
});
```