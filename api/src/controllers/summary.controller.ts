// const createSummary = async (req, res) => {
//   if (!req.user.isAdmin) return;
//   const { title } = req.body;
//   try {
//     const prompt = `Generate a concise summary of the following article mostly about front-end development from reliable sources.
//      Include any code examples in <pre><code> tags:\n\nTitle: ${title}`;

//     const response = await fetch("https://api.openai.com/v1/chat/completions", {
//       method: "POST",
//       headers: {
//         Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({
//         model: "gpt-3.5-turbo",
//         messages: [
//           {
//             role: "user",
//             content: prompt,
//           },
//         ],
//         max_tokens: 500, // Adjust as needed
//       }),
//     });

//     const data = await response.json();
//     const summary = data.choices[0].message.content;
//     res.json({ summary });
//   } catch (error) {
//     console.error("Error generating summary:", error);
//     res.status(500).json({ error: "Failed to generate summary" });
//   }
// };

// module.exports = createSummary;
