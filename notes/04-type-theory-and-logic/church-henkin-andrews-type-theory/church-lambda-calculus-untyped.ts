console.log("\n".repeat(6));
//https://www.cmi.ac.in/~madhavan/courses/pl2009/lecturenotes/lecture-notes/node1.html

// Alonzo Church invented the untyped lambda calculus as a general theory of computable functions.

//Church's formalism was later shown to be equivalent to the universal Turing machine (which it may have helped inspire.)

//Today it is the fundamental basis of functional programming languages as well as computer theorem proving systems (although many extensions have been added to it).

// What is a lambda expression.

type VariableBase = Readonly<{
    role: "Variable";
    name: string;
    toString: () => string;
}>;

// A free variable is just a placeholder, or an empty box waiting to be filled with any other lambda expression.
// In writing we use letters like x, y, f, g for variables.
type VariableFree = VariableBase & { readonly free: true };

// A variable is bound to a lambda abstraction, i.e., it becomes like a function parameter rather than an unspecified placeholder. It is waiting to be replaced by something when the lambda abstraction (function) is applied.

// You will notice that we use the term "lambda abstraction" and "lambda function" as synonyms.
type VariableBound = VariableBase & { readonly free: false };
type Variable = VariableBound | VariableFree;

//An Abstraction (function) consists of a bound variable, which is like the parameter of a function, and some other lambda expression as the body. Usually, the body will contain occurrences of the parameter, but it doesn't have to. When the body contains no occurrences of the parameter, we say that it is a constant function, since it will not be affected by the argument that is substituted for the parameter.
type Abstraction = Readonly<{
    role: "Abstraction";
    components: [parameter: VariableBound, body: Lambda];
    toString: () => string;
}>;

// This is like calling a function, except we don't actually compute the result We just form and agglomeration of the original expression and the second expression. Note, that the expression labeled "abstraction" represents an abstraction but it might not actually be an abstraction! That is the danger of not using types.
type Application = Readonly<{
    role: "Application";
    components: Lambda[];
    toString: () => string;
}>;

type Lambda = Variable | Abstraction | Application;

// Any object we can form that fits this type will be a valid lambda expression.

function toString(this: Lambda): string {
    if (this.role === "Variable") {
        return this.name;
    } else if (this.role === "Abstraction") {
        const [parameter, body] = this.components;
        return `λ${parameter.toString()}.[ ${body.toString()} ]`;
    } else if (this.role === "Application") {
        return this.components
            .map((exp, i) => {
                return i === 0 ? exp.toString() : `(${exp.toString()})`;
            })
            .join(" ");
    }
    const nothing: never = this;
    return nothing;
}

//We can construct these three types of lambdas as follows.

function Var(name: string, free?: true): VariableFree;
function Var(name: string, free?: false): VariableBound;
function Var(name: string, free?: undefined): VariableFree;
function Var(name: string, free?: boolean): Variable {
    free = free ?? true;
    name = name.replaceAll("˚", "");

    //Add symbol for bound variables
    name = free ? name : "˚" + name;

    return { role: "Variable", name, free: free ?? true, toString };
}
const x = Var("x");
const y = Var("y");
const z = Var("z");
const w = Var("w");

// First we need to define substitution for a variable
const Substitution = (
    x: Variable,
    expression: Lambda,
    substitute: Lambda
): Lambda => {
    if (expression.role === "Variable") {
        //If the expression a variable matching x, replace it with substitute expression
        if (expression.name === x.name) {
            return substitute;
        } else {
            //Otherwise return it unmodified
            return expression;
        }
    } else if (expression.role === "Abstraction") {
        const [innerParam, body] = expression.components;
        //If the innerParam has a different name, we replace the x variables inside the inner abstraction.
        let newParam = innerParam;
        if (
            innerParam.name === x.name &&
            substitute.role === "Variable" &&
            substitute.free === false
        ) {
            newParam = substitute;
        }
        return {
            ...expression,
            components: [newParam, Substitution(x, body, substitute)],
        };
    } else if (expression.role === "Application") {
        //Application
        const subbedComponents = expression.components.map((exp) =>
            Substitution(x, exp, substitute)
        );

        return Apply(...subbedComponents);
    }
    const nothing: never = expression; //So TypeScript knows undefined will never be implicitly returned by the function.
    return nothing;
};

