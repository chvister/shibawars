const ShibaWars = artifacts.require("ShibaWars");
const ShibaInu = artifacts.require("ShibaInu");
const STT = artifacts.require("ShibaTreatToken");
const ShibaWarsUtils = artifacts.require("ShibaWarsUtils");
const ShibaWarsEntity = artifacts.require("ShibaWarsEntity");
const ShibaMath = artifacts.require("ShibaMath");
const ShibaWarsArena = artifacts.require("ShibaWarsArena");
const ShibaWarsFactory = artifacts.require("ShibaWarsFactory");

module.exports = async function (deployer, networks, accounts) {
  // deploy libs
  await deployer.deploy(ShibaWarsUtils);
  await deployer.link(ShibaWarsUtils, ShibaWars);  

  await deployer.deploy(ShibaWarsEntity);
  await deployer.link(ShibaWarsEntity, ShibaWars);

  await deployer.deploy(ShibaMath);
  await deployer.link(ShibaMath, ShibaWars);

  // create shiba wars smart contract
  await deployer.deploy(ShibaWars);
  let shibaWars = await ShibaWars.deployed();
  await shibaWars.initialMint();
  let shibaWarsAddress = shibaWars['address'];

  // create arena
  await deployer.deploy(ShibaWarsArena, shibaWarsAddress);
  let shibaWarsArena = await ShibaWarsArena.deployed();
  let arenaAddress = shibaWarsArena['address'];
  shibaWars.setShibaWarsArena(arenaAddress, {from : accounts[0]});

  // create nft factory
  await deployer.deploy(ShibaWarsFactory, shibaWarsAddress);
  let shibaWarsFactory = await ShibaWarsFactory.deployed();
  let factoryAddress = shibaWarsFactory['address'];
  shibaWars.setFactoryAddress(factoryAddress, {from : accounts[0]});

  // create shiba treat token
  await deployer.deploy(STT, shibaWarsAddress);
  let stt = await STT.deployed();
  await stt.transferOwnership(shibaWarsAddress);

  /*await deployer.deploy(ShibaInu, {from : accounts[0]});
  let tokenInstance2 = await ShibaInu.deployed();*/
};
