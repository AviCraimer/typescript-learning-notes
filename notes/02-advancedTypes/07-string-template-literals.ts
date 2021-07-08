//Template literals allow type script to infer string literal types based on the JS string template syntax.

//Let's get the type of every playing card, without writing them out

export type Suit = "♠" | "♥" | "♦" | "♣";

type Rank =
  | "ace"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "jack"
  | "queen"
  | "king";

type Cards = `${Rank} of ${Suit}`;

//Wow, we got all 52 combinations!

// Be careful with this, it will really slow down your type checking if you create a combinatoric explosion.

//Here is an amazing video showing how to use template literal types together with conditional types to make a strongly typed REST API client.
//https://youtu.be/aZ6nnGlfBG8

type CollectionPaths =
  | "/collections"
  | "/collections/{collectionId}"
  | "/collections/{collectionId}/list"
  | "/collections/{collectionId}/{pageNumber}";

//We want to parse out the collectionID parameter so we can use it to check whether a parameter needs to be passed to our API function.

type PathParameter<Path extends string> =
  Path extends  //The template literal type below, checks if there is anything between curly brackets in our path string.
  `${infer Head}{${infer Parameter}}${infer Tail}`
    ? //If so, it returns a tuple with a pathParameter string argument. This will be used as an extra argument for our fetch function.
      [pathParameter: string]
    : [];

function fetchCollection<T extends CollectionPaths>(
  path: T,
  ...pathParameter: PathParameter<T>
) {
  //Do some stuff
}

//If I pass a path that has no path parameter, it's no problem.
fetchCollection("/collections");

//But, if I pass in a path with a parameter, I get an error telling me that my path parameter argument is missing
fetchCollection("/collections/{collectionId}");

fetchCollection("/collections/{collectionId}", "my-collection");

//So far, so good. But this only works for a single parameter. What if we have a path with multiple parameters?

fetchCollection("/collections/{collectionId}/{pageNumber}", "my-collection");
//The typing fails since, this should have two path parameter arguments, but we only passed it one.

// We can make a recursive version of the PathParameter utility function.
type PathParameter2<Path extends string> =
  Path extends `${infer Head}{${infer Parameter}}${infer Tail}`
    ? [
        pathParameter: string,

        //Here we apply PathParameter2 to the Tail of our string and spread out the resulting tuple type. If there are no other curly brackets in the tail, we will spread the empty tuple and terminate our recursion.
        ...params: PathParameter2<Tail>
      ]
    : [];

function fetchCollection2<T extends CollectionPaths>(
  path: T,
  ...pathParameter: PathParameter2<T>
) {
  //Do some stuff
}

fetchCollection2("/collections/{collectionId}/{pageNumber}", "my-collection");

//We got our error, which says that we need 3 arguments instead of two!

fetchCollection2(
  "/collections/{collectionId}/{pageNumber}",
  "my-collection",
  "2"
);
