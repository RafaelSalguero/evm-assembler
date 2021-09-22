import { tokenize } from "./tokenizer";
import * as fs from "fs";
import { toHexCode } from "./compiler";

const code = fs.readFileSync("./test.evm").toString();
const tokens = tokenize(code);
console.log(tokens);