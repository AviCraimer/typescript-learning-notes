// A bit more detail on how TypeScript handles narrowing and broadening


type Person = {
    name: string
}

type Employee = {
    name: string,
    employer: Person
}
//Notice that Employee has everything Person has and more. This makes Employee an implicit subtype or narrowed version of Person.

let sam :Person = {
    name: "Sam"
}

let sally : Person = {
    name: "Sally",
    employer: sam // Here it is an error because there is no employer property on Person or any valid type it knows about
    //This can be confusing since it indicates that the Person type does not "contain" objects with an employer property. Yet, this is misleading in general as we'll see shortly.
}

let frank : Employee = {
    name: "Frank",
    employer: sam // Here it is okay
}


let frankPerson : Person = frank; // This causes the compiler to forget that Franks has the employer property
//This assignment is allowed even though frank has type Employee and frankPerson has type Person. This is because Employee has all the properties required to count as a Person

// This seems to contradict the behaviour we saw with sally above. The difference is that frank has a well-defined type, we are not creating the an object with an unknown property "employer" on fly as we tried to do with sally.

// We see that in reality it is best to think of Person as a set containing every possible JS object that has a name key with a string value.


// Here we have a function to get the employer of an Employee
const getEmployer = (e:Employee): Person => e.employer;

//We see it works fine with frank
getEmployer(frank)

//Here we get an error even though the runtime value is the same.
getEmployer(frankPerson)

//This is because frank's type was broadened to Person when assigned to the variable frankPerson.
// As far as TS is concerned frankPerson is no longer an Employee just a person, so it doesn't know that frankPerson has the employer property.


//Terminology
//   Employee is a sub-type of Person
//   Employee extends Person
//   Employee is assignable to Person
//   Employee is an intersection of Person with some other type
//   Person contains Employee
//   Person includes Employee

// These all mean the same thing, more or less