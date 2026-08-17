(function() {
    // 1. Configuration - GET THE API KEY FROM THE SCRIPT TAG
    const script = document.currentScript;
    const apiKey = script.getAttribute('data-api-key');
    const apiUrl = "https://omnichat-backend-l0n9.onrender.com/api/v1"; // <--- CHANGE THIS TO YOUR RENDER URL

    async function initWidget() {
        try {
            // 2. Fetch Bot Settings from the Public API we created in Step 1
            const res = await fetch(`${apiUrl}/tenants/public/config/${apiKey}`);
            const config = await res.json();

            // 3. Inject the CSS and HTML into a "Shadow DOM" 
            // (This prevents the website's styles from breaking our bot)
            const container = document.createElement('div');
            container.id = 'omnichat-bubble-root';
            document.body.appendChild(container);
            const shadow = container.attachShadow({ mode: 'open' });

            shadow.innerHTML = `
                <style>
                    #bubble {
                        position: fixed; bottom: 20px; right: 20px;
                        width: 60px; height: 60px; border-radius: 50%;
                        background: ${config.primary_color}; cursor: pointer;
                        display: flex; align-items: center; justify-content: center;
                        box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 999999;
                    }
                    #window {
                        position: fixed; bottom: 90px; right: 20px;
                        width: 350px; height: 500px; background: white;
                        border-radius: 15px; display: none; flex-direction: column;
                        box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 999999;
                        font-family: system-ui, sans-serif; overflow: hidden;
                    }
                    .header { background: ${config.primary_color}; color: white; padding: 15px; font-weight: bold; }
                    .msgs { flex: 1; padding: 15px; overflow-y: auto; display: flex; flex-direction: column; gap: 10px; }
                    .footer { padding: 10px; border-top: 1px solid #eee; display: flex; }
                    input { flex: 1; border: none; padding: 10px; outline: none; }
                    button { background: none; border: none; color: ${config.primary_color}; font-weight: bold; cursor: pointer; }
                </style>

                <div id="window">
                    <div class="header">${config.bot_name}</div>
                    <div id="msgs" class="msgs">
                        <div style="background: #f0f0f0; padding: 8px 12px; border-radius: 15px; align-self: start; font-size: 13px;">
                            ${config.welcome_message}
                        </div>
                    </div>
                    <form id="form" class="footer">
                        <input id="input" type="text" placeholder="Type a message...">
                        <button type="submit">Send</button>
                    </form>
                </div>

                <div id="bubble">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="white"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                </div>
            `;

            // 4. Widget Logic (Open/Close and Chat)
            const bubble = shadow.getElementById('bubble');
            const window = shadow.getElementById('window');
            const form = shadow.getElementById('form');
            const input = shadow.getElementById('input');
            const msgs = shadow.getElementById('msgs');

            bubble.onclick = () => window.style.display = window.style.display === 'flex' ? 'none' : 'flex';

            form.onsubmit = async (e) => {
                e.preventDefault();
                const text = input.value.trim();
                if(!text) return;

                msgs.innerHTML += `<div style="background: ${config.primary_color}; color: white; padding: 8px 12px; border-radius: 15px; align-self: end; font-size: 13px;">${text}</div>`;
                input.value = "";

                const chatRes = await fetch(`${apiUrl}/chat/${apiKey}/query`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ message: text })
                });
                const data = await chatRes.json();

                msgs.innerHTML += `<div style="background: #f0f0f0; padding: 8px 12px; border-radius: 15px; align-self: start; font-size: 13px;">${data.reply}</div>`;
                msgs.scrollTop = msgs.scrollHeight;
            };

        } catch (e) {
            console.error("OmniChat failed to load", e);
        }
    }

    initWidget();
})();