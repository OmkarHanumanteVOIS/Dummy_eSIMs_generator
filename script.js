let generatedOutput = { part1: "", part2: "" };
let selectedSIMType = null; // Default: no SIM type selected

function selectSIMType(type) {
    // Highlight the selected eSIM type
    const buttons = document.querySelectorAll('.sidebar button');
    buttons.forEach((button) => button.classList.remove('active')); // Remove active class from all buttons
    document.getElementById(type).classList.add('active'); // Add active class to the selected button

    // Store the selected eSIM type globally
    selectedSIMType = type; // eSIM type will be stored as 'digital' or 'vouchered'
}

function generateICCID() {
    const prefix = "893106"; // ICCID prefix
    const remainingLength = 12; // Remaining random digits length
    const randomDigits = Array.from({ length: remainingLength }, () => Math.floor(Math.random() * 10)).join('');

    function luhnChecksum(iccid) {
        let sum = 0;
        for (let i = 0; i < iccid.length; i++) {
            let digit = parseInt(iccid.charAt(i), 10);
            if (i % 2 === 1) digit *= 2;
            if (digit > 9) digit -= 9;
            sum += digit;
        }
        return (sum % 10 === 0) ? 0 : (10 - (sum % 10));
    }

    const iccidWithoutChecksum = prefix + randomDigits;
    const checksum = luhnChecksum(iccidWithoutChecksum);
    return iccidWithoutChecksum + checksum.toString();
}

function generateNumber(start, totalLength) {
    let number = start;
    while (number.length < totalLength) {
        number += Math.floor(Math.random() * 10);
    }
    return number;
}

function generateRandomNumbers(count) {
    let numbersList = [];
    for (let i = 0; i < count; i++) {
        let num1 = generateICCID();
        let num2 = generateNumber('20404100', 15);
        numbersList.push([num1, num2]);
    }
    return numbersList;
}

function generateRandomSuffix(length) {
    let suffix = '';
    for (let i = 0; i < length; i++) {
        suffix += Math.floor(Math.random() * 10);
    }
    return suffix;
}

function generateOutput() {
    const entryCount = document.getElementById('entryCount').value || 1; // Default to 1 if empty

    // Validate selected eSIM type
    if (!selectedSIMType) {
        alert("Please select an eSIM type (Digital or Vouchered) before generating output.");
        return false;
    }

    let part1 = "$H:CREATE_PACKAGE\n$H:Type,Value,Pool,Activity Name,Activity Parameters,Attributes\n";
    let part2 = "$H:INVOKE_UNIFIED_RESOURCE_ACTIVITY\n$H:Type,Value,Pool,Activity Name,Activity Parameters,Attributes\n";

    // Determine Article ID based on eSIM type
    const articleID = selectedSIMType === 'vouchered' ? "107006560" : "107007551";

    let numbersList = generateRandomNumbers(entryCount);
    for (let [num1, num2] of numbersList) {
        part1 += `$R:<PARENT>SIM,${num1},,LOAD,,PIN2@6138:SIM Algorithm@17:PIN1@0000:ACC@1:Vendor Order ID@572:SP Order ID@3005492271:SIM Profile@TP_21THAL_POSTP_eSIM_B_LIVELAB:PUK1@58603921:PUK2@87379769:KI@825E487D797C1A5E14143CD0EAE6AEBC:SIM Type@E:Activation Code@LPAREPLACE_COLON1$vnl-gto-livelab.prod.ondemandconnectivity.com$B9BA7774D4C43CF111A2B611417BD1B5B7971B403E29CA66042457CCA96A40B9:Confirmation Code@888562:Matching Id@B9BA7774D4C43CF111A2B611417BD1B5B7971B403E29CA66042457CCA96A40B9:SMDPPLUS FQDN@vnl-gto-livelab.prod.ondemandconnectivity.com:INI STATE@Released:Payment Method@POSTPAID:Article ID@${articleID}<CHILD>IMSI,${num2},,,LOAD,,\n`;
        part2 += `$R:SIM,${num1},,ASSIGN,,,\n`;
    }
    part1 += "$F:\n";
    part2 += "$F:";
    generatedOutput = { part1, part2 };

    return true;
}

function generateOutputAndDisplay() {
    if (generateOutput()) { // Proceed only if output is successfully generated
        // Display the generated output in the <pre> elements
        const outputPart1 = document.getElementById('outputPart1');
        const outputPart2 = document.getElementById('outputPart2');

        outputPart1.textContent = generatedOutput.part1;
        outputPart2.textContent = generatedOutput.part2;

        // Let the <pre> resize dynamically based on its content
        outputPart1.style.whiteSpace = "pre-wrap"; // Ensures proper word wrapping
        outputPart2.style.whiteSpace = "pre-wrap";

        alert("Output generated successfully and displayed!");
    }
}

function downloadFiles() {
    if (!generatedOutput.part1 || !generatedOutput.part2) {
        alert("Please generate output first!");
        return;
    }
    let randomSuffix = generateRandomSuffix(5);
    let filenamePart1 = `VFNL_GEM_001122222333777777${randomSuffix}.txt`;
    let filenamePart2 = `SIM_ASSIGN_119111112233454467${randomSuffix}.txt`;

    download(filenamePart1, generatedOutput.part1);
    download(filenamePart2, generatedOutput.part2);
}

function download(filename, text) {
    let element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}
