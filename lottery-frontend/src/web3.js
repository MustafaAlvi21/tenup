import Web3 from 'web3';

let web3;

if (window.ethereum){
  web3 = new Web3(window.ethereum);
  console.log(web3);
}
else{
  web3 = new Web3('https://data-seed-prebsc-2-s3.binance.org:8545');
  console.log(web3);
}
export default web3;