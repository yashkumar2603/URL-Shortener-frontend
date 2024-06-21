document.getElementById('url-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const origUrl = document.getElementById('orig-url').value;
    const resultDiv = document.getElementById('result');
    resultDiv.innerHTML = '';

    try {
        const response = await fetch('https://shawtt.up.railway.app/api/short', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ origUrl }),
        });

        if (!response.ok) {
            throw new Error(await response.text());
        }

        const data = await response.json();
        const shortUrl = data.shortUrl;

        resultDiv.innerHTML = `<a href="${shortUrl}" target="_blank">${shortUrl}</a>`;
    } catch (error) {
        resultDiv.innerHTML = `<p style="color: red;">${error.message}</p>`;
    }
});
