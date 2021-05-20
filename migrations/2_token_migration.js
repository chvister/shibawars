const ShibaWars = artifacts.require("ShibaWars");
const ShibaInu = artifacts.require("ShibaInu");
const STT = artifacts.require("ShibaTreatToken");

module.exports = async function (deployer) {
  // create shiba wars smart contract
  await deployer.deploy(ShibaWars);
  let tokenInstance = await ShibaWars.deployed();
  await tokenInstance.initialMint();

  // create shiba treat token
  let shibaWarsAddress = tokenInstance['address'];
  await deployer.deploy(STT, shibaWarsAddress);
  tokenInstance = await STT.deployed();
  await tokenInstance.transferOwnership(shibaWarsAddress);

  //await deployer.deploy(ShibaInu, "Shiba Inu", "SHIB", 1000000000000000, deployer["networks"]["development"]["from"]);
  //let tokenInstance = await ShibaInu.deployed();
};
