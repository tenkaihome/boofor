"use client";

import { useBookState } from "@/hooks/useBookState";
import { FormatterTab } from "@/components/tabs/FormatterTab";
import { PromptTab } from "@/components/tabs/PromptTab";
import { SplitterTab } from "@/components/tabs/SplitterTab";
import { Modal } from "@/components/common/Modal";
import { AuthorTabs } from "@/components/common/AuthorTabs";
import { FileText, Wand2, TableProperties } from "lucide-react";

export default function Home() {
  const state = useBookState();

  if (!state.isMounted) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        {/* Author Workspace Tabs */}
        <AuthorTabs
          tabs={state.tabs}
          activeTabId={state.activeTabId}
          activeAuthor={state.author}
          onSelectTab={state.switchTab}
          onAddTab={state.addTab}
          onDeleteTab={state.deleteTab}
          onRenameTab={state.renameTab}
        />

        {/* Tab Navigation */}
        <div className="tab-navigation-container">
          <button
            onClick={() => state.setActiveTab("formatter")}
            className={`tab-button cursor-pointer ${
              state.activeTab === "formatter"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <FileText className="w-4 h-4" />
            Formatter
          </button>
          <button
            onClick={() => state.setActiveTab("prompt")}
            className={`tab-button cursor-pointer ${
              state.activeTab === "prompt"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Wand2 className="w-4 h-4" />
            Prompt Generator
          </button>
          <button
            onClick={() => state.setActiveTab("splitter")}
            className={`tab-button cursor-pointer ${
              state.activeTab === "splitter"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <TableProperties className="w-4 h-4" />
            Sheet Splitter
          </button>
        </div>

        {/* Tab content rendering */}
        {state.activeTab === "formatter" && (
          <FormatterTab
            editor={state.editor}
            isFormatting={state.isFormatting}
            isExporting={state.isExporting}
            isExportingPDF={state.isExportingPDF}
            formatContent={state.formatContent}
            triggerExportWord={state.triggerExportWord}
            triggerExportPDF={state.triggerExportPDF}
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
          />
        )}

        {state.activeTab === "prompt" && (
          <PromptTab
            promptTemplate={state.promptTemplate}
            setPromptTemplate={state.setPromptTemplate}
            promptPlaceholderBook={state.promptPlaceholderBook}
            setPromptPlaceholderBook={state.setPromptPlaceholderBook}
            parsedBooks={state.parsedBooks}
            handleSelectBook={state.handleSelectBook}
            title1={state.title1}
            title2={state.title2}
            copiedId={state.copiedId}
            handleCopy={state.handleCopy}
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
      />
    </div>
  );
}
