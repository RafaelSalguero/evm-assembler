#!/usr/bin/env node

import { compile } from "./index";
import * as fs from "fs";
import { exit } from "process";


const params = process.argv.slice(2);

if (params.length == 0) {
    console.log("evm-assembler <input> [output]");
    console.log("input: EVM assembly file, same format as solc --asm output");
    console.log("output: Hex file, if not specified ouput will be printed to console");
    exit(0);
}

const code = fs.readFileSync(params[0]).toString();
const hex = compile(code);

if (params.length == 1) {
    console.log(hex);
}
else {
    fs.writeFileSync(params[1], hex);
}