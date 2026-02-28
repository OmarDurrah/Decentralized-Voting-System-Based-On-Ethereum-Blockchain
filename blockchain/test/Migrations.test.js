const Migrations = artifacts.require("Migrations");

contract("Migrations", (accounts) => {
  it("should deploy the contract successfully", async () => {
    const instance = await Migrations.deployed();
    assert(instance.address !== "", "Migrations contract was not deployed");
  });
});
