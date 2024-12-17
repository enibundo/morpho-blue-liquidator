export type MorphoEvent =
  | {
      eventName: "CreateMarket";
      args: {
        id: `0x{string}`;
        marketParams: {
          loanToken: `0x${string}`;
          collateralToken: `0x{string}`;
          oracle: `0x${string}`;
          irm: `0x${string}`;
          lltv: BigInt;
        };
      };
    }
  | {
      eventName: "SupplyCollateral";
      args: {
        id: `0x${string}`;
        caller: `0x{string}`;
        onBehalf: `0x{string}`;
        assets: BigInt;
      };
    }
  | {
      eventName: "WithdrawCollateral";
      args: {
        id: `0x${string}`;
        onBehalf: `0x${string}`;
        receiver: `0x${string}`;
        caller: `0x${string}`;
        assets: BigInt;
      };
    }
  | {
      eventName: "Supply";
      args: {
        id: `0x${string}`;
        caller: `0x${string}`;
        onBehalf: `0x${string}`;
        assets: BigInt;
        shares: BigInt;
      };
    }
  | {
      eventName: "Borrow";
      args: {
        id: `0x${string}`;
        onBehalf: `0x${string}`;
        receiver: `0x${string}`;
        caller: `0x${string}`;
        assets: BigInt;
        shares: BigInt;
      };
    }
  | {
      eventName: "Repay";
      args: {
        id: `0x${string}`;
        caller: `0x${string}`;
        onBehalf: `0x${string}`;
        assets: BigInt;
        shares: BigInt;
      };
    }
  | {
      eventName: "Withdraw";
      args: {
        id: `0x${string}`;
        onBehalf: `0x${string}`;
        receiver: `0x${string}`;
        caller: `0x${string}`;
        assets: BigInt;
        shares: BigInt;
      };
    };
