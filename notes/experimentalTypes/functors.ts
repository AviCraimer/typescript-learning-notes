


type Functor<F, A> = F & {
    fmap: <B>(f : (v : A) => B) => ( (g: F<A>) => F<B>)
}
//Doesn't work because F is considered non-generic
