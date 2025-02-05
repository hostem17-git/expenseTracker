export const heartbeat = async (req, res) => {
    console.log("Heartbeat route hit");
    return res.status(200).json({
        message: "Ok"
    });
}