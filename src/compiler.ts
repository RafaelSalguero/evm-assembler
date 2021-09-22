import { labelize } from "./labels";
import { tokenize } from "./tokenizer";
import { HexToken } from "./types";

export function toHexCode(code: string): HexToken[] {
    return labelize(tokenize(code));
}

export function toBinCode(hex: HexToken[]) {
    return hex.map(x => x.hex.substr(2)).join("");
}

export function compile(code: string): string {
    return toBinCode(toHexCode(code));
}