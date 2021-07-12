const ShibaWars = artifacts.require("ShibaWars");
const ShibaInu = artifacts.require("ShibaInu");
const Leash = artifacts.require("Leash");
const ShibaWarsUtils = artifacts.require("ShibaWarsUtils");
const ShibaWarsEntity = artifacts.require("ShibaWarsEntity");
const ShibaMath = artifacts.require("ShibaMath");
const ShibaWarsArena = artifacts.require("ShibaWarsArena");
const ShibaWarsFactory = artifacts.require("ShibaWarsFactory");

module.exports = async function (deployer, networks, accounts) {
  // deploy libs
  await deployer.deploy(ShibaWarsUtils);
  await deployer.link(ShibaWarsUtils, ShibaWars);  
  await deployer.link(ShibaWarsUtils, ShibaWarsFactory);

  await deployer.deploy(ShibaWarsEntity);
  await deployer.link(ShibaWarsEntity, ShibaWars);
  await deployer.link(ShibaWarsEntity, ShibaWarsArena);

  await deployer.deploy(ShibaMath);
  await deployer.link(ShibaMath, ShibaWars);
  await deployer.link(ShibaMath, ShibaWarsArena);
  await deployer.link(ShibaMath, ShibaWarsFactory);

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

  console.log("wars: " + shibaWarsAddress);
  console.log("arena: " + arenaAddress);
  console.log("factory: " + factoryAddress);

  /*await deployer.deploy(ShibaInu, {from : accounts[0]});
  let tokenInstance2 = await ShibaInu.deployed();*/

  /*await deployer.deploy(Leash, {from : accounts[0]});
  let tokenInstance2 = await Leash.deployed();*/
};
