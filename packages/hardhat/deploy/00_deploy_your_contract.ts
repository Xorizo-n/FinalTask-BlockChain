import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { Contract } from "ethers";

/**
 * Deploys the "YourContract" contract using the deployer account and 
 * constructor arguments set to the deployer address.
 * 
 * @param hre HardhatRuntimeEnvironment object.
 */
const deployYourContract: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  /*
    On localhost, the deployer account is the one that comes with Hardhat, which is already funded.

    When deploying to live networks (e.g `yarn deploy --network sepolia`), the deployer account
    should have sufficient balance to pay for the gas fees for contract creation.

    You can generate a random account with `yarn generate` or `yarn account:import` to import your
    existing PK which will fill DEPLOYER_PRIVATE_KEY_ENCRYPTED in the .env file (then used on hardhat.config.ts).
    You can run the `yarn account` command to check your balance in every network.
  */
  const { deployer } = await hre.getNamedAccounts();
  const { deploy } = hre.deployments;

  // Deploy the contract with the constructor arguments
  const deploymentResult = await deploy("YourContract", {
    from: deployer,
    args: [], // No constructor arguments are needed for the new contract
    log: true,
    autoMine: true, // Automatically mine the contract deployment transaction on local networks
  });

  // Get the deployed contract instance
  const yourContract: Contract = await hre.ethers.getContract("YourContract", deployer);

  console.log("Contract Deployed!");
  console.log("Contract Address:", deploymentResult.address);
  console.log("Transaction Hash:", deploymentResult.transactionHash);

  // Example interaction: Retrieve total invoices count
  const totalInvoices = await yourContract.totalInvoices();
  console.log("Total Invoices at deployment:", totalInvoices.toString());
};

export default deployYourContract;

// Tags are useful if you have multiple deploy files and only want to run one of them.
// e.g. yarn deploy --tags YourContract
deployYourContract.tags = ["YourContract"];