const Token = artifacts.require("Token");

module.exports = async function (deployer) {
  await deployer.deploy(Token, "Shiba Wars", "SHIBW");
  let tokenInstance = await Token.deployed();
  await tokenInstance.mint("Bojar da Killa", "Altough he's not a Shiba, do not mess with him. The warden of order.", 100, 100, 100);
  let shiba = await tokenInstance.getTokenDetails(0);
  console.log(shiba);
};
