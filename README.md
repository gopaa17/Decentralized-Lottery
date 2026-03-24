# 🎲 Decentralized Lottery on Stellar (Soroban)

## 📌 Project Description
<img width="1920" height="1080" alt="image" src="https://github.com/user-attachments/assets/c21270d1-665c-4964-b382-418876e12902" />

This project is a decentralized lottery smart contract built using Soroban (Stellar’s smart contract platform). It allows users to participate in a transparent and trustless lottery system without relying on a centralized authority.

---

## ⚙️ What it does
- Users can enter the lottery by calling the smart contract
- The contract stores all participants securely on-chain
- A winner is selected using pseudo-random logic
- After selecting a winner, the lottery resets automatically

---

## ✨ Features
- 🧾 Fully on-chain participant tracking  
- 🔐 Secure authentication using Stellar addresses  
- 🎯 Fair winner selection (basic randomness for demo)  
- 🔄 Automatic reset after each round  
- ⚡ Built using Soroban SDK (Rust)

---

## 🚀 Smart Contract Functions

### `init()`
Initializes the lottery contract.

### `enter(player: Address)`
Allows a user to enter the lottery.

### `get_players()`
Returns the list of all participants.

### `pick_winner()`
Selects a winner and resets the lottery.

---

## ⚠️ Note on Randomness
The current implementation uses ledger timestamp for randomness, which is **not secure for production use**. For real-world applications, integrate a secure randomness oracle.

---

## 🛠 Tech Stack
- Soroban SDK (Rust)
- Stellar Blockchain

---
https://stellar.expert/explorer/testnet/contract/CBSQYC4TWGUO6BAHFFDYXUYDB5MZEFGJW65CG6QL6KPAZFPDTRA6XIWV

## 📦 Deployment

1. Build the contract:
```bash
cargo build --target wasm32-unknown-unknown --release
