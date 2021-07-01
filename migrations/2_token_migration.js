const ShibaWars = artifacts.require("ShibaWars");
const ShibaInu = artifacts.require("ShibaInu");
const STT = artifacts.require("ShibaTreatToken");
const ShibaWarsUtils = artifacts.require("ShibaWarsUtils");
const ShibaWarsEntity = artifacts.require("ShibaWarsEntity");

module.exports = async function (deployer, networks, accounts) {
  // deploy libs
  await deployer.deploy(ShibaWarsUtils);
  await deployer.link(ShibaWarsUtils, ShibaWars);  

  await deployer.deploy(ShibaWarsEntity);
  await deployer.link(ShibaWarsEntity, ShibaWars);

  // create shiba wars smart contract
  await deployer.deploy(ShibaWars);
  let tokenInstance = await ShibaWars.deployed();
  await tokenInstance.initialMint();

  // create shiba treat token
  let shibaWarsAddress = tokenInstance['address'];
  await deployer.deploy(STT, shibaWarsAddress);
  tokenInstance = await STT.deployed();
  await tokenInstance.transferOwnership(shibaWarsAddress);

  /*await deployer.deploy(ShibaInu, {from : accounts[0]});
  let tokenInstance2 = await ShibaInu.deployed();*/
};
