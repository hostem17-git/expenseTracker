export const whatsAppMiddleWare = (req,res,next)=>{
    console.log("In middleware");
    next();
}