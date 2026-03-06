//chat|route.ts
//import ReactMarkdown from "react-markdown";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function decideTool(question: string) {
  const response = await openai.chat.completions.create({
    model: "openai/gpt-oss-120b",
    messages: [
      {
        role: "system",
        content: `
You are a tool selector.

If the question is about:
- people
- places
- history
- general knowledge
Return JSON:
{
  "tool": "wikipedia_search",
  "arguments": { "query": "clean search term" }
}


If question is about news or current events or headlines,
return:
{
  "tool": "news_qa",
  "arguments": { "question": "original question" }
}


If it is normal conversation, return:
{
  "tool": "chat",
  "arguments": {}
}
`
      },
      { role: "user", content: question }
    ],
    response_format: { type: "json_object" }
  });

  return JSON.parse(response.choices[0].message.content!);
}

async function searchWikipedia(query: string) {
  const formatted = query.replace(/\s+/g, "_");

  const res = await fetch(
    `https://en.wikipedia.org/api/rest_v1/page/summary/${formatted}`
  );

  if (!res.ok) {
    return "No Wikipedia article found.";
  }

  const data = await res.json();
  return data.extract;
}

export async function POST(req: Request) {
  const body = await req.json();
  const question = body.question;

  const decision = await decideTool(question);

  if (decision.tool === "wikipedia_search") {
    const result = await searchWikipedia(decision.arguments.query);
    return Response.json({ answer: result });
  }

  if (decision.tool === "news_qa") {
  //const res = await fetch("http://localhost:3000/api/mcp",
  //const res = await fetch(`${process.env.VERCEL_URL}/api/mcp`,
  const res = await fetch(`https://news-vercel-react-7a6giopj4-anweshabose2025s-projects.vercel.app/api/mcp`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    }
  );
  const data = await res.json();
  const formatResponse = await openai.chat.completions.create({
  model: "openai/gpt-oss-120b",
  messages: [
    {
      role: "system",
      content: `
Reformat the following news into clean readable bullet points.

Rules:
- No pipe symbols
- Make bold headings and bullet points after understanding the entire context given
- Keep it clean and professional
- Give it a paragraph like structure and important points in bullet
- Try to provide sufficient gap between two news
`
    },
    {
      role: "user",
      content: data.result
    }
  ]
});

return Response.json({
  answer: formatResponse.choices[0].message.content
});
}

  // Fallback normal chat response
  return Response.json({
    answer: "I can help with general knowledge questions from Wikipedia."
  });
}