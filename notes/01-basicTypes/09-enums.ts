//https://www.typescriptlang.org/docs/handbook/enums.html
// Enums create named constants.

export enum Direction {
  Up = 1,
  Down,
  Left,
  Right,
}

// In this case, the value assigned to Up will be 1, and TS will increment the others automatically, i.e., Down = 2, etc.

//If you leave off the initializer, the default is to use a zero index, i.e., Up = 0, Down = 1, ...

// The nice thing about Enums is you don't have to think about the value of the constant when you are writing you code. You can simply refer to the value like so

let d: Direction = Direction.Up;

//Here Direction is acting as a type, while Direction dot is acting as a value. Personally I find this a bit untidy as it mixes together types and values in the syntax.

//The trouble with forgetting about what values are being assigned to the enum is that at runtime you may have trouble debugging if all you have are integer constants to log. You can address this with string enums, assigned like so

enum DirectionStr {
  Up = "UP",
  Down = "DOWN",
  Left = "LEFT",
  Right = "RIGHT",
}

// If you are going with all string constants it is difficult to see the benefit of using an Enum rather than a string union.

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";

//This achieves the same thing as the string enum.

//One advantage to using the enum is no having to type quotation marks.

//i.e.,

let b: DirectionStr = DirectionStr.Left;
let c: Dir = "LEFT";

//However, in the enum version you have to type the enum type name, so it is six of one, half a dozen of the other.

// There is more to them, computed values, etc.
