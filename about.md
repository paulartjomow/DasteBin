# About

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

## Using the API

You can post code snippets directly to the API. To use the API, just post a request to /new. The request must be in JSON format:

```
{
  "code": "print('Hello world')"
}
```

After the code has been posted, you will get a response with the IPFS hash of the code.

## License

This is free and open source software.

## Credits

- [IPFS](https://ipfs.io/)
- [EJS](https://ejs.co/)
- [Express](https://expressjs.com/)
- [IPFS-Core](https://github.com/ipfs/js-ipfs)
- [IPFS-HTTP-Client](https://github.com/ipfs/js-ipfs)
