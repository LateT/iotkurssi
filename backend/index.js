require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();

// Serve static files from the React app's build directory
const frontendPath = path.join(process.cwd(),"../frontend/build/")
app.use(express.static(frontendPath));
path.resol
// Api routes
app.get("/test", (req, res) => {
    return res.json({
        error: false
    })
})

// Catch all routes
app.get("*", (req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"))
})

app.listen(process.env.PORT || 5000, () => {
    console.log('Server is running...');
});