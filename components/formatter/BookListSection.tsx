import React, { useState, useRef, useEffect } from "react";
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
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

      <div className="space-y-1" ref={dropdownRef}>
        <label className="text-xs font-medium text-gray-500">Chọn Sách để điền Tự Động</label>
        {(() => {
          const selectedIdx = parsedBooks.findIndex(
            (book) => book.title1 === title1 && book.title2 === title2
          );
          const selectedBook = selectedIdx >= 0 ? parsedBooks[selectedIdx] : null;

          return (
            <div className="relative w-full">
              <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full pl-3 pr-10 py-2.5 bg-white dark:bg-[#161b22] border border-gray-250 dark:border-[#30363d] rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm text-gray-900 dark:text-slate-100 font-medium transition-all duration-200 cursor-pointer shadow-sm text-left flex items-center justify-between"
              >
                <span className="truncate">
                  {selectedBook
                    ? `${selectedIdx + 1}. ${selectedBook.title1}${selectedBook.title2 ? ` - ${selectedBook.title2}` : ""}`
                    : "-- Chọn cuốn sách đang làm --"}
                </span>
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 dark:text-slate-500 transition-transform duration-200 ${
                    isOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isOpen && (
                <div className="absolute z-50 w-full mt-1.5 bg-white dark:bg-[#161b22] border border-gray-250 dark:border-[#30363d] rounded-xl shadow-lg max-h-60 overflow-y-auto py-1 divide-y divide-gray-50 dark:divide-slate-800 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => {
                      const fakeEvent = {
                        target: { value: "" }
                      } as React.ChangeEvent<HTMLSelectElement>;
                      handleSelectBook(fakeEvent);
                      setIsOpen(false);
                    }}
                    className={`w-full px-3 py-2.5 text-xs text-left cursor-pointer transition-colors ${
                      selectedIdx === -1
                        ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                        : "text-gray-400 dark:text-slate-500 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                    }`}
                  >
                    -- Chọn cuốn sách đang làm --
                  </button>
                  {parsedBooks.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-gray-400 dark:text-slate-500 text-center">
                      Danh sách trống, vui lòng nhập ở trên.
                    </div>
                  ) : (
                    parsedBooks.map((book, idx) => {
                      const isSelected = idx === selectedIdx;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            const fakeEvent = {
                              target: { value: String(idx) }
                            } as React.ChangeEvent<HTMLSelectElement>;
                            handleSelectBook(fakeEvent);
                            setIsOpen(false);
                          }}
                          className={`w-full px-3 py-2.5 text-xs text-left cursor-pointer transition-colors flex items-center justify-between ${
                            isSelected
                              ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-semibold"
                              : "text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800/50"
                          }`}
                        >
                          <span className="truncate">
                            {idx + 1}. {book.title1} {book.title2 ? ` - ${book.title2}` : ""}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

