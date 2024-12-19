"use client";

import { useState } from "react";
import { parseEther } from "viem";
import { useScaffoldWriteContract, useScaffoldReadContract } from "~~/hooks/scaffold-eth";

const InvoiceApp = () => {
  const [payerAddress, setPayerAddress] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");

  // Хуки для записи в контракт
  const { writeContractAsync: createInvoice, isPending: isCreating } = useScaffoldWriteContract("YourContract");
  const { writeContractAsync: payInvoice, isPending: isPaying } = useScaffoldWriteContract("YourContract");

  // Хук для чтения инвойса
  const { data: invoiceData } = useScaffoldReadContract({
    contractName: "YourContract",
    functionName: "getInvoice",
    args: [BigInt(invoiceId) || 0n], // Преобразование invoiceId в BigInt
  });

  /**
   * Создать инвойс
   */
  const handleCreateInvoice = async () => {
    try {
      await createInvoice(
        {
          functionName: "createInvoice",
          args: [payerAddress, parseEther(amount), description],
        },
        {
          onBlockConfirmation: (txnReceipt) => {
            console.log("📦 Invoice created, blockHash:", txnReceipt.blockHash);
            alert("Invoice created successfully!");
          },
        }
      );
    } catch (error) {
      console.error("Error creating invoice:", error);
      alert("Failed to create invoice.");
    }
  };

  /**
   * Оплатить инвойс
   */
  const handlePayInvoice = async () => {
    try {
      await payInvoice(
        {
          functionName: "payInvoice",
          args: [BigInt(invoiceId) || 0n], // Преобразование invoiceId в BigInt
          value: parseEther(paymentAmount),
        },
        {
          onBlockConfirmation: (txnReceipt) => {
            console.log("📦 Payment confirmed, blockHash:", txnReceipt.blockHash);
            alert("Invoice paid successfully!");
          },
        }
      );
    } catch (error) {
      console.error("Error paying invoice:", error);
      alert("Failed to pay invoice.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-10 bg-base-300">
      <h1 className="text-4xl font-bold mb-6">Invoice Management</h1>

      <div className="w-full max-w-lg bg-base-100 p-6 rounded-xl shadow-md space-y-6">
        {/* Форма для создания инвойса */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Create Invoice</h2>
          <input
            type="text"
            placeholder="Payer Address"
            className="input input-bordered w-full"
            value={payerAddress}
            onChange={(e) => setPayerAddress(e.target.value)}
          />
          <input
            type="text"
            placeholder="Amount (ETH)"
            className="input input-bordered w-full"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <input
            type="text"
            placeholder="Description"
            className="input input-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <button
            className="btn btn-primary w-full"
            onClick={handleCreateInvoice}
            disabled={isCreating}
          >
            {isCreating ? <span className="loading loading-spinner loading-sm"></span> : "Create Invoice"}
          </button>
        </div>

        {/* Форма для получения данных по инвойсу */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Get Invoice</h2>
          <input
            type="number"
            placeholder="Invoice ID"
            className="input input-bordered w-full"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
          />
          {invoiceData && (
            <div className="mt-4 p-4 bg-base-200 rounded-md">
              <p>
                <strong>Payer:</strong> {invoiceData[0]}
              </p>
              <p>
                <strong>Amount:</strong> {Number(invoiceData[1]) / 1e18} ETH
              </p>
              <p>
                <strong>Description:</strong> {invoiceData[2]}
              </p>
              <p>
                <strong>Status:</strong> {invoiceData[3] ? "Paid" : "Unpaid"}
              </p>
            </div>
          )}
        </div>

        {/* Форма для оплаты инвойса */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Pay Invoice</h2>
          <input
            type="number"
            placeholder="Invoice ID"
            className="input input-bordered w-full"
            value={invoiceId}
            onChange={(e) => setInvoiceId(e.target.value)}
          />
          <input
            type="text"
            placeholder="Payment Amount (ETH)"
            className="input input-bordered w-full"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
          />
          <button
            className="btn btn-accent w-full"
            onClick={handlePayInvoice}
            disabled={isPaying}
          >
            {isPaying ? <span className="loading loading-spinner loading-sm"></span> : "Pay Invoice"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoiceApp;
