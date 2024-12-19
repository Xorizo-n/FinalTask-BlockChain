// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";

/**
 * A smart contract that allows users to create, pay, and retrieve invoices.
 */
contract YourContract {
    // State Variables
    address public immutable owner;
    uint256 public totalInvoices;

    struct Invoice {
        address payer;
        uint256 amount;
        string description;
        bool status; // false = unpaid, true = paid
    }

    mapping(uint256 => Invoice) public invoices; // invoiceId => Invoice
    mapping(address => uint256[]) public payerInvoices; // payer address => list of invoiceIds

    // Events
    event InvoiceCreated(address indexed payer, uint256 indexed invoiceId, uint256 amount, string description);
    event InvoicePaid(address indexed payer, uint256 indexed invoiceId, uint256 amount);

    // Constructor
    constructor() {
        owner = msg.sender;
    }

    // Modifier to ensure only the owner can execute specific functions
    modifier isOwner() {
        require(msg.sender == owner, "Not the Owner");
        _;
    }

    /**
     * Create a new invoice.
     * @param _payer The address of the payer who needs to pay the invoice.
     * @param _amount The amount to be paid in wei.
     * @param _description The description of the invoice.
     */
    function createInvoice(address _payer, uint256 _amount, string memory _description) public {
        require(_payer != address(0), "Payer address cannot be zero");
        require(_amount > 0, "Amount must be greater than zero");

        totalInvoices++;
        invoices[totalInvoices] = Invoice({
            payer: _payer,
            amount: _amount,
            description: _description,
            status: false
        });
        payerInvoices[_payer].push(totalInvoices);

        emit InvoiceCreated(_payer, totalInvoices, _amount, _description);
    }

    /**
     * Pay an existing invoice.
     * @param _invoiceId The ID of the invoice to be paid.
     */
    function payInvoice(uint256 _invoiceId) public payable {
        require(_invoiceId > 0 && _invoiceId <= totalInvoices, "Invalid invoice ID");
        Invoice storage invoice = invoices[_invoiceId];
        require(msg.sender == invoice.payer, "Only the payer can pay this invoice");
        require(!invoice.status, "Invoice is already paid");
        require(msg.value >= invoice.amount, "Insufficient payment amount");

        invoice.status = true;

        emit InvoicePaid(msg.sender, _invoiceId, msg.value);
    }

    /**
     * Get the details of a specific invoice.
     * @param _invoiceId The ID of the invoice to be retrieved.
     * @return Invoice details (payer, amount, description, status).
     */
    function getInvoice(uint256 _invoiceId) public view returns (address, uint256, string memory, bool) {
        require(_invoiceId > 0 && _invoiceId <= totalInvoices, "Invalid invoice ID");
        Invoice memory invoice = invoices[_invoiceId];
        return (invoice.payer, invoice.amount, invoice.description, invoice.status);
    }

    /**
     * Get all invoices created for a specific payer.
     * @param _payer The address of the payer.
     * @return List of invoice IDs associated with the payer.
     */
    function getInvoicesByPayer(address _payer) public view returns (uint256[] memory) {
        return payerInvoices[_payer];
    }

    /**
     * Withdraw Ether from the contract. Only the owner can withdraw.
     */
    function withdraw() public isOwner {
        (bool success, ) = owner.call{ value: address(this).balance }("");
        require(success, "Failed to send Ether");
    }

    /**
     * Allow the contract to receive Ether.
     */
    receive() external payable {}
}
