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
export const typeToString = (type: TypeExpression): string => {
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
const Var = (() => {
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

// console.log(Var(Om), Var([Ind, Ind]));

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

        const ApplyQ1 = (a: WFF) => {
            const partialApplication = Apply(QInstance, a);

            const ApplyQ2 = (b: WFF) => {
                return Apply(partialApplication, b);
            };
            ApplyQ2.wff = partialApplication;
            return ApplyQ2;
        };
        ApplyQ1.wff = QInstance;

        return ApplyQ1;
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

type FnApp = WFFBase & {
    syntaxRole: typeof FnAppBrand;
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

//Forms a WFF by function application. It will throw an error if the types of the two WFF inputs are not compatible
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
type LambdaTerm = WFFBase & {
    syntaxRole: typeof LambdaBrand;
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
const T = (() => {
    const Q_Om = Q(Om);
    const BiBooleanPropEquality = Q(Q_Om.wff.type);
    return BiBooleanPropEquality(Q(Om).wff)(Q(Om).wff);
})();

//Now false is the equality of AlwaysTrue and Id_Om, since clearly this is false.
const F = (() => {
    //A function that takes any truth-value and always returns T
    const x_Om = Var(Om);
    const alwaysTrue = Abstract(x_Om, T);
    const id_Om = Abstract(x_Om, x_Om);
    return Q(alwaysTrue.type)(alwaysTrue)(id_Om);
})();

//Pi returns a ForAll constructor for each variable. The ForAll constructor needs an additional argument of type alpha -> Om. This is some property of elements of alpha, and the completed ForAll proposition will be true iff the property equals a property that maps all alphas to True. In other words, only if the property is true of all alphas.
const Pi = (x: VariableSymbol) => {
    const alpha = x.type;

    const Q_alphaPredicate = Q([alpha, Om]);

    const allTrueAlpha = Abstract(x, T);

    return Q_alphaPredicate(allTrueAlpha);
};

// console.log(Pi(Ind));

//Conjunction
const andWFF = (() => {
    const g = Var([Om, [Om, Om]]);
    const x = Var(Om);
    const y = Var(Om);
    const gxy = Apply(Apply(g, x), y);
    const leftSide = Abstract(g, gxy); // λg[g(x)(y)]

    const gTT = Apply(Apply(g, T), T);
    const rightSide = Abstract(g, gTT); // λg[g(T)(T)]

    const andEquation = Q(leftSide.type)(leftSide)(rightSide); //λg[g(x)(y)] = λg[g(T)(T)]

    return Abstract(x, Abstract(y, andEquation));
})();

type Proposition = WFF & { type: typeof Om };

//Convenience function for forming propositions with and
const and = (a: WFF, b: WFF) => {
    return Apply(Apply(andWFF, a), b);
};

//Material Conditional
const ifThenWFF = (() => {
    const x = Var(Om);
    const y = Var(Om);
    const bothXY = and(x, y);

    const ifThenEquation = Q(Om)(bothXY)(x); //[x & y] = x
    // If you know that this is true, then from x you can get both x and y. That is equivalent ot modus ponens. Alternatively, if you know this equation and ~y, then you know that left side is false so x must be false, which is modus tollens .

    return Abstract(x, Abstract(y, ifThenEquation)); // λx.λy.([x & y] = x)

    return ifThenEquation;
})();

//Convenience function for forming propositions with ifThen
const ifThen = (a: WFF, b: WFF) => {
    return Apply(Apply(ifThenWFF, a), b);
};

//Axioms

//A1 States that a true-function being truth for both True and False, is equal to the the truth function being True for all values of Om.
const A1 = (() => {
    const g = Var([Om, Om]);
    const TFG = and(Apply(g, T), Apply(g, F));
    const x = Var(Om);
    const allTruthValuesG = Pi(x)(g);
    return Q(Om)(TFG)(allTruthValuesG);
})();

//If any two variables are equal, then all one-place predicates applied to them are also equal.
const A2 = (alpha: TypeExpression) => {
    const x = Var(alpha);
    const y = Var(alpha);
    const x_eq_y = Q(alpha)(x)(y);
    const h = Var([alpha, Om]);
    const hx = Apply(h, x);
    const hy = Apply(h, y);
    const hx_eq_hy = Q(hx.type)(hx)(hy);

    return ifThen(x_eq_y, hx_eq_hy);
};

//Function equality based on point-wise (extensional) equality
const A3 = (alpha: TypeExpression, beta: TypeExpression) => {
    const f = Var([beta, alpha]);
    const g = Var([beta, alpha]);
    const f_eq_g = Q(f.type)(f)(g);
    const x = Var(beta);
    const fx = Apply(f, x);
    const gx = Apply(g, x);
    const fx_eq_gx = Q(fx.type)(fx)(gx);
    const forAll_fx_eq_gx = Pi(x)(fx_eq_gx);
    return Q(f_eq_g.type)(f_eq_g)(forAll_fx_eq_gx);
};

const A4_1 = (alpha: TypeExpression, beta: TypeExpression) => {};
const A4_2 = (alpha: TypeExpression) => {};
const A4_3 = (
    alpha: TypeExpression,
    beta: TypeExpression,
    gamma: TypeExpression
) => {};
const A4_4 = (
    alpha: TypeExpression,
    beta: TypeExpression,
    gamma: TypeExpression,
    delta: TypeExpression
) => {};

const A5 = (() => {
    const y = Var(Ind);

    const i_y_eq = Apply(Iota, Q(Ind)(y).wff);

    return Q(i_y_eq.type)(i_y_eq)(y);
})();
