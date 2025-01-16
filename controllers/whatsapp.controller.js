import {extractAmount,normalizeName } from "../utils/strings.utils.js"

export const AddExpense = async(req,res) =>{
    console.log("In controller");
    try{
        // console.log("req");
        // console.log(req);
        // console.log("\n\n--------------------------------------------------------\n\n");

        console.log("req.body")
        console.log(req.body);
        console.log("\n\n--------------------------------------------------------\n\n");

        const {Body} = req.query;
        console.log("---------> message", Body);
        const inputText = Body;
        console.log("Message");
        console.log(inputText);
        console.log("\n\n--------------------------------------------------------\n\n");

        const inputLines = inputText.trim().split("\n");
        console.log("Input lines");
        console.log(inputLines);
        console.log("\n\n--------------------------------------------------------\n\n");

        const data = {};

        inputLines.forEach(line =>{
            const parts = line.trim().split(" ");
            const amountStr = parts.pop();
            const amount = extractAmount(amountStr);
            const expense = normalizeName(parts.join(" "));  
                                                      
        if (data[expense]) {                             
            data[expense] += amount;                     
            } else {                                         
            data[expense] = amount;                      
            } 
        })

        console.log("Data");
        console.log(data)
        console.log("\n\n--------------------------------------------------------\n\n");


    }catch(error){
console.log("Add Expense error",error);
    }finally{
        res.status(404).json({message:"unknown"})
    };
}