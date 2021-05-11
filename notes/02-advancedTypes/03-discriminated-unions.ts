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
    name: "gandolf",
    hp: 178,
    spellAttack: () => {}
}

//You can see that the type of madeAttack is Hero, which would allow you to chain together several functions that operate on the same discriminated union type.
const madeAttack = makeAttack(gandalf)