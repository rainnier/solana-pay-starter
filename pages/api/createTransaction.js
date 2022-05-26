import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    clusterApiUrl,
    Connection,
    PublicKey,
    Transaction,
    SystemProgram,
    LAMPORTS_PER_SOL
} from '@solana/web3.js';
import BigNumber from "bignumber.js";
import products from "./products.json";

// Make sure you replace this with your wallet address!
const sellerAddress = 'EpA3pJsgVsX9qE3GaxbwG9q8Bya9Sau3Ljjj8Mptrpav';
const sellerPublicKey = new PublicKey(sellerAddress);
const feeCollectorAddress = '9o7hmuR2DpmuLEK5Xbyf97Ui6xrvqUu8vEXpgbvEDbqF';
const feeCollectorPublicKey = new PublicKey(feeCollectorAddress);

const createTransaction = async(req, res) => {
    try {
        // Extract the transaction data from the request body
        const {buyer, orderID, itemID} = req.body;

        // If we don't have something we need, stop!
        if(!buyer) {
            res.status(400).json({
                message: "Missing buyer address"
            });
        }

        if(!orderID) {
            res.status(400).json({
                message: "Missing order ID"
            });
        }

        // Fetch item price from products.json using itemID
        const itemPrice = products.find((item) => item.id === itemID).price;

        if(!itemPrice) {
            res.status(404).json({
                message: "Item not found. Please check item ID"
            });
        }

        // Convert our price to the correct format
        const bigAmount = BigNumber(itemPrice);
        const buyerPublicKey = new PublicKey(buyer);
        const network = WalletAdapterNetwork.Devnet;
        const endpoint = clusterApiUrl(network);
        const connection = new Connection(endpoint);

        // A blockhash is sort of like an ID for a block. It lets you identify each block.
        const { blockhash } = await connection.getLatestBlockhash("finalized");

        // The first two things we need - a recent block ID
        // and the public key of the payer
        const tx = new Transaction({
            recentBlockhash: blockhash,
            feePayer: buyerPublicKey
        });

        const feePercentage = 0.001; // 0.1 Percent
        // This is the "action" that the transaction will take
        // We're just going to transfer some SOL
        const transferInstruction = SystemProgram.transfer({
            fromPubkey: buyerPublicKey,
            // Lamports are the smallest unit of SOL, like Gwei with Ethereum
            lamports: bigAmount.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
            toPubkey: sellerPublicKey
        });

        // We're adding more instructions to the transaction
        transferInstruction.keys.push({
            // We'll user our OrderID to find this transaction later
            pubkey: new PublicKey(orderID),
            isSigner: false,
            isWritable: false
        });

        // This is the "action" that the transaction will take
        // We're just going to transfer some SOL
        const feeTransferInstruction = SystemProgram.transfer({
            fromPubkey: buyerPublicKey,
            // Lamports are the smallest unit of SOL, like Gwei with Ethereum
            lamports: bigAmount.multipliedBy(feePercentage).multipliedBy(LAMPORTS_PER_SOL).toNumber(),
            toPubkey: feeCollectorPublicKey
        });

        // We're adding more instructions to the transaction
        feeTransferInstruction.keys.push({
            // We'll user our OrderID to find this transaction later
            pubkey: new PublicKey(orderID),
            isSigner: false,
            isWritable: false
        });

        tx.add(transferInstruction);
        tx.add(feeTransferInstruction);

        // Formatting our transaction
        const serializedTransaction = tx.serialize({
            requireAllSignatures: false
        });

        const base64 = serializedTransaction.toString("base64");

        res.status(200).json({
            transaction: base64
        });
    } catch(error) {
        console.error(error);
        res.status(500).json({error: "error creating tx"});
        return;
    }
};

export default function handler(req, res) {
    if(req.method === "POST") {
        createTransaction(req, res);
    } else {
        res.status(405).end();
    }
}