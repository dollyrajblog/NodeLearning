const http = require("http");
const fs = require("fs");
const index = fs.readFileSync("index.html", "utf-8");
const datajson = fs.readFileSync("LocalData.json", "utf-8");

const server = http.createServer((req, res) => {
  console.log(req.url);
  if (req.url.startsWith("/product")) {
    const productId = req.url.split("/")[2] || 1;
    console.log("productID", productId);
    const ProductData = JSON.parse(datajson)?.products;
    console.log(JSON.parse(datajson)?.products.length);
    if (productId > 0 && ProductData.length >= productId) {
      const Pdetail = ProductData[productId];
      const productCard = index
        .replace("**title**", Pdetail.title)
        .replace("**price**", Pdetail.price)
        .replace("**img**", Pdetail.thumbnail)
        .replace("**description**", Pdetail.description)
        .replace("**rating**", Pdetail.rating);
      res.setHeader("Content-Type", "text/html");
      res.end(productCard);
    } else {
      res.writeHead(404);
      res.end("Product not found");
    }
    return;
  }

  switch (req.url) {
    case "/":
      res.setHeader("Content-Type", "text/html");
      res.end("<h1>Welcome to server</h1");
      break;
    case "/api":
      res.setHeader("Content-Type", "application/json");
      res.end(datajson);
      break;
    default:
      res.writeHead(404);
      res.end("Page not found");
  }
});
server.listen(8081);
