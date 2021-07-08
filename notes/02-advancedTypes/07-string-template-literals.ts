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
