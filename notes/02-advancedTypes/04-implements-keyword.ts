// TLDR - Nice cheat sheet here
//https://rmolinamir.github.io/typescript-cheatsheet/#implements-keyword

interface Card {
    title: string,
    text: string,
    render: () => HTMLElement
}


// Notice the error here since we have not implemented the required interface
class _BasicCard implements Card {

}

class BasicCard implements Card {
    title: string
    text: string

    constructor (title: string, text: string) {
        this.title = title
        this.text = text
    }

    render(): HTMLElement {
        const cardEl = document.createElement('li')
        cardEl.innerHTML = `
            <h2>${this.title}</h2>
            <p>${this.text}</p>
        `
        return cardEl;
    }
}

//Unlike the extends keyword, the implements keyword only adds a constraint of the type that the class has to satisfy. It does not add anything to the implementation.

//Implements allows us to support multiple contracts for the class interface.

// Also, you can implement a type alias as well as an interface type

//e.g.,

type Clickable = {
    handleClick: (e: Event) => void
}

type WithImage = {
    imageUrl: string,
    imageAlt: string
}


//You can combine extends and implements.

//A class an only extend a single other class, but it can implement unlimited interfaces/types
class ExpandableCard extends BasicCard implements Card, Clickable, WithImage {
    imageUrl: string
    imageAlt: string

    //it can also have extra properties
    domNode: HTMLElement

    constructor (title: string, text: string, imageUrl: string, imageAlt: string) {
        super(title, text)
        this.imageUrl = imageUrl
        this.imageAlt =  imageAlt
        this.domNode = document.createElement('li')
    }

    handleClick(e: Event ) { //What happens if we don't declare the type, can TS infer it from the implements type? No.
        this.domNode.classList.add('expanded')
    }

    render () {
        this.domNode.innerHTML = `
            <h2>${this.title}</h2>
            <img src=${this.imageUrl} alt=${this.imageAlt} />
            <p>${this.text}</p>
        `
        return this.domNode;
    }
}

//In summary, you use class inheritance wih the extends keyword when you want a class to inherit the class properties and method implementations of the parent class. When you simply want to ensure that a class fits the shape of a given set of interfaces or type aliases you use the implements keyword.


//Comparison with intersection types.

// Creating a class that is constrained by the implements keyword is very similar to creating a factory function that has an intersection type as it's return value.

//A factory function is just a function that returns an object with a given shape. It doesn't use class or prototypical inheritance and for most use cases there are not significant performance disadvantages (unless you are making a library that is churning out tens of thousands of objects per second).

//Let's take a look at how we would create the ExpandableCard with a factory.

function ExpandableCardFactory (title: string, text: string, imageUrl: string, imageAlt: string): Card & Clickable & WithImage & {domNode: HTMLElement}

{ // The return type is an intersection of the types we want our returned object to implement.

    return {
            title,
            text,
            imageUrl,
            imageAlt,
            domNode: document.createElement('li'),
            render () {
                this.domNode.innerHTML = `
                <h2>${this.title}</h2>
                <img src=${this.imageUrl} alt=${this.imageAlt} />
                <p>${this.text}</p>
                `
                return this.domNode;
            },
            handleClick (e) { //Here unlike with implements TS can infer the type of the parameter.
                this.domNode.classList.add('expanded')
        }
    }
}


let card1 = new ExpandableCard("Title", "This is my card", "www.image.com", "An image")

let card2 = ExpandableCardFactory("Title", "This is my card", "www.image.com", "An image")

let card2Copy = card2

//Card 1 and Card 2 can be assigned to each other because they have the same type shape in terms of properties and methods. TypeScript doesn't care that the first is a class instance while the second is not.
card2 = card1
card1 = card2Copy

