//An Introduction to Mathematical Logic and Type Theory: To Truth Through Proof
// By Peter B. Andrews

//System Q_0 is a version of higher-order logic based on simply typed lambda calculus with equality.
// A cool feature of it is that it has only one rule of inference which is the substitution of equal terms for each other (a.k.a, Leibnitz's law. )

//Page 210, section 51
//(a) - (c)

//Type of Individuals, it must be non-empty, but can have any number of members greater than zero. For doing math, we could let Ind = ℕ, but this isn't necessary. Andrews proved that we can do all of arithmetic just with a single value *:Ind.
const Ind = Symbol("Ind");

//Type of truth-values, in the usual model this would be the Booleans = {T, F}
const Om = Symbol("Ω");
type PrimitiveType = typeof Ind | typeof Om;
type TypeExpression = PrimitiveType | [TypeExpression, TypeExpression];

//Gets a string which is unique to each type.
const typeToString = (type: TypeExpression): string => {
    if (typeof type === "symbol") {
        return type.description ?? "_";
    } else {
        const [fst, snd] = type;
        return `(${typeToString(fst)}, ${typeToString(snd)})`;
    }
};

// console.log(typeToString([Om, [[Ind, Om], Om]]));

//Page 211
// Primitive Symbols
//(a)

//(b) Typed Variables
type WFFBase = {
    readonly syntaxRole: symbol;
    name: string;
    type: TypeExpression;
    components: [WFF, WFF] | never[];
};

const VariableBrand = Symbol("Is Variable");

type VariableSymbol = WFFBase & {
    readonly syntaxRole: typeof VariableBrand;
    components: never[];
};

const ConstantBrand = Symbol("Is Constant");
type ConstantSymbol = WFFBase & {
    readonly syntaxRole: typeof ConstantBrand;
    components: never[];
};

type PrimitiveTerm = VariableSymbol | ConstantSymbol;

// Generate any number of variables of the given type. Counter ensures that the names are all distinct. i.e., it impossible to have two variables of the same name assigned to different types (within a given session).
const getVariable = (() => {
    let counter = 0;
    return (type: TypeExpression): VariableSymbol => {
        counter++;
        return {
            syntaxRole: VariableBrand,
            name: "x_" + counter,
            type: type,
            components: [],
        };
    };
})();

// console.log(getVariable(Om), getVariable([Ind, Ind]));

//(c) Logical Constants

// For every type, we have an identity or equality type for that type.
// The look up map ensures that if we get EQ twice for the same type, it will be the same Javascript object for the equality type. That way we don't need to worry about comparing by value.
const Q = (() => {
    const QLookup: Map<string, ConstantSymbol> = new Map();

    return (alpha: TypeExpression) => {
        const alphaStr = typeToString(alpha);

        const QInstance = QLookup.get(alphaStr) ?? {
            syntaxRole: ConstantBrand,
            name: `[EQ_${alphaStr}]`,
            type: [alpha, [alpha, Om]],
            components: [],
        };

        QLookup.set(alphaStr, QInstance);
        return QInstance;
    };
})();

// console.log(Q([Ind, Om]));
// console.log(Q([Ind, Om]) === Q([Ind, Om]));

//Iota is a function that takes a predicate over individuals i.e., a function from Ind -> Bool, and returns an Individual which satisfies the predicate, or a designated error value of type Inv.
const Iota: ConstantSymbol = {
    syntaxRole: ConstantBrand,
    name: `Iota`,
    type: [[Ind, Om], Ind],
    components: [],
};

// Well Formed Formulas (WFFs)

// Constants and Variables are WFFs, otherwise there are two additional ways to form WFFs.

// Function Application
// Rule (b)
const FnAppBrand = Symbol("Function Application Formula");
type FnAppBrand = typeof FnAppBrand;
type FnApp = WFFBase & {
    syntaxRole: FnAppBrand;
    components: [WFF, WFF];
};

const Apply = (a: WFF, b: WFF): FnApp | undefined => {
    //Check if argument type of A matches type of B
    if (
        Array.isArray(a.type) &&
        typeToString(a.type[0]) === typeToString(b.type)
    ) {
        return {
            syntaxRole: FnAppBrand,
            type: a.type[1],
            components: [a, b],
            name: `[${a.name}(${b.name})]`,
        };
    } else {
        return undefined;
    }
};

// Lambda Abstraction
//Rule (c)
const LambdaBrand = Symbol("λ");
type LambdaBrand = typeof LambdaBrand;
type LambdaTerm = WFFBase & {
    syntaxRole: LambdaBrand;
    components: [WFF, WFF];
};

const Abstraction = (x: VariableSymbol, b: WFF): LambdaTerm | undefined => {
    return {
        syntaxRole: LambdaBrand,
        type: [x.type, b.type],
        components: [x, b],
        name: `[λ${x.name}.${b.name}]`,
    };
};

type WFF = PrimitiveTerm | FnApp | LambdaTerm;
