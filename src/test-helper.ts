import { opCodes } from "./opcodes";
import { constantByteSize } from "./tokenizer";
import { OpCode, OpCodeName } from "./types";

export const op = (op: OpCodeName): OpCode => ({
    type: "op",
    hex: opCodes[op],
    size: constantByteSize(opCodes[op]),
    name: op
});
