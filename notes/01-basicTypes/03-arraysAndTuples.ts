//TypeScript has special syntax for arrays and tuples. In other languages this would be called List vs Tuple.

// An array type (a.k.a. list) has zero or more values of a given type

export let stringArray : string[]

//This defines an array of strings.

// I can assign any of the following values

stringArray = []
stringArray = ["cat"]
stringArray = ["Josh", "Frank", "Paris"] ///etc

// I can't assign

stringArray = [1,2,4]
stringArray = ["dog", "cat", {}]

// You get the idea.

// But what if I want a mix of values. Say I need a pair of a string and number. Say the direction to travel and the number of meters to move in that direction.

//For this I can use a tuple

const movement1 : [string, number] = ["North", 3]

// A tuple has a fixed length and every slot has a defined type.

//Note: TypeScript 4 introduced variadic tuples which can have variable length. This is an advanced feature which first requires us to understand generic types.

//EXERCISES

//1. Initialize a variable with a type that is a tuple of a list of numbers together with a list of functions

//2. Initialize a variable with a type that is a list of tuples, where each tuple has a dog (object type) and an owner (object type).





