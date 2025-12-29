// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SettlementRegistry {
    event SettlementRecorded(
        address indexed payer,
        address indexed payee,
        uint256 amount,
        bytes32 indexed settlementHash,
        uint256 timestamp
    );

    struct Settlement {
        address payer;
        address payee;
        uint256 amount;
        uint256 timestamp;
        bool exists;
    }

    mapping(bytes32 => Settlement) public settlements;

    function recordSettlement(
        address _payer,
        address _payee,
        uint256 _amount,
        bytes32 _settlementHash
    ) external {
        require(!settlements[_settlementHash].exists, "Settlement already recorded");

        settlements[_settlementHash] = Settlement({
            payer: _payer,
            payee: _payee,
            amount: _amount,
            timestamp: block.timestamp,
            exists: true
        });

        emit SettlementRecorded(_payer, _payee, _amount, _settlementHash, block.timestamp);
    }

    function verifySettlement(bytes32 _settlementHash) external view returns (bool) {
        return settlements[_settlementHash].exists;
    }
}
