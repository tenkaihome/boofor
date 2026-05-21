import React from "react";
import { ChevronDown, BookOpen } from "lucide-react";

interface Book {
  title1: string;
  title2: string;
  full: string;
}

interface BookListSectionProps {
  isBookListOpen: boolean;
  setIsBookListOpen: (open: boolean) => void;
  bookListText: string;
  setBookListText: (val: string) => void;
  parsedBooks: Book[];
  handleSelectBook: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  title1: string;
  title2: string;
}

export const BookListSection: React.FC<BookListSectionProps> = ({
  isBookListOpen,
  setIsBookListOpen,
  bookListText,
  setBookListText,
  parsedBooks,
  handleSelectBook,
  title1,
  title2,
}) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <button
        onClick={() => setIsBookListOpen(!isBookListOpen)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h2 className="text-md font-semibold text-gray-800">Quản lý Danh sách Sách</h2>
        </div>
        <ChevronDown
          className={`w-5 h-5 text-gray-400 transition-transform ${isBookListOpen ? "rotate-180" : ""}`}
        />
      </button>
      {!isBookListOpen && (
        <p className="text-xs text-gray-400 mt-1">Nhập và quản lý danh sách sách</p>
      )}

      {isBookListOpen && (
        <div className="space-y-1">
          <label className="text-xs font-medium text-gray-500">
            Danh sách sách (Mỗi dòng 1 cuốn, dùng dấu "-" để tách 2 phần)
          </label>
          <textarea
            rows={4}
            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900"
            placeholder="Ví dụ:&#10;Sách 1 phần A - Sách 1 phần B&#10;Sách số 2 - Cực kỳ hay"
            value={bookListText}
            onChange={(e) => setBookListText(e.target.value)}
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="text-xs font-medium text-gray-500">Chọn Sách để điền Tự Động</label>
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
                -- Chọn cuốn sách đang làm --
              </option>
              {parsedBooks.map((book, idx) => (
                <option key={idx} value={idx}>
                  {idx + 1}. {book.title1} {book.title2 ? ` - ${book.title2}` : ""}
                </option>
              ))}
            </select>
          );
        })()}
      </div>
    </div>
  );
};
