//Good resource
//https://github.com/typescript-cheatsheets/react/blob/main/README.md#class-components

import React, { Component } from "react";

//React.Component is a generic type (aka React.Component<PropType, StateType>),

type Props = {
  pageHeadingText: string;
};

type State = {
  pageMessage: string;
};

export class MyPage extends Component<Props, State> {
  state: State = {
    // optional second annotation for better type inference
    pageMessage: "Hello!",
  };

  render() {
    return (
      <main>
        <h1>{this.props.pageHeadingText}</h1>
        <p>{this.state.pageMessage}</p>
      </main>
    );
  }
}
