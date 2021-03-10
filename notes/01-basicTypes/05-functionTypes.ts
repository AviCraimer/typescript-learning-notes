// Until now we have been specifying the types of functions only in the most general way with the Function type.

let f : Function

// However, for most purposes, we want to be more specific.

// From a type theory perspective a function is defined by the types of it's parameters and the type of it's return value.

//e.g.,

const strConcat = (str1, str2) => str1 + str2

// This illustrates a classic ambiguity in javascript. We intend for this function to concatenate two strings. But the plus operator is overloaded, and works also with number inputs. We might get unexpected behaivior if we call.

strConcat(20, 21) // => 41 : number
// We expected the string "2021"

// We can solve this problem by annotating the function parameters

const strConcatTyped = (str1: string, str2: string) => str1 + str2

// Hover over the function name and you'll see that TypeScript correct infers that the return type of the function is string. It knows that when "+" is used on string inputs it must produce a string output.


strConcatTyped(20, 21) // Type error
strConcatTyped(String(20), String(21)) // OK, because we converted the numbers to strings

// Viewing functions in terms of their parameter type and return type works best with pure functions, meaning that a function only works with it's input arguments, does not mutate anything or have side effects.

// The ideal for static types is also to make functions TOTAL whenever possible. This means that for any input of it's parameter types, the function produces a meaningful output. Totality can be hard to achieve, but it provides an added level of type safety.

//With pure total functions, the function type tells us all the important info about the valid usage of the function and calling the function will never produce unexpected behaivior in the app.

//The function type does not say anything about a function's side effects, so use side effects with care.

// A function type is also called the function SIGNATURE. Just be aware so that you won't get confused when you hear that term.


// There are some different ways to annotate functions. You can do it either independent of the value like this.
let mathFunc1 : (a: number, b: number) => number
//This is called the short-hand notation.

//Notice that the return type is given after the "=>" which mirrors the JavaScript arrow funciton syntax
// Note: the parameter names in the type definition are purely for documentation, they don't have to match the parameter names of the function implementation.

//e.g., This implementation doesn't give a type error even though I use different parameter names
mathFunc1 = (n, m) => {
    return Math.sqrt(n * m);
}

// We can assign the short hand function syntax to a type alias

type MathFunction = (a: number, b: number) => number


//Another way to annotate function types is with interfaces, although interfaces are a whole other topic, so don't worry about it for now
interface MathFunc {
    (a: number, b: number): number
}

//Finally you can annotate a function inside the function declaration
// This is most common when you are declaring the function and the type at the same time and when you don't need to reuse the function's type elsewhere in the application.

function mathFunc2 (a: number, b: number):number {
//See above when declaring the parameters of the function each parameter is assigned a type. The return type is given immediately after the parameters followed by a colon.

    return (a + b) / 2
}

//Here is what this same function looks like for an arrow style function

const mathFunc3 = (a: number, b: number):number => (a + b) / 2

// Note: In JS, with an arrow function with a single argument you can drop the parenthesis, but you need them if you are declaring a type for the parameter.

const squareUntyped = n => n*n

const squareTyped = (n:number):number => n*n

//However, you can apply the type to the variable name and thereby leave out the parentheses on the parameter.

const squareShortAndTyped : (x: number) => number = n => n*n

//Notice again that the parameter name in the type signature does not have to match the parameter name in the function!  Above x versus n.

//The type's parameter name is just a placeholder, it is there only for readability.

//When we write type aliases that separate types from implementations, this separation can be helpful

//We define a type alias
type NumFunc = (x: number) => number

// Then we write a function of that type.
const squareShortAndTyped2 : NumFunc  = n => n*n // So pretty!

//Exercise set A

//1. Write a well-typed function that takes a string and returns a number equal to the length of the string times the number of words in the string.

//2. Write a function that takes an array of dogs and returns an array of the dog's primary owners.

//3. Write a function that takes an RPG character and returns an attack damage value (number) based on the RPG character's stats and some randomness.



//Function overloading

// Suppose we want a function that can accept arguments of different types and does slightly different things depending on what type the argument has.

// A common example is dealing with both a value of type T and an array of that same type.

// e.g., reverseStrings1 is meant to produce a reversed string from a string or an array of strings

type File = {
    fileName: string,
    size: number
}

type BatchRenameFunction = (newName: string,  files : File | File[]) => File | File[]

// batchRename is a function that takes either a single file or an array of files. It renames the files based on the passed in name string.

const batchRename : BatchRenameFunction = (newName, fileArg) => {
    if ( Array.isArray(fileArg) ) {

        // Returns an array of fileArg
        return fileArg.map(f => ({...f, fileName: newName}) )
    }

    //returns a single file
    return {...fileArg, fileName: newName}
}

const renamedFile = batchRename("myDoc2",  {fileName: "myDoc1", size: 200}  )

// Intuitively, renamedFile should have the type File since it had a single file as an input (not an array of files). However, if you hover over it you'll see that TS infers a union type of
    //  File | File[]
//which comes from our return type in BatchRenameFunction.

// We can use function overloads to tell typescript that want a certain input type to lead to a certain output type.

// We can do this using inline typing with function keyword like or with intersection types.

//Inline
function batchRenameOverloaded  (newName: string, fileArg: File[]) : File[] // array input to array output
function batchRenameOverloaded  (newName: string, fileArg: File) : File  // object input to object output
function batchRenameOverloaded  (newName: string, fileArg: File | File[]) : File | File[] { // The main function signature is the same
    if ( Array.isArray(fileArg) ) {

        // Returns an array of fileArg
        return fileArg.map(f => ({...f, fileName: newName}) )
    }

    //returns a single file
    return {...fileArg, fileName: newName}
}

//Now we get the expected types when we call it
const renamedFile2  = batchRenameOverloaded("myDoc2",  {fileName: "myDoc1", size: 200}  )
const renamedFiles  = batchRenameOverloaded("myDoc2",  [{fileName: "myDoc1", size: 200},{fileName: "myDoc3", size: 435}]  )

// Unfortunately, doing it this way we were not able to reuse our type alias BatchRenameFunction
// However, we can use intersection types instead.

type BatchRenameOverloaded =
    ((newName: string, fileArg: File[]) => File[])
    & ((newName: string, fileArg: File) => File)
    & BatchRenameFunction


const batchRenameOverloaded2 : BatchRenameOverloaded  (newName, fileArg) {
        if ( Array.isArray(fileArg) ) {
            return fileArg.map(f => ({...f, fileName: newName}) )
        }
        return {...fileArg, fileName: newName}
    }

// Everything is well typed.
const renamedFile3  = batchRenameOverloaded("myDoc2",  {fileName: "myDoc1", size: 200}  )
const renamedFiles2  = batchRenameOverloaded("myDoc2",  [{fileName: "myDoc1", size: 200},{fileName: "myDoc3", size: 435}]  )

export default {}