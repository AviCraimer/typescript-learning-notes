// Good resource
//https://github.com/typescript-cheatsheets/react/blob/main/README.md

import React, { PropsWithChildren, ReactEventHandler, useState } from "react";

type ButtonProps = PropsWithChildren<{
  ariaText: string;
  onClick: ReactEventHandler;
}>;

function Button({ ariaText, onClick, children }: ButtonProps): JSX.Element {
  return (
    <button onClick={onClick} aria-label={ariaText}>
      {children}
    </button>
  );
}
//By explicitly providing the return type JSX.Element, it ensures we'll get an error if we forget to return JSX.

//Sometimes we want to conditionally render something and return null if the condition is not met. Then we can add null to the return type explicitly with a union type, or we can let the return type be infered.

//Explicit return
function UserBadge1({ imageUrl }: { imageUrl: string }): JSX.Element | null {
  if (imageUrl === "") {
    return null;
  }

  return (
    <div>
      <img src={imageUrl} alt="User badge" />
    </div>
  );
}

//Inferred return, notice the inferred return type is the same as UserBadge2's explicit return type
function UserBadge2({ imageUrl }: { imageUrl: string }) {
  if (imageUrl === "") {
    return null;
  }

  return (
    <div>
      <img src={imageUrl} alt="User badge" />
    </div>
  );
}

//An older pattern is to use React.FC or React.FunctionalComponent.

type FunctionalComponent<P> = (props: P) => JSX.Element;

const ButtonFC: React.FC<ButtonProps> = function ({
  ariaText,
  onClick,
  children,
}) {
  return (
    <button onClick={onClick} aria-label={ariaText}>
      {children}
    </button>
  );
};

//This is now generally considered less good than simple type annotation. It gives you less control over the return type for one thing. It will always return Element | null

// A common hook is useState, let's take a look at the types for use state.

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <>
      <div>Current Count: {count}</div>
      <button onClick={() => setCount((count) => count + 1)}>
        Increment Count
      </button>
    </>
  );
}

//The type for setCount is complicated looking
//React.Dispatch<React.SetStateAction<number>>

//If you ever need to annotate this type explicitly, say you are passing this setCount function to another component as a prop and you want to add it's type signature. Just hover over the setCount value and copy and paste the type.

//Let's say we want to make the button in the above component into it's own component.

type IncrementButtonProps = {
  setCount: React.Dispatch<React.SetStateAction<number>>;
  //setCount: HookSetStateFn<number>;
};

function IncrementButton({ setCount }: IncrementButtonProps): JSX.Element {
  return (
    <button onClick={() => setCount((count) => count + 1)}>
      Increment Count
    </button>
  );
}

//This means the button is not tied to to specific counter function above. It can work with any state setter function that has a number type for the state value.

//Do you see the generic pattern here?
export type HookSetStateFn<T> = React.Dispatch<React.SetStateAction<T>>;

//We just replace the value type number with our generic parameter T.

// What if we initialize our state with an empty or nullish value, how do we get the state to have the right type?

function ToDos1() {
  const [toDos, setToDos] = useState([]); //Oops, the type of toDos is never[]
  return (
    <ul>
      {toDos.map((toDo) => (
        <li>{toDo.toDoText}</li> //We get an error here because toDoText is not a property of toDo.
      ))}
    </ul>
  );
}

type ToDo = {
  toDoText: string;
};
//We fix this by adding the generic type argument to useState
function ToDos2() {
  const [toDos, setToDos] = useState<ToDo[]>([]);
  return (
    <ul>
      {toDos.map((toDo) => (
        <li>{toDo.toDoText}</li>
      ))}
    </ul>
  );
}

//If we initialize our state  with null or undefined, just add the value as a union type
function ToDos3() {
  const [toDos, setToDos] = useState<ToDo[] | null>(null);

  if (toDos === null) {
    return null;
  }

  return (
    <ul>
      {toDos.map((toDo) => (
        <li>{toDo.toDoText}</li>
      ))}
    </ul>
  );
}
