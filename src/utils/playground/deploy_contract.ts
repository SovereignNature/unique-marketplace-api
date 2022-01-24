import { evmToAddress } from '@polkadot/util-crypto';

import * as unique from '../blockchain/unique';
import * as lib from '../blockchain/web3';
import * as util from '../blockchain/util';

import { signTransaction, transactionStatus } from '../blockchain/polka';
import * as logging from '../logging'


export const main = async(moduleRef) => {
  const config = moduleRef.get('CONFIG', {strict: false});
  if(config.blockchain.escrowSeed === null) {
    logging.log('You need to set ESCROW_SEED env or override config "blockchain.escrowSeed" section');
    return;
  }

  logging.log(['WS endpoint', config.blockchain.unique.wsEndpoint]);
  const web3conn = lib.connectWeb3(config.blockchain.unique.wsEndpoint);
  const api = await unique.connectApi(config.blockchain.unique.wsEndpoint, false), web3 = web3conn.web3;

  const escrow = util.privateKey(config.blockchain.escrowSeed);
  logging.log(['Escrow substrate address', escrow.address]);
  if(config.blockchain.unique.contractOwnerSeed === null) {
    logging.log('No existed contractOwnerSeed, creating new eth account');
    let balance = BigInt((await api.query.system.account(escrow.address)).data.free.toJSON());
    if (balance < 3000n * lib.UNIQUE) {
      logging.log(['Balance on account', escrow.address, 'too low to create eth account. Need at least', 3000n * lib.UNIQUE])
      return await api.disconnect();
    }
    const account = web3.eth.accounts.create();

    let result = await signTransaction(escrow, api.tx.balances.transfer(evmToAddress(account.address), 1000n * lib.UNIQUE), 'api.tx.balances.transfer') as any;
    if(result.status !== transactionStatus.SUCCESS) {
      logging.log(['Unable to transfer', 1000n * lib.UNIQUE, 'from', escrow.address, 'to', evmToAddress(account.address)], logging.level.ERROR);
      logging.log(result.result.toHuman(), logging.level.ERROR);
      return await api.disconnect();
    }

    logging.log(['Your new eth account seed', account.privateKey]);
    logging.log(['Your new eth account address', account.address]);
    logging.log('Set it to CONTRACT_ETH_OWNER_SEED env or override config "blockchain.unique.contractOwnerSeed" section');
    logging.log('Re-run this playground after doing this to progress contract creation');

    return await api.disconnect();
  }
  if(config.blockchain.unique.contractAddress !== null) {
    logging.log('Contract already deployed. Check your CONTRACT_ADDRESS env or "blockchain.unique.contractAddress" config section', logging.level.WARNING);
    return await api.disconnect();
  }
  let balance = BigInt((await api.query.system.account(escrow.address)).data.free.toJSON());
  if (balance < 2000n * lib.UNIQUE) {
    logging.log(['Balance on account', escrow.address, 'too low to deploy contract. Need at least', 2000n * lib.UNIQUE])
    return await api.disconnect();
  }
  const account = web3.eth.accounts.privateKeyToAccount(config.blockchain.unique.contractOwnerSeed);
  web3.eth.accounts.wallet.add(account.privateKey);

  const contract = new web3.eth.Contract(JSON.parse(util.blockchainStaticFile('MarketPlace.abi')), undefined, {
    from: account.address, ...lib.GAS_ARGS,
  });
  const deployedContract = await contract.deploy({data: util.blockchainStaticFile('MarketPlace.bin'), arguments: [account.address]}).send({from: account.address, gas: 10000000});
  const helpers = lib.contractHelpers(web3, account.address);
  await helpers.methods.toggleSponsoring(deployedContract.options.address, true).send({from: account.address});
  await helpers.methods.setSponsoringRateLimit(deployedContract.options.address, 1).send({from: account.address});
  let result = await signTransaction(escrow, api.tx.balances.transfer(evmToAddress(deployedContract.options.address), 1000n * lib.UNIQUE), 'api.tx.balances.transfer') as any;
  if(result.status !== transactionStatus.SUCCESS) {
    logging.log(['Unable to transfer', 1000n * lib.UNIQUE, 'from', escrow.address, 'to', evmToAddress(deployedContract.options.address)], logging.level.ERROR);
    logging.log(result.result.toHuman(), logging.level.ERROR);
    return await api.disconnect();
  }
  logging.log(['Your new contract address', deployedContract.options.address]);
  logging.log('Set it to CONTRACT_ADDRESS env or override config "blockchain.unique.contractAddress"');

  return await api.disconnect();

}