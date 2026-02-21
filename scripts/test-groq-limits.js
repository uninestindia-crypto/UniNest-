const fs = require('fs');

// Load keys from environment variable (comma-separated: KEY1,KEY2,...)
const keys = process.env.GROQ_API_KEYS
    ? process.env.GROQ_API_KEYS.split(',').map(k => k.trim())
    : [];

if (keys.length === 0) {
    console.error("No Groq API keys found. Please set GROQ_API_KEYS environment variable.");
    process.exit(1);
}

async function makeRequest(apiKey) {
    const start = performance.now();
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            model: 'llama-3.3-70b-versatile',
            messages: [{ role: 'user', content: 'Say hello in 5 words.' }]
        })
    });
    const end = performance.now();
    return { status: res.status, time: end - start, res };
}

async function runTest() {
    console.log("Starting Groq API limit and rotation load test...\n");

    const report = [];

    for (let i = 0; i < keys.length; i++) {
        const key = keys[i];
        console.log(`Testing Key ${i + 1} (${key.substring(0, 10)}...)...`);

        let reqCount = 0;
        let hitLimit = false;

        // We'll flood the API until we hit a 429
        while (!hitLimit && reqCount < 100) { // Safety break at 100
            reqCount++;
            const { status, time } = await makeRequest(key);

            if (status === 200) {
                process.stdout.write('.'); // Success pulse
            } else if (status === 429) {
                console.log(`\n[!] Rate limit hit on Key ${i + 1} after ${reqCount - 1} successful requests.`);
                hitLimit = true;

                let switchTimeMs = "N/A";

                // Measure switch and recovery time with next key
                if (i < keys.length - 1) {
                    console.log(`Initiating fallback to Key ${i + 2}...`);
                    const switchStart = performance.now();
                    const nextAttempt = await makeRequest(keys[i + 1]);
                    const switchEnd = performance.now();

                    if (nextAttempt.status === 200) {
                        switchTimeMs = (switchEnd - switchStart).toFixed(2);
                        console.log(`Success! Request completed using new key in ${switchTimeMs}ms.\n`);
                    } else {
                        console.log(`Fallback key also failed with status ${nextAttempt.status}.\n`);
                    }
                } else {
                    console.log(`No more keys to failover to.\n`);
                }

                report.push({
                    keyIndex: i + 1,
                    successfulLoad: reqCount - 1,
                    switchTimeMs,
                });

            } else {
                console.log(`\n[Error] Unexpected status ${status} on Key ${i + 1}`);
                hitLimit = true;
            }
        }
    }

    // Generate Report Artifact
    let markdown = `# Groq API Key Rotation Load Test Report\n\n`;
    markdown += `This report outlines the capabilities of the rotatory API keys when subjected to continuous load until reaching rate limits.\n\n`;
    markdown += `| Key Index | Successful API Hits Before Rate Limit | Time Taken to Switch to Next Key & Complete Request (ms) |\n`;
    markdown += `|-----------|---------------------------------------|----------------------------------------------------------|\n`;

    report.forEach(r => {
        markdown += `| Key ${r.keyIndex} | ${r.successfulLoad} | **${r.switchTimeMs}** |\n`;
    });

    markdown += `\n**Key Findings:**\n`;
    markdown += `- **Load Capacity**: Each key takes an average of **${(report.reduce((a, b) => a + b.successfulLoad, 0) / report.length).toFixed(1)} requests** before Groq issues a 429 Rate Limit.\n`;

    const switchTimes = report.filter(r => r.switchTimeMs !== 'N/A').map(r => parseFloat(r.switchTimeMs));
    const avgSwitchTime = switchTimes.length ? (switchTimes.reduce((a, b) => a + b, 0) / switchTimes.length).toFixed(2) : 'N/A';

    markdown += `- **Rotation Latency**: The application takes approximately **${avgSwitchTime} milliseconds** to intercept a rate limit error, switch to a fresh API key, and successfully return a completion from the new key.\n`;

    const reportPath = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\f7cbb9d7-072b-43cd-a2c5-4e3e55bfeaf3\\groq_load_report.md';
    fs.writeFileSync(reportPath, markdown);
    console.log(`\nReport successfully generated at ${reportPath}`);
}

runTest();
