// 1. Scroll Animation Observer
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

// 2. Initialize Icons
try {
    if (window.lucide) {
        lucide.createIcons();
    }
} catch (e) {
    console.error("Icon loading failed:", e);
}

// 3. Neural Network Background Animation
try {
    const canvas = document.getElementById('network-canvas');
    const ctx = canvas.getContext('2d');
    let width, height;
    
    const nodes = [];
    
    function resize() {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
        initNodes();
    }

    class Node {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 2 + 2; 
            this.vx = (Math.random() - 0.5) * 0.2; 
            this.vy = (Math.random() - 0.5) * 0.2;
            this.packets = []; 
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            
            if(Math.random() < 0.005) {
                this.packets.push({ progress: 0, target: nodes[Math.floor(Math.random() * nodes.length)] });
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = '#cbd5e1'; 
            ctx.fill();

            for (let i = this.packets.length - 1; i >= 0; i--) {
                let p = this.packets[i];
                p.progress += 0.01;
                
                if (p.progress >= 1) {
                    this.packets.splice(i, 1);
                    continue;
                }

                let px = this.x + (p.target.x - this.x) * p.progress;
                let py = this.y + (p.target.y - this.y) * p.progress;

                ctx.beginPath();
                ctx.arc(px, py, 2, 0, Math.PI * 2);
                ctx.fillStyle = '#3b82f6'; 
                ctx.fill();
                
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(p.target.x, p.target.y);
                ctx.strokeStyle = `rgba(59, 130, 246, ${0.05 * (1-p.progress)})`;
                ctx.stroke();
            }
        }
    }

    function initNodes() {
        nodes.length = 0;
        const count = Math.min(30, (width * height) / 25000); 
        for(let i = 0; i < count; i++) {
            nodes.push(new Node());
        }
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        nodes.forEach(node => {
            node.update();
            node.draw();
        });

        ctx.lineWidth = 1;
        for(let i=0; i<nodes.length; i++) {
            for(let j=i+1; j<nodes.length; j++) {
                let dx = nodes[i].x - nodes[j].x;
                let dy = nodes[i].y - nodes[j].y;
                let dist = Math.sqrt(dx*dx + dy*dy);

                if(dist < 150) {
                    ctx.strokeStyle = `rgba(203, 213, 225, ${0.15 - dist/1000})`;
                    ctx.beginPath();
                    ctx.moveTo(nodes[i].x, nodes[i].y);
                    ctx.lineTo(nodes[j].x, nodes[j].y);
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
} catch (e) {
    console.error("Canvas animation failed:", e);
}

// ==========================================
// 4. GEMINI AI CHAT INTEGRATION
// ==========================================
const chatWidget = document.getElementById('ai-widget-container');
const toggleBtn = document.getElementById('ai-toggle-btn');
const chatWindow = document.getElementById('ai-chat-window');
const closeBtn = document.getElementById('ai-close-btn');
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const messagesContainer = document.getElementById('chat-messages');
const quickActions = document.querySelectorAll('.quick-action');

let isChatOpen = false;

// --- RESUME DATA FOR AI CONTEXT ---
const resumeContext = `
    You are the AI Assistant for Amit Wankhede's portfolio. You represent Amit, a Custom Software Engineering Analyst.
    Your tone is professional, humble, confident, and reliable.
    
    Key Details about Amit:
    - Role: Custom Software Engineering Analyst at Accenture (Feb 2022 - Present).
    - Focus: Application Support (L2/L3), Stability, Automation, .NET Development.
    - Tech Stack: ASP.NET MVC, C# .NET, SQL Server, Oracle PL/SQL, HTML/CSS.
    - Tools: Automic (Batch Monitoring), ServiceNow, Jira, WinSCP, Excel.
    - Key Projects:
        1. Retail Inventory System: Built Inbound/Outbound jobs, ASP.NET MVC UI, MS SQL backend.
        2. Enterprise Sales Portal: Maintained ASP.NET app + Oracle DB, connected to SAP. Did RCA.
        3. SharePoint Utility: Built C# automation tool for file uploads.
    - Achievements: Accenture Pinnacle Award "Rising Star" (2023), 30% reduction in manual effort via automation.
    - Philosophy: "I turn complex problems into quiet mornings." (Stability focused).
    - Contact: amitwankhede39@gmail.com.
    
    Instructions:
    - Answer questions based on this context.
    - Keep answers concise (under 3 sentences usually).
    - Be helpful and encouraging about hiring Amit.
    - If asked about something not here, say you don't have that specific info but suggest contacting Amit.
`;

// Toggle Chat
function toggleChat() {
    isChatOpen = !isChatOpen;
    if (isChatOpen) {
        chatWindow.classList.remove('hidden', 'scale-95', 'opacity-0');
        chatWindow.classList.add('scale-100', 'opacity-100');
        toggleBtn.classList.add('hidden');
    } else {
        chatWindow.classList.add('hidden', 'scale-95', 'opacity-0');
        chatWindow.classList.remove('scale-100', 'opacity-100');
        toggleBtn.classList.remove('hidden');
    }
}

toggleBtn.addEventListener('click', toggleChat);
closeBtn.addEventListener('click', toggleChat);

// Append Message to UI
function appendMessage(text, isUser) {
    const div = document.createElement('div');
    div.className = `chat-message ${isUser ? 'chat-user' : 'chat-ai'}`;
    // Use marked for simple markdown parsing if available, else plain text
    div.innerHTML = isUser ? text : marked.parse(text); 
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Show Typing Indicator
function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-message chat-ai flex gap-1 items-center';
    div.id = 'typing-indicator';
    div.innerHTML = `<div class="typing-dot"></div><div class="typing-dot" style="animation-delay:0.1s"></div><div class="typing-dot" style="animation-delay:0.2s"></div>`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    return div;
}

// Call Gemini API (with Mock Fallback)
async function askGemini(prompt) {
    // ==================================================
    // 🚨 INSERT YOUR GEMINI API KEY BELOW TO ENABLE AI 🚨
    // ==================================================
    const apiKey = ""; // <--- Paste key inside quotes!
    
    // Fallback Mock Logic (If no key is present)
    if (!apiKey) {
        // Mock typing delay
        const typingIndicator = showTyping();
        
        setTimeout(() => {
            typingIndicator.remove();
            const lowerPrompt = prompt.toLowerCase();
            let reply = "<strong>Demo Mode:</strong> No API key detected. Once you add your Gemini API key to the code, I can answer anything! <br><br>Here is what I know based on keywords:";
            
            if (lowerPrompt.includes("skill") || lowerPrompt.includes("stack") || lowerPrompt.includes("tech")) {
                reply = "Amit's tech stack includes **ASP.NET MVC, C#, SQL Server, Oracle PL/SQL**, and **Automic**. He is also an expert in **Incident Management** and **RCA**.";
            } else if (lowerPrompt.includes("experience") || lowerPrompt.includes("work") || lowerPrompt.includes("job")) {
                reply = "Amit has been a **Custom Software Engineering Analyst at Accenture** since Feb 2022. He specializes in L2/L3 support, Azure-to-AWS migrations, and automation.";
            } else if (lowerPrompt.includes("project")) {
                reply = "Key projects include the **Retail Inventory System** (End-to-end .NET jobs), **Enterprise Sales Portal** (Oracle/SAP integration), and a **SharePoint Automation Utility**.";
            } else if (lowerPrompt.includes("contact") || lowerPrompt.includes("email") || lowerPrompt.includes("reach")) {
                reply = "You can reach Amit at **amitwankhede39@gmail.com**.";
            } else {
                reply = "I see you're asking about \"" + prompt + "\". In real mode, I'd analyze Amit's resume to answer that. In this demo, I can tell you about his **Skills**, **Experience**, or **Projects**.";
            }
            
            appendMessage(reply, false);
        }, 1500);
        return;
    }

    // Real API Call
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const typingIndicator = showTyping();

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{
                    role: "user",
                    parts: [{ text: `System Instruction: ${resumeContext}\n\nUser Question: ${prompt}` }]
                }]
            })
        });

        const data = await response.json();
        typingIndicator.remove();

        if (data.candidates && data.candidates[0].content) {
            const reply = data.candidates[0].content.parts[0].text;
            appendMessage(reply, false);
        } else {
            appendMessage("I'm having trouble connecting to Google's AI servers right now. Please try again later.", false);
        }
    } catch (error) {
        console.error("Gemini Error:", error);
        typingIndicator.remove();
        appendMessage("Oops! Something went wrong with the connection. Please check your internet or API key.", false);
    }
}

// Handle Form Submit
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = chatInput.value.trim();
    if (!text) return;

    appendMessage(text, true);
    chatInput.value = '';
    askGemini(text);
});

// Handle Quick Actions
quickActions.forEach(btn => {
    btn.addEventListener('click', () => {
        const text = btn.innerText;
        appendMessage(text, true);
        askGemini(text);
    });
});