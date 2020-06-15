const request = require("request");
const getStream = require("get-stream");

function init(server, recipe) {
  for (let endpoint of recipe.endpoints) {
    const handler = async (req, res) => {
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

      if (statusCode >= 300) {
        return;
      }

      await res.json(data);
    };

    server[endpoint.method.toLowerCase()](endpoint.path, handler);
  }
}

module.exports = {init};
