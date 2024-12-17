import dotenv from "dotenv";
import {
  getListOfOraclesFromDatabase,
  readLiquidatorDatabase,
  updateLiquidatorDatabase,
} from "./liquidatorDatabase";
import { parseBlock } from "./blockchain-parser";
import { readPositionOfWallet } from "./blockchain-fetching";
import _ from "lodash";
import { isLiquidationOpportunity, liquidatePosition } from "./liquidator";

dotenv.config();

const start = async () => {
  let db = await readLiquidatorDatabase();

  let currentBlock = db.lastIndexedBlock + 1;

  while (true) {
    const morphoEvents = await parseBlock(currentBlock);
    const updateResult = await updateLiquidatorDatabase(
      db,
      currentBlock,
      morphoEvents,
      ({ wallet, marketId }) => {
        return readPositionOfWallet(wallet, marketId);
      }
    );
    db = updateResult.currentDatabase;

    Object.keys(updateResult.walletsWithUpdatedPositions).forEach(
      (positionKey: any) => {
        const marketId = (positionKey as `0x${string}-0x${string}`).split(
          "-"
        )[0] as `0x${string}`;
        const currentMarket = db.morphoBlueMarkets[marketId];
        const currentPosition = db.morphoBluePositions[positionKey];

        if (isLiquidationOpportunity(currentMarket, currentPosition)) {
          liquidatePosition(currentMarket, currentPosition);
        }
      }
    );

    currentBlock++;
    await new Promise((resolve) => setTimeout(resolve, 15_000));
  }
};

// start();
