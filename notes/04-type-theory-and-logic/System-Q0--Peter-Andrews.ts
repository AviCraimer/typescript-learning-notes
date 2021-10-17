// Page references are to:
//An Introduction to Mathematical Logic and Type Theory: To Truth Through Proof
// By Peter B. Andrews

//System Q_0 is a version of higher-order logic based on simply typed lambda calculus with equality.
// A cool feature of it is that it has only one rule of inference which is the substitution of equal terms for each other (a.k.a, Leibnitz's law.). The Q in the name of the system is related to Q in eQuals.

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
            name: `[Q_${alphaStr}]`,
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

const typeEq = (a: TypeExpression, b: TypeExpression): Boolean => {
    if (typeof a === "symbol" && typeof b === "symbol") {
        return a === b;
    } else if (Array.isArray(a) && Array.isArray(b)) {
        return typeEq(a[0], b[0]) && typeEq(a[1], b[1]);
    } else {
        return false;
    }
};

const Apply = (a: WFF, b: WFF): FnApp => {
    if (!a || !b) {
        console.log("One of the types sent to Apply is not defined");
        throw new Error();
    }

    //Check if argument type of A matches type of B
    if (Array.isArray(a.type) && typeEq(a.type[0], b.type)) {
        return {
            syntaxRole: FnAppBrand,
            type: a.type[1],
            components: [a, b],
            name: `[${a.name}(${b.name})]`,
        };
    } else {
        console.log("Types sent to Apply do not match is not defined");
        console.log(
            `Type of first argument is
            ${typeToString(a.type)}.
            Second argument
            ${typeToString(b.type)}`
        );
        throw new Error();
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

const Abstract = (x: VariableSymbol, b: WFF): LambdaTerm => {
    return {
        syntaxRole: LambdaBrand,
        type: [x.type, b.type],
        components: [x, b],
        name: `[λ${x.name}.${b.name}]`,
    };
};

type WFF = PrimitiveTerm | FnApp | LambdaTerm;

//p 212, Definitions
const Q_Om = Q(Om);
const BiBooleanPropEquality = Q(Q_Om.type);

const T = Apply(Apply(BiBooleanPropEquality, Q(Om)), Q(Om)) as FnApp;

//A function that takes any truth-value and always returns T
const x_Om = getVariable(Om);
const alwaysTrue = Abstract(x_Om, T);
const id_Om = Abstract(x_Om, x_Om);

//Now false is the equality of AlwaysTrue and Id_Om, since clearly this is false.
const F = Apply(Apply(Q(alwaysTrue.type), alwaysTrue), id_Om);

//Pi returns a ForAll constructor for each type. The ForAll constructor needs an additional argument of type alpha -> Om. This is some property of elements of alpha, and the completed ForAll proposition will be true iff the property equals a property that maps all alphas to True. In other words, only if the property is true of all alphas.
const Pi = (alpha: TypeExpression) => {
    const alphaStr = typeToString(alpha);

    const Q_alphaPredicate = Q([alpha, Om]);

    const allTrueAlpha = Abstract(getVariable(alpha), T);

    return Apply(Q_alphaPredicate, allTrueAlpha);
};

// console.log(Pi(Ind));

//Conjunction
const and = () => {
    const g = getVariable([Om, [Om, Om]]);
    const x = getVariable(Om);
    const y = getVariable(Om);
    const gxy = Apply(Apply(g, x), y);
    const leftSide = Abstract(g, gxy); // λg[g(x)(y)]

    const gTT = Apply(Apply(g, T), T);
    const rightSide = Abstract(g, gTT);

    const andEquation = Apply(Apply(Q(leftSide.type), leftSide), rightSide);

    const conjunction = Abstract(x, Abstract(y, andEquation));
    console.log(conjunction.name);
};
and();
