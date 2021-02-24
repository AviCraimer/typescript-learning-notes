// From a type system perspective a function is defined by the types of it's parameters and the type of it's return value. The function type does not say anything about a function's side effects, so use side effects with care.

// A function type is also called the function SIGNATURE. Just be aware so that you won't get confused when you hear that term.


// There are some different ways to annotate functions. You can do it either independent of the value like this.
export let mathFunc1 : (a: number, b: number) => number
//This is called the short-hand notation


//Like this, although interfaces are a whole other topic, so don't worry about it for now
interface mathFunc1 {
    (a: number, b: number): number
}

//Finally you can annotate a function inside the function declaration
// This is most common when you are writing the function and the type at the same time and you don't need to reuse the function type elsewhere.

function mathFunc2 (a: number, b: number):number {
//See above when declaring the parameters of the function each parameter is assigned a type. The return type is given immediately after the parameters followed by a colon.

    return (a + b) / 2

}

//Here is what this looks like for an arrow style function

const mathFunc3 = (a: number, b: number):number => (a + b) / 2

// In JS, with an arrow function with a single argument you can drop the parenthesis, but you need them if you are declaring a type for the parameter.

const squareUntyped = n => n*n

const squareTyped = (n:number):number => n*n

//However, you can apply the type to the variable name and thereby leave out the parentheses on the parameter.

const squareShortAndTyped : (x: number) => number = n => n*n

//Notice that the parameter name in the type signature does not have to match the parameter name in the function!  Above x versus n.

//This is because the type parameter name is just a placeholder, it is there only for readability.

//This might seem silly, but later when we learn to write type aliases that separate types from implementations, it will be clear why this makes sense. Here is a preview of what this looks like.

//We define a type alias
type NumFunc = (x: number) => number

// Then we write a function of that type.
const squareShortAndTyped2 : NumFunc  = n => n*n // So pretty!

//Exercise set A

//1. Write a well-typed function that takes a string and returns a number equal to the length of the string times the number of words in the string.

//2. Write a function that takes an array of dogs and returns an array of the dog's primary owners.

//3. Write a function that takes an RPG character and returns an attack damage value (number) based on the RPG character's stats and some randomness.



//Function overloading