//We can use any variable x to form a lambda abstraction.
const Abstract = (x: VariableFree, expression: Lambda): Abstraction => {
    const x_bound = Var(x.name, false);

    const newInnerBound = Var(x.name + "'", false);

    // Substitute new name for existing bound variables with the same name as x
    const newExpression = Substitution(x_bound, expression, newInnerBound);

    //Replace each free x variable in expression with the bound x variable.
    const xBoundInExp = Substitution(x, newExpression, x_bound);

    return {
        role: "Abstraction",
        components: [x_bound, xBoundInExp],
        toString,
    };
};

// Probably the simplest lambda abstraction is
const id_x = Abstract(x, x);
//   Written as:   λx.x
//For the variable x and some expression E, we would write it on paper as:
//   λx.E
// Notice that the dot (.) separates the variable form the expression E.

// If we are thinking of lambda abstraction as functions in programming, the variable x is the single parameter of the function, while the expression E is the body of the function.

// so in javascript syntax, we could write it directly as
const id_x_JS = (x: Variable) => x;
// But for fun and learning, we are building the machinery ourselves rather than relying directly on our programming language.

// Our final lambda expression constructor:
const Apply = (...args: Lambda[]): Application => {
    let components: Lambda[] = args;
    if (args[0].role === "Application") {
        components = [...args[0].components, ...args];
    }

    return {
        role: "Application",
        components,
        toString,
    };
};

// This just sticks any lambda expressions together. We can think of it as function application (i.e., calling a function with an argument). However, unlike calling a function in a programming language, the application is not immediately resolved, but left in suspended animation.

id_x_JS(y);
//Here we are applying our JS function, and it would be immediately evaluated to return x

const id_x_app_y = Apply(id_x, y);
// Here, we don't evaluated the lambda immediately, we get the compound expression.

//Compare these two results:
// print(id_x_JS(y));
// print(id_x_app_y);
// console.log(id_x_app_y.toString());

// As we can see, the methods of abstraction and application by themselves, only ever make a lambda expression bigger.

//However, there are also rules which can reduce a lambda expression, these rules are directly related to computation.

const getUniqueParamNames = (expression: Lambda): string[] => {
    const getParamsInExpression = (expression: Lambda): VariableBound[] => {
        if (expression.role === "Variable") {
            return expression.free ? [] : [expression];
        } else {
            return expression.components
                .map(getParamsInExpression)
                .reduce((a, b) => [...a, ...b]);
        }
    };

    return [...new Set(getParamsInExpression(expression).map((x) => x.name))];
};

// const BetaVar = (expression: Variable):Variable {
//     return expression
// }
const exampleExp = Abstract(
    w,
    Abstract(y, Abstract(x, Apply(y, Apply(Apply(w, y), x))))
);

const unfoldAbs = (exp: Abstraction): Lambda[] => {
    let nonAbstractionBody: Lambda | undefined;
    let list: Lambda[] = [];
    let current: Abstraction = exp;
    while (nonAbstractionBody === undefined) {
        const [variable, body] = current.components;
        list.push(variable);
        if (body.role === "Abstraction") {
            current = body;
        } else {
            nonAbstractionBody = body;
            list.push(body);
        }
    }
    return list;
};

const foldAbs = (variables: VariableBound[], expression: Lambda) => {
    let current: Lambda = expression;

    variables.reverse().forEach((variable) => {
        current = {
            role: "Abstraction",
            components: [variable, current],
            toString,
        };
    });
    return current;
};

