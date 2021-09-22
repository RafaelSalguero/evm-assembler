import { opCodes } from "./opcodes";
import type { HexToken, LabelDef, LabelOp, LabelOpName, OpCode, OpCodeName, Token } from "./types";
import { assertUnreachable, flatten, mapMany, sum } from "simple-pure-utils";
import { pushConstant, toHex } from "./tokenizer";

function isHexToken(x: Token): x is HexToken {
    const r = x as HexToken;
    return r.size != undefined && r.hex != undefined;
}

function isLabelDef(x: Token): x is LabelDef {
    return x.type == "labelBegin" || x.type == "labelEnd";
}


export function estimateLabelMaxSize(tokens: Token[]): number {

    const contractSizeWithoutLabels = sum(tokens.map(x => isHexToken(x) ? x.size : 0));
    const labelCount = tokens.filter(x => x.type == "labelOp").length;
    const maxTheoricalLabelSize = 15;
    // we need to safisfy 
    // labelSize >= log256(contractSizeWithoutLabels + (1 byte + labelSize) * labelCount)

    for (let labelSize = 1; labelSize < maxTheoricalLabelSize; labelSize++) {
        const contractSize = contractSizeWithoutLabels + (1 + labelSize) * labelCount;
        const contractSizeBytes = Math.log(contractSize) / Math.log(256);

        if (labelSize >= contractSizeBytes) {
            return labelSize;
        }
    }

    return maxTheoricalLabelSize;
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
    const labelSize = estimateLabelMaxSize(tokens);
    for (const token of tokens) {
        if (token.type == "labelBegin") {
            stack.push({
                index,
                name: token.name
            });
            index = 0;
        }

        if (token.type == "labelEnd") {
            const label = stack.pop();
            if (label == null) {
                throw new Error("Stack is empty at index " + index);
            }
            index = label.index + index;
            const size = index - label.index;
            labels[label.name] = {
                index: label.index,
                size: size
            };
        }

        if (isHexToken(token)) {
            index += token.size;
        }
        if (token.type == "labelOp") {
            index += 1; //push
            index += labelSize;
        }
    }

    return flatten(tokens
        .filter(x => !isLabelDef(x))
        .map<HexToken[]>(x => {
            if (isHexToken(x)) return [x];
            if (isLabelDef(x)) throw new Error("Unreachable");

            const label = labels[x.label];
            if (label == null) throw new Error(`Label '${x.label}' not found`);

            if (x.op == "dataOffset") {
                return pushConstant(toHex(label.index, labelSize));
            }

            if (x.op == "dataSize") {
                return pushConstant(toHex(label.size, labelSize));
            }

            assertUnreachable(x.op);
        })
    );
}