type Error<Msg extends string> = Readonly<{
    [key in Msg]: void;
}>;

type NotTupleErr = Error<"Predicate requires a tuple of inputs">;

//A predicate maps some tuple type to the booleans. The length of the tuple is the number of places of the predicate.
export type Predicate<T> = (
    slots: T extends any[] ? T : NotTupleErr
) => Boolean;

type Proposition<T> = [Predicate<T>, T];

//Evaluates a proposition to its truth value
const T = <T extends any[]>(prop: T) => prop[0](prop[1]);

const onePlace = {
    places: 1,
} as const;

const twoPlace = {
    places: 2,
} as const;

type OnePlace = Readonly<typeof onePlace>;

type TwoPlace = Readonly<typeof twoPlace>;

//A logical connective is a predicate over two propositions
type LogicalConnectiveFn = <T, S>(
    prop1: Proposition<T>,
    prop2: Proposition<S>
) => Predicate<[Proposition<T>, Proposition<S>]>;

type LogicalConnective = LogicalConnectiveFn & TwoPlace;

type LogicalConnectiveOnePlaceFn = <T>(
    prop1: Proposition<T>
) => Predicate<[Proposition<T>]>;

type LogicalConnectiveOnePlace = LogicalConnectiveOnePlaceFn & OnePlace;

const and_: LogicalConnectiveFn = function (prop1, prop2) {
    return (props) => {
        const [a, b] = props;
        return Boolean(Number(T(a)) * Number(T(b)));
    };
};

const and: LogicalConnective = Object.assign(and_, twoPlace);

// const or: LogicalConnective = (prop1, prop2) => (props) => {
//     const truthValues = props.map(T);
//     if (truthValues.includes(true)) {
//         return true;
//     } else {
//         return false;
//     }
// };

// const ifThen: LogicalConnective = (prop1, prop2) => (props) => {
//     const [antecedent, consequent] = props.map(T);
//     if (antecedent && !consequent) {
//         return false;
//     } else {
//         return true;
//     }
// };

const not_: LogicalConnectiveOnePlaceFn =
    (prop1) =>
    ([prop]) => {
        return !T(prop);
    };

const not: LogicalConnectiveOnePlace = Object.assign(not_, onePlace);

const formProposition =
    <T extends any[]>(predicate: Predicate<T>) =>
    (args: T): Proposition<T> => {
        return [predicate, args];
    };

const propFromConnective = <
    T,
    S,
    C extends LogicalConnective | LogicalConnectiveOnePlace
>(
    connective: C,
    p: C extends LogicalConnective ? [T, S] : [T]
) => {
    if (connective.places === 1) {
        connective(p[0]);
    } else {
        return <T, S>(
            p: typeof connective extends LogicalConnective ? [T, S] : [T]
        ) => {
            connective(...p); // T is Infered as unknown
        };
    }
};

const andProp = formProposition(and);
const orProp = formProposition(or);
const notProp = formProposition(not);
const ifThenProp = formProposition(ifThen);

//A compound proposition is produced either by a two-place of one-place connective.
type CompoundProposition =
    | ReturnType<typeof andProp>
    | ReturnType<typeof notProp>;

//A quantifier is a predicate over predicates. That is, it takes a predicate to a truth-value.
type Quantifier = Predicate<[Predicate<unknown[]>]>;

// We can only evaluate quantifiers explicitly if the input type of the predicate being quantified over is finite.

type FinPredicate<T extends any[]> = {
    predicate: Predicate<T>;
    finiteDomain: Set<T>;
};

type FinQuantifier<T extends any[]> = Predicate<[FinPredicate<T>]>;

const finExists: FinQuantifier = <T extends [FinPredicate<unknown[]>]>([
    finPredicate,
]: T) => {
    const { predicate, finiteDomain } = finPredicate;

    for (const el of finiteDomain) {
        const prop = formProposition(predicate)(el);
        const truthValue = T(prop);
        if (truthValue === true) {
            return true;
        }
    }
    return false;
};

const finForAll: FinQuantifier = <T extends [FinPredicate<unknown[]>]>([
    finPredicate,
]: T) => {
    const { predicate, finiteDomain } = finPredicate;

    return [...finiteDomain].every((els) => {
        const prop = formProposition(predicate)(els);
        return T(prop);
    });
};

const pets = [
    "Fluffy",
    "Fido",
    "Chippy",
    "Muffin",
    "Cobi",
    "Ferdinand",
] as const;
type Pet = typeof pets[number];

const petArgs: [Pet][] = pets.map((p) => [p]);

const isCat: FinPredicate<[Pet]> = {
    predicate: ([pet]) => {
        if (["Fluffy", "Muffin"].includes(pet)) {
            return true;
        } else {
            return false;
        }
    },
    finiteDomain: new Set(petArgs),
};

const isThereACat = finExists([isCat]); // true
