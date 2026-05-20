import React from "react";
import { EditorContent, Editor } from "@tiptap/react";
import { Check, Copy } from "lucide-react";

interface BookCoverSectionProps {
  title1: string;
  setTitle1: (val: string) => void;
  title2: string;
  setTitle2: (val: string) => void;
  author: string;
  setAuthor: (val: string) => void;
  copiedId: string | null;
  handleCopy: (text: string, id: string, isHtml?: boolean) => void;
  authorEditor: Editor | null;
  authorInfoMap: Record<string, string>;
}

export const BookCoverSection: React.FC<BookCoverSectionProps> = ({
  title1,
  setTitle1,
  title2,
  setTitle2,
  author,
  setAuthor,
  copiedId,
  handleCopy,
  authorEditor,
  authorInfoMap,
}) => {
  const fullTitle = `${title1}${title2 ? ` ${title2}` : ""}`.replace(/\s+/g, " ").trim();

  return (
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
          <button
            onClick={() => handleCopy(fullTitle, "title1")}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
            title="Copy Full Title"
          >
            {copiedId === "title1" ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
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
          <button
            onClick={() => handleCopy(fullTitle, "title2")}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
            title="Copy Full Title"
          >
            {copiedId === "title2" ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
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
          <button
            onClick={() => handleCopy(author, "author")}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
            title="Copy"
          >
            {copiedId === "author" ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
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
                handleCopy(authorEditor.getHTML(), "authorInfo", true);
              }
            }}
            disabled={!author || !authorInfoMap[author]}
            className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors disabled:opacity-50"
          >
            {copiedId === "authorInfo" ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}{" "}
            {copiedId === "authorInfo" ? "Copied" : "Copy"}
          </button>
        </div>
        {!author && (
          <p className="text-xs text-red-500 mb-2">
            Vui lòng nhập tên tác giả ở trên trước khi điền.
          </p>
        )}
        <div
          className={`overflow-hidden rounded-lg ${
            !author ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          <EditorContent editor={authorEditor} />
        </div>
      </div>
    </div>
  );
};
