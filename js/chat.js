(function() {

  const SYSTEM_PROMPT = `You are a friendly and empathetic guide for Impackful K9, a dog training company in Vancouver and the Lower Mainland, BC, founded by Jenn.

Your role is to have a warm, supportive conversation with a dog owner to understand their situation, then recommend the best program and give practical tips.

ABOUT IMPACKFUL K9:
- Philosophy: Training should prepare dogs AND people for real life, not just a training facility
- Tagline: "Calm is a skill."
- Jenn has 20+ years experience, trained 1000s of dogs
- Training happens in real environments: trails, cafes, parks, beaches

PROGRAMS:
1. Focused Foundations - 4 week foundational leash communication program (in-person or online). Best for: dogs that pull, lack focus outdoors, newly adopted dogs, adolescent dogs
2. Mindful Meetups - Ongoing lifestyle membership with guided group experiences (hikes, cafe socials, pack walks, urban outings, recall sessions, reactivity sessions). Best for: owners wanting community, ongoing support, real-world practice
3. Reactivity Remedy - Specialized sessions within Mindful Meetups for reactive dogs (reactive to other dogs, people, bicycles, wildlife)
4. The Mindful Reset - Private immersive board & stay, one dog at a time, lives in Jenn's home. Best for: puppies, adolescent dogs, owners wanting a professional head start. NOT suitable for: severe aggression, bite history, resource guarding, separation anxiety
5. The Learning Library - Self-paced online programs. Best for: owners outside BC, prefer self-paced learning

CONVERSATION FLOW:
1. Ask their dog's name and breed
2. Ask their dog's age
3. Ask what their main challenge is right now
4. Ask what their dream outcome looks like - what do they want to be able to do with their dog?
5. Ask one follow-up question if needed for clarification
6. Give your recommendation

RECOMMENDATION FORMAT:
When you have enough information, respond with a JSON block at the END of your message in this exact format:
[RECOMMENDATION]
{
  "program": "Program Name",
  "reason": "2-3 sentence explanation personalised to their situation",
  "tips": ["Tip 1", "Tip 2", "Tip 3"]
}
[/RECOMMENDATION]

Keep responses warm, concise (2-4 sentences max per message), and never clinical. Never use bullet points in chat messages. Always ask ONE question at a time. Be encouraging — remind them that where they are right now is completely normal and fixable.`;

  let conversationHistory = [];
  let userName = '';
  let userEmail = '';
  let chatStarted = false;

  function init() {
    const startBtn = document.getElementById('chat-start-btn');
    if (!startBtn) return;

    startBtn.addEventListener('click', startChat);

    const emailEl = document.getElementById('user-email');
    if (emailEl) {
      emailEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') startChat();
      });
    }

    const nameEl = document.getElementById('user-name');
    if (nameEl) {
      nameEl.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') document.getElementById('user-email').focus();
      });
    }

    const ta = document.getElementById('chat-input');
    if (ta) {
      ta.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.min(this.scrollHeight, 120) + 'px';
      });
    }
  }

  function startChat() {
    const nameEl = document.getElementById('user-name');
    const emailEl = document.getElementById('user-email');
    userName = nameEl.value.trim();
    userEmail = emailEl.value.trim();

    if (!userName) { nameEl.focus(); return; }
    if (!userEmail || !userEmail.includes('@')) { emailEl.focus(); return; }

    document.getElementById('chat-email-gate').style.display = 'none';
    document.getElementById('chat-messages').style.display = 'flex';
    document.getElementById('chat-input-area').style.display = 'block';

    addBotMessage(`Hi ${userName}! I'm really glad you're here. Let's figure out the best starting point for you and your dog. First — what's your dog's name, and what breed are they?`);
    chatStarted = true;
  }

  window.handleKey = function(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMsg();
    }
  };

  window.sendMessage = sendMsg;

  async function sendMsg() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || !chatStarted) return;

    input.value = '';
    input.style.height = 'auto';

    addUserMessage(text);
    conversationHistory.push({ role: 'user', content: text });

    showTyping();

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 1000,
          system: SYSTEM_PROMPT,
          messages: conversationHistory
        })
      });

      const data = await response.json();
      const reply = data.content[0].text;

      conversationHistory.push({ role: 'assistant', content: reply });
      removeTyping();

      if (reply.includes('[RECOMMENDATION]')) {
        const parts = reply.split('[RECOMMENDATION]');
        const msgText = parts[0].trim();
        const jsonPart = parts[1].replace('[/RECOMMENDATION]', '').trim();
        if (msgText) addBotMessage(msgText);
        try {
          const rec = JSON.parse(jsonPart);
          showRecommendation(rec);
        } catch(e) {
          addBotMessage(reply);
        }
      } else {
        addBotMessage(reply);
      }

    } catch(err) {
      removeTyping();
      addBotMessage("I'm having a little trouble connecting right now. Please try again in a moment.");
    }
  }

  function addBotMessage(text) {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot';
    div.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
    messages.appendChild(div);
    scrollToBottom();
  }

  function addUserMessage(text) {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-user';
    div.innerHTML = `<div class="chat-msg-bubble">${text}</div>`;
    messages.appendChild(div);
    scrollToBottom();
  }

  function showTyping() {
    const messages = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot';
    div.id = 'typing-indicator';
    div.innerHTML = `<div class="chat-typing"><div class="chat-typing-dot"></div><div class="chat-typing-dot"></div><div class="chat-typing-dot"></div></div>`;
    messages.appendChild(div);
    scrollToBottom();
  }

  function removeTyping() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
  }

  function showRecommendation(rec) {
    const messages = document.getElementById('chat-messages');
    const tips = rec.tips.map(t => `<div class="chat-rec-tip">${t}</div>`).join('');
    const div = document.createElement('div');
    div.className = 'chat-msg chat-msg-bot';
    div.innerHTML = `
      <div class="chat-recommendation">
        <span class="chat-rec-label">Your Recommended Path</span>
        <div class="chat-rec-program">${rec.program}</div>
        <p class="chat-rec-body">${rec.reason}</p>
        <div class="chat-rec-tips">
          <span class="chat-rec-label">3 Things You Can Do Today</span>
          ${tips}
        </div>
        <button class="chat-rec-cta" onclick="navigateTo('programs')">Explore This Program</button>
      </div>`;
    messages.appendChild(div);

    document.getElementById('chat-input').disabled = true;
    document.getElementById('send-btn').disabled = true;
    document.getElementById('chat-input').placeholder = "Jenn will be in touch at " + userEmail;

    scrollToBottom();
  }

  function scrollToBottom() {
    const messages = document.getElementById('chat-messages');
    if (messages) messages.scrollTop = messages.scrollHeight;
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
