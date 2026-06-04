import React, { useState } from "react";
import { Wand2, BookOpen, Check, Copy, ChevronDown } from "lucide-react";

interface Book {
  title1: string;
  title2: string;
  full: string;
}

interface PromptTabProps {
  promptTemplate: string;
  setPromptTemplate: (val: string) => void;
  promptPlaceholderBook: string;
  setPromptPlaceholderBook: (val: string) => void;
  parsedBooks: Book[];
  handleSelectBook: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  title1: string;
  title2: string;
  copiedId: string | null;
  handleCopy: (text: string, id: string, isHtml?: boolean) => void;
  editor: any;
  setActiveTab: (val: "formatter" | "prompt" | "splitter") => void;
  selectBook: (title1: string, title2: string) => void;
  isPromptOpen: boolean;
  setIsPromptOpen: (val: boolean) => void;
}

export const PromptTab: React.FC<PromptTabProps> = ({
  promptTemplate,
  setPromptTemplate,
  promptPlaceholderBook,
  setPromptPlaceholderBook,
  parsedBooks,
  handleSelectBook,
  title1,
  title2,
  copiedId,
  handleCopy,
  selectBook,
  isPromptOpen,
  setIsPromptOpen,
}) => {
  const fullTitle = `${title1}${title2 ? ` ${title2}` : ""}`.replace(/\s+/g, " ").trim();
  const generatedPrompt = promptTemplate.replaceAll(promptPlaceholderBook, fullTitle);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Prompt Template & Quick Selector */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <button
            onClick={() => setIsPromptOpen(!isPromptOpen)}
            className="flex items-center justify-between w-full cursor-pointer"
          >
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-indigo-600" />
              Prompt Generator
            </h2>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${isPromptOpen ? "rotate-180" : ""}`}
            />
          </button>
          {!isPromptOpen && (
            <p className="text-xs text-gray-400 mt-1">Nhập prompt mẫu và cấu hình tên sách thay thế</p>
          )}

          {isPromptOpen && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-gray-500">
                Nhập prompt mẫu rồi chọn sách — hệ thống sẽ tự thay tên sách cho bạn.
              </p>

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
                <label className="text-xs font-medium text-gray-500">
                  Tên sách mẫu trong Prompt (để thay thế)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm text-gray-900"
                  value={promptPlaceholderBook}
                  onChange={(e) => setPromptPlaceholderBook(e.target.value)}
                  placeholder="VD: English for Beginners"
                />
              </div>
            </div>
          )}
        </div>

        {/* Danh sách sách & Copy nhanh */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-md font-semibold text-gray-800 flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo-600" />
              Danh sách sách & Copy nhanh
            </h2>
            <span className="text-xs bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-transparent dark:border-indigo-900/30 px-2.5 py-0.5 rounded-full font-semibold">
              {parsedBooks.length} sách
            </span>
          </div>

          {parsedBooks.length > 0 ? (
            <div className="max-h-[420px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {parsedBooks.map((book, idx) => {
                  const bookFullTitle = `${book.title1}${book.title2 ? ` ${book.title2}` : ""}`.replace(/\s+/g, " ").trim();
                  const bookPrompt = promptTemplate.replaceAll(promptPlaceholderBook, bookFullTitle);
                  const isSelected = book.title1 === title1 && book.title2 === title2;
                  const copyKey = `prompt-book-${idx}`;
                  const isCopied = copiedId === copyKey;
                  
                  const previewText = bookPrompt 
                    ? (bookPrompt.length > 80 ? bookPrompt.slice(0, 80) + "..." : bookPrompt)
                    : "Chưa có prompt mẫu...";

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        selectBook(book.title1, book.title2);
                        if (promptTemplate && promptPlaceholderBook) {
                          handleCopy(bookPrompt, copyKey);
                        }
                      }}
                      className={`flex flex-col text-left p-4 rounded-xl border transition-all cursor-pointer relative group ${
                        isSelected
                          ? "border-indigo-600 bg-indigo-50/20 ring-2 ring-indigo-500/10 shadow-sm"
                          : "border-gray-100 bg-gray-50/50 hover:bg-indigo-50/40 hover:border-indigo-300"
                      }`}
                      title={bookFullTitle}
                    >
                      {/* Top badge and copy status */}
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isSelected ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-600 group-hover:bg-indigo-100 group-hover:text-indigo-700"
                        }`}>
                          #{idx + 1}
                        </span>
                        
                        <span className={`text-[10px] flex items-center gap-1 font-medium transition-colors ${
                          isCopied ? "text-green-600 font-bold" : "text-gray-400 group-hover:text-indigo-600"
                        }`}>
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-green-600 animate-scale" />
                              <span>Đã copy!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
                              <span className="opacity-0 group-hover:opacity-100 transition-opacity">Copy</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Book Title */}
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1 w-full mt-1.5" title={bookFullTitle}>
                        {bookFullTitle}
                      </h4>

                      {/* Prompt Preview */}
                      <p className="text-[11px] text-gray-400 line-clamp-2 mt-1 leading-normal italic font-light group-hover:text-gray-500">
                        {previewText}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-xl text-sm text-gray-400">
              Chưa có danh sách sách. Vui lòng nhập danh sách sách trong tab Formatter.
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Generated Output */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">Kết quả</h2>
            {promptTemplate && title1 && promptPlaceholderBook && (
              <button
                onClick={() => handleCopy(generatedPrompt, "generatedPrompt")}
                className="flex items-center gap-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors shadow-sm cursor-pointer"
              >
                {copiedId === "generatedPrompt" ? (
                  <Check className="w-3 h-3" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}{" "}
                {copiedId === "generatedPrompt" ? "Copied!" : "Copy Prompt"}
              </button>
            )}
          </div>

          {promptTemplate && title1 && promptPlaceholderBook ? (
            <div className="w-full p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/30 rounded-lg text-sm text-gray-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed">
              {generatedPrompt}
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
  );
};
