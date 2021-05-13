// A common pattern is to have a bunch of sub-types or variations on theme. You have a function or class or component that deals with every variant and does something different depending which variant is passed in.

// A Discriminated Union is nice way to handle this on the type system level.


type HeroBase = {
    class: string,
    name: string,
    hp: number,
    level: number
}

type Wizard = HeroBase & {
    class: "wizard",
    spellAttack: () => void
}

type Fighter = HeroBase & {
    class: "fighter",
    meleeAttack: () => void
}

const _makeAttack =  (character: HeroBase) => {
    if (character.class === "wizard") {
        character.spellAttack();
    } else if (character.class === "fighter") {
        character.meleeAttack();
    }
}

//Notice the type errors when we try to call the special attacks. This is because typescript doesn't know that we are dealing with wizards and fighters, as far as it is concerned they are all just generic heros.

// We can solve this by making a new Hero type that is a union

type Hero = Wizard | Fighter

//What makes this a discriminated union is that Wizard and Fighter have a shared property called class, and no two types in the Hero union have the same type for this property. i.e., the wizard's class property has the string literal type "wizard", while the figher's class property has the string literal type "fighter".

//Now we refactor makeAttack function to use the new Hero union type.
const makeAttack =  (character: Hero) => {
    if (character.class === "wizard") {
        character.spellAttack();
        return character;
    } else if (character.class === "fighter") {
        character.meleeAttack();
        return character;
    }

    //We can return a never type here to ensure that all members of the discriminated union are covered.
    const c:never = character
    return c;
}


const gandalf :Wizard = {
    class: "wizard",
    level: 18,
    name: "gandalf",
    hp: 178,
    spellAttack: () => {}
}

//You can see that the type of madeAttack is Hero, which would allow you to chain together several functions that operate on the same discriminated union type.
const madeAttack = makeAttack(gandalf)



//What if we don't want to use switch statements. We might prefer to have a dictionary to look up the function that needs to be called for each type. Here is an attempt that which ultimately fails do to the limits fo the TypeScript compiler.
//If anybody finds a way to do this, please let me know and I'll update the notes.

type  Classes = "wizard" | "fighter"

const characterAttacks = {
    "fighter":  (char: Fighter) => char.meleeAttack(),
    "wizard": (char: Wizard) => char.spellAttack()
}

type CharacterAttacks = typeof characterAttacks;

const getAttackFromObject =  function <T extends  Classes> (charClass: T) {
    const makeAttack : CharacterAttacks[T] = characterAttacks[charClass]
    return makeAttack
}

//This is correctly typed as (char: Wizard) => void
const makeSpellAttack =  getAttackFromObject("wizard")

//typed as (char: Fighter) => void
const makeMeleeAttack =  getAttackFromObject("fighter")

//Unfortunately, there doesn't seem to be a way to wrap this up in a single function that takes a hero argument
const makeAttackFromObject = function <T extends Hero> (char: T) {

    //Here it infers the union type "wizard" | "fighter", but this isn't want we want. We know that the type T will always have a .class property that is specifically one of those two, not either of them.
    const charClass = char.class

    //As a result here we get a union of function types ((char: Fighter) => void) | ((char: Wizard) => void)
    const makeAttack = getAttackFromObject(charClass)

    //We cannot call our makeAttack function because when calling a union of function types, the TypeScript compiler takes the intersection of all the function type parameters to see if there is any common paramter values that could be used to call all the function types. In this case there aren't since Wizard and Fighter are non-overlapping by design.

    //So we get the error: Argument of type 'T' is not assignable to parameter of type 'never'.
    makeAttack(char)

    //This looks like a limit to the intelligence of the TypeScript compiler's type inference system.
    // A further discussion of this can be found here:
    // https://stackoverflow.com/questions/56406284/argument-of-type-is-not-assignable-to-parameter-of-type-never

}