const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Deploy CarbonCreditToken
  console.log("\n📝 Deploying CarbonCreditToken...");
  const CarbonCreditToken = await hre.ethers.getContractFactory("CarbonCreditToken");
  const token = await CarbonCreditToken.deploy();
  await token.waitForDeployment();
  const tokenAddress = await token.getAddress();
  console.log("✅ CarbonCreditToken deployed to:", tokenAddress);

  // Deploy CarbonCreditRegistry
  console.log("\n📝 Deploying CarbonCreditRegistry...");
  const CarbonCreditRegistry = await hre.ethers.getContractFactory("CarbonCreditRegistry");
  const registry = await CarbonCreditRegistry.deploy();
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("✅ CarbonCreditRegistry deployed to:", registryAddress);

  // Grant ISSUER_ROLE to registry (optional, if you want registry to issue credits)
  // const ISSUER_ROLE = await token.ISSUER_ROLE();
  // await token.grantRole(ISSUER_ROLE, registryAddress);
  // console.log("✅ Granted ISSUER_ROLE to registry");

  console.log("\n📋 Deployment Summary:");
  console.log("CarbonCreditToken:", tokenAddress);
  console.log("CarbonCreditRegistry:", registryAddress);
  console.log("\n💡 Add these addresses to your .env file:");
  console.log(`CARBON_CREDIT_TOKEN_ADDRESS=${tokenAddress}`);
  console.log(`CARBON_CREDIT_REGISTRY_ADDRESS=${registryAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