const BetaAbs = (expression: Abstraction): Lambda => {
    const list = unfoldAbs(expression);
    const body = list[list.length - 1];
    const variables = list.slice(0, list.length - 1) as VariableBound[];

    let resolvedBody = body;
    if (body.role === "Application") {
        // resolvedBody = BetaApp(body)
    }

    return foldAbs(variables, resolvedBody);
};
// console.log(exampleExp.toString()); //λ˚w.[ λ˚y.[ λ˚x.[ ˚y (˚w (˚y) (˚w (˚y)) (˚x)) ] ] ]
// console.log(BetaAbs(exampleExp).toString()); // λ˚w.[ λ˚y.[ λ˚x.[ ˚y' (˚w' (˚y') (˚w' (˚y')) (˚x')) ] ] ]
// Issue with the renaming of bound variables. It shouldn't be doing this.

const BetaApp = (expression: Application): Lambda => {
    const { components } = expression;
    const first = components[0];
    if (first.role === "Abstraction") {
        const [parameter, body] = first.components;
        const bodyParams = getUniqueParamNames(body);
        let modifiedArg: Lambda = exp2;
        bodyParams.forEach((param) => {
            modifiedArg = Substitution(
                Var(param, false),
                modifiedArg,
                Var(param + "'", false)
            );
        });
        const substituted = Substitution(parameter, body, modifiedArg);

        if (components.length > 2) {
            //More arguments to apply in future steps
            const resolvedApp: Application = {
                ...expression,
                components: [
                    substituted,
                    ...components.slice(2, components.length),
                ],
            };
            return resolvedApp;
        } else {
            //All arguments have been applied:
            return substituted;
        }
    } else {
        //The first component cannot be an application because of how applications are constructed. There are no nested applications.
        // If the first components is a variable we, might still be able to reduce one of the applied arguments.
        const newComponents = [...components];
        for (let i = 1; i < components.length; i++) {
            const exp = components[i];
            if (exp.role === "Abstraction") {
                newComponents[i] = BetaAbs(exp);
                break;
            } else if (exp.role === "Application") {
                newComponents[i] = BetaApp(exp);
                break;
            }
        }
        return {
            ...expression,
            components: newComponents,
        };
    }
};

type LambdaExpressionRoleFns = {
    v: (x: VariableFree) => Lambda;
    app: (app: Application) => Lambda;
    abs: (abs: Abstraction) => Lambda;
};

type LambdaFn = (exp: Lambda) => Lambda;

const lambdaSwitch = (fns: LambdaExpressionRoleFns): LambdaFn => {
    const { v, app, abs } = fns;
    return (exp: Lambda) => {
        if (exp.role === "Application") {
            return app(exp);
        } else if (exp.role === "Abstraction") {
            return abs(exp);
        } else if (exp.role === "Variable" && exp.free === true) {
            return v(exp);
        } else {
            throw new Error(
                "Bound variable passed into lambda expression function, this is not allowed since a bound variable is not a complete lambda expression."
            );
        }
    };
};

const BetaStep = lambdaSwitch({
    v: (v) => v,
    app: BetaApp,
    abs: BetaAbs,
});

const BetaStepLog = (exp: Lambda) => {
    const result = BetaStep(exp);
    console.log(result.toString());
    return result;
};

