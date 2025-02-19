## TOC

1. [General Idea](#general-idea)
2. [Model](#model)
3. [Running](#running)
4. [Improvements](#improvements)

## General Idea

I will go for a naive solution (to respect the 5h limit timebox).

👉 Improvement proposals are [at the bottom of this page](#improvements).

I will keep track of minimum required events to liquidate positions. Every time I receive one of these events I will check impacted positions
The events we will be interested on are:

1. Morpho events: `CreateMarket`, `Supply`, `Supply Collateral`, `Repay`, `Borrow`, `Withdraw`, `WithdrawCollateral`.
2. Oracle events: `Price change`

The rough lines of our algorithm are:

```
InterestingWallets = []

For each block b:
  // see for any oracle price change
  For each known oracle o:
     If o's price is updated in b:
        Update lastOraclePrice for market m of oracle o in Database

        For each market m who's oracle is o:
          For each position p of market m:
            InterestingWallets.push(p.wallet, m.id)

  // see for any activity that could introduce liquidation opportunity
  For each transaction t of block b:
    For each log l of transaction t:
      If l is any event of interesting morpho events (list 1 above):
        Update Database using l
        InterestingWallets.push(l.walletBorrower)

  For each w in InterestingWallets:
    If w's current position in m is under collateralized:
      Send a liquidate transaction
```

#### Calculating the under collateralized position / liquidation opportunity

Information on an under collateralized position will be calculated _actively_ using the `position` read function of the morpho blue contract.
Example, calling `position` today (block `21419652`) on mainnet with arguments `0xD95C5285ED6009B272A25A94539BD1AE5AF0E9020AD482123E01539AE43844E1` and `0xf603265f91f58F1EfA4fAd57694Fb3B77b25fC18` gives us

```
supplyShares uint256, borrowShares uint128, collateral uint128

[ position(bytes32,address) method Response ]
  supplyShares   uint256 :  1981745995869275522001791
  borrowShares   uint128 :  900000000000000000000000
  collateral   uint128 :  1100000000000000
```

Liquidation opportunity is calculated as per the docs:

```
export const isLiquidationOpportunity = (
  market: MorphoBlueMarket,
  position: MorphoBluePosition,
  oraclePrice: bigint
) => {
  const positionsLtv =
    (position.borrowShares * oraclePrice) /
    (position.collateral * BigInt(10) ** BigInt(36));
```

## Model

We will create a minimum database to store current state of blockchain indexing.

```
export type MorphoBlueMarket = {
  id: `0x${string}`;
  loanToken: `0x${string}`;
  collateralToken: `0x${string}`;
  oracle: `0x${string}`;
  irm: `0x${string}`;
  lltv: bigint;
  lastOraclePrice: bigint | undefined;
};

export type MorphoPosition = {
  marketId: `0x${string}`;
  wallet: `0x${string}`;
  supplyShares: bigint;
  borrowShares: bigint;
  collateral: bigint;
};

```

## Running

1. Initialise your `.env` with the right variables (depending on the indexed chain)

```

ALCHEMY_NODE_API_KEY=YOUR-ALCHEMY-API-KEY
MORPHO_CONTRACT_ADDRESS=0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb
MORPHO_START_BLOCK=18883124
CHAIN_ID=1

```

2. Run

```

npm i
npx ts-node src/index.ts

```

## Improvements

1. Implement `//todo:` for `liquidatePosition` function and `readPriceOfOracle`
2. Use morpho blue's subgraph (`TheGraph`) for indexing.
3. Due to the timebox, the state of the current solution is in between a simple and complicated approach. We could improve this in two different ways.

   a. We could make it simpler by listening to `BorrowRateUpdate` event (instead of all of the events) and update position actively.

   b. Instead of polling position actively we could eventually calculate it on our side since we listen to all events.

4. This has been tested only manually. _Should_ add unit tests for main loop, liquidation logic, parsing/encoding of data.
5. Use a real database instead of a json file (sqlite, redis, postgres, etc.) and trace log of upgrades + last state
6. Don't read logs of blocks that have no interesting transactions, we can save alchemy credits this way.
7. Actually remove `lodash` and use `forEach` or other native functions.
8. Improve loops and data structures to iterate less in collections.
