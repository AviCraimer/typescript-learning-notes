//Generic Constraints

//Sometimes we want to allow a range of types but not literally every possible type.

//Here is  function that takes in an object and uses the dataOfBirth field to calculate the person's age in years, adding this to the other fields and returning a new object.
const _addAge = <T>(obj: T) => {
    const milliseconds = Date.now() - obj.dateOfBirth.getTime(); //Compiler error because dateOfBirth might not be available on T
    const years = Math.floor(milliseconds / 1000 / 60 / 60 / 24 / 365);

    return {
        ...obj,
        age: years,
    };
};

//The problem here is that T is too broad. It could be replaced by any type in type script, many of which do not have the dataOfBirth field.

//We solve this problem with a generic constraint.

const addAge = <T extends {dateOfBirth: Date}>(obj: T) => {
    const milliseconds = Date.now() - obj.dateOfBirth.getTime();
    const years = Math.floor(milliseconds / 1000 / 60 / 60 / 24 / 365.25);

    return {
        ...obj,
        age: years,
    };
};


const withAge = addAge({
    name: "Lex Luthor",
    dateOfBirth: new Date(1978, 5, 25),
    email: "lex@gmail.com"
});

const age = withAge.age //Infers that age is type number

const email = withAge.email // The typing preserves arbitrary extra fields based on generic inference


// With literal types.

// You can also use generic constraints to add literal types by extending string or number

const setType = <T extends string, S extends object>(typeString: T, obj: S) => {
    return {
        ...obj,
        type: typeString
    }
}

const PERSON_TYPE_CONSTANT = "PERSON_TYPE_CONSTANT" // This has a literal type because it was declared with const

const jill = setType(PERSON_TYPE_CONSTANT,  {
    name: "Jill",
    age: 25
})

//Check the type of jill. She has the properties that were passed in plus the additional type property with the literal type "PERSON_TYPE_CONSTANT". Without the use of a generic here, the type of the "type" property would be string.



