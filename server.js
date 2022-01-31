const express = require("express");
const IPFS = require("ipfs-core");
const CID = require("cids");
const fs = require("fs");

async function main() {
  const ipfs = await IPFS.create();

  const app = express();

  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  app.get("/", (req, res) => {
    res.redirect("/new");
  });

  app.get("/new", (req, res) => {
    res.render("new");
  });

  app.post("/new", async (req, res) => {
    const code = req.body.code;

    //Check if code is valid
    if (code.length < 1) {
      res.json({ error: "Code is empty" });
      return;
    }

    const hash = await ipfs.add(code);

    res.json({ hash: hash.path });
  });

  app.post("/save", async (req, res) => {
    const code = req.body.code;
    const hash = await ipfs.add(code);

    res.redirect("/" + hash.path);
  });

  app.get("/about.md", async (req, res) => {
    const code = fs.readFileSync("about.md", "utf8");

    res.render("code-display", { code, language: "markdown" });
  });

  app.get("/:cid", async (req, res) => {
    let cid = req.params.cid;
    let code = await getCode(cid);

    res.render("code-display", { code, cid });
  });

  app.get("/raw/:cid", async (req, res) => {
    let code = await getCode(req.params.cid);

    res.send(code);
  });

  app.get("/duplicate/:cid", async (req, res) => {
    let cid = req.params.cid;
    let code = await getCode(cid);

    res.render("new", { code });
  });

  // Start the server with the port number
  app.listen(process.env.PORT || 3000, () => {
    console.log("Server started on port " + (process.env.PORT || 3000));
  });

  const getCode = async (cid) => {
    cid = new CID(cid);
    const data = await ipfs.cat(cid);

    let code = "";

    for await (const chunk of data) {
      code += chunk.toString("utf8");
    }

    return code;
  };
}

main();
