import {extractAmount,normalizeName } from "../utils/strings.utils.js"

export const AddExpense = async(req,res) =>{
    try{
        console.log("\n\n--------------------------------------------------------\n\n");
        console.log("\n\n--------------------------------------------------------\n\n");
        console.log("\n\n--------------------------------------------------------\n\n");
  

        console.log("request body");
        console.log(req.body);

        const {Body,From} = req.body;

        const inputText = Body;
        
        const inputLines = inputText.trim().split("\n");
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
        console.log("\n\n--------------------------------------------------------\n\n");
        console.log("\n\n--------------------------------------------------------\n\n");


    }catch(error){
console.log("Add Expense error",error);
    }finally{
        res.status(404).json({message:"unknown"})
    };
}