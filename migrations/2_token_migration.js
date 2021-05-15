const Token = artifacts.require("Token");
const ShibaInu = artifacts.require("ShibaInu");

module.exports = async function (deployer) {
  await deployer.deploy(Token, "Shiba Wars", "SHIBW");
  let tokenInstance = await Token.deployed();
  await tokenInstance.initialMint();

  //await deployer.deploy(ShibaInu, "Shiba Inu", "SHIB", 1000000000000000, deployer["networks"]["development"]["from"]);
  //let tokenInstance = await ShibaInu.deployed();
};
