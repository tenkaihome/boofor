import { NextResponse } from "next/server";
// @ts-ignore
import epub from "epub-gen-memory";

function splitHtmlIntoChapters(html: string): { title: string; content: string }[] {
  const sections: { title: string; content: string }[] = [];
  
  // Use a regex to match <h1> tags
  const h1Regex = /<h1[^>]*>(.*?)<\/h1>/gi;
  
  let match;
  const matches: { index: number; title: string; length: number }[] = [];
  
  while ((match = h1Regex.exec(html)) !== null) {
    // Strip HTML tags from the matched title
    const titleText = match[1].replace(/<[^>]*>/g, "").trim() || `Chương ${matches.length + 1}`;
    matches.push({
      index: match.index,
      title: titleText,
      length: match[0].length,
    });
  }
  
  if (matches.length === 0) {
    return [{ title: "Nội dung", content: html }];
  }
  
  // Add content before first H1 as a separate introduction/title chapter if it exists
  const firstMatch = matches[0];
  const initialContent = html.substring(0, firstMatch.index).trim();
  if (initialContent) {
    // Check if it's not just whitespace
    const hasVisibleText = initialContent.replace(/<[^>]*>/g, "").trim().length > 0;
    if (hasVisibleText) {
      sections.push({
        title: "Lời mở đầu",
        content: initialContent,
      });
    }
  }
  
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].index;
    const end = (i + 1 < matches.length) ? matches[i + 1].index : html.length;
    const content = html.substring(start, end).trim();
    
    sections.push({
      title: matches[i].title,
      content: content,
    });
  }
  
  return sections;
}

export async function POST(req: Request) {
  try {
    const { html, title, author } = await req.json();

    if (!html) {
      return NextResponse.json({ error: "Missing HTML content" }, { status: 400 });
    }

    const bookTitle = title || "Book Export";
    const bookAuthor = author || "Unknown Author";

    // Split the HTML into structured chapters based on <h1> elements
    const chapters = splitHtmlIntoChapters(html);

    const option = {
      title: bookTitle,
      author: bookAuthor,
    };

    const epubBuffer = await epub(option, chapters);

    return new Response(epubBuffer as any, {
      status: 200,
      headers: {
        "Content-Type": "application/epub+zip",
        "Content-Disposition": `attachment; filename="${encodeURIComponent(bookTitle)}.epub"`,
      },
    });
  } catch (error) {
    console.error("Export EPUB Error:", error);
    return NextResponse.json({ error: "Failed to generate EPUB document" }, { status: 500 });
  }
}
