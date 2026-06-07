import { NextResponse } from "next/server";
// @ts-ignore
import epub from "epub-gen-memory";

function splitHtmlIntoChapters(html: string): any[] {
  const sections: any[] = [];
  
  // Use a regex to match <h1> tags
  const h1Regex = /<h1[^>]*>(.*?)<\/h1>/gi;
  
  let match;
  const matches: { index: number; title: string; length: number }[] = [];
  
  while ((match = h1Regex.exec(html)) !== null) {
    // Strip HTML tags from the matched title
    const titleText = match[1].replace(/<[^>]*>/g, "").trim() || `Chapter ${matches.length + 1}`;
    matches.push({
      index: match.index,
      title: titleText,
      length: match[0].length,
    });
  }
  
  if (matches.length === 0) {
    return [{ title: "Content", content: html }];
  }
  
  // Add content before first H1 as a separate introduction/title chapter if it exists
  const firstMatch = matches[0];
  const initialContent = html.substring(0, firstMatch.index).trim();
  if (initialContent) {
    // Split the initialContent by the first page break if it's the title page
    const pageBreakRegex = /<div class="page-break" style="page-break-after: always;"><\/div>/i;
    const parts = initialContent.split(pageBreakRegex);
    
    // The first part is the Title Page
    const titlePageContent = parts[0].trim();
    if (titlePageContent && titlePageContent.replace(/<[^>]*>/g, "").trim().length > 0) {
      sections.push({
        title: "Title Page",
        content: titlePageContent,
        excludeFromToc: true,
        beforeToc: true,
      });
    }
    
    // The second part (if any) is the actual introduction/preface content
    if (parts.length > 1) {
      const remainingIntro = parts.slice(1).join('<div class="page-break" style="page-break-after: always;"></div>').trim();
      if (remainingIntro && remainingIntro.replace(/<[^>]*>/g, "").trim().length > 0) {
        sections.push({
          title: "Introduction",
          content: remainingIntro,
        });
      }
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
