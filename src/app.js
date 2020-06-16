const request = require("request");
const getStream = require("get-stream");

const API_KEY = "your-api-key";

function authorize(authorization) {
  if (authorization !== API_KEY) {
    throw new Error("Your API key is invalid or incorrect.");
  }
}

function init(server, recipe) {
  for (let endpoint of recipe.endpoints) {
    const handler = async (req, res) => {
      try {
        await authorize(req.header("Authorization"));
      } catch (e) {
        return res.status(401).json({ message: e.message });
      }

      let statusCode = 0;

      const proxy = req.pipe(request({
        uri: endpoint.service + req.url,
        qs: req.query,
        gzip: true,
      }));

      proxy.on("response", (resp) => {
        statusCode = resp.statusCode;
      });

      const originalString = await getStream(proxy);

      const data = JSON.parse(originalString);

      res.status(statusCode).json(data);
    };

    server[endpoint.method.toLowerCase()](endpoint.path, handler);
  }
}

module.exports = {init};
