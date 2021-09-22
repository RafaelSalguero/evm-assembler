import type { opCodes } from "./opcodes";

export type OpCodeName = keyof typeof opCodes

export interface OpCode {
    type: "op";
    name: OpCodeName;
    hex: string;
    size: number;
}

export interface Constant {
    type: "const";
    hex: string;
    size: number;
}

export type HexToken = OpCode | Constant;

export interface LabelBegin {
    type: "labelBegin";
    name: string;
}

export interface LabelEnd {
    type: "labelEnd";
}

export type LabelDef = LabelBegin | LabelEnd;

export type LabelOpName = "dataSize" | "dataOffset";

export interface LabelOp {
    type: "labelOp",
    op: LabelOpName,
    label: string;
}

export type Token = HexToken | LabelDef | LabelOp;