let generatedOutput = { part1: "", part2: "" };
let selectedSIMType = null; // Default: no SIM type selected

function selectSIMType(type) {
    const buttons = document.querySelectorAll('.sidebar button');
    buttons.forEach((button) => button.classList.remove('active')); // Remove active state
    document.getElementById(type).classList.add('active'); // Highlight selected button

    selectedSIMType = type; // Store selected type globally
}

function generateOutputAndDisplay() {
    if (!selectedSIMType) {
        alert("Please select an eSIM type first!");
        return;
    }

    const entryCount = document.getElementById('entryCount').value || 1; // Default to 1
    const articleID = selectedSIMType === "vouchered" ? "107006560" : "107007551";

    let part1 = "$H:CREATE_PACKAGE\n$H:Type,Value,Pool,Activity Name,Activity Parameters,Attributes\n";
    let part2 = "$H:INVOKE_UNIFIED_RESOURCE_ACTIVITY\n$H:Type,Value,Pool,Activity Name,Activity Parameters,Attributes\n";

    for (let i = 0; i < entryCount; i++) {
        let iccid = generateICCID();
        let imsi = generateNumber("20404100", 15);
        part1 += `$R:SIM,${iccid},,LOAD,,Article ID@${articleID}<CHILD>IMSI,${imsi},,,LOAD,,\n`;
        part2 += `$R:SIM,${iccid},,ASSIGN,,,\n`;
    }

    part1 += "$F:";
    part2 += "$F:";
    generatedOutput = { part1, part2 };

    document.getElementById("outputPart1").textContent = generatedOutput.part1;
    document.getElementById("outputPart2").textContent = generatedOutput.part2;
}

function generateICCID() {
    const prefix = "893106";
    const remainingLength = 12;
    const randomDigits = Array.from({ length: remainingLength }, () =>
        Math.floor(Math.random() * 10)
    ).join("");
    return prefix + randomDigits;
}

function generateNumber(prefix, length) {
    let result = prefix;
    while (result.length < length) {
        result += Math.floor(Math.random() * 10);
    }
    return result;
}

function downloadFiles() {
    if (!generatedOutput.part1 || !generatedOutput.part2) {
        alert("Please generate output first!");
        return;
    }

    const filename1 = `VFNL_GEM_File.txt`;
    const filename2 = `SIM_ASSIGN_File.txt`;

    download(filename1, generatedOutput.part1);
    download(filename2, generatedOutput.part2);
}

function download(filename, content) {
    const element = document.createElement("a");
    element.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(content));
    element.setAttribute("download", filename);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