// β - Beta Reduction
const Beta = (
    expression: Lambda,
    levels: number = 0,
    maxLevels: number = 20
): Lambda => {
    //Safeguard against non-terminating expressions
    if (levels > maxLevels) {
        throw new Error(
            `Beta reduction failed to terminate after ${maxLevels} levels of recursion`
        );
    }
    //Print initial expression
    console.log(expression.toString(), " -- Role:", expression.role, "\n");
    if (expression.role === "Variable") {
        return expression;
    } else if (expression.role === "Abstraction") {
        const [parameter, body] = expression.components;

        const bodyResolved = Beta(body);

        const newExpression: Lambda = {
            ...expression,
            components: [parameter, bodyResolved], // iF beta(body is diff from body, run beta on whole expression)
        };

        console.log("With Resolved body:", newExpression.toString());
        console.log("Original body", body.toString());

        if (deepEqual(bodyResolved, body)) {
            console.log("resolved and original are equal\n");
            return newExpression;
        }
        console.log("Body != body resolved");
        return Beta(newExpression, levels + 1, maxLevels);
    } else if (expression.role === "Application") {
        // const reducedComponents = expression.components.map((exp) =>
        //     Beta(exp, levels + 1, maxLevels)
        // );
        const reducedComponents = expression.components;
        const reduced = reducedComponents.reduce((exp1, exp2) => {
            if (deepEqual(exp1, Var("EmptyLambda"))) {
                return exp2;
            } else if (exp1.role === "Abstraction") {
                const [parameter, body] = exp1.components;
                const bodyParams = getUniqueParamNames(body);
                let modifiedArg: Lambda = exp2;
                bodyParams.forEach((param) => {
                    modifiedArg = Substitution(
                        Var(param, false),
                        modifiedArg,
                        Var(param + "'", false)
                    );
                });
                const substituted = Substitution(parameter, body, modifiedArg);
                console.log(
                    "After substitution: ",
                    substituted.toString(),
                    "\n"
                );
                return Beta(substituted, levels + 1, maxLevels);
            } else if (
                exp1.role === "Application" ||
                exp1.role === "Variable"
            ) {
                return Apply(exp1, Beta(exp2, levels + 1, maxLevels));
            }
            let nothing: never = exp1;
            return exp1;
        }, Var("EmptyLambda"));

        console.log("Application reduction finished\n");
        return reduced;
    } else {
        const nothing: never = expression;
        return expression;
    }
};
//Let's look at some tests of our lambda calculus machinery

//Let's start with a JavaScript lambda

//@ts-ignore
const fnCompositionJs = (f) => (g) => (arg) => f(g(arg));

//Can we replicate this with lambda expressions?
//Create some free variables
const f = Var("f");
const g = Var("g");
const arg = Var("arg");
const g_arg = Apply(g, arg);
// console.log(g_arg.toString());
const f_g_arg = Apply(f, g_arg);
// console.log(f_g_arg.toString());
const f_after_g = Abstract(f, Abstract(g, f_g_arg));
// console.log(compose.toString());

//Arg in compose is now bound
// console.log("Free:");
// print(f);
// console.log("Bound:");
// print(f_after_g.components);

//Great, now we can use our compose abstraction by first applying it. Let's just apply it to the identity function for simplicity.
const composeId = Apply(Apply(f_after_g, id_x), Abstract(y, y));

//It works, reducing down to zero
// console.log(Beta(composeId).toString());

// Non-terminating expressions
const selfApplication = Abstract(x, Apply(x, x)); ////    λx.[ x( x ) ]
// Beta(Apply(selfApplication, selfApplication), 0, 5); // λx˚ .[ x˚  (x˚ ) ] (λx˚ .[ x˚  (x) ])

// Alpha Reduction  -- renaming bound variables

// λx.x  is the same as λy.y, Alpha lets us do this.
const Alpha = (expression: Abstraction, newName: string): Abstraction => {
    const newVar = Var(newName, false);

    const newBody = Substitution(
        expression.components[0],
        expression.components[1],
        newVar
    );

    return {
        ...expression,
        components: [newVar, newBody],
    };
};

const exp1 = Apply(
    Abstract(x, Abstract(z, Apply(x, y))),
    Abstract(z, Apply(z, y))
);
const exp2 = Apply(
    Abstract(x, Abstract(y, Apply(y, x))),
    Abstract(y, Apply(y, z))
);

// Beta(exp1); //  Working!
// Beta(exp2); // Working!

