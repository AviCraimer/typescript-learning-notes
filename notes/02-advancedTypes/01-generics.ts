//Generic Types

//We want to define a tree data structure, to store hierarchical data.

//We can start by defining some types.

//A tree node has a parent which is itself a tree node, or null in the case of the root of the tree.

//A data property to store any arbitrary data

//It has an array of children which contains a combination of further tree nodes
type _TreeNode = {
    parent: _TreeNode | null;
    children: _TreeNode[];
    data: any;
};

//A tree root is a TreeNode with parent === null
type _TreeRoot = _TreeNode & { parent: null };

const tree: _TreeRoot = {
    parent: null,
    data: 1,
    children: [],
};

//Add some children
tree.children = [
    {
        parent: tree,
        data: 2,
        children: [],
    },
    {
        parent: tree,
        data: 3,
        children: [],
    },
    {
        parent: tree,
        data: "Randomly a string", // No compiler error when we mix data types inside the tree
        children: [],
    },
];

//Now I want to access a value in one of the nodes

const data = tree.children[0].data;

//Hover over it and you'll see that it has the any type. This isn't so useful since we want to know what type of data is stored in our tree.

//Of course, we could create a specialized tree for every data type.

//e.g.,
type TreeNodeString = {
    parent: TreeNodeString | null;
    children: TreeNodeString[];
    data: string;
};

type TreeNodeNumber = {
    parent: TreeNodeNumber | null;
    children: TreeNodeNumber[];
    data: number;
};

//...etc for every tree type you might need. //This is quite tedious.
// Notice how in the name of the type we put a type
// TreeNode + string = TreeNodeString
// What if we could actually pass string as a parameter? This is exactly what generic types allow you to do.

//Generic types allow generality in the type definition together with specificity in the type of the instantiated value.

//The T is a type parameter. i.e., it is a placeholder that can be filled in with any TypeScript type.



type TreeNode<T> = {
    //We put type parameters between angle brackets, think of these as analogous to the smooth brackets of a regular function, i.e, <T> <=> (x)
    parent: TreeNode<T> | null;
    children: TreeNode<T>[];
    data: T; // Notice that we put the type parameter here, where we previously had the any type.
};

type TreeRoot<T> = TreeNode<T> & { parent: null }; // For our tree root we can pass through the type parameter to our generic node

//Now we copy our tree code from above but we assign the generic types
//Notice that we pass in number as the type argument to fill in our T parameter
//This means that everywhere we had T in our type definition, this type will now have number
const treeGeneric: TreeRoot<number> = {
    parent: null,
    data: 1,
    children: [],
};

//Add some children
treeGeneric.children = [
    {
        parent: tree,
        data: 2,
        children: [],
    },
    {
        parent: tree,
        data: 3,
        children: [],
    },
    {
        parent: tree,
        data: "Randomly a string", // We get a helpful compiler error if we mix data types
        children: [],
    },
];

//Now when we retrieve our data, TypeScript correctly infers that we have a value of type number
const numberData = treeGeneric.children[0].data;

//EXERCISE

class _Queue {
    data: any[] = []

    constructor (data: any) {
        this.data = data;
    }

    push (item: any): Queue {
        this.data.push(item);
        return this;
    }
    pop (item: any): any {
        return this.data.shift();
    }
}

//Copy this class below removing the _ from the name. Convert it to use generics

//Hint first line is
//class Queue<T> {




//Somewhat more advanced
// We can define a custom tree mapping function for analogous to Array.prototype.map()

const mapTree = <T, S>( //Here we have two type parameters. The first represents the starting type of the tree, the second represents that type of the tree after mapping
    fn: (data: T) => S // Takes a callback function argument that will be applied to the tree node data.
): ((startTree: TreeRoot<T>) => TreeRoot<S>) => { // Returns a function that goes from a T-tree to an S-tree

    //Use function overload to say that a tree root returns a tree root.
    //Recall that a tree root is a subtype (special case) of a tree node, which is what allows the overload to work.
    function mapTreeSteps (currentTree: TreeRoot<T>, parent: null) : TreeRoot<S>
    function mapTreeSteps (currentTree: TreeNode<T>, parent: TreeNode<S>) : TreeNode<S>
    function mapTreeSteps (
        currentTree: TreeNode<T>,
        parent: TreeNode<S> | null
    ): TreeNode<S>  {

        //Create a new node with mapped data
        const newNode : TreeNode<S> =  {
            parent,
            data: fn(currentTree.data), //Apply the provided callback function to the data from the original node
            children: []
        };

        //Recursively apply the mapping to all children, passing in the newly created node as parent
        newNode.children = currentTree.children.map(childNode => mapTreeSteps(childNode, newNode) )

        return newNode;
    };

    //Return a function that applies the mapping for any given tree of type T
    return (rootTree: TreeRoot<T>):TreeRoot<S> => mapTreeSteps(rootTree, null)
};


const hiHiHi = (num: number):string => {
    const nat = Math.abs(Math.round(num))
    const hiArr : "hi"[] = []
    hiArr.length = nat;
    hiArr.fill("hi")
    return hiArr.join(" ")
}

const treeHi = mapTree(hiHiHi)(treeGeneric)

const hiString = treeHi.children[1].data  // "hi hi hi"