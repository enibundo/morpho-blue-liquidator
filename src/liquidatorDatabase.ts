import { readFile, writeFile } from "fs/promises";
import { MorphoEvent } from "./MorphoEvent";
import _ from "lodash";

const databaseFile = "liquidator-database.json";

type MorphoBlueMarket = {
  id: `0x${string}`;
  loanToken: `0x${string}`;
  collateralToken: `0x${string}`;
  oracle: `0x${string}`;
  lltv: BigInt;
  lastOraclePrice: BigInt | undefined;
};

type MorphoPosition = {
  marketId: `0x${string}`;
  wallet: `0x${string}`;
  supplyShares: BigInt;
  borrowShares: BigInt;
  collateral: BigInt;
  atBlock: number;
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

export const updateLiquidatorDatabase = (
  currentDatabase: LiquidatorDatabase,
  blockNumber: number,
  morphoEvents: MorphoEvent[]
) => {
  currentDatabase.lastIndexedBlock = blockNumber;

  let walletsWithUpdatedPositions: `0x${string}`[] = [];

  _.forEach(morphoEvents, (morphoEvent) => {
    // update newly created markets
    if (morphoEvent.eventName === "CreateMarket") {
      const marketId = morphoEvent.args.id;
      currentDatabase.morphoBlueMarkets[morphoEvent.args.id] = {
        id: marketId,
        lastOraclePrice: undefined,
        ...morphoEvent.args.marketParams,
      };
    } else {
      // track wallet with changed position
      walletsWithUpdatedPositions.push(morphoEvent.args.onBehalf);
    }
  });

  _.forEach(walletsWithUpdatedPositions, (wallet) => {
    console.log(`Wallet ${wallet} has an updated position`);
  });

  return currentDatabase;
};
