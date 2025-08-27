const express = require("express");
const server = express();
const productRouter = require("./routes/product");

server.use(express.json());
server.use(express.static("public"));
server.use("/products", productRouter.router);
//7cGzSyERBFHtEQEg    ==>atlas
// OGdaVaQz6xlVFxVQ

server.listen(8080, () => {
  console.log("Server Started");
});
