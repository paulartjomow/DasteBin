const express = require("express");

const IPFS = require("ipfs-core");

async function main() {
  const ipfs = await IPFS.create();

  const app = express();

  app.set("view engine", "ejs");
  app.use(express.static("public"));
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req, res) => {
    res.redirect("/new");
  });

  app.get("/new", (req, res) => {
    res.render("new");
  });

  app.post("/save", async (req, res) => {
    const code = req.body.code;
    const hash = await ipfs.add(code);

    res.redirect("/" + hash.path);
  });

  app.get("/about.md", async (req, res) => {
    let code = `# About
DasteBin is a paste server that allows you to save code snippets to IPFS. IPFS is a peer-to-peer distributed content storage system, so it is a decentralized way to store data.
This service is automatically starting up an IPFS node.

The GitHub repository for this project is https://github.com/Prixix/DasteBin.
    
## Features
- Save code
- Share code
- View code
- View code in raw format
    
## How to use
- Go to /new
- Write code
- Click save

## License
This is free and open source software.

## Credits
- [IPFS](https://ipfs.io/)
- [EJS](https://ejs.co/)
- [Express](https://expressjs.com/)
- [IPFS-Core](https://github.com/ipfs/js-ipfs)
- [IPFS-HTTP-Client](https://github.com/ipfs/js-ipfs)`;

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
    console.log("Server started");
  });

  const getCode = async (cid) => {
    const data = await ipfs.cat(cid);

    let code = "";

    for await (const chunk of data) {
      code += chunk.toString();
    }

    return code;
  };
}

main();
