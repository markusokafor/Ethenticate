const express = require('express');
const app = express();
var bodyParser = require("body-parser");
const db= require("./models");
const port = 3000
var crypto = require("crypto");
const deploy = require('./deploy');
const hdWalletProvider =  require('truffle-hdwallet-provider');
const infuraEndpoint = 'https://rinkeby.infura.io/v3/92f9830da25c4179bee178f94e362586';
const Web3 = require('Web3');
const provider =  new hdWalletProvider(
    'top mom throw audit relax flame outdoor next boost repair city december',
    infuraEndpoint
);
const web3 = new Web3(provider);
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
db.sequelize.sync({force:false}).then(async ()=>{
    console.log("table generated");
    const result = await db.contract_data.findAll();
    if (result.length === 0){
        await deploy();
    }
}).catch((err)=>console.log(err));
let serve;
app.get('/generateServerKeys', (req, res) => {
    serve = crypto.createDiffieHellman(parseInt(128,10));
    serve.generateKeys();
    let convertedType = serve.getPrime('hex');
    let convertedgenerator = serve.getGenerator('hex')
    db.server_data.create({
        server_private_key:serve.getPrivateKey().toString('hex'),
        server_public_key:serve.getPublicKey().toString('hex')
    })
    res.send({msg:"Server has generated it's keys , use this data to generate yours",serverkeyType: convertedType, serverGenerator: convertedgenerator, serverPublicKey: serve.getPublicKey().toString('hex')});
}); 
app.post('/saveClientKeys', (req, res) => {
    db.server_data.update(   
        {client_public_key: req.body.client_public_key,
        server_secret: serve.computeSecret(req.body.client_public_key,'hex','hex')
        },
        {where: {client_public_key: 'none'}}).then(result => {
            res.send("Keys exchanged successfully")
        }).catch(error => {
            console.log(error);
            res.send("error occured");
        })
});     
app.post('/saveFingerPrint', (req, res) => {
    db.server_data.findOne().then(result => {
        console.log("recieved",req.body)
        db.server_data.update({client_finger_print: req.body.encryptedFP},{
            where: {
                client_public_key: req.body.clientPubKey
            }
        }).then(result => {
            res.send('Finger print saved');
        })
    })
});  
app.post('/compareFingerPrint', (req, res) => {
        db.server_data.findOne({
            where: {
                client_public_key: req.body.clientPubKey
            }
        }).then(async result => {
            const textParts = result.client_finger_print.split(':');
            const IV = new Buffer.from(textParts.shift(), 'hex');
            const encryptedText = new Buffer.from(textParts.join(':'), 'hex');
            var decipher = crypto.createDecipheriv('aes-256-ctr',result.server_secret , IV)
            let fromDB = decipher.update(encryptedText,'hex','utf8')
            fromDB += decipher.final('utf8');

            const textParts2 = req.body.encryptedFP.split(':');
            const IV2 = new Buffer.from(textParts2.shift(), 'hex');
            const encryptedText2 = new Buffer.from(textParts2.join(':'), 'hex');
            var decipher = crypto.createDecipheriv('aes-256-ctr',result.server_secret , IV2)
            let fromClient = decipher.update(encryptedText2,'hex','utf8')
            fromClient += decipher.final('utf8');
            const contractFormDB = await db.contract_data.findOne()
            const accounts = await web3.eth.getAccounts();
            let contract = new web3.eth.Contract(JSON.parse(contractFormDB.interface),contractFormDB.address);
            if(fromDB === fromClient){
                try {
                    await contract.methods.saveResult(true)
                    .send({from : accounts[0],gas: '1000000'});
                    res.send("Authentication successful, record inserted in blockchain");
                } catch (error) {
                    console.log(error);
                }
            } else {
                try {
                    await contract.methods.saveResult(false)
                    .send({from : accounts[0],gas: '1000000'});
                    res.send("Authentication failed, record inserted in blockchain");
                } catch (error) {
                    console.log(error);
                }
            }
        })
});  
app.get('/GetAllResults', (req, res) => {
    db.server_data.findOne().then(result => {
        console.log("recieved",req.body)
        db.server_data.findOne().then(async result => {
            const accounts = await web3.eth.getAccounts();
            const contractFormDB = await db.contract_data.findOne()
            
            let contract = new web3.eth.Contract(JSON.parse(contractFormDB.interface),contractFormDB.address);
            try {
                let count = await contract.methods.results()
                .call({from : accounts[0]});
                console.log(count);
                let allResults = []
                for(let i = 0 ; i < count; i++){
                    let individualAuth = await contract.methods.Authentications(i)
                    .call({from : accounts[0]});
                    allResults.push({WasAuthenticated : individualAuth.isAuthenticated, TimeStamp: individualAuth.TimeStamp});
                }
                console.log(",",allResults);
                res.send(allResults);
            } catch (error) {
                console.log(error);
            }
        })
    })
});  

app.listen(port, () => console.log(`Finger Print verification server listening on port ${port}!`))