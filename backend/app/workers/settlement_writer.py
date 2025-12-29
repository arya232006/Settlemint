from app.celery_app import celery_app
from app.db.session import SessionLocal
from app.models.payment import Payment
from web3 import Web3
from app.config import settings
from eth_account import Account
import json

# Minimal ABI for the settlement contract
CONTRACT_ABI = [
    {
        "inputs": [
            {"internalType": "address", "name": "_from", "type": "address"},
            {"internalType": "address", "name": "_to", "type": "address"},
            {"internalType": "uint256", "name": "_amount", "type": "uint256"},
            {"internalType": "bytes32", "name": "_settlementHash", "type": "bytes32"}
        ],
        "name": "recordSettlement",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
]

@celery_app.task(acks_late=True, bind=True, max_retries=5)
def write_settlement_to_blockchain(self, payment_id: int):
    db = SessionLocal()
    try:
        payment = db.query(Payment).filter(Payment.id == payment_id).first()
        if not payment:
            return

        if not settings.SETTLEMENT_CONTRACT_ADDRESS or not settings.PRIVATE_KEY:
            print("Blockchain not configured, skipping settlement writing.")
            return

        w3 = Web3(Web3.HTTPProvider(settings.ETHEREUM_NODE_URL))
        if not w3.is_connected():
            raise Exception("Blockchain node not connected")

        contract = w3.eth.contract(address=settings.SETTLEMENT_CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        
        # Prepare data
        # Assuming User model has wallet_address. If not, we can't settle on chain.
        payer_wallet = payment.from_user.wallet_address
        payee_wallet = payment.to_user.wallet_address
        
        if not payer_wallet or not payee_wallet:
            print(f"Users for payment {payment_id} do not have wallet addresses.")
            return

        amount_wei = int(payment.amount * 10**18) # Assuming 18 decimals
        settlement_hash = Web3.solidity_keccak(
            ['address', 'address', 'uint256', 'uint256'],
            [payer_wallet, payee_wallet, amount_wei, int(payment.id)]
        )

        # Build transaction
        account = Account.from_key(settings.PRIVATE_KEY)
        nonce = w3.eth.get_transaction_count(account.address)
        
        tx = contract.functions.recordSettlement(
            payer_wallet,
            payee_wallet,
            amount_wei,
            settlement_hash
        ).build_transaction({
            'chainId': 1337, # Localhost / Ganache
            'gas': 2000000,
            'gasPrice': w3.eth.gas_price,
            'nonce': nonce,
        })
        
        signed_tx = w3.eth.account.sign_transaction(tx, settings.PRIVATE_KEY)
        tx_hash = w3.eth.send_raw_transaction(signed_tx.rawTransaction)
        
        # Wait for receipt? Or just fire and forget?
        # User said "Settlement writing is async".
        # We can wait for receipt to ensure it succeeded.
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
        
        if receipt.status != 1:
            raise Exception("Transaction failed on chain")
            
        print(f"Settlement written to blockchain: {tx_hash.hex()}")

    except Exception as e:
        print(f"Error writing settlement: {e}")
        self.retry(exc=e, countdown=60)
    finally:
        db.close()
