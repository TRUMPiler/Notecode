const fs = require("fs");
const { exec } = require("child_process");
const path = require("path");


function codeNeedsInput(language, code) {
  const inputPatterns = {
    python: /input\s*\(/i,
    java: /Scanner\s+.*=\s*new\s+Scanner|System\.in/i,
    csharp: /Console\.Read(Line|Key)\s*\(/i,
  };

  return inputPatterns[language]?.test(code) || false;
}

function extractJavaClassName(code) {
  const match = code.match(/public\s+class\s+([A-Za-z_]\w*)/);
  return match ? match[1] : null;
}

function compileCodeFromFile(language, callback) {
  const filePath = path.join(__dirname, "temp.txt");


  fs.readFile(filePath, "utf8", (err, code) => {
    if (err) {
      callback(`❌ Error reading code file: ${err.message}`);
      return;
    }

    let filename = ``;
    let extension = "";
    let command = "";

    switch (language) {
      case "python":
        extension = ".py";
        filename = `temp`;
        command = `python ${filename}${extension}`;
        break;

      case "java":
        extension = ".java";
        filename = extractJavaClassName(code);
        if (!filename) {
          callback("❌ Java code must have a public class.");
          return;
        }
        command = `javac ${filename}${extension} && java ${filename}`;
        break;

      case "csharp":
        extension = ".cs";
        filename = `temp`;
        command = `csc ${filename}${extension} && ${filename}.exe`;
        break;

      default:
        callback("❌ Unsupported language."+language);
        
        return;
    }

    const requiresInput = codeNeedsInput(language, code);
    console.log("⚠️ Code needs input:", requiresInput);

    fs.writeFile(`${filename}${extension}`, code, (err) => {
      if (err) {
        callback("❌ Error writing code file.");
        return;
      }

      if (requiresInput) {
        callback("⚠️ This code requires input. Please provide user input via stdin.");
        cleanup();
        return;
      }

      exec(command, (error, stdout, stderr) => {
        cleanup();
        if (error) {
          callback(`❌ Compilation error:\n${stderr}`);
          return;
        }
        callback(stdout);
      });
    });

    function cleanup() {
      try {
        fs.unlinkSync(`${filename}${extension}`);
        if (language === "java") fs.unlinkSync(`${filename}.class`);
        if (language === "csharp") fs.unlinkSync(`${filename}.exe`);
      } catch (e) {
        console.log("Cleanup error:", e.message);
      }
    }
  });
}

module.exports = { compileCodeFromFile };
