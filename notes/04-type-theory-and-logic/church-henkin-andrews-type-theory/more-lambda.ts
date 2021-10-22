const lambdaEq = (() => {
    let counter = 0;

    const innerFunction = (exp1: Lambda, exp2: Lambda): Boolean => {
        if (exp1.role !== exp2.role) {
            return false;
        } else {
            if (
                exp1.role === "Variable" &&
                exp2.role === "Variable" &&
                exp1.free === true
            ) {
                return exp1.name === exp2.name;
            } else if (
                exp1.role === "Abstraction" &&
                exp2.role === "Abstraction"
            ) {
                const params1 = getUniqueParamNames(exp1);
                const params2 = getUniqueParamNames(exp1);
                if (params1.length !== params2.length) {
                    return false;
                }

                const unrepeatableBoundVars = params1.map((x) => {
                    counter++;
                    return Var("" + counter, false);
                });
                let newExp1: Lambda = exp1;
                let newExp2: Lambda = exp2;

                unrepeatableBoundVars.forEach((v, i) => {
                    newExp1 = Substitution(Var(params1[i]), exp1, v);
                    newExp2 = Substitution(Var(params2[i]), exp1, v);
                });
                return deepEqual(newExp1, newExp2);
            } else if (
                exp1.role === "Application" &&
                exp2.role === "Application"
            ) {
                if (
                    innerFunction(exp1.components[0], exp2.components[0]) &&
                    innerFunction(exp1.components[1], exp2.components[1])
                ) {
                    return true;
                } else {
                    return false;
                }
            }
            throw new Error("should not reach here");
        }
    };
    return innerFunction;
})();
