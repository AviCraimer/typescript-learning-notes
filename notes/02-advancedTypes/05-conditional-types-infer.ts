//We can create a helper type to convert the core JS data types to string literal types

export type ToStringLiteral<T> = T extends string
  ? "string"
  : T extends number
  ? "number"
  : T extends boolean
  ? "boolean"
  : T extends undefined
  ? "undefined"
  : T extends null
  ? "null"
  : T extends symbol
  ? "symbol"
  : T extends Function
  ? "function"
  : T extends any[]
  ? "array"
  : object;

// Note this functions like if-else.

type IsStr = ToStringLiteral<"cat">;

type IsArr = ToStringLiteral<["cat", "dog"]>;

type IsNull = ToStringLiteral<null>;

type IsObject = ToStringLiteral<{ cat: "Fuzzy" }>;

// Conditional types and union distribution

type NoEmpty<T> = T extends null | undefined ? never : T;
// Conditional Union Distribution: Applying a conditional type to a union is equivalent to the condition applied to each members of the union.

// Remember that a union is like a logical OR. If I say, "A cat or a dog eats its food", this is the same as saying, "Either a cat eats its food OR a dog eats its food".

//So here I'm saying "string or null aren't empty"
type Ex = NoEmpty<string | null>;

//Which is the same as "Either string isn't empty or null isn't empty"
type Expanded = NoEmpty<string> | NoEmpty<null>;
//        maps string to string | maps null to never
// so you get           string  |    never
// which reduces to          string

//Infers Keyword

// Now, a good mental model for conditional types is they they are type functions, i.e., functions that take in a type input (the condition) and output a return type (the then/else types).

//In this simple example we can see T as our parameter/argument to the function, and the return type of the function are string literal types "array" or "other".
type IsArray<T> = T extends Array<any> ? "array" : "other";

// But what if we want additional variables within our type function, to infer a part of the input type to use in our output.

//We can do this with the infer keyword

type UnboxArray<T> = T extends Array<infer ElementType> ? ElementType : T;

// Here we have a type that given an array will return the element type of the array, and given anything else will do nothing.

type Unboxed1 = UnboxArray<{ name: string; age: 19 }[]>;

// We get just the object type from the array of objects

// But suppose we pass the object type itself, not the array. Does our type function fail?
type Unboxed2 = UnboxArray<{ name: string; age: 19 }>;

//No, it still works, just keeping the same type.
