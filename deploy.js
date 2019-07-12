const hdWalletProvider =  require('truffle-hdwallet-provider');
const Web3 = require('Web3');
const {interface, bytecode} = require('./compiler');
const infuraEndpoint = 'https://rinkeby.infura.io/v3/92f9830da25c4179bee178f94e362586';
const db = require("./models");
const provider =  new hdWalletProvider(
    'top mom throw audit relax flame outdoor next boost repair city december',
    infuraEndpoint
);

const web3 = new Web3(provider);

const deploy = async()=>{

    const accounts = await web3.eth.getAccounts();
    console.log("deploying using ", accounts[0]);
   const contractAddress =  await new web3.eth.Contract(JSON.parse(interface))
    .deploy({data: bytecode})
    .send({gas:'1000000', from: accounts[0]});
    console.log(contractAddress.options.address);
    let result = await db.contract_data.create({
        interface: interface,
        byte_code: bytecode,
        address: contractAddress.options.address
    });
    console.log(result);
}
module.exports = deploy;
