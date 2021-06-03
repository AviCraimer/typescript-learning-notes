export type NameAge = [string, number];

const [name, age]: NameAge = ["George", 45];

//Let's define some class props.
type ClassProps = {
  class: "wizard" | "fighter" | "thief";
  level: number;
};

//Here we define character props. Here a character might have any number of classes between name and hp. Note, I'm just putting them between name and hp to show that you can use the rest operator in the middle of the variadic tuple
export type CharacterProps<T extends ClassProps[]> = [
  name: string,
  ...classes: T,
  hp: number
];

// This is called a variadic tuple because depending on what tuple type is passed in for T you get all the tuple types with T interpolated.

const myWizard: CharacterProps<[ClassProps]> = [
  "Zimbo",
  { class: "wizard", level: 17 },
  45,
];

const myMultiClass: CharacterProps<[ClassProps, ClassProps]> = [
  "Son of Zimbo",
  { class: "wizard", level: 5 },
  { class: "fighter", level: 7 },
  37,
];

//This is nice, but what if we wanted to handle any number of classes. For this we can define a generic function.

function typeClassProps<T extends ClassProps[]>(props: CharacterProps<T>) {
  return props;
}

const superMultiClass = typeClassProps([
  "Zimbobap",
  { class: "thief", level: 3 },
  { class: "wizard", level: 6 },
  { class: "fighter", level: 2 },
  31,
]);
