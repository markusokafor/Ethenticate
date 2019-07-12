const axios = require('axios')
var crypto = require("crypto");
const db= require("./models");

axios.get('http://localhost:3000/generateServerKeys')
.then(async (res) => {
  const client= crypto.createDiffieHellman(Buffer.from(res.data.serverkeyType,'hex'), Buffer.from(res.data.serverGenerator,'hex'));
  client.generateKeys();
  console.log('pub',client.getPublicKey().toString('hex'));
  console.log('priv',client.getPrivateKey().toString('hex'));
  db.client_data.create({
    client_private_key: client.getPrivateKey().toString('hex'),
    client_public_key: client.getPublicKey().toString('hex'),
    server_public_key: res.data.serverPublicKey,
    client_secret: client.computeSecret(res.data.serverPublicKey,'hex','hex')
  }).then(result => {
      axios.post('http://localhost:3000/saveClientKeys',{
        client_public_key: result.client_public_key
      }).then(result => {
        console.log(result.data);
      }).catch(error => {
        console.log(error);
      })
  })

})
.catch((error) => {
  console.error(error)
})