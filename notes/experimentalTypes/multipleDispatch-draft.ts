
type Signature<Args extends any[], Return> = [Args, Return]
type Method<Args extends any[], Return> = (...Args) => Return


type MultiFunctionDef = {
    name: string,
    addMethod<Args extends any[], Return>(m: Method<Args, Return>): boolean,

    methods: Method<any, any>[] // We need a union of the argument types for all the methods,
}







const dispatch = (fnDef: MultiFunctionDef) => () => {

}

