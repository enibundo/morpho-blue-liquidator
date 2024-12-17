import dotenv from "dotenv";
import { parseBlock } from "./blockchain-parser";

dotenv.config();

const FIRST_CREATE_MARKET_BLOCK = 18919858;

parseBlock(FIRST_CREATE_MARKET_BLOCK);