console.log(exp1.toString());
BetaStepLog(exp1);
BetaStepLog(exp1);
BetaStepLog(exp1);
BetaStepLog(exp1);

//*****  Arithmatic  ******

// Repeated function application.
// We can write a lambda abstraction that applies a function n times.

//Here we are applying f directly to the identity function. We can think of this as applying f "zero times" since the the identity function λz˚.[ z˚ ], is a kind of  the "do nothing" function.
const zeroTimes = Abstract(f, Apply(f, Abstract(z, z))); // λf˚.[ f˚ (λz˚.[ z˚ ]) ]

// Beta(Apply(zeroTimes, Abstract(x, Abstract(z, Apply(x, y))))); // λ˚z'.[ y ]
// Beta(Apply(Abstract(x, Abstract(z, Apply(x, y))), Abstract(z, z))); //λ˚z.[ y ]

const oneTime = Abstract(f, Apply(f, Abstract(z, z))); // λf˚.[ f˚ (λz˚.[ z˚ ]) ]

const succ = Abstract(
    w,
    Abstract(y, Abstract(x, Apply(y, Apply(Apply(w, y), x))))
);

// console.log(succ.toString());
// const succ = Abstract(nat, Abstract(f, nat)); // λnat˚.[ λf˚.[ nat˚ ] ]
// const one = Beta(Apply(succ, zeroTimes)); //λ˚y.[ λ˚x.[ ˚y (λ˚f.[ ˚f (λ˚z.[ ˚z ]) ] (˚y) (˚x)) ] ]
// -- The inner expression is not resolving, maybe too deeply nested.

// // Subtraction of one is just function application.

// const decrement = Abstract(nat, Apply(nat, x)); //x is a placeholder variable here.

// let twoMinusOne = Beta(Apply(decrement, two));
// console.log(oneTime.toString());
//This are the same modulo bound variable renaming

// Beta(Apply(two, decrement));

// //But what happens when we reach zero? //Decrement is undefined for zero, since there is no nat lower than zero. In our current setup,  applying decrement to zero will produce x. Applying it repeatedly (three times to zero) will cause a non terminating beta-reduction, since it results in x(x).

// console.log(Beta(Apply(decrement, Apply(decrement, zero))).toString()); // x(x)
// // console.log(Beta(Apply(decrement, Apply(decrement, Apply(decrement, zero))))); //Non-terminating

// const first = Abstract(x, Abstract(y, x)); //  λx˚.[ λy˚.[ x˚ ] ]
// const second = Abstract(x, Abstract(y, y)); // λx˚.[ λy˚.[ y˚ ] ]

// const flip = Abstract(x, Apply(Apply(x, second), first));

// console.log(
//     "Is flipped first = second?",
//     deepEqual(Beta(Apply(flip, first)), second)
// );

// console.log(
//     "Is flipped second = first?",
//     deepEqual(Beta(Apply(flip, second)), first)
// );

//Adding n means applying succ n times. We can do this by decrementing n, each time succ is applied.
// 1 + 2
// 2 + 1
// 3 + 0
// 3

// Might need to build up to this.
// const add =  Abstract(Var("nat1"), Abstract(Var("nat2"),

// ))    // λnat˚.[λnat˚.[]]

// This takes any natural number and "adds one to it".

// Pick up here: https://www.cmi.ac.in/~madhavan/courses/pl2009/lecturenotes/lecture-notes/node85.html
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//
//Util functions, I just stick them down here so they don't break the flow of the presentation above.
function print(obj: object): void {
    return console.log(JSON.stringify(obj, null, 4));
}

function deepEqual(object1: any, object2: any): Boolean {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            (areObjects && !deepEqual(val1, val2)) ||
            (!areObjects && val1 !== val2)
        ) {
            return false;
        }
    }
    return true;
}
function isObject(object: any): Boolean {
    return object != null && typeof object === "object";
}

console.log("\n---");
export {};
