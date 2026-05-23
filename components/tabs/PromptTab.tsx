import React from "react";
import { Wand2, BookOpen, Check, Copy } from "lucide-react";

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
}) => {
  const fullTitle = `${title1}${title2 ? ` ${title2}` : ""}`.replace(/\s+/g, " ").trim();
  const generatedPrompt = promptTemplate.replaceAll(promptPlaceholderBook, fullTitle);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left Column: Prompt Template & Quick Selector */}
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-indigo-600" />
            Prompt Generator
          </h2>
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

        {/* Quick Book Selector */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <h2 className="text-md font-semibold text-gray-800 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            Chọn sách nhanh
          </h2>
          {(() => {
            const selectedIdx = parsedBooks.findIndex(
              (book) => book.title1 === title1 && book.title2 === title2
            );
            return (
              <select
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
                onChange={handleSelectBook}
                value={selectedIdx >= 0 ? selectedIdx : ""}
              >
                <option value="" disabled>
                  -- Chọn cuốn sách --
                </option>
                {parsedBooks.map((book, idx) => (
                  <option key={idx} value={idx}>
                    {idx + 1}. {book.title1} {book.title2 ? ` - ${book.title2}` : ""}
                  </option>
                ))}
              </select>
            );
          })()}
          {title1 && (
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-sm text-indigo-800">
              Đang chọn: <span className="font-bold">{fullTitle}</span>
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
            <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-gray-800 whitespace-pre-wrap max-h-[60vh] overflow-y-auto leading-relaxed">
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
