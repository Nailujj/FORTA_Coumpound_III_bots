# Compound III Proposal

## Summary
- **Compound III** is the latest iteration of the Compound protocol, designed to simplify user interactions and improve security.
- The protocol allows users to supply assets to liquidity pools and earn interest, or borrow assets against their supplied collateral.
- **Key improvements to Coumpound II** include lower gas costs, improved capital efficiency, and enhanced user experience.

## Proposed Bots:
- **COMP01: Investment Tracker Bot for USDC**
  - **Monitors**: Tracks when an individual address stakes a given amount in tokens, emitting an alert when it exceeds a predetermined threshold.
  - **Purpose**: To track any suspicious investment activity by a user.
- **COMP02: Rewards Tracker Bot**
  - **Informs**: Notifies the user of their accrued rewards.
  - **Purpose**: To track rewards for a user.
- **COMP03: Anomaly Detection Bot using Machine Learning**
  - **Monitors**: Uses machine learning to detect anomalous borrowing or supply patterns, indicating potential threats or exploits.
  - **Purpose**: Enhances security by identifying unusual activities that could signify malicious behavior or protocol vulnerabilities.

## Proposed Solution:
### COMP01: Investment Tracker Bot
- **Event Utilized**: `Supply(address indexed from, address indexed dst, uint amount);`
  - **Parameters**:
    - `from`: User address being monitored.
    - `dst`: Pool address for which the user is supplying stake.
- **Proxy Contract Address**: [`0x1B0e765F6224C21223AeA2af16c1C46E38885a40`](https://etherscan.io/address/0x1B0e765F6224C21223AeA2af16c1C46E38885a40).
- **Functionality**:
  - Issues an alert when the total transaction amount from supply events exceeds a specified threshold within a day for a given address.
  - Utilizes a cache to monitor activity over a day.

### COMP02: Rewards Tracker Bot
- **Function Utilized**: `baseTrackingAccrued(address account) external view returns (uint64);`
  - **Parameters**:
    - `account`: The account to check rewards for.
- **Contract Address**: [`0x285617313887d43256F852cAE0Ee4de4b68D45B0`](https://etherscan.io/address/0x285617313887d43256F852cAE0Ee4de4b68D45B0).
- **Functionality**:
  - Calculates the amount of USDC tokens owed to an account.

### COMP03: Anomaly Detection Bot using Machine Learning
- **Detailed Instructions**:
  1. **Data Collection**:
     - Collect historical transaction data from the Compound III protocol, focusing on `borrow()` and `supply()` transactions.
     - Use APIs from providers to extract this data.
  2. **Data Labeling**:
     - Utilize unsupervised learning techniques like Isolation Forest to detect anomalies.
     - Manually label a subset of detected anomalies and normal transactions.
  3. **Model Training**:
     - Train a supervised machine learning model (e.g., MLP/Randomforest) on the labeled dataset.
     - Use scikit-learn for training and evaluation.