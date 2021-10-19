//Russell's Paradox
function arrayEq(arr1: any[], value: any): boolean {
    if (!(Array.isArray(value) && arr1.length === value.length)) {
        return false;
    }
    return arr1.every((el, i) => (el = value[i]));
}

//Takes an array of arrays and returns an filtered array
function selfReferenceFilter(arr: any[][]) {
    return arr.filter((memberArr) =>
        memberArr.every((el) => !arrayEq(memberArr, el))
    );
}

const B: any[] = [];
B.push(B); // B is a member of itself

const A: any[] = [B, 3, 5, 6, "Cat", [], {}];
A.push(A); // A is a member of itself and contains B which is a member of itself.

const A_filtered = selfReferenceFilter(A); // [3,5,6,"Cat", [], {}]
//This will filter A and B from the members of A, since both have themselves as members. Note that the function does not alter either A or B, but simply re-packages their members based on the filter.

//The next part we can't do fully programmatically, since it involves infinities!
// Imagine an infinite array that contains all possible JavaScript arrays.
let Omega: any[][] = [["all the arrays"]];

// Now consider, if we could actually run our filter function and return a value:
const Omega_filtered = selfReferenceFilter(Omega);

// Note that while the infinities make it impossible to compute this, that is not actually a problem for mathematicians. The real problem is with the contradiction that follows when you consider Omega_filtered.

// First we can ask ourselves, is Omega_filtered an element of the array Omega?

//Of course, since Omega_filtered is an array, it is in Omega by definition.

// Okay, now we ask, does Omega_filtered have itself as an element? The answer should be "No!" since Omega_filtered is an array that could be produced by the function selfReferenceFilter, which would have remove any self-referencing member.

//However, since Omega_filtered is an element of Omega and it is not a member of itself, it must get copied to the array produced by selfReferenceFilter (since the function copies all elements that are not-members of themselves).

// So Omega_filtered both is and is not an element of itself.
