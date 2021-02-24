//Object types

export let dog : {
    woof: Function,
    name: string,
    ageHumanYears: number
    ageDogYears: number
}

// Having assigned a type to the dog variable we can initialize it with the appropriate value

dog = {
    woof() {
        console.log("woof woof")
    },
    name: "Sparky",
}

//Notice the error under dog since it is missing some fields. By default, fields in object types are required.

///Add in the missing fields above. You'll notice the autocomplete for those long field names since the editor knows those are the only options. How nice!

//When you initialize a variable with an object without a type annotation, typescript will infer the type.

const fred = {
    woof() {
        console.log("woof woof")
    },
    name: "Fred",
    ageHumanYears: 7,
    ageDogYears: 49
}

//Hover over Fred and you'll see that the inferred type is pretty close to what we wrote above under dog. The only difference is that for the Function type, it infers something more specific about the return type (which we will cover later).



//Field Modifiers
// What if you want an optional field?

let cat : {
    name: string,
    scratch: Function,
    numberOfLivesRemaining?: number
}

//We might not know how many of it's nine lives are remaining, so we can leave out that field.

//We use a question mark just before the colon to indicate optional.

cat = {
    name: "Skaggle",
    scratch() {
        throw new Error("Raaaawwr")
    }
}

//Notice, there is no field for number of lives yet the compiler does not complain.

//Another modifier for object types is readonly. This ensures that a value at that key is not mutated.

let ledgerEntry : {
    readonly income: number,
    readonly expenses: number,
    note: string
}

ledgerEntry = {
    income: 34.38,
    expenses: 23.50,
    note: "Got paid for shovelling the drive way and had to buy more melting salt."
}

ledgerEntry.income = 40

//Compiler error tells you that you can't assign to income

ledgerEntry.note = "Actually, I just raided the piggy bank and bought candy"

//It does not complain when you change the note property.



//Exercise

// Pretend you are building two characters for an RPG video game. Start by declaring a variable for each character with the let keyword. Use an explicit object type annotation to describe the fields for each character. Then after you have described the types, initialize the variables with values that make the compiler happy.



