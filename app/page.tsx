"use client";

import { useState, useMemo } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { Markdown } from "tiptap-markdown";
import { Save, Wand2, FileText, Loader2, Copy, BookOpen, Check } from "lucide-react";
import { saveAs } from "file-saver";

export default function Home() {
  const [isExporting, setIsExporting] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [title1, setTitle1] = useState("");
  const [title2, setTitle2] = useState("");
  const [author, setAuthor] = useState("");
  const [bookListText, setBookListText] = useState("");
  const [introductionText, setIntroductionText] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline.configure(),
      Markdown.configure(),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({
        placeholder: "Dán nội dung vào đây...",
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[60vh] max-h-[70vh] overflow-y-auto p-8 border rounded-md shadow-inner bg-white font-serif",
      },
    },
  });

  const parsedBooks = useMemo(() => {
    if (!bookListText) return [];
    return bookListText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        // Hỗ trợ chia title1 và title2 nếu có dấu -, |, hoặc :
        const match = line.match(/^(.*?)\s*[-|:]\s*(.*)$/);
        if (match) {
          return { title1: match[1], title2: match[2], full: line };
        }
        return { title1: line, title2: "", full: line };
      });
  }, [bookListText]);

  const copyToClipboard = async (text: string, id: string, isHtml = false) => {
    if (!text) return;
    try {
      if (isHtml) {
        const blobHtml = new Blob([text], { type: "text/html" });
        const plainText = new DOMParser().parseFromString(text, "text/html").body.textContent || "";
        const blobText = new Blob([plainText], { type: "text/plain" });
        const data = [new ClipboardItem({
            "text/html": blobHtml,
            "text/plain": blobText,
        })];
        await navigator.clipboard.write(data);
      } else {
        await navigator.clipboard.writeText(text);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error(err);
      if (isHtml) {
        const plainText = new DOMParser().parseFromString(text, "text/html").body.textContent || "";
        navigator.clipboard.writeText(plainText);
      } else {
        navigator.clipboard.writeText(text);
      }
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const handleSelectBook = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx) && parsedBooks[idx]) {
      setTitle1(parsedBooks[idx].title1);
      setTitle2(parsedBooks[idx].title2);
    }
  };

  const formatContent = () => {
    if (!editor) return;
    setIsFormatting(true);

    setTimeout(() => {
      let html = editor.getHTML();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      const vietnameseRegex = /[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũũụủưứừửữựỳýỹỷỵ]/i;

      const aiPhrases = [
        "certainly! here is",
        "ready for chapter",
        "just say",
        "would you like to continue",
        "absolutely! below is",
        "here is a comprehensive",
        "congratulations! by reaching this point",
        "please confirm",
        "absolutely! here is",
        "next steps:",
        "thank you for your confirmation",
        "end of chapter"
      ];

      const allElements = doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, div");
      
      allElements.forEach((el) => {
        const text = el.textContent?.trim() || "";
        const lowerText = text.toLowerCase();
        
        if (!text) return; 

        if (vietnameseRegex.test(text)) {
          el.remove();
          return;
        }

        const hasAiPhrase = aiPhrases.some((phrase) => lowerText.includes(phrase));
        if (hasAiPhrase) {
          el.remove();
          return;
        }

        const wordCount = text.split(/\s+/).length;
        const isHeadingCandidate = wordCount < 15;
        
        const isChapterHeading = /^chapter\s+\d+/i.test(lowerText);
        const isIntroOrConclusion = /(introduction|conclusion)/i.test(lowerText) && isHeadingCandidate;

        if (isChapterHeading || isIntroOrConclusion) {
          let headingEl = el;
          if (el.tagName !== "H1") {
            const h1 = doc.createElement("h1");
            h1.innerHTML = el.innerHTML;
            el.replaceWith(h1);
            headingEl = h1; 
          }
          
          (headingEl as HTMLElement).style.textAlign = "center";
          (headingEl as HTMLElement).classList.add("page-break-before");
        }
      });

      // Lấy Intro text trước khi đặt lại nội dung
      let isRecordingIntro = false;
      let hasFinishedIntro = false;
      let extractedIntro: string[] = [];
      const cleanedNodes = Array.from(doc.body.children);
      
      for (const el of cleanedNodes) {
        const text = el.textContent?.trim() || "";
        const lower = text.toLowerCase();

        if (/^chapter\s+\d+/i.test(lower)) {
          isRecordingIntro = false;
          hasFinishedIntro = true;
        } else if (/(introduction)/i.test(lower) && text.split(/\s+/).length < 15 && !hasFinishedIntro && !isRecordingIntro) {
          isRecordingIntro = true;
        } else if (isRecordingIntro && text) {
          extractedIntro.push(el.outerHTML);
        }
      }

      setIntroductionText(extractedIntro.join(""));

      let cleanedHtml = doc.body.innerHTML;
      editor.commands.setContent(cleanedHtml);
      setIsFormatting(false);
    }, 100);
  };

  const exportToWord = async () => {
    if (!editor) return;
    setIsExporting(true);

    try {
      let html = editor.getHTML();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      const allElements = doc.body.querySelectorAll("*");
      allElements.forEach((el) => {
        const hElement = el as HTMLElement;
        hElement.style.fontFamily = "Times New Roman";
        
        if (hElement.style.textAlign === "center" || hElement.getAttribute("data-text-align") === "center") {
          hElement.style.textAlign = "center";
        }

        if (hElement.tagName === "H1") {
          hElement.style.fontSize = "16pt";
        } else if (hElement.tagName === "P" || hElement.tagName === "SPAN") {
          hElement.style.fontSize = "13pt";
        } else if (hElement.tagName === "TABLE") {
          hElement.style.borderCollapse = "collapse";
          hElement.style.width = "100%";
          hElement.setAttribute("border", "1");
        } else if (hElement.tagName === "TD" || hElement.tagName === "TH") {
          hElement.style.border = "1px solid black";
          hElement.style.padding = "5px";
        }
      });

      const pageBreakElements = doc.body.querySelectorAll(".page-break-before");
      pageBreakElements.forEach((el) => {
        if (el.previousElementSibling) {
          const pageBreakDiv = doc.createElement("div");
          pageBreakDiv.style.pageBreakBefore = "always";
          el.parentNode?.insertBefore(pageBreakDiv, el);
        }
      });

      let processedHtml = doc.body.innerHTML;

      processedHtml = processedHtml.replace(/font-family:\s*(&quot;|"|')?Times New Roman(&quot;|"|')?/gi, "font-family: Times New Roman");

      if (title1 || title2 || author) {
        const titlePageHtml = `
          <div style="text-align: center; margin-top: 100pt; margin-bottom: 50pt;">
            ${title1 ? `<p style="font-family: Times New Roman; font-size: 30pt; font-weight: bold; text-align: center; margin: 0;">${title1}</p>` : ""}
            ${title1 && title2 ? `<hr style="border: none; border-top: 3pt dotted black; width: 100%; margin: 40pt 0;" />` : ""}
            ${title2 ? `<p style="font-family: Times New Roman; font-size: 30pt; font-weight: bold; text-align: center; margin: 0;">${title2}</p>` : ""}
          </div>
          <div style="text-align: center; margin-top: 250pt;">
            ${author ? `<p style="font-family: Times New Roman; font-size: 20pt; font-weight: bold; text-align: center; margin: 0;"><u>${author}</u></p>` : ""}
          </div>
          <div style="page-break-before: always;"></div>
        `;
        processedHtml = titlePageHtml + processedHtml;
      }

      const response = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: processedHtml }),
      });

      if (!response.ok) throw new Error("Failed to export");

      const blob = await response.blob();
      const fullTitle = title1 ? `${title1}${title2 ? ` - ${title2}` : ""}` : "Book_Exported";
      
      // Tự động copy tên sách vào clipboard
      try {
        await navigator.clipboard.writeText(fullTitle);
      } catch (err) {
        console.error("Failed to copy title", err);
      }

      saveAs(blob, `${fullTitle}.docx`);
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra khi xuất file Word.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cột trái: Editor và Export */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-6 h-6 text-blue-600" />
                Book Formatter Pro
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Dán văn bản AI, tự động format thành sách và xuất Word.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={formatContent}
                disabled={isFormatting}
                className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70"
              >
                {isFormatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Dọn dẹp & Format
              </button>
              <button
                onClick={exportToWord}
                disabled={isExporting}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70"
              >
                {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Xuất File Word
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-4">
            <EditorContent editor={editor} />
          </div>
          
          <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed">
            <strong>📝 Hướng dẫn sử dụng:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Copy toàn bộ văn bản từ AI Chat và dán vào khung soạn thảo trên.</li>
              <li>Bấm <strong>Dọn dẹp & Format</strong> để công cụ tự động căn lề và tạo ngắt trang.</li>
              <li>Bấm <strong>Xuất File Word</strong> để tải về file <code>.docx</code> chuẩn.</li>
            </ul>
          </div>
        </div>

        {/* Cột phải: Tools lười biếng */}
        <div className="space-y-6">
          
          {/* Tool 1: Book List Manager */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              <h2 className="text-md font-semibold text-gray-800">Quản lý Danh sách Sách</h2>
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Danh sách sách (Mỗi dòng 1 cuốn, dùng dấu "-" để tách 2 phần)</label>
              <textarea
                rows={4}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                placeholder="Ví dụ:\nSách 1 phần A - Sách 1 phần B\nSách số 2 - Cực kỳ hay"
                value={bookListText}
                onChange={(e) => setBookListText(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Chọn Sách để điền Tự Động</label>
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                onChange={handleSelectBook}
                defaultValue=""
              >
                <option value="" disabled>-- Chọn cuốn sách đang làm --</option>
                {parsedBooks.map((book, idx) => (
                  <option key={idx} value={idx}>{idx + 1}. {book.title1} {book.title2 ? ` - ${book.title2}` : ""}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Book Cover Info (Syncs with the editor export) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <h2 className="text-md font-semibold text-gray-800">Thông tin Trang Bìa</h2>
            
            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Tên sách (Phần 1)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  value={title1}
                  onChange={(e) => setTitle1(e.target.value)}
                />
                <button onClick={() => copyToClipboard(title1, 'title1')} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Copy">
                  {copiedId === 'title1' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Tên sách (Phần 2)</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  value={title2}
                  onChange={(e) => setTitle2(e.target.value)}
                />
                <button onClick={() => copyToClipboard(title2, 'title2')} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Copy">
                  {copiedId === 'title2' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-gray-500">Tác giả</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
                <button onClick={() => copyToClipboard(author, 'author')} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Copy">
                  {copiedId === 'author' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Intro Extractor */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-md font-semibold text-gray-800">Trích xuất Introduction</h2>
              <button 
                onClick={() => copyToClipboard(introductionText, 'intro', true)}
                disabled={!introductionText}
                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
              >
                {copiedId === 'intro' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />} {copiedId === 'intro' ? 'Copied' : 'Copy'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-2">Sau khi ấn "Dọn dẹp & Format", phần giới thiệu sẽ tự động xuất hiện ở đây.</p>
            {introductionText ? (
              <div 
                className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 overflow-y-auto prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: introductionText }}
              />
            ) : (
              <div className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 overflow-y-auto whitespace-pre-wrap">
                Chưa có nội dung...
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
