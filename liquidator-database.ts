import { readFile, writeFile } from "fs";
import dotenv from "dotenv";
const databaseName = "liquidator-database.json";

dotenv.config();

export type MorphoBlueMarket = {
  id: string;
  base: string;
  quote: string;
  oracle: string;
  lltv: number;
  lastOraclePrice: number | undefined;
};

export type MorphoPosition = {
  marketId: string;
  wallet: string;
  supplyShares: number;
  borrowShares: number;
  collateral: number;
};

export type LiquidatorDatabase = {
  lastIndexedBlock: number;
  morphoBlueMarkets: _.Dictionary<MorphoBlueMarket>;
  morphoBluePositions: _.Dictionary<MorphoPosition>;
};

const getMorphoPositionKey = (morphoPosition: MorphoPosition) =>
  `${morphoPosition.marketId}-${morphoPosition.wallet}`;

const createMorphoPositionKey = (marketId: string, wallet: string) =>
  `${marketId}-${wallet}`;

const initEmptyDatabase = () => {
  console.log("inside init empty database " + process.env.MORPHO_START_BLOCK);

  const beforeMorphoBlock =
    (process.env.MORPHO_START_BLOCK as unknown as number) - 1;

  const emptyDatabase: LiquidatorDatabase = {
    lastIndexedBlock: beforeMorphoBlock,
    morphoBlueMarkets: {},
    morphoBluePositions: {},
  };

  return emptyDatabase;
};

const writeDatabase = (database: LiquidatorDatabase) => {
  writeFile(databaseName, JSON.stringify(database), () => {});
};

const readLiquidatorDatabase = async () => {
  readFile(databaseName, (err, data) => {
    if (err) {
      console.log("here");
      const emptyDatabase = initEmptyDatabase();

      writeDatabase(emptyDatabase);
    }
  });
};

readLiquidatorDatabase();
