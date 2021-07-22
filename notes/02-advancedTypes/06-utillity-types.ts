//Utility types
// Docs: https://www.typescriptlang.org/docs/handbook/utility-types.html

import { allowedNodeEnvironmentFlags } from "node:process";
import { isArray } from "node:util";

type Point = {
  x: number;
  y: number;
  z?: number; //Notice that z is optional, it could be a 2D point or a 3D point
};

//We can use the Required utility type to make all three coordinates required, i.e., only 3D points.
type Point3D = Required<Point>;

//What if we want to specify just a partial coordinate, e.g., only x, or x and y. We can easily do this with the Partial utility type. Now all properties are optional.
type Coordinate = Partial<Point>;

//Let's use our types to write an update function. This could be used in a game to move characters around in space.
function updateCoordinates(p: Point3D, update: Coordinate) {
  return {
    ...p,
    ...update,
  };
}

const start = {
  x: 0,
  y: 0,
  z: 0,
};

//Here we move to the right, leaving the other coordinates unchanged
const newPosition = updateCoordinates(start, { x: 4 });
//{
//     x: 4,
//     y: 0,
//     z: 0
// }

// Notice that we updated our coordinate immutably, by creating a new object and using the spread operator. Suppose we had some state logic that would be broken if a function were to mutate an object. We can ensure this doesn't happen with the Readonly type.

type ImmutablePoint3D = Readonly<Point3D>;

function updateCoordinates2(p: ImmutablePoint3D, update: Coordinate) {
  //Now we get an error if we attempt to mutate p
  p.x = 4;

  return {
    ...p,
    ...update,
  };
}

//We can still call our function with a non-immutable Point3D. It will be treated as immutable inside the function.
const newPosition2 = updateCoordinates2(start, { x: 4 });

// We can also make it immutable by re-assigning it
const startImmutable: ImmutablePoint3D = start;

//Unfortunately, we can allow assign in the other direction which breaks the readonly requirements!

const notImmutableStart: Point3D = startImmutable;

//This is a big problem: https://stackoverflow.com/questions/53412934/disable-allowing-assigning-readonly-types-to-non-readonly-types

// So bear in mind that readonly is only a week guarentee of immutability. If you pass a readonly value to a function that types the parameter as non-readonly, that function can mutate all it likes.

function mutate(p: Point3D) {
  p.x = 666;
}

mutate(startImmutable); //NO ERROR!@#$*

//On to happier things.

// Pick Utility Type
//It can happen that you have an object type and you want to just get a few keys in it.

type APIResponse = {
  headers: { blah: string };
  data: { foo: number; important: string; content: {}[] };
  logging: {};
  errors: {};
};

// If all you needed as the type of the data you could do this.

type APIData = APIResponse["data"];

//But suppose you want the data and the headers. You could do it manually, like so

type _APIRelevant = {
  headers: APIResponse["headers"];
  data: APIResponse["data"];
};

//But there is a lot of repetition here, especially if you needed to get more than two keys.

type APIRelevant = Pick<APIResponse, "data" | "headers">;
//Hover over to confirm that this gets the relevant type. Wow, you might think this was some magic that had to be baked into TypeScript, but in fact, you can build this type yourself.

//Let's look at how this works
type MyPick<Type, Keys extends keyof Type> = {
  [Parameter in Keys]: Type[Parameter];
};

//You provide a type and key in that type (or a union of keys)

// the keyof type operator turns the keys from an object type into a union type.

type APIResponseKeys = keyof APIResponse;
// =  "headers" | "data" | "logging" | "errors"

//Now any subset of that union type is considered to extend the type. Remember that "extends X" really means, "is a sub-type of X"

//So K can by "header" or "header" | "data", etc.

//Finally, the type returned by Pick uses a mapped type, P in K. Here P is a type parameter that iterates through all the values in K. So T[P] is just the type of each property in T (of those properties include in the union K).

// Omit

//Pick is nice if you only want a few properties in an complex object type. But sometimes you just need to leave some things out. For this you can use Omit.

//In the above example we could get the same type by omitting logging and errors

type APIRelevant2 = Omit<APIResponse, "logging" | "errors">;

