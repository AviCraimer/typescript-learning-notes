//Notes not finished


function Logger (logString: string) {
    return function (constructor: Function) {
        console.log(logString)
        console.log(constructor)
    }
}



@Logger("Logging person")
class Person_ {
    name = "Max"

    constructor () {
        console.log("creating person object")
    }
}

const pers = new Person_()


//Use a type like this in your decorators to ensure it can only apply to classes with the required properties
type ClassType = {new(...args: any[]): {requiredClassProp:string} }

function Dec<T extends ClassType>(origConstructor: T) {
    return class extends origConstructor {
        //Does this class extend the type of whatever class it is applied to, or just the minimal type ClassType?
        //My guess is it extends the actual type of the class it is applied to because T extends ClassType, but that doesn't mean it is ClassType. It can and usually will be a narrower type.
    }
}