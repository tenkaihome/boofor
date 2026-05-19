"use client";

import { useState, useMemo, useEffect } from "react";
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
import { Save, Wand2, FileText, Loader2, Copy, BookOpen, Check, ChevronDown, List, X } from "lucide-react";
import { saveAs } from "file-saver";

export default function Home() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [title1, setTitle1] = useState("");
  const [title2, setTitle2] = useState("");
  const [author, setAuthor] = useState("");
  const [bookListText, setBookListText] = useState("");
  const [introductionText, setIntroductionText] = useState("");
  const [chapterKeywords, setChapterKeywords] = useState("chapter, lesson");
  const [genresText, setGenresText] = useState("Language Study / English as a Second Language\nLanguage Study / Multi-Language Phrasebooks");
  const [customBlockPhrases, setCustomBlockPhrases] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [promptPlaceholderBook, setPromptPlaceholderBook] = useState("");
  const [activeTab, setActiveTab] = useState<'formatter' | 'prompt'>('formatter');
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isBookListOpen, setIsBookListOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [detectedChapters, setDetectedChapters] = useState<string[]>([]);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [isChapterListVisible, setIsChapterListVisible] = useState(false);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });

  const [bookIntroMap, setBookIntroMap] = useState<Record<string, string>>({});
  const [authorInfoMap, setAuthorInfoMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const savedBookList = localStorage.getItem("bofo_bookList");
    if (savedBookList) setBookListText(savedBookList);

    const savedTitle1 = localStorage.getItem("bofo_title1");
    if (savedTitle1) setTitle1(savedTitle1);

    const savedTitle2 = localStorage.getItem("bofo_title2");
    if (savedTitle2) setTitle2(savedTitle2);

    const savedAuthor = localStorage.getItem("bofo_author");
    if (savedAuthor) setAuthor(savedAuthor);

    const savedBookIntroMap = localStorage.getItem("bofo_bookIntroMap");
    if (savedBookIntroMap) setBookIntroMap(JSON.parse(savedBookIntroMap));

    const savedAuthorInfoMap = localStorage.getItem("bofo_authorInfoMap");
    if (savedAuthorInfoMap) setAuthorInfoMap(JSON.parse(savedAuthorInfoMap));

    const savedChapterKeywords = localStorage.getItem("bofo_chapterKeywords");
    if (savedChapterKeywords) setChapterKeywords(savedChapterKeywords);

    const savedGenres = localStorage.getItem("bofo_genres");
    if (savedGenres) setGenresText(savedGenres);

    const savedCustomBlockPhrases = localStorage.getItem("bofo_customBlockPhrases");
    if (savedCustomBlockPhrases) setCustomBlockPhrases(savedCustomBlockPhrases);

    const savedPromptTemplate = localStorage.getItem("bofo_promptTemplate");
    if (savedPromptTemplate) setPromptTemplate(savedPromptTemplate);

    const savedPromptPlaceholderBook = localStorage.getItem("bofo_promptPlaceholderBook");
    if (savedPromptPlaceholderBook) setPromptPlaceholderBook(savedPromptPlaceholderBook);

    const savedSettingsOpen = localStorage.getItem("bofo_isSettingsOpen");
    if (savedSettingsOpen !== null) setIsSettingsOpen(savedSettingsOpen === "true");

    const savedBookListOpen = localStorage.getItem("bofo_isBookListOpen");
    if (savedBookListOpen !== null) setIsBookListOpen(savedBookListOpen === "true");
  }, []);

  useEffect(() => {
    localStorage.setItem("bofo_bookList", bookListText);
  }, [bookListText]);

  useEffect(() => {
    localStorage.setItem("bofo_title1", title1);
  }, [title1]);

  useEffect(() => {
    localStorage.setItem("bofo_title2", title2);
  }, [title2]);

  useEffect(() => {
    localStorage.setItem("bofo_author", author);
  }, [author]);

  useEffect(() => {
    localStorage.setItem("bofo_chapterKeywords", chapterKeywords);
  }, [chapterKeywords]);

  useEffect(() => {
    if (isChapterListOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isChapterListOpen]);

  useEffect(() => {
    localStorage.setItem("bofo_isSettingsOpen", String(isSettingsOpen));
  }, [isSettingsOpen]);

  useEffect(() => {
    localStorage.setItem("bofo_isBookListOpen", String(isBookListOpen));
  }, [isBookListOpen]);

  useEffect(() => {
    localStorage.setItem("bofo_genres", genresText);
  }, [genresText]);

  useEffect(() => {
    localStorage.setItem("bofo_customBlockPhrases", customBlockPhrases);
  }, [customBlockPhrases]);

  useEffect(() => {
    localStorage.setItem("bofo_promptTemplate", promptTemplate);
  }, [promptTemplate]);

  useEffect(() => {
    localStorage.setItem("bofo_promptPlaceholderBook", promptPlaceholderBook);
  }, [promptPlaceholderBook]);

  useEffect(() => {
    if (title1 && bookIntroMap[title1] !== undefined) {
      setIntroductionText(bookIntroMap[title1]);
    } else {
      setIntroductionText("");
    }
  }, [title1, bookIntroMap]);

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

  const authorEditor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Placeholder.configure({
        placeholder: "Dán thông tin tác giả vào đây...",
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: "prose prose-sm w-full p-3 border border-gray-200 rounded-lg focus:outline-none min-h-[100px] bg-gray-50 text-sm text-gray-900",
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (author) {
        setAuthorInfoMap(prev => {
          const newMap = { ...prev, [author]: html };
          localStorage.setItem("bofo_authorInfoMap", JSON.stringify(newMap));
          return newMap;
        });
      }
    }
  });

  useEffect(() => {
    if (authorEditor && author) {
      const savedInfo = authorInfoMap[author] || "";
      if (authorEditor.getHTML() !== savedInfo) {
        authorEditor.commands.setContent(savedInfo);
      }
    } else if (authorEditor && !author) {
      authorEditor.commands.setContent("");
    }
  }, [author, authorInfoMap, authorEditor]);

  const parsedBooks = useMemo(() => {
    if (!bookListText) return [];
    return bookListText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        let cleanTitle = line.replace(/^\d+\.\s*/, "");
        return { title1: cleanTitle, title2: "", full: line };
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
      // Intro updates via useEffect
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
        "certainly",
        "ready for chapter",
        "just say",
        "would you like to continue",
        "absolutely",
        "here is a comprehensive",
        "congratulations! by reaching this point",
        "please confirm",
        "next steps:",
        "thank you for your confirmation",
        "end of chapter",
        "next up",
        "in the next chapter",
        "ready for more",
        "continue to chapter",
        "here is chapter",
        "ready to begin",
        "would you like me to continue",
        "bạn có muốn tiếp tục với chapter",
        "dưới đây là chapter",
        "in the final chapter",
        "tôi sẽ tiếp tục với chapter",
        "nếu bạn muốn tiếp tục với chapter",
        "would you like to sê a sample chapter",
        "would you like to see a sample chapter",
        "1000 words",
        "1000+ words",
        "1100 words",
        "1200 words",
        "1300 words",
        "1400 words",
        "1500 words",
        "1600 words",
        "1700 words",
        "1800 words",
        "1900 words",
        "2000 words",
        "would you like to",
        "ready for next chapter",
        "would you like to continue to the next chapter",
        "would you like to proceed",
        "if you need additional",
        "if you need additional revisions",
        "the story continue",
        "if you need further assistance",
        "want to explore more topics",
        "if you approve this introduction",
        "are you ready? take the next step",
        "continue"
      ];

      const userPhrases = customBlockPhrases
        .split("\n")
        .map(p => p.trim().toLowerCase())
        .filter(p => p.length > 0);
      const allAiPhrases = [...aiPhrases, ...userPhrases];

      const chapterRegexStr = chapterKeywords
        .split(",")
        .map(k => k.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        .filter(k => k.length > 0)
        .join("|") || "chapter";
      const chapterRegex = new RegExp(`^(${chapterRegexStr})\\s+\\d+`, "i");

      const allElementsArr = Array.from(doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li"));

      let hasSeenIntro = false;
      let hasSeenChapter = false;
      let lastConclusionElement: Element | null = null;

      for (let i = allElementsArr.length - 1; i >= 0; i--) {
        const el = allElementsArr[i];
        const text = el.textContent?.trim() || "";
        if (!text) continue;
        const lowerText = text.toLowerCase();
        const wordCount = text.split(/\s+/).length;

        if (el.tagName !== "LI" && /^(conclusion|kết luận)\b/i.test(lowerText) && wordCount < 15) {
          lastConclusionElement = el;
          break;
        }
      }

      // Pre-pass: Lọc và tìm các thẻ heading chapter để loại bỏ lặp (chỉ giữ cái cuối cùng của 1 series lặp)
      const chapterCandidates: { el: Element, prefix: string }[] = [];
      allElementsArr.forEach((el) => {
        const text = el.textContent?.trim() || "";
        const lowerText = text.toLowerCase();
        const wordCount = text.split(/\s+/).length;
        if (el.tagName !== "LI" && chapterRegex.test(lowerText) && wordCount < 15) {
          const match = lowerText.match(chapterRegex);
          if (match) {
            chapterCandidates.push({ el, prefix: match[0].trim() });
          }
        }
      });

      const duplicateChaptersToRemove = new Set<Element>();
      for (let i = 0; i < chapterCandidates.length - 1; i++) {
        // Nếu 2 heading liền nhau có chung prefix (vd: cùng là "chapter 1"), xóa cái đứng trước (giữ cái sau)
        if (chapterCandidates[i].prefix === chapterCandidates[i + 1].prefix) {
          duplicateChaptersToRemove.add(chapterCandidates[i].el);
        }
      }

      allElementsArr.forEach((el) => {
        const text = el.textContent?.trim() || "";
        const lowerText = text.toLowerCase();

        if (!text) return;

        if (vietnameseRegex.test(text)) {
          el.remove();
          return;
        }

        const hasAiPhrase = allAiPhrases.some((phrase) => lowerText.includes(phrase));
        if (hasAiPhrase) {
          el.remove();
          return;
        }

        if (duplicateChaptersToRemove.has(el)) {
          el.remove();
          return;
        }

        const wordCount = text.split(/\s+/).length;
        const isHeadingCandidate = wordCount < 15;

        const isChapterHeading = el.tagName !== "LI" && chapterRegex.test(lowerText);
        if (isChapterHeading) {
          hasSeenChapter = true;
        }

        let isMainIntro = false;
        if (el.tagName !== "LI" && /^(introduction|giới thiệu|lời nói đầu)\b/i.test(lowerText) && isHeadingCandidate) {
          if (!hasSeenIntro && !hasSeenChapter) {
            isMainIntro = true;
            hasSeenIntro = true;
          }
        }

        let isMainConclusion = false;
        if (el === lastConclusionElement) {
          isMainConclusion = true;
        }

        const isIntroOrConclusion = isMainIntro || isMainConclusion;

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

      // Xóa tất cả các thẻ <hr> (dòng kẻ) bị thừa do ChatGPT tạo ra
      doc.body.querySelectorAll("hr").forEach(hr => hr.remove());

      // Xóa các phần tử rỗng/khoảng trắng trước heading có ngắt trang để tránh trang trắng
      doc.body.querySelectorAll(".page-break-before").forEach(heading => {
        let prev = heading.previousElementSibling;
        while (prev) {
          const text = prev.textContent?.trim() || "";
          const tagName = prev.tagName;
          // Chỉ xóa các thẻ p, div, span, br, h2-h6 rỗng (không xóa table, img, etc.)
          if (!text && ["P", "DIV", "SPAN", "BR", "H2", "H3", "H4", "H5", "H6"].includes(tagName) && !prev.querySelector("img, table")) {
            const toRemove = prev;
            prev = prev.previousElementSibling;
            toRemove.remove();
          } else {
            break;
          }
        }
      });

      // Xóa các đoạn trống liên tiếp (giữ tối đa 1 đoạn trống giữa nội dung)
      const allChildren = Array.from(doc.body.children);
      let consecutiveEmpty = 0;
      for (const child of allChildren) {
        const text = child.textContent?.trim() || "";
        if (!text && !child.querySelector("img, table, hr") && ["P", "DIV", "SPAN", "BR"].includes(child.tagName)) {
          consecutiveEmpty++;
          if (consecutiveEmpty > 1) {
            child.remove();
          }
        } else {
          consecutiveEmpty = 0;
        }
      }

      // Lấy Intro text trước khi đặt lại nội dung
      let isRecordingIntro = false;
      let hasFinishedIntro = false;
      let extractedIntro: string[] = [];
      const cleanedNodes = Array.from(doc.body.children);

      for (const el of cleanedNodes) {
        const text = el.textContent?.trim() || "";
        const lower = text.toLowerCase();

        if (chapterRegex.test(lower)) {
          isRecordingIntro = false;
          hasFinishedIntro = true;
        } else if (/(introduction)/i.test(lower) && text.split(/\s+/).length < 15 && !hasFinishedIntro && !isRecordingIntro) {
          isRecordingIntro = true;
        } else if (isRecordingIntro && text) {
          extractedIntro.push(el.outerHTML);
        }
      }

      const finalIntro = extractedIntro.join("");
      setIntroductionText(finalIntro);
      if (title1) {
        setBookIntroMap(prev => {
          const newMap = { ...prev, [title1]: finalIntro };
          localStorage.setItem("bofo_bookIntroMap", JSON.stringify(newMap));
          return newMap;
        });
      }

      const chapterHeadings = Array.from(doc.body.querySelectorAll(".page-break-before"))
        .map(el => el.textContent?.trim() || "")
        .filter(text => text.length > 0);
      setDetectedChapters(chapterHeadings);

      let cleanedHtml = doc.body.innerHTML;
      editor.commands.setContent(cleanedHtml);
      setIsFormatting(false);
    }, 100);
  };

  const getProcessedHtml = () => {
    if (!editor) return "";
    let html = editor.getHTML();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    const allElements = doc.body.querySelectorAll("*");
    allElements.forEach((el) => {
      const hElement = el as HTMLElement;
      hElement.style.fontFamily = "Times New Roman";
      hElement.style.color = "#000000";

      if (hElement.style.textAlign === "center" || hElement.getAttribute("data-text-align") === "center") {
        hElement.style.textAlign = "center";
      }

      if (hElement.tagName === "H1") {
        hElement.style.fontSize = "18pt";
        hElement.style.fontWeight = "bold";
        hElement.style.marginTop = "24pt";
        hElement.style.marginBottom = "12pt";
      } else if (hElement.tagName === "P" || hElement.tagName === "SPAN") {
        hElement.style.fontSize = "13pt";
        hElement.style.lineHeight = "1.5";
        hElement.style.marginBottom = "10pt";
      } else if (hElement.tagName === "TABLE") {
        hElement.style.borderCollapse = "collapse";
        hElement.style.width = "100%";
        hElement.setAttribute("border", "1");
      } else if (hElement.tagName === "TD" || hElement.tagName === "TH") {
        hElement.style.border = "1px solid black";
        hElement.style.padding = "5px";
      }
    });

    const h1Elements = doc.body.querySelectorAll("h1");
    h1Elements.forEach((el, index) => {
      if (el.previousElementSibling) {
        const pageBreakDiv = doc.createElement("div");
        pageBreakDiv.className = "page-break";
        pageBreakDiv.style.pageBreakAfter = "always";
        el.parentNode?.insertBefore(pageBreakDiv, el);
      }
    });

    let processedHtml = doc.body.innerHTML;
    processedHtml = processedHtml.replace(/font-family:\s*(&quot;|"|')?Times New Roman(&quot;|"|')?/gi, "font-family: Times New Roman");

    if (title1 || title2 || author) {
      const titlePageHtml = `
        <div style="text-align: center; margin-top: 100pt; margin-bottom: 50pt; color: #000000;">
          ${title1 ? `<p style="font-family: Times New Roman; font-size: 30pt; font-weight: bold; text-align: center; margin: 0; color: #000000;">${title1}</p>` : ""}
          ${title1 && title2 ? `<p style="font-family: Times New Roman; font-size: 24pt; text-align: center; margin: 20pt 0; color: #000000;">***************************</p>` : ""}
          ${title2 ? `<p style="font-family: Times New Roman; font-size: 30pt; font-weight: bold; text-align: center; margin: 0; color: #000000;">${title2}</p>` : ""}
        </div>
        ${Array(18).fill("<br/>").join("")}
        <div style="text-align: center; color: #000000;">
          ${author ? `<p style="font-family: Times New Roman; font-size: 20pt; font-weight: bold; text-align: center; margin: 0; color: #000000;"><u>${author}</u></p>` : ""}
        </div>
        <div class="page-break" style="page-break-after: always;"></div>
      `;
      processedHtml = titlePageHtml + processedHtml;
    }

    return processedHtml;
  };

  const exportToWord = async () => {
    if (!editor) return;
    setIsExporting(true);

    try {
      const processedHtml = getProcessedHtml();

      const response = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: processedHtml }),
      });

      if (!response.ok) throw new Error("Failed to export");

      const blob = await response.blob();
      const fullTitle = title1 ? `${title1}${title2 ? ` ${title2}` : ""}`.replace(/\s+/g, ' ').trim() : "Book_Exported";

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

  const exportToPDF = async () => {
    if (!editor) return;
    setIsExportingPDF(true);

    try {
      const processedHtml = getProcessedHtml();
      const fullTitle = title1 ? `${title1}${title2 ? ` ${title2}` : ""}`.replace(/\s+/g, ' ').trim() : "Book_Exported";

      try {
        await navigator.clipboard.writeText(fullTitle);
      } catch (err) {
        console.error("Failed to copy title", err);
      }

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Vui lòng cho phép mở popup để xuất PDF.");
        return;
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>${fullTitle}</title>
            <style>
              @page {
                size: A4;
                margin: 0.5in;
              }
              body {
                font-family: 'Times New Roman', serif;
                color: #000000;
                line-height: 1.5;
                font-size: 13pt;
              }
              h1 {
                font-size: 18pt;
                font-weight: bold;
                text-align: center;
                margin-top: 24pt;
                margin-bottom: 12pt;
              }
              p, span, div {
                font-size: 13pt;
                margin-bottom: 10pt;
              }
              table {
                width: 100%;
                border-collapse: collapse;
              }
              td, th {
                border: 1px solid black;
                padding: 5px;
              }
              .page-break {
                page-break-after: always;
              }
              /* Ẩn các nút in mặc định nếu có */
              @media print {
                html, body {
                  height: auto;
                }
              }
            </style>
          </head>
          <body>
            ${processedHtml}
            <script>
              window.onload = () => {
                setTimeout(() => {
                  window.print();
                }, 500);
              };
              window.onafterprint = () => {
                window.close();
              };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();

    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra khi xuất file PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-6 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100 w-fit">
          <button
            onClick={() => setActiveTab('formatter')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'formatter'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <FileText className="w-4 h-4" />
            Formatter
          </button>
          <button
            onClick={() => setActiveTab('prompt')}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'prompt'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-gray-600 hover:bg-gray-100'
              }`}
          >
            <Wand2 className="w-4 h-4" />
            Prompt Generator
          </button>
        </div>

        {activeTab === 'formatter' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

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
                  <div className="flex gap-1">
                    <button
                      onClick={formatContent}
                      disabled={isFormatting}
                      className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70"
                    >
                      {isFormatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                      Dọn dẹp & Format
                    </button>
                    {detectedChapters.length > 0 && (
                      <button
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setButtonPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
                          setIsChapterListOpen(true);
                          setTimeout(() => setIsChapterListVisible(true), 10);
                        }}
                        className="flex items-center justify-center px-3 py-2.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-lg transition-colors shadow-sm"
                        title="Kiểm tra các mục đã nhận diện"
                      >
                        <List className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  <button
                    onClick={exportToWord}
                    disabled={isExporting}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70"
                  >
                    {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Xuất File Word
                  </button>
                  <button
                    onClick={exportToPDF}
                    disabled={isExportingPDF}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70"
                  >
                    {isExportingPDF ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                    Xuất File PDF
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-4">
                <EditorContent editor={editor} />
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
                  <div className="w-full h-40 p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 overflow-y-auto whitespace-pre-wrap flex items-center justify-center text-gray-400">
                    Chưa có nội dung...
                  </div>
                )}
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

              {/* Settings */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <button
                  onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                  className="flex items-center justify-between w-full"
                >
                  <h2 className="text-md font-semibold text-gray-800">Cài đặt Format</h2>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isSettingsOpen ? 'rotate-180' : ''}`} />
                </button>
                {!isSettingsOpen && (
                  <p className="text-xs text-gray-400 mt-1">Từ khoá chia mục · Câu cần chặn</p>
                )}
                {isSettingsOpen && (
                  <div className="space-y-4 pt-2">
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">Từ khoá chia mục (cách nhau dấu phẩy)</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                        value={chapterKeywords}
                        onChange={(e) => setChapterKeywords(e.target.value)}
                        placeholder="VD: chapter, lesson, unit"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-medium text-gray-500">Câu/Từ khóa cần chặn (mỗi dòng 1 cụm)</label>
                      <textarea
                        rows={3}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                        value={customBlockPhrases}
                        onChange={(e) => setCustomBlockPhrases(e.target.value)}
                        placeholder="VD: here is your translation&#10;enjoy reading"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Tool 1: Book List Manager */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <button
                  onClick={() => setIsBookListOpen(!isBookListOpen)}
                  className="flex items-center justify-between w-full"
                >
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-md font-semibold text-gray-800">Quản lý Danh sách Sách</h2>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-gray-400 transition-transform ${isBookListOpen ? 'rotate-180' : ''}`} />
                </button>
                {!isBookListOpen && (
                  <p className="text-xs text-gray-400 mt-1">Nhập và quản lý danh sách sách</p>
                )}

                {isBookListOpen && (
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
                )}

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
                    <button onClick={() => copyToClipboard(`${title1}${title2 ? ` ${title2}` : ""}`.replace(/\s+/g, ' ').trim(), 'title1')} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Copy Full Title">
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
                    <button onClick={() => copyToClipboard(`${title1}${title2 ? ` ${title2}` : ""}`.replace(/\s+/g, ' ').trim(), 'title2')} className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors" title="Copy Full Title">
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

                {/* Author Info inner block */}
                <div className="pt-4 border-t border-gray-100 mt-4 space-y-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-semibold text-gray-800">Thông tin Tác giả</h3>
                    <button
                      onClick={() => {
                        if (authorEditor) {
                          copyToClipboard(authorEditor.getHTML(), 'authorInfo', true);
                        }
                      }}
                      disabled={!author || !authorInfoMap[author]}
                      className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
                    >
                      {copiedId === 'authorInfo' ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />} {copiedId === 'authorInfo' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  {!author && <p className="text-xs text-red-500 mb-2">Vui lòng nhập tên tác giả ở trên trước khi điền.</p>}
                  <div className={`overflow-hidden rounded-lg ${!author ? 'opacity-50 pointer-events-none' : ''}`}>
                    <EditorContent editor={authorEditor} />
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-3">
                <h2 className="text-md font-semibold text-gray-800">Genres</h2>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Nhập danh sách Genres (mỗi dòng 1 cái)</label>
                  <textarea
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                    value={genresText}
                    onChange={(e) => setGenresText(e.target.value)}
                  />
                </div>
                <div className="space-y-2 mt-2">
                  {genresText.split('\n').map(g => g.trim()).filter(g => g).map((genre, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                      <span className="text-sm text-gray-700 truncate pr-2" title={genre}>{genre}</span>
                      <button
                        onClick={() => copyToClipboard(genre, `genre${idx}`)}
                        className="flex-shrink-0 flex items-center gap-1 px-2 py-1.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 text-xs font-medium rounded-md transition-colors shadow-sm"
                      >
                        {copiedId === `genre${idx}` ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {activeTab === 'prompt' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Left: Prompt Template */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Wand2 className="w-5 h-5 text-indigo-600" />
                  Prompt Generator
                </h2>
                <p className="text-xs text-gray-500">Nhập prompt mẫu rồi chọn sách — hệ thống sẽ tự thay tên sách cho bạn.</p>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Prompt mẫu</label>
                  <textarea
                    rows={8}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                    value={promptTemplate}
                    onChange={(e) => setPromptTemplate(e.target.value)}
                    placeholder="VD: Hãy viết Chapter 1 cho cuốn sách English for Beginners với 1500 từ..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-gray-500">Tên sách mẫu trong Prompt (để thay thế)</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                    value={promptPlaceholderBook}
                    onChange={(e) => setPromptPlaceholderBook(e.target.value)}
                    placeholder="VD: English for Beginners"
                  />
                </div>
              </div>

              {/* Quick Book Selector */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <h2 className="text-md font-semibold text-gray-800 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  Chọn sách nhanh
                </h2>
                <select
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                  onChange={handleSelectBook}
                  defaultValue=""
                >
                  <option value="" disabled>-- Chọn cuốn sách --</option>
                  {parsedBooks.map((book, idx) => (
                    <option key={idx} value={idx}>{idx + 1}. {book.title1} {book.title2 ? ` - ${book.title2}` : ""}</option>
                  ))}
                </select>
                {title1 && (
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
                    Đang chọn: <span className="font-bold">{title1}{title2 ? ` ${title2}` : ""}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Generated Output */}
            <div className="space-y-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-800">Kết quả</h2>
                  {promptTemplate && title1 && promptPlaceholderBook && (
                    <button
                      onClick={() => {
                        const fullTitle = `${title1}${title2 ? ` ${title2}` : ""}`.replace(/\s+/g, ' ').trim();
                        const generated = promptTemplate.replaceAll(promptPlaceholderBook, fullTitle);
                        copyToClipboard(generated, 'generatedPrompt');
                      }}
                      className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                    >
                      {copiedId === 'generatedPrompt' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />} {copiedId === 'generatedPrompt' ? 'Copied!' : 'Copy Prompt'}
                    </button>
                  )}
                </div>

                {promptTemplate && title1 && promptPlaceholderBook ? (
                  <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed">
                    {promptTemplate.replaceAll(promptPlaceholderBook, `${title1}${title2 ? ` ${title2}` : ""}`.replace(/\s+/g, ' ').trim())}
                  </div>
                ) : (
                  <div className="w-full p-8 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 text-center">
                    {!promptTemplate && "Nhập prompt mẫu để bắt đầu..."}
                    {promptTemplate && !promptPlaceholderBook && "Nhập tên sách mẫu cần thay thế..."}
                    {promptTemplate && promptPlaceholderBook && !title1 && "Chọn một cuốn sách từ danh sách..."}
                  </div>
                )}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Chapter List Popup */}
      {isChapterListOpen && (
        <div className={`fixed inset-0 z-50 transition-colors duration-300 ${isChapterListVisible ? 'bg-black/50 backdrop-blur-sm' : 'bg-transparent backdrop-blur-none'}`}>
          <div 
            className={`absolute inset-0 flex items-center justify-center p-4 pointer-events-none transition-all duration-300
              ${isChapterListVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}
            style={{ transformOrigin: `${buttonPos.x}px ${buttonPos.y}px` }}
          >
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] pointer-events-auto">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                  <List className="w-5 h-5 text-indigo-600" />
                  Các mục đã nhận diện ({detectedChapters.length})
                </h2>
                <button
                  onClick={() => {
                    setIsChapterListVisible(false);
                    setTimeout(() => setIsChapterListOpen(false), 300);
                  }}
                  className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto">
                {detectedChapters.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Chưa tìm thấy mục nào.</p>
                ) : (
                  <ul className="space-y-2">
                    {detectedChapters.map((chapter, idx) => (
                      <li key={idx} className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-medium">
                        {chapter}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
