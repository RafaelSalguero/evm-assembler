import { labelize } from "./labels";
import { tokenize } from "./tokenizer";
import { HexToken } from "./types";

export function toHexCode(code: string): HexToken[] {
    return labelize(tokenize(code));
}