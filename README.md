In this repo I will implement a solution for the Morpho's take home assignment for their Senior Software engineer position:
https://morpho-labs.notion.site/Liquidation-Bot-Senior-Web3-Engineer-f40d1d078bb24915add46af3209aaf86?pvs=73

## General Idea

I will go for a naive solution (to respect the 5h limit timebox). Improvement proposals are at the bottom of this page.

I will keep track of minimum required events to liquidate positions.
The events we will be interested on are:

1. Morpho events: `MarketCreated`, `Supply`, `Supply Collateral`, `Repay`, `Withdraw`
2. Oracle events: `Price change`

The rough lines of our algorithm are:

```
InterestingWallets = []

For each block b:
  For each known oracle o:
     If o's price is updated in b:
        Update lastOraclePrice for market m of oracle o in Database

        For each market m who's oracle is o:
          For each position p of market m:
            InterestingWallets.push(p.wallet, m.id)

  For each transaction t of block b:
    For each log l of transaction t:
      Update Database using l
      If l is any event of list 1:
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

## Model

We will create a minimum database to store current state of blockchain indexing.

#### MorphoMarket

- id: string
- base: string
- quote: string
- oracle: string
- lastOraclePrice: number | undefined
- lltv: number

#### MorphoPosition

- marketId: id
- supplyShares: number
- borrowShares: number
- collateral: number
- wallet: string

#### Liquidator Logs

- indexedDate: datetime
- action: string (`index block`, `liquidate position`)
- data: json/string

## Running

initialise your `.env`
`ALCHEMY_NODE_API_KEY=YOUR-ALCHEMY-API-KEY`

`npm i`
`npx ts-node index.ts`

## Improvements

1. Instead of actively asking `position` every time we see a market/position change, we could track it ourselves on every event (we'd have to listen to other events like `AccrueInterest` as well)
