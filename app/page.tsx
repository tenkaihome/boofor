"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useBookState } from "@/hooks/useBookState";
import { FormatterTab } from "@/components/tabs/FormatterTab";
import { PromptTab } from "@/components/tabs/PromptTab";
import { SplitterTab } from "@/components/tabs/SplitterTab";
import { ReconcilerTab } from "@/components/tabs/ReconcilerTab";
import { Modal } from "@/components/common/Modal";
import { AuthorTabs } from "@/components/common/AuthorTabs";
import { FileText, Wand2, TableProperties, BookOpen, ShieldAlert, LogOut, Loader2, Clock, Sun, Moon, Bell, Mail, Share2, Inbox, Check, XCircle } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { ManageRoles } from "@/components/admin/ManageRoles";
import { ShareModal } from "@/components/common/ShareModal";

export default function Home() {
  const state = useBookState();
  const { user, isLoading, logout, theme, toggleTheme } = useAuth();
  const [activeMainTab, setActiveMainTab] = useState<"book" | "manage-roles">("book");
  const [sharedAuthors, setSharedAuthors] = useState<any[]>([]);
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [authorToShare, setAuthorToShare] = useState<any>(null);
  const inboxRef = useRef<HTMLDivElement>(null);

  const fetchSharedAuthors = useCallback(async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("boofor_session_id") : null;
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/shares", { headers });
      if (res.ok) {
        const data = await res.json();
        setSharedAuthors(data.shares || []);
      }
    } catch (error) {
      console.error("Failed to fetch shared authors:", error);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchSharedAuthors();
      const interval = setInterval(fetchSharedAuthors, 30000);
      return () => clearInterval(interval);
    }
  }, [user, fetchSharedAuthors]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (inboxRef.current && !inboxRef.current.contains(target)) {
        setIsInboxOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpenShareModal = (tab: any) => {
    setAuthorToShare(tab);
    setIsShareModalOpen(true);
  };

  const handleImportShare = async (share: any) => {
    try {
      state.importSharedAuthor({
        authorName: share.authorName,
        bookListText: share.bookListText,
        bookIntroMap: share.bookIntroMap,
        genresText: share.genresText,
        chapterKeywords: share.chapterKeywords,
        customBlockPhrases: share.customBlockPhrases,
      });

      const token = typeof window !== "undefined" ? localStorage.getItem("boofor_session_id") : null;
      await fetch("/api/shares", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ shareId: share.id }),
      });

      fetchSharedAuthors();
      setIsInboxOpen(false);
      alert(`Đã nhận thành công tác giả "${share.authorName}" vào Workspace của bạn.`);
    } catch (err) {
      console.error("Import error:", err);
      alert("Đã xảy ra lỗi khi nhận tác giả.");
    }
  };

  const handleDeclineShare = async (share: any) => {
    if (!window.confirm(`Bạn có chắc muốn xóa lời chia sẻ tác giả "${share.authorName}" từ "${share.sender}"?`)) {
      return;
    }
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("boofor_session_id") : null;
      await fetch("/api/shares", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ shareId: share.id }),
      });

      fetchSharedAuthors();
    } catch (err) {
      console.error("Decline error:", err);
      alert("Đã xảy ra lỗi khi từ chối chia sẻ.");
    }
  };

  if (!state.isMounted || isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#090d16] text-white">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-2" />
        <span className="text-sm text-gray-400">Đang tải thông tin phiên làm việc...</span>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen />;
  }

  if (user.role === "guest") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d16] p-4 relative overflow-hidden font-sans text-white">
        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] rounded-full bg-orange-950/10 blur-[120px] pointer-events-none" />
        <div className="w-full max-w-md bg-[#111827]/85 border border-[#1f2937] rounded-2xl shadow-2xl p-8 backdrop-blur-xl relative z-10 text-center">
          <div className="inline-flex p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 mb-4">
            <Clock className="w-6 h-6 text-orange-400 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-gray-100">
            Chờ duyệt tài khoản
          </h2>
          <p className="text-gray-400 mt-4 text-sm leading-relaxed">
            Tài khoản <strong className="text-gray-200">{user.username}</strong> của bạn vừa được đăng ký thành công với quyền hạn mặc định là <span className="text-orange-400 font-semibold">guest</span>.
          </p>
          <p className="text-gray-400 mt-2 text-sm leading-relaxed">
            Vui lòng liên hệ với Quản trị viên (Admin) để được cấp quyền thành <span className="text-indigo-400 font-semibold">user</span> trước khi truy cập vào hệ thống.
          </p>
          <button
            onClick={logout}
            className="w-full mt-8 py-3 px-4 bg-[#1f2937] hover:bg-gray-800 text-white rounded-xl font-medium text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98]"
          >
            <LogOut className="w-4 h-4" />
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0d1117] p-4 md:p-8 font-sans transition-colors duration-300">
      <div className="max-w-7xl mx-auto">
        {/* Top user profile header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 bg-white dark:bg-[#161b22] px-5 py-3 rounded-xl shadow-sm border border-gray-200 transition-colors duration-300 animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-bold uppercase text-sm">
              {user.username.charAt(0)}
            </div>
            <div>
              <span className="font-semibold text-gray-800 dark:text-slate-100 text-sm block">Xin chào, {user.username}</span>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  {user.role}
                </span>
                <span className="text-[12px] text-gray-500 dark:text-slate-400">telegram: @caramencafe</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-auto sm:ml-0">
            {user.role === "admin" && (
              <div className="flex bg-gray-100 dark:bg-[#0d1117] p-1 rounded-lg border border-gray-200">
                <button
                  onClick={() => setActiveMainTab("book")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    activeMainTab === "book"
                      ? "bg-white dark:bg-[#161b22] text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Book
                </button>
                <button
                  onClick={() => setActiveMainTab("manage-roles")}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-all ${
                    activeMainTab === "manage-roles"
                      ? "bg-white dark:bg-[#161b22] text-indigo-600 dark:text-indigo-400 shadow-sm"
                      : "text-gray-600 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Manage Roles
                </button>
              </div>
            )}

            {/* Shared Authors Inbox */}
            <div className="relative" ref={inboxRef}>
              <button
                onClick={() => setIsInboxOpen(!isInboxOpen)}
                className="p-2 border border-gray-250 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1f2937] transition-all cursor-pointer relative flex items-center justify-center"
                title="Tác giả được chia sẻ"
              >
                <Bell className="w-4 h-4" />
                {sharedAuthors.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {sharedAuthors.length}
                  </span>
                )}
              </button>

              {isInboxOpen && (
                <div className="absolute right-0 mt-2 z-50 w-72 bg-white dark:bg-[#161b22] border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl py-3 animate-fadeIn text-gray-900 dark:text-slate-100">
                  <div className="px-4 pb-2 border-b border-gray-150 dark:border-slate-800 flex items-center gap-2">
                    <Inbox className="w-4 h-4 text-indigo-500" />
                    <span className="text-xs font-bold">Hộp thư nhận tác giả ({sharedAuthors.length})</span>
                  </div>

                  <div className="max-h-60 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
                    {sharedAuthors.length === 0 ? (
                      <div className="px-4 py-6 text-center text-xs text-gray-400 italic">
                        Không có chia sẻ nào mới
                      </div>
                    ) : (
                      sharedAuthors.map((share) => (
                        <div key={share.id} className="p-3 space-y-2">
                          <div className="text-left">
                            <span className="text-xs font-bold block truncate" title={share.authorName}>
                              {share.authorName}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-slate-400">
                              Chia sẻ bởi: <strong>{share.sender}</strong>
                            </span>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleDeclineShare(share)}
                              className="px-2 py-1 text-[10px] font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md transition-colors cursor-pointer"
                            >
                              Từ chối
                            </button>
                            <button
                              onClick={() => handleImportShare(share)}
                              className="px-2 py-1 text-[10px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center gap-1 cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Nhận
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 border border-gray-250 text-gray-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1f2937] transition-all cursor-pointer"
              title={theme === "light" ? "Chuyển sang chế độ tối" : "Chuyển sang chế độ sáng"}
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-500 animate-pulse" />}
            </button>

            <button
              onClick={logout}
              className="text-sm font-semibold text-gray-500 dark:text-slate-400 hover:text-red-600 transition-colors cursor-pointer flex items-center gap-1.5 border border-gray-250 hover:border-gray-350 dark:hover:border-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1f2937]"
            >
              <LogOut className="w-4 h-4" />
              Đăng xuất
            </button>
          </div>
        </div>

        {activeMainTab === "book" ? (
          <>
            {/* Author Workspace Tabs */}
            <AuthorTabs
              tabs={state.tabs}
              activeTabId={state.activeTabId}
              activeAuthor={state.author}
              onSelectTab={state.switchTab}
              onAddTab={state.addTab}
              onDeleteTab={state.deleteTab}
              onRenameTab={state.renameTab}
              onShareTab={handleOpenShareModal}
            />

            {/* Tab Navigation */}
            <div className="tab-navigation-container">
              <button
                onClick={() => state.setActiveTab("formatter")}
                className={`tab-button cursor-pointer ${state.activeTab === "formatter"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <FileText className="w-4 h-4" />
                Formatter
              </button>
              <button
                onClick={() => state.setActiveTab("prompt")}
                className={`tab-button cursor-pointer ${state.activeTab === "prompt"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <Wand2 className="w-4 h-4" />
                Prompt Generator
              </button>
              <button
                onClick={() => state.setActiveTab("splitter")}
                className={`tab-button cursor-pointer ${state.activeTab === "splitter"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <TableProperties className="w-4 h-4" />
                Sheet Splitter
              </button>
              <button
                onClick={() => state.setActiveTab("reconciler")}
                className={`tab-button cursor-pointer ${state.activeTab === "reconciler"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
                  }`}
              >
                <BookOpen className="w-4 h-4" />
                Catalog Reconciler
              </button>
            </div>

            {/* Tab content rendering */}
            {state.activeTab === "formatter" && (
              <FormatterTab
                editor={state.editor}
                isFormatting={state.isFormatting}
                isExporting={state.isExporting}
                isExportingPDF={state.isExportingPDF}
                isExportingEPUB={state.isExportingEPUB}
                formatContent={state.formatContent}
                triggerExportWord={state.triggerExportWord}
                triggerExportPDF={state.triggerExportPDF}
                triggerExportEPUB={state.triggerExportEPUB}
                detectedChapters={state.detectedChapters}
                setButtonPos={state.setButtonPos}
                setIsChapterListOpen={state.setIsChapterListOpen}
                setIsChapterListVisible={state.setIsChapterListVisible}
                introductionText={state.introductionText}
                copiedId={state.copiedId}
                handleCopy={state.handleCopy}
                isSettingsOpen={state.isSettingsOpen}
                setIsSettingsOpen={state.setIsSettingsOpen}
                chapterKeywords={state.chapterKeywords}
                setChapterKeywords={state.setChapterKeywords}
                customBlockPhrases={state.customBlockPhrases}
                setCustomBlockPhrases={state.setCustomBlockPhrases}
                isBookListOpen={state.isBookListOpen}
                setIsBookListOpen={state.setIsBookListOpen}
                bookListText={state.bookListText}
                setBookListText={state.setBookListText}
                parsedBooks={state.parsedBooks}
                handleSelectBook={state.handleSelectBook}
                title1={state.title1}
                setTitle1={state.setTitle1}
                title2={state.title2}
                setTitle2={state.setTitle2}
                author={state.author}
                setAuthor={state.setAuthor}
                authorEditor={state.authorEditor}
                authorInfoMap={state.authorInfoMap}
                genresText={state.genresText}
                setGenresText={state.setGenresText}
                bookContentMap={state.bookContentMap}
                bookCovers={state.bookCovers}
                saveBookCover={state.saveBookCover}
                deleteBookCover={state.deleteBookCover}
                isBatchExporting={state.isBatchExporting}
                batchProgress={state.batchProgress}
                triggerBatchExportEPUB={state.triggerBatchExportEPUB}
                reconcilerRawText={state.reconcilerRawText}
              />
            )}

            {state.activeTab === "prompt" && (
              <PromptTab
                promptTemplate={state.promptTemplate}
                setPromptTemplate={state.setPromptTemplate}
                promptPlaceholderBook={state.promptPlaceholderBook}
                setPromptPlaceholderBook={state.setPromptPlaceholderBook}
                promptPlaceholderAuthor={state.promptPlaceholderAuthor}
                setPromptPlaceholderAuthor={state.setPromptPlaceholderAuthor}
                coverPromptTemplate={state.coverPromptTemplate}
                setCoverPromptTemplate={state.setCoverPromptTemplate}
                coverPromptPlaceholderBook={state.coverPromptPlaceholderBook}
                setCoverPromptPlaceholderBook={state.setCoverPromptPlaceholderBook}
                coverPromptPlaceholderAuthor={state.coverPromptPlaceholderAuthor}
                setCoverPromptPlaceholderAuthor={state.setCoverPromptPlaceholderAuthor}
                parsedBooks={state.parsedBooks}
                handleSelectBook={state.handleSelectBook}
                title1={state.title1}
                title2={state.title2}
                author={state.author}
                copiedId={state.copiedId}
                handleCopy={state.handleCopy}
                editor={state.editor}
                setActiveTab={state.setActiveTab}
                selectBook={state.selectBook}
                isPromptOpen={state.isPromptOpen}
                setIsPromptOpen={state.setIsPromptOpen}
              />
            )}

            {state.activeTab === "splitter" && (
              <SplitterTab
                splitterInput={state.splitterInput}
                setSplitterInput={state.setSplitterInput}
                copiedId={state.copiedId}
                handleCopy={state.handleCopy}
              />
            )}

            {state.activeTab === "reconciler" && (
              <ReconcilerTab
                rawText={state.reconcilerRawText}
                setRawText={state.setReconcilerRawText}
                warehouseText={state.bookListText}
                setWarehouseText={state.setBookListText}
              />
            )}
          </>
        ) : (
          user.role === "admin" && <ManageRoles />
        )}
      </div>

      {/* Chapter List Modal */}
      <Modal
        isOpen={state.isChapterListOpen}
        isVisible={state.isChapterListVisible}
        onClose={() => {
          state.setIsChapterListVisible(false);
          setTimeout(() => state.setIsChapterListOpen(false), 300);
        }}
        title="Các mục đã nhận diện"
        detectedChapters={state.detectedChapters}
        buttonPos={state.buttonPos}
        editorHtml={state.editor ? state.editor.getHTML() : ""}
        title1={state.title1}
        title2={state.title2}
        author={state.author}
      />

      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        authorTab={authorToShare}
        currentUsername={user.username}
      />
    </div>
  );
}
