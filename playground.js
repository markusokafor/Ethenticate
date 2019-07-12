const hdWalletProvider =  require('truffle-hdwallet-provider');
const infuraEndpoint = 'https://rinkeby.infura.io/v3/92f9830da25c4179bee178f94e362586';
const Web3 = require('Web3');
const provider =  new hdWalletProvider(
    'top mom throw audit relax flame outdoor next boost repair city december',
    infuraEndpoint
);

const web3 = new Web3(provider);

const deploy = async()=>{
	const result = await db.contract_data.findOne()
	const accounts = await web3.eth.getAccounts();
	let contract = new web3.eth.Contract(JSON.parse(result.interface),result.address);
	try {
		let cotractRes = await contract.methods.saveResult(true)
		.send({from : accounts[0],gas: '1000000'});
	} catch (error) {
		console.log(error);
	}


}
deploy();
