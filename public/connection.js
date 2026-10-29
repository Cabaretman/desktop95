const aiConnection = (() => {
  let key = '';
  function endpoint() {
    let url;
    try { url = new URL(settings.endpoint || 'https://api.openai.com/v1/chat/completions'); }
    catch { throw Error('Enter a valid provider endpoint in Connection settings.'); }
    if (url.protocol !== 'https:' || url.username || url.password || url.hash) throw Error('Use an HTTPS endpoint without embedded credentials or a fragment.');
    return url;
  }
  function validate() {
    const url = endpoint();
    if (!settings.model?.trim()) throw Error('Enter a model in Connection settings.');
    if (!key) throw Error('Enter your API key in Connection settings.');
    return url;
  }
  return {
    get hasKey() { return !!key; },
    setKey(value) { key = value.trim(); },
    clear() { key = ''; },
    validate,
    async send(messages, signal) {
      const url = validate();
      const response = await fetch(url, {
        method: 'POST', credentials: 'omit', cache: 'no-store', referrerPolicy: 'no-referrer',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
        body: JSON.stringify({ model: settings.model.trim(), messages }), signal
      });
      if (!response.ok) throw Error('Provider returned HTTP ' + response.status + '. Check your key, model, and account billing.');
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;
      if (typeof content !== 'string') throw Error('The endpoint did not return a chat-completions response.');
      return content;
    }
  };
})();
