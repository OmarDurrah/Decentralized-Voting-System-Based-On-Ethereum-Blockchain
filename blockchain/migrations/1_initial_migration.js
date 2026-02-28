const VotingSystem = artifacts.require("VotingSystem");

module.exports = async function (deployer) {
  await deployer.deploy(VotingSystem);
  const instance = await VotingSystem.deployed();

  console.log("✅ VotingSystem deployed at:", instance.address);
};