In this repo I will implement a solution for the Morpho's take home assignment for their Senior Software engineer position: 
https://morpho-labs.notion.site/Liquidation-Bot-Senior-Web3-Engineer-f40d1d078bb24915add46af3209aaf86?pvs=73

## General Idea
I will go for a naive solution. I will keep track of minimum required events to liquidate positions.

The events we will be interested on are:

1. Morpho events: `MarketCreated`, `Supply`, `Supply Collateral`, `Repay`, `Withdraw`
3. Oracle events: `Price change`

The rough lines of our algorithm are:

```
InterestingWallets = []

For each block b: 
  For each known oracle o:
     If o's price is updated in b:
        For each market m who's oracle is o:
          For each position p of market m:
            InterestingWallets.push(p.wallet, m.id)

  For each transaction t of block b:
    For each log l of transaction t:
      If l is any event of list 1:
        InterestingWallets.push(l.wallet)

  For each w in InterestingWallets:
    If w's current position in m is under collateralized:
      Send a liquidate transaction
```

## Model
We will create a minimum database to store current state of blockchain indexing.

#### MorphoMarket
- id: string
- base: string
- quote: string
- oracle: string
- lastOraclePrice: number

#### MorphoPosition
- marketId: id
- collateralAmount: number
- borrowAmount: number

#### Liquidator Logs
- indexedDate: datetime
- action: string (`index block`, `liquidate position`)
- data: json/string


