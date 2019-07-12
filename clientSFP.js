const axios = require('axios')
var crypto = require("crypto");
const db= require("./models");

db.client_data.findOne().then(async result => {
    console.log('result',result.client_public_key);
    
    const fingerPrint = 'abcdefghijklmnopqrstuvwxyz'
    const iv = new Buffer.from(crypto.randomBytes(16));
    ivstring = iv.toString('hex');
    var cipher = crypto.createCipheriv('aes-256-ctr',result.client_secret, iv)
    var crypted = cipher.update(fingerPrint,'utf8','hex');
    crypted += cipher.final('hex');
    let encryptedFP =  `${iv.toString('hex')}:${crypted.toString()}`;
    axios.post('http://localhost:3000/saveFingerPrint',{
        encryptedFP: encryptedFP,
        clientPubKey: result.client_public_key
    }).then( result => {
        console.log(result.data);
    }).catch(err => {
        console.log(err);
    })
});