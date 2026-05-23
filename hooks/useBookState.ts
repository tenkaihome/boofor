import React, { useState, useEffect, useMemo, useRef } from "react";
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

export interface AuthorTab {
  id: string;
  title1: string;
  title2: string;
  author: string;
  bookListText: string;
  introductionText: string;
  chapterKeywords: string;
  genresText: string;
  customBlockPhrases: string;
  promptTemplate: string;
  promptPlaceholderBook: string;
  splitterInput: string;
  isSettingsOpen: boolean;
  isBookListOpen: boolean;
  detectedChapters: string[];
  editorContent: string;
  authorEditorContent: string;
  bookIntroMap: Record<string, string>;
  bookContentMap: Record<string, string>;
  activeSubTab: "formatter" | "prompt" | "splitter";
}

export interface BatchJob {
  id: number;
  bookTitle: string;
  status: "idle" | "pending" | "generating" | "completed" | "failed";
  progressText: string;
  resultText?: string;
  error?: string;
}

export const useBookState = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);

  // Tab State
  const [tabs, setTabs] = useState<AuthorTab[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>("");

  // Flat Active State variables (sourced from active tab)
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
  const [bookContentMap, setBookContentMap] = useState<Record<string, string>>({});

  const editorRestoredRef = useRef(false);
  const authorEditorRestoredRef = useRef(false);
  const isSwitchingTabRef = useRef(false);
  const authorRef = useRef(author);

  useEffect(() => {
    authorRef.current = author;
  }, [author]);

  // Initialize from LocalStorage and migrate old flat state if necessary
  useEffect(() => {
    setIsMounted(true);

    const savedTabs = localStorage.getItem("bofo_tabs");
    const savedActiveTabId = localStorage.getItem("bofo_activeTabId");

    const oldAuthorInfoMap = JSON.parse(localStorage.getItem("bofo_authorInfoMap") || "{}");
    setAuthorInfoMap(oldAuthorInfoMap);



    if (savedTabs) {
      const parsedTabs = JSON.parse(savedTabs) as AuthorTab[];
      setTabs(parsedTabs);

      const targetId = savedActiveTabId && parsedTabs.some((t) => t.id === savedActiveTabId)
        ? savedActiveTabId
        : parsedTabs[0]?.id || "";

      if (targetId) {
        setActiveTabId(targetId);
        const activeTabObj = parsedTabs.find((t) => t.id === targetId)!;
        setTitle1(activeTabObj.title1 || "");
        setTitle2(activeTabObj.title2 || "");
        setAuthor(activeTabObj.author || "");
        setBookListText(activeTabObj.bookListText || "");
        setIntroductionText(activeTabObj.introductionText || "");
        setChapterKeywords(activeTabObj.chapterKeywords || "chapter, lesson");
        setGenresText(activeTabObj.genresText || "");
        setCustomBlockPhrases(activeTabObj.customBlockPhrases || "");
        setPromptTemplate(activeTabObj.promptTemplate || "");
        setPromptPlaceholderBook(activeTabObj.promptPlaceholderBook || "");
        setSplitterInput(activeTabObj.splitterInput || "");
        setIsSettingsOpen(activeTabObj.isSettingsOpen ?? true);
        setIsBookListOpen(activeTabObj.isBookListOpen ?? true);
        setDetectedChapters(activeTabObj.detectedChapters || []);
        setBookIntroMap(activeTabObj.bookIntroMap || {});
        setBookContentMap(activeTabObj.bookContentMap || {});
        setActiveTab(activeTabObj.activeSubTab || "formatter");
      }
    } else {
      // Migrate from old flat structure
      const oldTitle1 = localStorage.getItem("bofo_title1") || "";
      const oldTitle2 = localStorage.getItem("bofo_title2") || "";
      const oldAuthor = localStorage.getItem("bofo_author") || "";
      const oldBookList = localStorage.getItem("bofo_bookList") || "";
      const oldChapterKeywords = localStorage.getItem("bofo_chapterKeywords") || "chapter, lesson";
      const oldGenres = localStorage.getItem("bofo_genres") || "Language Study / English as a Second Language\nLanguage Study / Multi-Language Phrasebooks";
      const oldCustomBlockPhrases = localStorage.getItem("bofo_customBlockPhrases") || "";
      const oldPromptTemplate = localStorage.getItem("bofo_promptTemplate") || "";
      const oldPromptPlaceholderBook = localStorage.getItem("bofo_promptPlaceholderBook") || "";
      const oldSplitterInput = localStorage.getItem("bofo_splitterInput") || "";
      const oldSettingsOpen = localStorage.getItem("bofo_isSettingsOpen") !== "false";
      const oldBookListOpen = localStorage.getItem("bofo_isBookListOpen") !== "false";
      const oldBookIntroMap = JSON.parse(localStorage.getItem("bofo_bookIntroMap") || "{}");

      const oldAuthorEditorContent = oldAuthor ? (oldAuthorInfoMap[oldAuthor] || "") : "";

      const initialId = `tab_${Date.now()}`;
      const initialTab: AuthorTab = {
        id: initialId,
        title1: oldTitle1,
        title2: oldTitle2,
        author: oldAuthor,
        bookListText: oldBookList,
        introductionText: "",
        chapterKeywords: oldChapterKeywords,
        genresText: oldGenres,
        customBlockPhrases: oldCustomBlockPhrases,
        promptTemplate: oldPromptTemplate,
        promptPlaceholderBook: oldPromptPlaceholderBook,
        splitterInput: oldSplitterInput,
        isSettingsOpen: oldSettingsOpen,
        isBookListOpen: oldBookListOpen,
        detectedChapters: [],
        editorContent: "",
        authorEditorContent: oldAuthorEditorContent,
        bookIntroMap: oldBookIntroMap,
        bookContentMap: {},
        activeSubTab: "formatter",
      };

      setTabs([initialTab]);
      setActiveTabId(initialId);

      setTitle1(oldTitle1);
      setTitle2(oldTitle2);
      setAuthor(oldAuthor);
      setBookListText(oldBookList);
      setChapterKeywords(oldChapterKeywords);
      setGenresText(oldGenres);
      setCustomBlockPhrases(oldCustomBlockPhrases);
      setPromptTemplate(oldPromptTemplate);
      setPromptPlaceholderBook(oldPromptPlaceholderBook);
      setSplitterInput(oldSplitterInput);
      setIsSettingsOpen(oldSettingsOpen);
      setIsBookListOpen(oldBookListOpen);
      setBookIntroMap(oldBookIntroMap);
      setBookContentMap({});
    }
  }, []);

  // Sync splitterInput to author if index 9 contains a value
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
      if (isSwitchingTabRef.current) return;
      const html = ed.getHTML();
      const currentAuthor = authorRef.current;
      if (currentAuthor) {
        setAuthorInfoMap((prev) => {
          const newMap = { ...prev, [currentAuthor]: html };
          localStorage.setItem("bofo_authorInfoMap", JSON.stringify(newMap));
          return newMap;
        });
      }
    },
  });

  // Load editor contents on startup when components are ready
  useEffect(() => {
    if (editor && activeTabId && tabs.length > 0 && !editorRestoredRef.current) {
      const activeTabObj = tabs.find((t) => t.id === activeTabId);
      if (activeTabObj) {
        const title = activeTabObj.title1 || "";
        const savedMap = activeTabObj.bookContentMap || {};
        const content = (title ? savedMap[title] : null) || activeTabObj.editorContent || "";
        editor.commands.setContent(content);
      }
      editorRestoredRef.current = true;
    }
  }, [editor, activeTabId, tabs]);

  useEffect(() => {
    if (authorEditor && activeTabId && tabs.length > 0 && !authorEditorRestoredRef.current) {
      const activeTabObj = tabs.find((t) => t.id === activeTabId);
      if (activeTabObj && activeTabObj.authorEditorContent) {
        isSwitchingTabRef.current = true;
        authorEditor.commands.setContent(activeTabObj.authorEditorContent);
        setTimeout(() => {
          isSwitchingTabRef.current = false;
        }, 100);
      }
      authorEditorRestoredRef.current = true;
    }
  }, [authorEditor, activeTabId, tabs]);

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

  // Debounced save to LocalStorage and in-memory tabs state
  useEffect(() => {
    if (!isMounted || !activeTabId) return;

    const timer = setTimeout(() => {
      const currentEditorContent = editor ? editor.getHTML() : "";
      const currentAuthorEditorContent = authorEditor ? authorEditor.getHTML() : "";

      setBookContentMap((prevMap) => {
        const nextMap = { ...prevMap };
        if (title1) {
          nextMap[title1] = currentEditorContent;
        }

        setTabs((prevTabs) => {
          const updated = prevTabs.map((t) => {
            if (t.id === activeTabId) {
              return {
                ...t,
                title1,
                title2,
                author,
                bookListText,
                introductionText,
                chapterKeywords,
                genresText,
                customBlockPhrases,
                promptTemplate,
                promptPlaceholderBook,
                splitterInput,
                isSettingsOpen,
                isBookListOpen,
                detectedChapters,
                bookIntroMap,
                bookContentMap: nextMap,
                activeSubTab: activeTab,
                editorContent: currentEditorContent,
                authorEditorContent: currentAuthorEditorContent,
              };
            }
            return t;
          });

          localStorage.setItem("bofo_tabs", JSON.stringify(updated));
          localStorage.setItem("bofo_activeTabId", activeTabId);

          return updated;
        });

        return nextMap;
      });
    }, 500);

    return () => clearTimeout(timer);
  }, [
    activeTabId,
    title1,
    title2,
    author,
    bookListText,
    introductionText,
    chapterKeywords,
    genresText,
    customBlockPhrases,
    promptTemplate,
    promptPlaceholderBook,
    splitterInput,
    isSettingsOpen,
    isBookListOpen,
    detectedChapters,
    bookIntroMap,
    activeTab,
    editor,
    authorEditor,
    isMounted,
  ]);

  // Tab switcher
  const switchTab = (nextTabId: string) => {
    if (nextTabId === activeTabId) return;

    isSwitchingTabRef.current = true;

    const currentEditorContent = editor ? editor.getHTML() : "";
    const currentAuthorEditorContent = authorEditor ? authorEditor.getHTML() : "";

    setTabs((prevTabs) => {
      const updated = prevTabs.map((t) => {
        if (t.id === activeTabId) {
          return {
            ...t,
            title1,
            title2,
            author,
            bookListText,
            introductionText,
            chapterKeywords,
            genresText,
            customBlockPhrases,
            promptTemplate,
            promptPlaceholderBook,
            splitterInput,
            isSettingsOpen,
            isBookListOpen,
            detectedChapters,
            bookIntroMap,
            bookContentMap,
            activeSubTab: activeTab,
            editorContent: currentEditorContent,
            authorEditorContent: currentAuthorEditorContent,
          };
        }
        return t;
      });

      const nextTab = updated.find((t) => t.id === nextTabId);
      if (nextTab) {
        setTitle1(nextTab.title1 || "");
        setTitle2(nextTab.title2 || "");
        setAuthor(nextTab.author || "");
        setBookListText(nextTab.bookListText || "");
        setIntroductionText(nextTab.introductionText || "");
        setChapterKeywords(nextTab.chapterKeywords || "chapter, lesson");
        setGenresText(nextTab.genresText || "");
        setCustomBlockPhrases(nextTab.customBlockPhrases || "");
        setPromptTemplate(nextTab.promptTemplate || "");
        setPromptPlaceholderBook(nextTab.promptPlaceholderBook || "");
        setSplitterInput(nextTab.splitterInput || "");
        setIsSettingsOpen(nextTab.isSettingsOpen ?? true);
        setIsBookListOpen(nextTab.isBookListOpen ?? true);
        setDetectedChapters(nextTab.detectedChapters || []);
        setBookIntroMap(nextTab.bookIntroMap || {});
        setBookContentMap(nextTab.bookContentMap || {});
        setActiveTab(nextTab.activeSubTab || "formatter");

        if (editor) {
          const content = (nextTab.title1 ? (nextTab.bookContentMap || {})[nextTab.title1] : null) || nextTab.editorContent || "";
          editor.commands.setContent(content);
        }
        if (authorEditor) {
          authorEditor.commands.setContent(nextTab.authorEditorContent || "");
        }
      }

      return updated;
    });

    setActiveTabId(nextTabId);

    setTimeout(() => {
      isSwitchingTabRef.current = false;
    }, 100);
  };

  // Add a new tab
  const addTab = () => {
    isSwitchingTabRef.current = true;

    const newId = `tab_${Date.now()}`;
    const newTab: AuthorTab = {
      id: newId,
      title1: "",
      title2: "",
      author: "",
      bookListText: "",
      introductionText: "",
      chapterKeywords: "chapter, lesson",
      genresText: "Language Study / English as a Second Language\nLanguage Study / Multi-Language Phrasebooks",
      customBlockPhrases: "",
      promptTemplate: "",
      promptPlaceholderBook: "",
      splitterInput: "",
      isSettingsOpen: true,
      isBookListOpen: true,
      detectedChapters: [],
      editorContent: "",
      authorEditorContent: "",
      bookIntroMap: {},
      bookContentMap: {},
      activeSubTab: "formatter",
    };

    const currentEditorContent = editor ? editor.getHTML() : "";
    const currentAuthorEditorContent = authorEditor ? authorEditor.getHTML() : "";

    setTabs((prevTabs) => {
      const updated = prevTabs.map((t) => {
        if (t.id === activeTabId) {
          return {
            ...t,
            title1,
            title2,
            author,
            bookListText,
            introductionText,
            chapterKeywords,
            genresText,
            customBlockPhrases,
            promptTemplate,
            promptPlaceholderBook,
            splitterInput,
            isSettingsOpen,
            isBookListOpen,
            detectedChapters,
            bookIntroMap,
            bookContentMap,
            activeSubTab: activeTab,
            editorContent: currentEditorContent,
            authorEditorContent: currentAuthorEditorContent,
          };
        }
        return t;
      });
      return [...updated, newTab];
    });

    setTitle1("");
    setTitle2("");
    setAuthor("");
    setBookListText("");
    setIntroductionText("");
    setChapterKeywords("chapter, lesson");
    setGenresText("Language Study / English as a Second Language\nLanguage Study / Multi-Language Phrasebooks");
    setCustomBlockPhrases("");
    setPromptTemplate("");
    setPromptPlaceholderBook("");
    setSplitterInput("");
    setIsSettingsOpen(true);
    setIsBookListOpen(true);
    setDetectedChapters([]);
    setBookIntroMap({});
    setBookContentMap({});
    setActiveTab("formatter");

    if (editor) {
      editor.commands.setContent("");
    }
    if (authorEditor) {
      authorEditor.commands.setContent("");
    }

    setActiveTabId(newId);

    setTimeout(() => {
      isSwitchingTabRef.current = false;
    }, 100);
  };

  // Delete a tab
  const deleteTab = (tabId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (tabs.length <= 1) return;

    isSwitchingTabRef.current = true;

    const tabIndex = tabs.findIndex((t) => t.id === tabId);
    const nextTabs = tabs.filter((t) => t.id !== tabId);

    setTabs(nextTabs);

    if (activeTabId === tabId) {
      const nextActiveIndex = tabIndex === 0 ? 0 : tabIndex - 1;
      const nextActiveTab = nextTabs[nextActiveIndex];
      if (nextActiveTab) {
        setTitle1(nextActiveTab.title1 || "");
        setTitle2(nextActiveTab.title2 || "");
        setAuthor(nextActiveTab.author || "");
        setBookListText(nextActiveTab.bookListText || "");
        setIntroductionText(nextActiveTab.introductionText || "");
        setChapterKeywords(nextActiveTab.chapterKeywords || "chapter, lesson");
        setGenresText(nextActiveTab.genresText || "");
        setCustomBlockPhrases(nextActiveTab.customBlockPhrases || "");
        setPromptTemplate(nextActiveTab.promptTemplate || "");
        setPromptPlaceholderBook(nextActiveTab.promptPlaceholderBook || "");
        setSplitterInput(nextActiveTab.splitterInput || "");
        setIsSettingsOpen(nextActiveTab.isSettingsOpen ?? true);
        setIsBookListOpen(nextActiveTab.isBookListOpen ?? true);
        setDetectedChapters(nextActiveTab.detectedChapters || []);
        setBookIntroMap(nextActiveTab.bookIntroMap || {});
        setBookContentMap(nextActiveTab.bookContentMap || {});
        setActiveTab(nextActiveTab.activeSubTab || "formatter");

        if (editor) {
          const content = (nextActiveTab.title1 ? (nextActiveTab.bookContentMap || {})[nextActiveTab.title1] : null) || nextActiveTab.editorContent || "";
          editor.commands.setContent(content);
        }
        if (authorEditor) {
          authorEditor.commands.setContent(nextActiveTab.authorEditorContent || "");
        }

        setActiveTabId(nextActiveTab.id);
      }
    }

    setTimeout(() => {
      isSwitchingTabRef.current = false;
    }, 100);
  };

  // Rename tab
  const renameTab = (tabId: string, newName: string) => {
    if (tabId === activeTabId) {
      setAuthor(newName);
    } else {
      setTabs((prev) =>
        prev.map((t) => (t.id === tabId ? { ...t, author: newName } : t))
      );
    }
  };

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



  const selectBook = (newTitle1: string, newTitle2: string) => {
    if (!editor) return;

    // 1. Save current content of the old book before switching
    const currentHtml = editor.getHTML();
    let nextMap = { ...bookContentMap };
    if (title1) {
      nextMap[title1] = currentHtml;
      setBookContentMap(nextMap);
      setTabs((prevTabs) =>
        prevTabs.map((t) =>
          t.id === activeTabId ? { ...t, bookContentMap: nextMap } : t
        )
      );
    }

    // 2. Update titles
    setTitle1(newTitle1);
    setTitle2(newTitle2);

    // 3. Load content of the new book
    const newHtml = nextMap[newTitle1] || "";
    editor.commands.setContent(newHtml);
  };

  // Handle select dropdown choices
  const handleSelectBook = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = parseInt(e.target.value, 10);
    if (!isNaN(idx) && parsedBooks[idx]) {
      selectBook(parsedBooks[idx].title1, parsedBooks[idx].title2);
    }
  };

  const handleSelectBookByIndex = (idx: number) => {
    if (parsedBooks[idx]) {
      selectBook(parsedBooks[idx].title1, parsedBooks[idx].title2);
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
    // Multi-tab workspace features
    tabs,
    setTabs,
    activeTabId,
    setActiveTabId,
    switchTab,
    addTab,
    deleteTab,
    renameTab,
    bookContentMap,
    setBookContentMap,
    selectBook,
  };
};