// Exclude
//Exclude uses a conditional type to remove types from a union
type Fruit = "Apple" | "Orange" | "Banana" | "Mango";

type FruitAllergies = "Banana" | "Mango";

type EdibleFruit = Exclude<Fruit, FruitAllergies>;

//Here is the definition
type _MyExclude<T, U> = T extends U ? never : T;
//Well this makes no sense on the face of it.

// To help us understand Exclude, we will have to learn a bit of type theoretic algebra (feel free to skip this if you don't care)

//** Never as empty type

// It might sound weird but you can assign never to every other type. If you think in set theory terms, the never type is the empty set, and the empty set is a sub-set of every other set.

// So if we have a union type: "apple" | "orange", then this is the same type as "apple" | "orange" | "never"
export type Fruit2 = "Apple" | "Orange" | "Banana" | "Mango" | never;
//Same type as Fruit

type MyExclude<T, U> = T extends U ? never : T;
// To understand this, first review to the section on conditional union distribution in the notes on conditional types.

// Where T is a union type. This says, every value of the union either extends (is a subtype of) U, or it doesn't. If it extends U, then delete it by mapping to never, if it doesn't extend U, then keep it.

// Now, take a moment to read the Omit type definition. See if you can figure out how it works.

type MyOmit<T, K extends string | number | symbol> = {
  [P in MyExclude<keyof T, K>]: T[P];
};

//After all that heavy logic, let's look at some fun and simple utility types.

// With string unions you might need to support both upper and lower case versions. A common example would be for fetch types.

type LowercaseFetchMethod = "post" | "get" | "put" | "delete";

//But you want to support the uppercase versions of all these strings as well.

// You can do this.

type FetchMethod = LowercaseFetchMethod | Uppercase<LowercaseFetchMethod>;

// The Uppercase utility type changes all the string literal types from lowercase to uppercase.

// Ok, but what if later you want to get just the lower case version and you forgot where you put the original lowercase fetch method type definition (don't do this in practice!)

type LowerCaseFetchRecreated = Lowercase<FetchMethod>;

// You can also use Capitalize and Uncapitalize, which work on the first character of each string.

//Unlike the other utility types we examined, these string literal utilities are not definable on your own. They are baked into the TypeScript compiler.

//Record

//A record is an object with a bunch of different keys that all have the same type of value. For example, a dictionary that looks up each word by the word as a key, and gives back a definition.

type Definition = Record<"word" | "definition" | "etymology", string>;

//Equivalent to
// {
//   word: string;
//   definition: string;
//   etymology: string;
// };

type Dictionary = Record<string, Definition>;

//eg

let myDictionary: Dictionary = {
  apple: {
    word: "apple",
    definition: "A fruit",
    etymology: "I don't know",
  },
  orange: {
    word: "orange",
    definition: "An orange fruit",
    etymology: "I don't know",
  },
};

//Note that there is nothing in the type definition to ensure that the key matches the word property. That would be up to the runtime code to enforce.

// I can also be used with union types. We can quickly defined vectors of any length.

//Note: A vector is analogous to an array, but with a fixed number of indexes.

//We can define a vector using tuple types with generics, but it's a bit repetitive.
type TupleVect4<T> = [T, T, T, T];

//Alternatively, we can the Record utility type to define JS Objects that function like vectors.
type Vector4<T> = Record<0 | 1 | 2 | 3, T>;
type Vector5<T> = Record<0 | 1 | 2 | 3 | 4, T>;

type Point4D = Vector4<number>;

const p4: Point4D = {
  0: 34.22,
  1: 23.2,
  2: 43.22,
  3: 234.333,
};
//I need to include all the keys provided in the Record type

// If I try to access a index that is outside the range, I'll get a TS error

const undef = p4[4]; //I will get an error here as long as I have "no implicit any" turned on in tsconfig

//***Extract
type Pets =
  | "Fido"
  | "Whiskers"
  | "Thomas the Turtle"
  | "Ralph"
  | "Fuzzy"
  | "Iggy";

type Dogs = "Fido" | "Ralph" | "Bingo" | "Lassie";

type MyDogs = Extract<Dogs, Pets>;

