import { opCodes } from "./opcodes";
import { op } from "./test-helper";
import { constantByteSize, pushConstant, reduceOpSpaces, tokenize } from "./tokenizer";
import { Constant, HexToken, OpCode, OpCodeName, Token } from "./types";

test("simple call", () => {
    const actual = tokenize('mstore(0x40, 0x80)');

    const expected: HexToken[] = [
        ...pushConstant("0x80"),
        ...pushConstant("0x40"),
        op("mstore")
    ];

    expect(actual).toEqual(expected);
});

test("simple call 2", () => {
    const actual = tokenize('calldatacopy(0x1, 0x2, calldatasize)');

    const expected: HexToken[] = [
        op("calldatasize"),
        ...pushConstant("0x02"),
        ...pushConstant("0x01"),
        op("calldatacopy")
    ];

    expect(actual).toEqual(expected);
});

test("simple ops", () => {
    const actual = tokenize(`
    push1
    push1
    mstore
    `);

    const expected: OpCode[] = [
        op("push1"),
        op("push1"),
        op("mstore"),
    ];

    expect(actual).toEqual(expected);
});

test("op consts", () => {
    const actual = tokenize(`
    0x80
    0x40
    mstore
    `);

    const expected: HexToken[] = [
        ...pushConstant("0x80"),
        ...pushConstant("0x40"),
        op("mstore"),
    ];

    expect(actual).toEqual(expected);
});

test("op call", () => {
    const actual = tokenize(`
    mstore(0x40, 0x80)
    `);

    const expected: HexToken[] = [
        ...pushConstant("0x80"),
        ...pushConstant("0x40"),
        op("mstore"),
    ];

    expect(actual).toEqual(expected);
});

test("spaces", () => {
    const code = "tag_1:\npop";

    expect(reduceOpSpaces(code)).toEqual(code);
});

test("label", () => {
    const actual = tokenize(`
tag_1:
pop
    `);

    const expected: Token[] = [
        {
            type: "labelBegin",
            name: "tag_1"
        },
        {
            type: "labelEnd"
        },
        op("jumpdest"),
        op("pop")
    ];

    expect(actual).toEqual(expected);
});

test("auxdata", () => {
    const actual = tokenize(`
auxdata: 0x1234
    `);

    const expected: Token[] = [
        op("invalid"),
        {
            type: "const",
            size: 2,
            hex: "0x1234"
        }
    ];

    expect(actual).toEqual(expected);
});

test("code block", () => {
    const actual = tokenize(`
sub_0: assembly {
    dup1
}
    `);

    const expected: Token[] = [
        {
            type: "labelBegin",
            name: "sub_0"
        },
        op("dup1"),
        {
            type: "labelEnd"
        }
    ];

    expect(actual).toEqual(expected);
});

test("labelRef", () => {
    const actual = tokenize(`
dup1
label_0
dup2
label_0:
dup3
dup4
    `);

    const expected: Token[] = [
        op("dup1"),
        {
            type: "labelOp",
            label: "label_0",
            op: "dataOffset"
        },
        op("dup2"),
        {
            type: "labelBegin",
            name: "label_0"
        },
        {
            type: "labelEnd"
        },
        op("jumpdest"),
        op("dup3"),
        op("dup4"),
    ];

    expect(actual).toEqual(expected);
});