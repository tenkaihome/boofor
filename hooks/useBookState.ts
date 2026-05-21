import React, { useState, useEffect, useMemo } from "react";
import { useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { Table } from "@tiptap/extension-table";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";
import { TableRow } from "@tiptap/extension-table-row";
import { Markdown } from "tiptap-markdown";
import { copyToClipboard } from "@/utils/clipboard";
import { cleanAndFormatHtml, getProcessedHtml } from "@/utils/formatter";
import { exportToWord, exportToPDF } from "@/services/exportService";

export const useBookState = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);

  const [title1, setTitle1] = useState("");
  const [title2, setTitle2] = useState("");
  const [author, setAuthor] = useState("");
  const [bookListText, setBookListText] = useState("");
  const [introductionText, setIntroductionText] = useState("");
  const [chapterKeywords, setChapterKeywords] = useState("chapter, lesson");
  const [genresText, setGenresText] = useState(
    "Language Study / English as a Second Language\nLanguage Study / Multi-Language Phrasebooks"
  );
  const [customBlockPhrases, setCustomBlockPhrases] = useState("");
  const [promptTemplate, setPromptTemplate] = useState("");
  const [promptPlaceholderBook, setPromptPlaceholderBook] = useState("");
  const [activeTab, setActiveTab] = useState<"formatter" | "prompt" | "splitter">("formatter");
  const [splitterInput, setSplitterInput] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(true);
  const [isBookListOpen, setIsBookListOpen] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [detectedChapters, setDetectedChapters] = useState<string[]>([]);
  const [isChapterListOpen, setIsChapterListOpen] = useState(false);
  const [isChapterListVisible, setIsChapterListVisible] = useState(false);
  const [buttonPos, setButtonPos] = useState({ x: 0, y: 0 });

  const [bookIntroMap, setBookIntroMap] = useState<Record<string, string>>({});
  const [authorInfoMap, setAuthorInfoMap] = useState<Record<string, string>>({});

  // Initialize from LocalStorage
  useEffect(() => {
    setIsMounted(true);

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

    const savedSplitterInput = localStorage.getItem("bofo_splitterInput");
    if (savedSplitterInput) setSplitterInput(savedSplitterInput);

    const savedSettingsOpen = localStorage.getItem("bofo_isSettingsOpen");
    if (savedSettingsOpen !== null) setIsSettingsOpen(savedSettingsOpen === "true");

    const savedBookListOpen = localStorage.getItem("bofo_isBookListOpen");
    if (savedBookListOpen !== null) setIsBookListOpen(savedBookListOpen === "true");
  }, []);

  // Sync state changes to LocalStorage
  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_bookList", bookListText);
  }, [bookListText, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_title1", title1);
  }, [title1, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_splitterInput", splitterInput);
  }, [splitterInput, isMounted]);

  useEffect(() => {
    if (isMounted && splitterInput) {
      const rows = splitterInput.split("\n").map(r => r.trim()).filter(r => r);
      const activeRow = rows[0] || "";
      const columns = activeRow ? activeRow.split("\t").map(col => col.trim()) : [];
      const nameVal = columns[9];
      if (nameVal && nameVal.trim()) {
        setAuthor(nameVal.trim());
      }
    }
  }, [splitterInput, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_title2", title2);
  }, [title2, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_author", author);
  }, [author, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_chapterKeywords", chapterKeywords);
  }, [chapterKeywords, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_genres", genresText);
  }, [genresText, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_customBlockPhrases", customBlockPhrases);
  }, [customBlockPhrases, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_promptTemplate", promptTemplate);
  }, [promptTemplate, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_promptPlaceholderBook", promptPlaceholderBook);
  }, [promptPlaceholderBook, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_isSettingsOpen", String(isSettingsOpen));
  }, [isSettingsOpen, isMounted]);

  useEffect(() => {
    if (isMounted) localStorage.setItem("bofo_isBookListOpen", String(isBookListOpen));
  }, [isBookListOpen, isMounted]);

  // Sync Introduction content based on current Title1
  useEffect(() => {
    if (isMounted) {
      if (title1 && bookIntroMap[title1] !== undefined) {
        setIntroductionText(bookIntroMap[title1]);
      } else {
        setIntroductionText("");
      }
    }
  }, [title1, bookIntroMap, isMounted]);

  // Handle document scrolling when popup list is open
  useEffect(() => {
    if (isChapterListOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isChapterListOpen]);

  // Main Text Editor instance
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

  // Author description Editor instance
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
        class:
          "prose prose-sm w-full p-3 border border-gray-200 rounded-lg focus:outline-none min-h-[100px] bg-gray-50 text-sm text-gray-900",
      },
    },
    onUpdate: ({ editor: ed }) => {
      const html = ed.getHTML();
      if (author) {
        setAuthorInfoMap((prev) => {
          const newMap = { ...prev, [author]: html };
          localStorage.setItem("bofo_authorInfoMap", JSON.stringify(newMap));
          return newMap;
        });
      }
    },
  });

  // Sync author editor contents when current author changes
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

  // Memoized lists of parsed books
  const parsedBooks = useMemo(() => {
    if (!bookListText) return [];
    return bookListText
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const cleanTitle = line.replace(/^\d+\.\s*/, "");
        return { title1: cleanTitle, title2: "", full: line };
      });
  }, [bookListText]);

  // Handle select dropdown choices
  const handleSelectBook = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx) && parsedBooks[idx]) {
      setTitle1(parsedBooks[idx].title1);
      setTitle2(parsedBooks[idx].title2);
    }
  };

  const handleSelectBookByIndex = (idx: number) => {
    if (parsedBooks[idx]) {
      setTitle1(parsedBooks[idx].title1);
      setTitle2(parsedBooks[idx].title2);
    }
  };

  // Helper copy content action
  const handleCopy = async (text: string, id: string, isHtml = false) => {
    return await copyToClipboard(
      text,
      () => {
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
      },
      isHtml
    );
  };

  // Formatting execution wrapper
  const formatContent = () => {
    if (!editor) return;
    setIsFormatting(true);

    setTimeout(() => {
      const html = editor.getHTML();
      const result = cleanAndFormatHtml(html, chapterKeywords, customBlockPhrases);

      setIntroductionText(result.introductionText);
      if (title1) {
        setBookIntroMap((prev) => {
          const newMap = { ...prev, [title1]: result.introductionText };
          localStorage.setItem("bofo_bookIntroMap", JSON.stringify(newMap));
          return newMap;
        });
      }

      setDetectedChapters(result.detectedChapters);
      editor.commands.setContent(result.cleanedHtml);
      setIsFormatting(false);
    }, 100);
  };

  // Word document export triggers
  const triggerExportWord = async () => {
    if (!editor) return;
    setIsExporting(true);
    try {
      const processedHtml = getProcessedHtml(editor.getHTML(), title1, title2, author);
      await exportToWord(processedHtml, title1, title2);
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra khi xuất file Word.");
    } finally {
      setIsExporting(false);
    }
  };

  // PDF export triggers
  const triggerExportPDF = async () => {
    if (!editor) return;
    setIsExportingPDF(true);
    try {
      const processedHtml = getProcessedHtml(editor.getHTML(), title1, title2, author);
      await exportToPDF(processedHtml, title1, title2);
    } catch (err) {
      console.error(err);
      alert("Đã có lỗi xảy ra khi xuất file PDF.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  return {
    isMounted,
    isExporting,
    isExportingPDF,
    isFormatting,
    title1,
    setTitle1,
    title2,
    setTitle2,
    author,
    setAuthor,
    bookListText,
    setBookListText,
    introductionText,
    setIntroductionText,
    chapterKeywords,
    setChapterKeywords,
    genresText,
    setGenresText,
    customBlockPhrases,
    setCustomBlockPhrases,
    promptTemplate,
    setPromptTemplate,
    promptPlaceholderBook,
    setPromptPlaceholderBook,
    activeTab,
    setActiveTab,
    splitterInput,
    setSplitterInput,
    isSettingsOpen,
    setIsSettingsOpen,
    isBookListOpen,
    setIsBookListOpen,
    copiedId,
    detectedChapters,
    isChapterListOpen,
    setIsChapterListOpen,
    isChapterListVisible,
    setIsChapterListVisible,
    buttonPos,
    setButtonPos,
    parsedBooks,
    editor,
    authorEditor,
    handleSelectBook,
    handleSelectBookByIndex,
    handleCopy,
    formatContent,
    triggerExportWord,
    triggerExportPDF,
    authorInfoMap,
  };
};
