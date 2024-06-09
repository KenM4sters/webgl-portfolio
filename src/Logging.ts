/**
 * @brief Not actually using this at the moment, since I can't get the TS linter/compiler to understand
 * that this function checks if a type is null and throws an error if it is.
 */
export default class 
{
    constructor() {}

    static cassert<T>(subject : T, msg : string) : void 
    {
        if(subject == null) throw new Error(msg);
    } 
} 