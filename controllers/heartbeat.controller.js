export const heartbeat = async (req, res) => {
    console.log("Heartbeat route hit");
    res.status(200).json({
        success: true,
        message: "Server is running",
    });
}