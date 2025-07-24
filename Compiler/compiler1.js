const fs = require("fs");
const { exec } = require("child_process");

// 👇 Function to detect if input is used in code
function codeNeedsInput(language, code) {
  const inputPatterns = {
    python: /input\s*\(/i,
    java: /Scanner\s+.*=\s*new\s+Scanner|System\.in/i,
    csharp: /Console\.Read(Line|Key)\s*\(/i
  };

  return inputPatterns[language]?.test(code) || false;
}
function extractJavaClassName(code) {
  const match = code.match(/public\s+class\s+([A-Za-z_]\w*)/);
  return match ? match[1] : null;
}
// 👇 Main compiler function
function compileCode(language, code, callback) {
  let filename = ``;
  let extension = "";
  let command = "";

  switch (language) {
    case "python":
      extension = ".py";
      filename=`temp`;
      command = `python ${filename}${extension}`;
      break;

    case "java":
      extension = ".java";
      filename=extractJavaClassName(code);
      command = `javac ${filename}${extension} && java ${filename}`;
      break;

    case "csharp":
      extension = ".cs";
      command = `csc ${filename}${extension} && ${filename}.exe`;
      break;

    default:
      callback("❌ Unsupported language.");
      return;
  }

  // 1. Check if code requires input
  const requiresInput = codeNeedsInput(language, code);
  console.log("⚠️ Code needs input:", requiresInput);
function extractJavaClassName(code) {
  const match = code.match(/public\s+class\s+([A-Za-z_]\w*)/);
  return match ? match[1] : null;
}
  // 2. Write code to file
  fs.writeFile(`${filename}${extension}`, code, (err) => {
    if (err) return callback("❌ Error writing code file.");

    if (requiresInput) {
      callback("⚠️ This code requires input. Please provide user input via stdin.");
      cleanup();
      return;
    }

    // 3. Compile and run
    exec(command, (error, stdout, stderr) => {
      cleanup();
      if (error) return callback(`❌ Compilation error:\n${stderr}`);
      return callback(stdout);
    });
  });

  // 4. Cleanup function
  function cleanup() {
    try {
      fs.unlinkSync(`${filename}${extension}`);
      if (language === "java") fs.unlinkSync(`${filename}.class`);
      if (language === "csharp") fs.unlinkSync(`${filename}.exe`);
    } catch (e) {
      console.log("Cleanup error:", e.message);
    }
  }
}

// ✅ Example test
const sampleCode = fs.readFileSync("temp.txt",'utf-8',(err,data)=>{
console.log(data);
});
console.log(sampleCode);
compileCode("java", sampleCode, (result) => {
  console.log("\n== Output ==");
  console.log(result);
});

code=`
print("Hello world");
`;

compileCode("python", code, (result) => {
    console.log("\n== Output ==");
    console.log(result);
  });