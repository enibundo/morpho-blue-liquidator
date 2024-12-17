import dotenv from "dotenv";
import { parseBlock } from "./blockchain-parser";

dotenv.config();

const liquidatorConfig = readLiquidatorDatabase();
parseBlock(FIRST_CREATE_MARKET_BLOCK);
