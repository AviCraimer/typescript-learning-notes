// The biggest developer debate since tabs vs spaces...

// ***** TYPE ALIAS VS INTERFACE ******

type AnimalTypeAlias = {
    species: string,
    energy: number
}

interface AnimalInterface {
    species: string,
    energy: number
}

//Note: Both may use commas or semi-colons to end lines in the declaration. I use commas to be consistent with JS object syntax.

// Syntax differences
   // No equals sign for interface
   // different keywords


//Example
let dog : AnimalTypeAlias = {
    species: "dog",
    energy: 120
}

// The type alias is assignable to the interface because they both have the same structure.
const dogAsInterface : AnimalInterface = dog

// Similarly, the interface is assignable to the type alias. We are not broadening or narrowing the type so they are equivalent.
dog = dogAsInterface

//Type Inheritance / Composition

//With type aliases we compose types using intersections and unions. The intersection type gives us something analogous to inheritance in OOP, except the order does not matter.  Instead of thinking in terms of a base type and it's child sub-types, we can just think of narrowing a bunch of broad types by composing them together.
type BirdTypeAlias =
//Note that for consistent formatting you can add an extra & at the beginning. This doesn't affect the type.
    & AnimalInterface
    &  {
        flightSpeed: number // Km/h
    }
    & {
        fly: Function
    }


//Here we compose the three types in a different order
type BirdTypeAlias_DifferentOrder =
    & {
        flightSpeed: number // Km/h
    }
    & AnimalInterface
    & {
        fly: Function
    }




let swallow : BirdTypeAlias = {
    species: "swallow",
    energy: 120,
    flightSpeed: 80,
    fly () {
        return `The ${this.species} flew ${this.flightSpeed} km.`
    }
}

//Can we assign it to the type alias that was composed in a different order
const swallow2 : BirdTypeAlias_DifferentOrder = swallow
swallow = swallow2
//Yes: Order doesn't matter with intersection types -- except in the case of function overloads...because there always has be be an exception : (


//  /*
interface BirdInterface extends AnimalInterface { // Must be in this order
    flightSpeed: number,
    fly: Function
}
// */

//Comment the above out and comment this in to see that we can't chance the order
  /*
interface AnimalInterface extends   {
    flightSpeed: number,
    fly: Function
}
 */

//We get the error:
// "An interface can only extend an identifier/qualified-name with optional type arguments"

// This means we can only extend a previously created named interface.



//What about?
interface Part1 {
    foo: "bar"
}

interface Part2 {
    bar: "baz"
}

interface ComposeFooBar extends Part1 extends Part2 {

}

//Now we get an error:
//     'extends' clause already seen.

// So you can't use extends to do multi-inheritance or free-form composition. This makes it less useful for common JavaScript patterns of object compositions. It is more useful if you are trying to model the behaviour of classical (pun intended) OOP inheritance.



// Assigning composed types to interfaces.
   // As long as the property structure is the same we can assign in both directions
const swallowAsInterface : BirdInterface = swallow
swallow = swallowAsInterface

//Interface Merging

/* Uncomment this and see how it changes the assignment above
interface BirdInterface {
    wingspan: number, //cm
    //species:  "hawk" | "seagull" //Uncomment this line to see how the merging overrides previous type
}
*/

const hawk : BirdInterface = {
    species: "hawk",
    energy: 80,
    wingspan: 30,
    flightSpeed: 150,
    fly () {
        return `The ${this.species} flew ${this.flightSpeed} km.`
    }
}


// If you declare the same interface multiple times, TypeScript merges the declarations together. This merging is different than type intersection because it uses a last-in-wins principle for conflicting types on the same property keys.

//In the BirdInterface example above, under species, the union type of "hawk" | "seagull" overrides the string type defined in AnimalInterface.

// Thus, interfaces behave more like mutable JavaScript objects, while type alias behave like immutable data structures.

// External libraries will often use interfaces to allow library consumers to easily extend or override types through interface merging.

//However, if you want the added predictability and type safety that comes with immutability, type aliases are a better bet.

// To some extent, it is a matter of comfort and familiarity. Developers from an Object-Oriented background may find the terminology of "interface" and "extends" more intuitive than the that of "type alias" and "intersection".

//However, we should not let syntactic familiarity lock us into using interfaces, if the code would be better served by having flexible type composition and immutability.