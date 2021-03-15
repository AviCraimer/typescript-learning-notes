// Types are assigned to variables, using a colon after the variable name.

//e.g.,
let str : string;
// This says that str has the type string.

//When declared the runtime value of str is undefined.
//But still, the variable has the type string.

//So every type by default can start out as undefined or sometimes as null in addition to values of the specified type. These are called an uninitialized value.

//However, we get a type error if we try to explicitly assign undefined or null to a string type, since this would amount to initializing the value incorrectly.

str = undefined
str = null

//You can initialize the value with a string.
str = "hello"

//Of course, we also get a type error if we try to assign type that does not overlap with string

str = 5 //Can't be a number
str = ["hello"] // Can't be an array

//Here are all the primitive data types. These are the types given be JavaScript's runtime typeof operator

const s : string = "cat"
const n : number = 9
const t : boolean = true
const sym : symbol = Symbol("I'm special")
//const i : bigint = 1000000000000n //Only available when targeting ES2020
const f : Function = ()=>{}
//Note you have to use a capital F since function is a reserved word in JavaScript. However, you usually are more specific in your function types and will rarely use this in practice.

const u : undefined = undefined
 //Interesting the above throws a type error if not initialized even though the uninitialized value will be undefined!

const o : object = {}

// Null is not a primitive data type in JavaScript, however, TypeScript does have a null type.
const nl : null = null;
//Remember when using the runtime typeof operator null is typed as "object", but using the TypeScript compiler it is typed as null.



//Type inference

// In most of the above cases if we had not told typescript the type of the variable it nevertheless would infer the correct type from the type of the value we used to initialize the variable.



//**************
//EXERCISE
//Part 1
//Assign new variables with the let keyword to each of the primitive value types (as well as null).
//Don't declare the types.
//Hover over the variable to see what types typescript has inferred.

//e.g.
let m = 5; //Typescript correctly assigns the number type to m











// Part 2
//Did you notice any types that weren't quite what you expected. If so, go ahead and add the type annotations above so they match the explicitly typed primitive variables given in the notes. Only add annotations to those that need them.

//In general it is good practice not to over specify types with explicit annotations. Let the compiler infer types where possible as this makes code more maintainable.


//**************

//Answers

let str2 = "dog"
let sym2 = Symbol("I'm special too")
let obj2 : object = {}
let bool = false
let fun : Function  = () => {}
let nll2 : null = null
const nll3 : any = null


// any and unknown

//You may have noticed that when we declared a null value without explicit type annotation typescript inferred an type called any.

let uninitialized = null;

//That's because typescript assumes that null is an empty value similar to undefined, that this variable is waiting to be initialized with a value. Similar to just declaring a variable without a value.

//Here we initialize the variable with a number value.
let uninitialized2 = 5

// Now typescript can infer that the value is number. It does not let us call the string method split on the value.
uninitialized2.split("")

//This is how an implicit any works. However, if we assign any explicitly in a type annotation then the typescript compiler will not help with type checking this variable.

let uninitialized3 : any; //explicit any
uninitialized3 = 5
uninitialized3.split("") // Yikes this will be a runtime error since a number value does not have the split method!

//The compiler does not flag the error because we explicitly told it that the variable could be anything.

// Remember: any is the type that means anything goes.
let Any  : any = "Random value"
Any.allows.anything.you.can.imagine()

//I can also assign the value to anything, even something which has a well defined type.
let definitelyNumber : number = 32
definitelyNumber = Any

//This breaks the type inference entirely because typescript now believes that definitelyNumber is a number when it fact it is something else (a string in this case).

// Unknown to the rescue

// To fix this problem while still giving us flexibility we can use the type unknown.

// Unknown functions similar to any until you assign a value to a variable. Then the type is fixed.

let uninitialized4 : unknown;

//Even though it is definitely types as number,I can assign it to the variable with type unknown.
uninitialized4 = definitelyNumber;

//However, I can't use a function that takes number input because typescript still knows that it's type is unknown.
Math.abs(uninitialized4)

//It is more useful if I am initalizing it with an unknown runtime value.

//Say I get an API result I don't know if it will be a number or a string.

// I can assign it
let unknownValue : unknown //= "this time it's a string"

//Now before I can use the value, I must check if it's a string
if (typeof unknownValue === "string") {
    //Inside this if block typescript knows the value is a string.

    unknownValue.split("") //No error here
    //Hover over unknownValue above and see that its type is inferred to be string.
}













export default {}