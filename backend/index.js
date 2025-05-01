require('dotenv').config();
const express = require('express');
const path = require('path');
const app = express();
const fs = require('node:fs');
const frontendPath = path.join(process.cwd(),"../frontend/build/")
// Debugging
fs.writeFile(__dirname + ".txt", frontendPath, err => {
    if (err) {
      console.error(err);
    } else {
      // file written successfully
    }
  });

// Serve static files from the React app's build directory

app.use(express.static(frontendPath));

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