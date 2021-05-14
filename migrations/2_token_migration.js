const Token = artifacts.require("Token");
const ShibaInu = artifacts.require("ShibaInu");

module.exports = async function (deployer) {
  await deployer.deploy(Token, "Shiba Wars", "SHIBW");
  let tokenInstance = await Token.deployed();
  await tokenInstance.mint(0, 100, 100, 100);
  await tokenInstance.mint(1, 100, 100, 100);

  //await deployer.deploy(ShibaInu, "Shiba Inu", "SHIB", 1000000000000000, deployer["networks"]["development"]["from"]);
  //tokenInstance = await ShibaInu.deployed();
};
