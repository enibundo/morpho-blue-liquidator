import { readFile, writeFile } from "fs/promises";

const databaseFile = "liquidator-database.json";

type MorphoBlueMarket = {
  id: string;
  base: string;
  quote: string;
  oracle: string;
  lltv: number;
  lastOraclePrice: number | undefined;
};

type MorphoPosition = {
  marketId: string;
  wallet: string;
  supplyShares: number;
  borrowShares: number;
  collateral: number;
};

type LiquidatorDatabase = {
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

export const writeLiquidatorDatabase = async (database: LiquidatorDatabase) => {
  await writeFile(databaseFile, JSON.stringify(database));
};

export const readLiquidatorDatabase = async () => {
  try {
    console.log(`Reading database at ${databaseFile}`);
    const data = JSON.parse((await readFile(databaseFile)).toString());
    return data as unknown as LiquidatorDatabase;
  } catch (err) {
    console.log("Initializing database with empty values");
    const emptyDatabase = initEmptyDatabase();
    writeLiquidatorDatabase(emptyDatabase);
    return emptyDatabase;
  }
};
