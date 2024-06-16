import express from 'express'
import { createHelia } from 'helia'
import { unixfs } from '@helia/unixfs'
import { CID } from 'multiformats/cid'
import fs from 'fs'
import path from 'path'

async function main() {
  const helia = await createHelia()
  const ufs = unixfs(helia)
  const encoder = new TextEncoder()

  const app = express()

  app.set("view engine", "ejs")
  app.use(express.static("public"))
  app.use(express.urlencoded({ extended: true }))
  app.use(express.json())

  app.get("/", (req, res) => {
    res.redirect("/new")
  })

  app.get("/new", (req, res) => {
    res.render("new")
  })

  app.post("/new", async (req, res) => {
    const code = req.body.code

    // Check if code is valid
    if (code.length < 1) {
      res.json({ error: "Code is empty" })
      return
    }

    const bytes = encoder.encode(code)
    
    const cid = await ufs.addBytes(bytes)

    res.json({ hash: cid.toString() })
  });

  app.post("/save", async (req, res) => {
    const code = req.body.code;
    const bytes = encoder.encode(code)
    
    const cid = await ufs.addBytes(bytes)

    res.redirect("/" + cid.toString())
  });

  app.get("/about.md", (req, res) => {
    const code = fs.readFileSync(path.resolve("about.md"), "utf8")

    res.render("code-display", { code, language: "markdown" })
  });

  app.get("/:cid", async (req, res) => {
    let cid = req.params.cid;
    let code = await getCode(cid);

    res.render("code-display", { code, cid })
  });

  app.get("/raw/:cid", async (req, res) => {
    let code = await getCode(req.params.cid)

    res.send(code);
  });

  app.get("/duplicate/:cid", async (req, res) => {
    let cid = req.params.cid;
    let code = await getCode(cid)

    res.render("new", { code })
  });

  // Start the server with the port number
  app.listen(process.env.PORT || 3000, process.env.IP || '127.0.0.1', () => {
    console.log("Server started on port " + (process.env.PORT || 3000))
  })

  const getCode = async (cid) => {
    try {
      cid = CID.parse(cid)
      const decoder = new TextDecoder()

      let code = ""

      for await(const chunk of ufs.cat(cid)) {
        code += decoder.decode(chunk, {
          stream: true
        })
      }

      return code
    } catch (err) {
      return fs.readFileSync(path.resolve("invalid.md"), "utf8")
    }
  }
}

main()
