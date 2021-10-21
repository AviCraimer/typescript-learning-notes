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
    components: [abstraction: Lambda, argument: Lambda];
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
        const [abstraction, argument] = this.components;
        return `${abstraction.toString()} (${argument.toString()})`;
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
    name = free ? name : name + "˚";

    return { role: "Variable", name, free: free ?? true, toString };
}
const x = Var("x");
const y = Var("y");
const z = Var("z");

// First we need to define substitution for a variable
const Substitution = (
    x: Variable,
    expression: Lambda,
    substitute: Lambda
): Lambda => {
    if (expression.role === "Variable") {
        //If the expression a variable matching x, replace it with substitute expression
        if (expression.name === x.name && expression.free === x.free) {
            return substitute;
        } else {
            //Otherwise return it unmodified
            return expression;
        }
    } else if (expression.role === "Abstraction") {
        //If the expression is itself an abstraction, we have to consider scope, we don't replace if a variable with a narrow scope has the same name as our x.
        const [innerParam, body] = expression.components;

        if (x.name === innerParam.name) {
            //Within this expression x is bound to the inner lambda parameter "innerParam". So we don't replace it under the inner scope.
            return expression as Lambda;
        } else {
            //If the innerParam has a different name, we replace the x variables inside the inner abstraction.
            return {
                ...expression,
                components: [innerParam, Substitution(x, body, substitute)],
            };
        }
    } else if (expression.role === "Application") {
        //Application
        const [abstraction, argument] = expression.components;
        return Apply(
            Substitution(x, abstraction, substitute),
            Substitution(x, argument, substitute)
        );
    }
    const nothing: never = expression; //So TypeScript knows undefined will never be implicitly returned by the function.
    return nothing;
};

//We can use any variable x to form a lambda abstraction.
const Abstract = (x: VariableFree, expression: Lambda): Abstraction => {
    const x_bound = Var(x.name, false);

    //Replace each free x variable in expression with the bound x variable.
    const xBoundInExp = Substitution(x, expression, x_bound);

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
const Apply = (expression1: Lambda, expression2: Lambda): Application => {
    return {
        role: "Application",
        components: [expression1, expression2],
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
    console.log(expression.toString(), " -- Role:", expression.role);
    if (expression.role === "Variable") {
        console.log("Expression is a variable\n");
        return expression;
    } else if (expression.role === "Abstraction") {
        console.log("Expression is an abstraction");
        const [parameter, body] = expression.components;

        const bodyResolved = Beta(body);

        const newExpression: Lambda = {
            ...expression,
            components: [parameter, Beta(body)], // iF beta(body is diff from body, run beta on whole expression)
        };
        console.log("With Resolved body:", newExpression.toString(), "\n");
        if (deepEqual(bodyResolved, body)) {
            console.log("Body = body resolved");
            return newExpression;
        }
        console.log("Body != body resolved");
        return Beta(newExpression);
    } else if (expression.role === "Application") {
        const [inner, argument] = expression.components;
        if (inner.role === "Application") {
            console.log("Outer app, inner app\n");

            // Nested Application
            const resolved = Beta(inner, levels + 1, maxLevels);

            const newExpression = Apply(resolved, argument);

            return Beta(newExpression, levels + 1, maxLevels);
        } else if (inner.role === "Abstraction") {
            console.log("outer app, inner abstraction");
            const [parameter, body] = inner.components;

            const substituted = Substitution(parameter, body, argument);
            console.log("After substitution: ", substituted.toString(), "\n");
            return Beta(substituted, levels + 1, maxLevels);
        } else {
            console.log("outer app, inner var\n");
            // The expression can't be reduced any more, as the remaining left hand side of the application is just a variable.
            return expression;
        }
    }
    const nothing: never = expression;
    return expression;
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

//To use this we'll need to get all the variable names in an expression
const extractVariableNames = () => {};

// λx.(λy.xy)
// λy.yy //Error, the fact that these are the same is a problem.

// λx.[λy.xy](λz.zy)

//λx.[ λz.[ x (y) ] ] (λz.[ z (y) ])
const exp1 = Apply(
    Abstract(x, Abstract(z, Apply(x, y))),
    Abstract(z, Apply(z, y))
);
const exp2 = Apply(
    Abstract(x, Abstract(y, Apply(y, z))),
    Abstract(y, Apply(y, z))
);
Beta(exp1); //  Working!
Beta(exp2); // Working!

// λy.[[λz.zy]xy]
// λy.[[xyy]]

// const foo = Apply(Apply(id_x, f), g);
// Beta(foo).toString();

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