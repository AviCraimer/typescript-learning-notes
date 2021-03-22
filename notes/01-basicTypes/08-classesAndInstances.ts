import { getDiffieHellman } from "crypto"

class Superhero {

    //We declare instance properties like this
    public name: string // The public modifier is optional
    //Below we leave off the public modifier, but unmasked is still public
    unmasked: null | string = null // Assign default static value when property is declared

    //Here we use the private modifier. This means the property is only accessible within the class body
    private readonly secretIdentity: string

    //class property modifiers always go before regular object property modifiers, e.g., here private goes before readonly.

    //Finally, we have protected
    protected superPower: string
    //Protected means the property is available to this class and classes that inherit from this class (i.e., child classes)


    // All instance properties that are not initialized above must be initialized in the constructor
    constructor (name:string, secretIdentity: string, superPower: string) {
        this.name = name
        this.secretIdentity = secretIdentity
        this.superPower = superPower
    }

    //A static property or method appears on the class but not on the instance
    static type :string  = "SuperHero Constructor"

    guessIdentity  (guess: string) {
        if (this.secretIdentity === guess) {
            this.unmasked = this.secretIdentity
            console.log(`You unmasked ${this.name}`)
        }
    }
}

const blackMask = new Superhero("The Black Mask", "Jill Watson", "strength")
// If you look at the type of jill, you'll see it says "SuperHero". Thus a class functions as both a JavaScript value, and as a TypeScript type.

//The class is the type of its instances.


//Accessing static properties
let type : string= blackMask.type //Can't access static property on the instance
type = Superhero.type //All good

//Oops I can't get Jill's identity like this, JavaScript will allow it but the compiler blocks me from accessing the property.
let identity:string = blackMask.secretIdentity


blackMask.guessIdentity("Jill Watson")

//If I guessed correctly, then I can now access the identity at the public unmasked property.
if (blackMask.unmasked) {
    identity = blackMask.unmasked
}


// TYPE OF A CLASS
// What is the type of the class itself.

class Foo  {
    baz: string = "baz"
}

class Bar {
    baz: string = "baz"
}

class Baz {
    foo: string = "bar"
}

//We make a variable with the type of the class Foo
let FooClass : typeof Foo
// The inferred type is just typeof Foo, which is not very illuminating.

//However, we can assign Bar to this variable no problem
FooClass = Bar

//We can't assign Baz to FooClass because its structure is different
FooClass = Baz


//Inheritance
class Speedster extends Superhero {
    protected superPower : "speed" = "speed"

    constructor(name:string, secretIdentity: string ) { //Notice, the constructor has only two arguments instead of three because superPower doesn't need to be specified
        super(name, secretIdentity, "speed")
    }

    //Of course you can add specialized methods, or reimplement methods that are available on the parent class
    run() {
        console.log(`${this.name} zooms along at super speed.`)
    }
}

let theFlash =  new Speedster("The Flash", "Barry Allen")
theFlash.run()


//Class short hand, avoiding duplication
class LongWindedThug {
    hp : number
    damage: number
    defeated: boolean = false

    constructor(hp: number, damage: number) {
        this.hp = hp
        this.damage = damage
    }
    attack () {
        console.log(`Thug attacks for ${this.damage} points of damage`)
    }
}

//Notice the duplication between where we declare the properties above the constructor and where we initialize them in the constructor.

//We can eliminate the property declaration by adding the class modifier to the arguement in the constructor. These are called "Class Parameter Properties"

class ShortThug {
    defeated: boolean = false // We can mix and match. We don't need this in the constructor so we declare it above.

    constructor(
        public hp: number,
        public damage: number
        //Note, here the public keyword is not optional, since this let's TypeScript know that we are declaring the property in the constructor.
    ) {
        this.hp = hp
        this.damage = damage
    }
    attack () {
        console.log(`Thug attacks for ${this.damage} points of damage`)
    }
}

