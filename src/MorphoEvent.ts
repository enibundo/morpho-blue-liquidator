export type LiquidationOpportunityTriggerEvent =
  | OraclePriceChangeEvent
  | MorphoStateChange;

export type OraclePriceChangeEvent = {
  address: `0x${string}`;
  newPrice: bigint;
};

export type MorphoStateChange =
  | {
      eventName: "CreateMarket";
      args: {
        id: `0x{string}`;
        marketParams: {
          loanToken: `0x${string}`;
          collateralToken: `0x{string}`;
          oracle: `0x${string}`;
          irm: `0x${string}`;
          lltv: bigint;
        };
      };
    }
  | {
      eventName: "SupplyCollateral";
      args: {
        id: `0x${string}`;
        caller: `0x{string}`;
        onBehalf: `0x{string}`;
        assets: bigint;
      };
    }
  | {
      eventName: "WithdrawCollateral";
      args: {
        id: `0x${string}`;
        onBehalf: `0x${string}`;
        receiver: `0x${string}`;
        caller: `0x${string}`;
        assets: bigint;
      };
    }
  | {
      eventName: "Supply";
      args: {
        id: `0x${string}`;
        caller: `0x${string}`;
        onBehalf: `0x${string}`;
        assets: bigint;
        shares: bigint;
      };
    }
  | {
      eventName: "Borrow";
      args: {
        id: `0x${string}`;
        onBehalf: `0x${string}`;
        receiver: `0x${string}`;
        caller: `0x${string}`;
        assets: bigint;
        shares: bigint;
      };
    }
  | {
      eventName: "Repay";
      args: {
        id: `0x${string}`;
        caller: `0x${string}`;
        onBehalf: `0x${string}`;
        assets: bigint;
        shares: bigint;
      };
    }
  | {
      eventName: "Withdraw";
      args: {
        id: `0x${string}`;
        onBehalf: `0x${string}`;
        receiver: `0x${string}`;
        caller: `0x${string}`;
        assets: bigint;
        shares: bigint;
      };
    };
