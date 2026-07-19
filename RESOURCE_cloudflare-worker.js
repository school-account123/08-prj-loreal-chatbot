export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json"
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    let userInput;
    try {
      userInput = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: corsHeaders
      });
    }

    const apiKey = env.OPENAI_API_KEY;

    const requestBody = {
      model: "gpt-4o",
      messages: userInput.messages,
      max_tokens: 800,
      temperature: 0.5,
      frequency_penalty: 0.8
    };

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const text = await response.text();
      return new Response(
        JSON.stringify({
          error: "OpenAI API error",
          status: response.status,
          details: text
        }),
        { status: response.status, headers: corsHeaders }
      );
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { headers: corsHeaders });
  }
};