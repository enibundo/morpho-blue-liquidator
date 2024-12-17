import { MorphoBlueMarket, MorphoBluePosition } from "./liquidatorDatabase";

export const isLiquidationOpportunity = (
  market: MorphoBlueMarket,
  position: MorphoBluePosition
) => {
  const positionsLtv =
    (position.borrowShares * (market.lastOraclePrice as bigint)) /
    (position.collateral * BigInt(10) ** BigInt(36));

  return positionsLtv > market.lltv;
};

export const liquidatePosition = (
  market: MorphoBlueMarket,
  position: MorphoBluePosition
) => {
  // todo: implement liquidate call on morpho ABI using signer, wallet from viem to push a liquidate transaction
  // should store PRIVATE_KEY in .env of our liquidator bot wallet
};
