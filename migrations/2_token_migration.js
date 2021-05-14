const Token = artifacts.require("Token");

module.exports = async function (deployer) {
  await deployer.deploy(Token, "Shiba Wars", "SHIBW");
  let tokenInstance = await Token.deployed();
  await tokenInstance.mint(0, 100, 100, 100);
  await tokenInstance.mint(1, 100, 100, 100);
};
