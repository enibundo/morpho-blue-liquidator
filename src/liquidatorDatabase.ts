import { readFile, writeFile } from "fs/promises";
import { MorphoEvent } from "./MorphoEvent";
import _ from "lodash";

const databaseFile = "liquidator-database.json";

export type MorphoBlueMarket = {
  id: `0x${string}`;
  loanToken: `0x${string}`;
  collateralToken: `0x${string}`;
  oracle: `0x${string}`;
  lltv: bigint;
  lastOraclePrice: bigint | undefined;
};

export type MorphoBluePosition = {
  marketId: `0x${string}`;
  wallet: `0x${string}`;
  supplyShares: bigint;
  borrowShares: bigint;
  collateral: bigint;
};

type LiquidatorDatabase = {
  lastIndexedBlock: number;
  morphoBlueMarkets: Record<`0x${string}`, MorphoBlueMarket>;
  morphoBluePositions: Record<`0x${string}-0x${string}`, MorphoBluePosition>;
};

const createMorphoPositionKey = (
  wallet: `0x${string}`,
  marketId: `0x${string}`
) => `${marketId}-${wallet}` as `0x${string}-0x${string}`;

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

export const updateLiquidatorDatabase = async (
  currentDatabase: LiquidatorDatabase,
  blockNumber: number,
  morphoEvents: MorphoEvent[],
  getLastPositionOfWallet: ({
    wallet,
    marketId,
  }: {
    wallet: `0x${string}`;
    marketId: `0x${string}`;
  }) => Promise<{
    supplyShares: bigint;
    borrowShares: bigint;
    collateral: bigint;
  }>
) => {
  currentDatabase.lastIndexedBlock = blockNumber;

  let walletsWithUpdatedPositions: Record<
    `0x${string}-0x${string}`,
    {
      supplyShares: bigint | undefined;
      borrowShares: bigint | undefined;
      collateral: bigint | undefined;
    }
  > = {};

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
      const positionKey = createMorphoPositionKey(
        morphoEvent.args.onBehalf,
        morphoEvent.args.id
      );

      walletsWithUpdatedPositions[positionKey] = {
        supplyShares: undefined,
        borrowShares: undefined,
        collateral: undefined,
      };
    }
  });

  // update positions of wallets
  _.forEach(
    Object.keys(
      walletsWithUpdatedPositions
    ) as any as `0x${string}-0x${string}`[],
    async (positionKey) => {
      const [marketId, wallet] = positionKey.split("-") as `0x${string}`[];
      const lastPositionOfWallet = await getLastPositionOfWallet({
        marketId,
        wallet,
      });

      currentDatabase.morphoBluePositions[positionKey] = {
        ...currentDatabase.morphoBluePositions[positionKey],
        ...lastPositionOfWallet,
      };
    }
  );

  // write database
  writeLiquidatorDatabase(currentDatabase);

  return { currentDatabase, walletsWithUpdatedPositions };
};
