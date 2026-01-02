import json
import os
from web3 import Web3
from solcx import compile_standard, install_solc
from dotenv import load_dotenv

load_dotenv()

def deploy():
    # 1. Install specific Solidity version
    print("Installing Solidity compiler...")
    install_solc("0.8.0")

    # 2. Read Contract Source
    with open("backend/contracts/Settlement.sol", "r") as file:
        settlement_file = file.read()

    # 3. Compile Contract
    print("Compiling contract...")
    compiled_sol = compile_standard(
        {
            "language": "Solidity",
            "sources": {"Settlement.sol": {"content": settlement_file}},
            "settings": {
                "outputSelection": {
                    "*": {
                        "*": ["abi", "metadata", "evm.bytecode", "evm.sourceMap"]
                    }
                }
            },
        },
        solc_version="0.8.0",
    )

    bytecode = compiled_sol["contracts"]["Settlement.sol"]["SettlementRegistry"]["evm"]["bytecode"]["object"]
    abi = compiled_sol["contracts"]["Settlement.sol"]["SettlementRegistry"]["abi"]

    # 4. Connect to Blockchain
    # For now, we use a local node or the one in .env
    node_url = os.getenv("ETHEREUM_NODE_URL", "http://127.0.0.1:8545")
    w3 = Web3(Web3.HTTPProvider(node_url))
    
    if not w3.is_connected():
        print(f"Failed to connect to {node_url}")
        return

    chain_id = w3.eth.chain_id
    my_address = os.getenv("WALLET_ADDRESS")
    private_key = os.getenv("PRIVATE_KEY")

    if not private_key or not my_address:
        print("Please set WALLET_ADDRESS and PRIVATE_KEY in .env to deploy.")
        # Fallback for local ganache/hardhat node if available and no keys set
        if w3.eth.accounts:
            print("Using first account from local node.")
            my_address = w3.eth.accounts[0]
            # Local nodes usually unlock accounts, so we might not need private key for transacting if using w3.eth.send_transaction
            # But for consistency with standard deployment, we usually sign.
            # Let's just stop here if it's a real network.
        else:
            return

    print(f"Deploying from {my_address}...")

    # 5. Build Transaction
    Settlement = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Get nonce
    nonce = w3.eth.get_transaction_count(my_address)

    # Build
    transaction = Settlement.constructor().build_transaction({
        "chainId": chain_id,
        "from": my_address,
        "nonce": nonce,
        "gasPrice": w3.eth.gas_price
    })

    # 6. Sign & Send
    if private_key:
        signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)
        tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)
    else:
        # For local unlocked nodes
        tx_hash = w3.eth.send_transaction(transaction)

    print(f"Deploying... Tx Hash: {tx_hash.hex()}")
    
    # 7. Wait for Receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    print(f"Done! Contract deployed to: {tx_receipt.contractAddress}")
    print("\nUpdate your .env file with:")
    print(f"SETTLEMENT_CONTRACT_ADDRESS={tx_receipt.contractAddress}")

    # Save ABI for frontend/backend use
    with open("backend/app/abi.json", "w") as f:
        json.dump(abi, f)
    print("ABI saved to backend/app/abi.json")

if __name__ == "__main__":
    deploy()
