import { opCodes } from "./opcodes";
import type { HexToken, LabelDef, LabelOp, LabelOpName, OpCode, OpCodeName, Token } from "./types";
import { assertUnreachable, flatten, mapMany } from "simple-pure-utils";
import { pushConstant, toHex } from "./tokenizer";

function isHexToken(x: Token): x is HexToken {
    const r = x as HexToken;
    return r.size != undefined && r.hex != undefined;
}

function isLabelDef(x: Token): x is LabelDef {
    return x.type == "labelBegin" || x.type == "labelEnd";
}

export function labelize(tokens: Token[]): HexToken[] {
    interface Label {
        index: number;
        size: number;
    }

    interface LabelStack {
        name: string;
        index: number;
    }

    const stack: LabelStack[] = [];
    const labels: {
        [name: string]: Label
    } = {};

    // define labels:
    let index = 0;
    for (const token of tokens) {
        if (token.type == "labelBegin") {
            stack.push({
                index,
                name: token.name
            });
        }

        if (token.type == "labelEnd") {
            const label = stack.pop()!;
            const size = index - label.index;
            labels[label.name] = {
                index: label.index,
                size: size
            };
        }

        if (isHexToken(token)) {
            index += token.size;
        }
    }

    return flatten(tokens
        .filter(x => !isLabelDef(x))
        .map<HexToken[]>(x => {
            if (isHexToken(x)) return [x];
            if (isLabelDef(x)) throw new Error("Unreachable");

            const label = labels[x.label];
            if (label == null) throw new Error(`Label '${label}' not found`);

            if (x.op == "dataOffset") {
                return pushConstant(toHex(label.index));
            }

            if (x.op == "dataSize") {
                return pushConstant(toHex(label.size));
            }

            assertUnreachable(x.op);
        })
    );
}