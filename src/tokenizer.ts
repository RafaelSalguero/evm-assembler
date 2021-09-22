import { opCodes } from "./opcodes";
import type { Constant, HexToken, LabelDef, LabelOp, LabelOpName, OpCode, OpCodeName, Token } from "./types";
import { assertUnreachable, flatten, mapMany } from "simple-pure-utils";

function removeComments(code: string): string {
    const multiLineComment = /\/\*.*\*\//g;
    const singleLineComment = /\/\/.*/g;
    return code.replace(multiLineComment, "").replace(singleLineComment, "");
}

export function reduceSpaces(code: string): string {
    const space = /(\s|\n)+/g;
    return code.replace(space, " ");
}

export function reduceOpSpaces(code: string): string {
    const r1 = /[^\S\r\n]*([(,:{])[^\S\r\n]*/g;
    code = code.replace(r1, "$1");

    const r2 = /[^\S\r\n]*(\)})/g;
    code = code.replace(r2, "$1");
    return code;
}

export function tokenize(code: string): Token[] {
    return flatten(
        reduceSpaces(reduceOpSpaces(removeComments(code)))
            .split(" ")
            .filter(x => x != "")
            .map(tokenizePart)
    );
}

export function constantByteSize(hex: string): number {
    return Math.ceil((hex.length - 2) / 2);
}

function tokenizeOpCode(code: string): OpCode | null {
    const hex = opCodes[code.toLowerCase()];
    if (hex != undefined) {
        return {
            type: "op",
            name: code.toLowerCase() as OpCodeName,
            hex: hex,
            size: constantByteSize(hex)
        }
    }

    return null;
}


function tokenizeLabelDef(code: string): Token[] | null {
    {
        //single line
        const regex = /^([a-z][a-z\d_]*):$/i;
        const match = regex.exec(code);
        if (match != null) {
            return [
                {
                    type: "labelBegin",
                    name: match[1]
                },
                {
                    type: "labelEnd",
                },
                throwIfNull(tokenizeOpCode("jumpdest")),
            ];
        }
    }

    {
        // multi line
        const regex = /^([a-z][a-z\d_]*):\s*assembly\s*{$/i;
        const match = regex.exec(code);
        if (match != null) {
            return [
                {
                    type: "labelBegin",
                    name: match[1]
                }
            ];
        }
    }

    if (code == "}") {
        return [
            {
                type: "labelEnd"
            }
        ]
    };
    return null;
}

function throwIfNull<T>(x: T | null): T {
    if (x == null) throw new Error("null arg");
    return x;
}

function tokenizeCall(code: string): Token[] | null {
    const callRegex = /^([^\(\)]+)\((.*)\)$/;
    const callMatch = callRegex.exec(code);
    if (callMatch != null) {
        const func = callMatch[1];
        const params = callMatch[2];

        const funcTokens = tokenize(func);
        const pTokens = tokenizeParams(params);

        return [
            ...pTokens,
            ...funcTokens
        ];
    }

    return null;
}

function tokenizeLabelOp(code: string): LabelOp | null {
    const regex = /^(dataSize|dataOffset)\((.+)\)$/i;
    const match = regex.exec(code);
    if (match != null) {
        const op = match[1];
        const label = match[2];
        return {
            type: "labelOp",
            label,
            op: op as LabelOpName
        }
    }
    return null;
}

function fixHex(hex: string): string {
    return "0x" + (hex.length % 2 == 1 ? "0" : "") + hex.substr(2).toLowerCase();
}

export function pushConstant(hex: string): HexToken[] {
    const size = constantByteSize(hex);
    return [
        throwIfNull(tokenizeOpCode("push" + size)),
        {
            type: "const",
            hex: fixHex(hex),
            size
        }]
}

function tokenizeAuxData(code: string): HexToken[] | null {
    const prefix = "auxdata:";
    if (code.startsWith(prefix)) {
        const hex = code.substr(prefix.length);
        return [
            throwIfNull(tokenizeOpCode("invalid")),
            {
                type: "const",
                hex: hex,
                size: constantByteSize(hex)
            }
        ]
    }
    return null;
}


export function toHex(num: number, size: number) {
    const h = num.toString(16);

    const pad = (size * 2) - h.length;
    return "0x" + "0".repeat(pad) + h;
}

function tokenizePart(part: string): Token[] {
    const opCode = tokenizeOpCode(part);
    if (opCode != null) {
        return [opCode];
    }

    const hexRegex = /^0x[\da-f]+$/i;
    if (hexRegex.test(part)) {
        return pushConstant(part);
    }

    const auxDataToken = tokenizeAuxData(part);
    if (auxDataToken != null) {
        return auxDataToken;
    }

    const labelOpToken = tokenizeLabelOp(part);
    if (labelOpToken != null) {
        return [labelOpToken];
    }

    const callToken = tokenizeCall(part);
    if (callToken != null) {
        return callToken;
    }

    const labelDefToken = tokenizeLabelDef(part);
    if (labelDefToken != null) {
        return labelDefToken;
    }

    return [{
        type: "labelOp",
        op: "dataOffset",
        label: part
    }];
}

function tokenizeParams(params: string): Token[] {
    return flatten(params.split(/,\s*/).reverse().map(tokenize));
}

