
type Person = {
    name: string
}

type Employee = {
    name: string,
    employer: Person
}

let sam :Person = {
    name: "Sam"
}

let sally : Person = {
    name: "Sally",
    employer: sam // Here it is an error because there is no employer property on Person or any valid type it knows about
}

let frank : Employee = {
    name: "Frank",
    employer: sam // Here it is okay and it extends Person
}

const getEmployer = (e:Employee): Person => e.employer;

let frankPerson : Person = frank; // This causes the compiler to forget that Franks has the employer property
//This assignment is allowed even though frank has type Employee and frankPerson has type Person. This is because Employee has all the properties required to count as a Person

getEmployer(frank) // No error
getEmployer(frankPerson) // Error because the type has been broadened


//Terminology
//   Employee is a sub-type of Person
//   Employee extends Person
//   Employee is assignable to Person
//   Employee is an intersection of Person with some other properties

// These all mean the same thing in TypeScript!






