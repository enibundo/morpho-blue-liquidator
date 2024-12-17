import { MorphoBlueMarket, MorphoBluePosition } from "./liquidatorDatabase";

export const isLiquidationOpportunity = (
  market: MorphoBlueMarket,
  position: MorphoBluePosition,
  oraclePrice: bigint
) => {
  const positionsLtv =
    (position.borrowShares * oraclePrice) /
    (position.collateral * BigInt(10) ** BigInt(36));

  return positionsLtv > market.lltv;
};
