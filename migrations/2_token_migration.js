const DecPort = artifacts.require("DecPort");

module.exports = async function (deployer) {
  await deployer.deploy(DecPort);
  let tokenInstance = await DecPort.deployed();

  //await deployer.deploy(ShibaInu, "Shiba Inu", "SHIB", 1000000000000000, deployer["networks"]["development"]["from"]);
  //let tokenInstance = await ShibaInu.deployed();
};
