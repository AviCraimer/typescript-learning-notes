// You can form a type based on a literal string or number value
// For example, notice the type inference here

const dog1 = "fido"

// The type looks like the string value "fido", this called a literal type. Here, typescript infers a literal type because the variable is a const, so it can only ever contain that one value.

// If we declare using a let, the inference is different

let dog2 = "Rex"

//Here dog2 has type string because TypeScript knows it might be reassigned a different value.

//We can declare a literal type explicitly just by writing a string or number in a location where TypeScript expects a type to go.

let dog3 : "Rex"

dog3 = "Fido"

// Now we get a type error when we try to assign dog3 to Fido

//Similarly, suppose we want to keep track of a specific number

let sidesOctahedron =  8;

// Here typescript infers the type number of side of an octahedron. But we know that this will always be 8 no matter what.

// Go ahead and add in the type annotation to make sidesOctahedron a literal number type.







//Answer:
// let sidesOctahedron : 8 =  8;



//*** Union Types

// Literal types might not seem that useful on their own. Why not just use a const if you want a fixed value? However, they become useful when combined into custom types.


// A union type lets you build up a BROADER type from a bunch of other types.

let direction : "N" | "S" | "E" | "W"

// We use the pipe operator to say that direction can have any of these values.

direction = "N"
direction = "W"

direction = "North by northwest" // Type error

// typescript also knows that all the values in directions type are strings. So we can assign direction to a string value.

let str : string

str = direction // No type error

// However, we cannot assign a string type to direction

let north = "N" // Here typescript doesn't know north is a direction without an annotation

direction = north // Type error

// Remember: Narrow types can be assigned to broader types, but not the other way around

// Union types can combine any two types, not only literals.

// For example,

let objectKey : number | string | symbol

// This defines the type of a key for a JavaScript object which can be a number, string, or symbol.



//**** Intersection Types

// We saw that unions create a broader type from existing types. An intersection creates a narrower type (or sub-type).

// We use the & operator. Think of an intersection imposing multiple type constraints.

// Intersections allow us to reuse our types and compose them together to form more specific types.

// e.g., A robot dog is type that has all the features required to be a dog AND all the features required to be a robot. Note that they can have overlapping features, like "name".

// (We can create named type aliases for reuse with the type keyword)

type Dog = {
    name: string,
    woof: Function
}

type Robot = {
    name: string,
    model: number,
    oilChange: Function
}

let robbie : Dog & Robot // Here we use an intersection to make robbie a robot dog

robbie = {
    name: "Robbie",
    woof: () => "zzz ruff zzz ruff",
    model: 479399,
    oilChange: () => "Robbie's oil has been changed"
}

// If you form an intersection with types that do not overlap, you will get a never type.

let x : number & string

// This means that x can never be assigned a value; there is no value that is both a string and a number.