// Extract<A, B>
// You can think of this in two ways. Either as extracting members of B that are in A. Or equivalently, as filtering A, based on whether members of A are in B.

//We can see that the type signature uses the conditional type distribution property to filter each member of T based on whether it is a subtype of U.

//Equivalent to set intersection?

type MyExtract<T, U> = T extends U ? T : never;

//*** NonNullable
// Simply removes null or undefined from a union type
type One = NonNullable<undefined | 1>;

type One_ = NonNullable<null | 1>;

//Looking at the type signature shows the now familiar pattern of using conditional types to apply a condition to each member of a union, and using the never type to remove unwanted members.
type MyNonNullable<T> = T extends null | undefined ? never : T;

//*** ReturnType
// Get the return type of a function

type Container = Array<any> | string | Set<any>;

function append(container: Container, element: any) {
  if (typeof container === "string") {
    return container + element;
  } else if (Array.isArray(container)) {
    return [...container, element];
  } else if (container instanceof Set) {
    return new Set(container).add(element);
  }
  //This last check ensures we have covered all the cases in the Container union type.
  let a: never = container;

  //By returning a never value we tell the compiler not to worry about the conditions being unmet.
  return a;
}

// Using ReturnType, we get back the equivalent of our container type. This could be useful if we have imported append into a module, but have not imported the Container type. Or if we simply want to verify that the append function returns all the correct types.
type Container_ = ReturnType<typeof append>;

//Parameters lets us get the tuple type of a function. This is useful for programming with higher-order functions. Say we want to store the arguments of a function to apply them inside another function. We can use Parameters to get the tuple type, and then use the spread operator to apply this tuple to our function.
type AppendArgs = Parameters<typeof append>;

//e.g.,

const numArrayArgs: AppendArgs = [[1, 2, 3], 4];

const numArray = append(...numArrayArgs);

//*** ConstructorParameters

class Candidate {
  constructor(
    public name: string = name,
    public politicalParty:
      | "The Dogs"
      | "The Cats"
      | "The Pigs" = politicalParty,
    private chanceOfVictory: number = chanceOfVictory
  ) {}
  wins() {
    return Math.random() > this.chanceOfVictory;
  }
}

type CandidateArgs = ConstructorParameters<typeof Candidate>;
//Why do we need to use the typeof operator here? By default, when you reference a class in a type position, TS infers the instance type for the class (i.e., it infers the type of being a Candidate object, not the type of the Candidate class itself. Since the ConstructorParameters utility operates on classes, we need to use the typeof operator to get the class type. )

class CandidateRequired {
  constructor(
    public name: string,
    public politicalParty: "The Dogs" | "The Cats" | "The Pigs",
    private chanceOfVictory: number
  ) {
    this.name = name;
    this.politicalParty = politicalParty;
    this.chanceOfVictory = chanceOfVictory;
  }
  wins() {
    return Math.random() > this.chanceOfVictory;
  }
}

type CandidateRequiredArgs = ConstructorParameters<typeof CandidateRequired>;
//Now all the constructor parameters are required.

//*** InstanceType
//Instance type gives you the return type of the a class's constructor function. For custom classes, this is equivalent to what you get if you just write the class name in a type position.

//e.g., the types below are the same
let bob: Candidate;
let susan: InstanceType<typeof Candidate>;

//This is neat but also useless.
//So when would you use InstanceType?

// It is hard to think of examples.

// Here is an example from: https://lesscodeismore.dev/utility-types-part2/
declare function create<T extends new () => any>(c: T): InstanceType<T>;

class A {
  b: 0 = 0;
}

const instA = create(A); // instA has the type A

// In this example we have a factory that takes in a class as an argument and returns the instance type of that class. We need to use instance type to properly type such a higher-order function.

//The last three utilities are hard to think of use cases for so I've left the notes minimal for now.

//*** OmitThisParameter<Type>
//Removes the this parameter from a type.

//*** ThisParameterType<Type>
//Suppose you want to define a function signature with a this parameter type to later us in defining classes.

// ThisType<Type>
//Only useable when the compiler has noImplicitThis turned on. Not relevant for most purposes.
