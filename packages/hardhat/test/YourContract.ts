import { expect } from "chai";
import { ethers } from "hardhat";
import { YourContract } from "../typechain-types";

describe("YourContract", function () {
  let yourContract: YourContract;
  let owner: any;
  let payer: any;

  before(async () => {
    [owner, payer] = await ethers.getSigners();
    const yourContractFactory = await ethers.getContractFactory("YourContract");
    yourContract = (await yourContractFactory.deploy()) as YourContract;
    await yourContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      expect(await yourContract.owner()).to.equal(owner.address);
    });
  });

  describe("Invoice Management", function () {
    it("Should create an invoice successfully", async function () {
      const amount = ethers.parseEther("1");
      const description = "Test Invoice";

      const tx = await yourContract.connect(owner).createInvoice(payer.address, amount, description);
      await tx.wait();

      const invoice = await yourContract.getInvoice(1);
      expect(invoice[0]).to.equal(payer.address);
      expect(invoice[1]).to.equal(amount);
      expect(invoice[2]).to.equal(description);
      expect(invoice[3]).to.equal(false);
    });

    it("Should retrieve all invoices for a specific payer", async function () {
      const invoices = await yourContract.getInvoicesByPayer(payer.address);
      expect(invoices.length).to.equal(1);
      expect(invoices[0]).to.equal(1);
    });

    it("Should allow a payer to pay an invoice", async function () {
      const amount = ethers.parseEther("1");
      const tx = await yourContract.connect(payer).payInvoice(1, { value: amount });
      await tx.wait();

      const invoice = await yourContract.getInvoice(1);
      expect(invoice[3]).to.equal(true); // Invoice status should be true (paid)
    });

    it("Should prevent overpaying an invoice", async function () {
      const excessAmount = ethers.parseEther("2");
      await expect(yourContract.connect(payer).payInvoice(1, { value: excessAmount })).to.be.revertedWith("Invoice is already paid");
    });

    it("Should prevent non-payer from paying an invoice", async function () {
      const newPayer = (await ethers.getSigners())[2];
      await expect(yourContract.connect(newPayer).payInvoice(1, { value: ethers.parseEther("1") })).to.be.revertedWith("Only the payer can pay this invoice");
    });

    it("Should prevent payment of non-existent invoice", async function () {
      await expect(yourContract.connect(payer).payInvoice(999, { value: ethers.parseEther("1") })).to.be.revertedWith("Invalid invoice ID");
    });

    it("Should not allow non-owner to withdraw funds", async function () {
      await expect(yourContract.connect(payer).withdraw()).to.be.revertedWith("Not the Owner");
    });
  });
});
