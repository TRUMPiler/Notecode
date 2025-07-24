const express=require("express");
const path=require("path");
const {compileCodeFromFile}=require(path.join(__dirname,"Compiler"));

const app=express();
app.use(express.json());
app.post("/compile", (req, res) => {
    const language = req.body; 

    if (!language) {
      return res.status(400).send({ error: "Language is required." });
    }

    compileCodeFromFile(language.language, (result) => {
      res.send({ output: result}); 
    });
});

app.listen(5000, () => {
    console.log(`Server is running on http://localhost:5000`);
});