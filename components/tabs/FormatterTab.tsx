import React from "react";
import { Editor } from "@tiptap/react";
import { EditorSection } from "../formatter/EditorSection";
import { IntroExtractorSection } from "../formatter/IntroExtractorSection";
import { SettingsSection } from "../formatter/SettingsSection";
import { BookListSection } from "../formatter/BookListSection";
import { BookCoverSection } from "../formatter/BookCoverSection";
import { GenresSection } from "../formatter/GenresSection";

interface Book {
  title1: string;
  title2: string;
  full: string;
}

interface FormatterTabProps {
  editor: Editor | null;
  isFormatting: boolean;
  isExporting: boolean;
  isExportingPDF: boolean;
  formatContent: () => void;
  triggerExportWord: () => void;
  triggerExportPDF: () => void;
  detectedChapters: string[];
  setButtonPos: (pos: { x: number; y: number }) => void;
  setIsChapterListOpen: (open: boolean) => void;
  setIsChapterListVisible: (visible: boolean) => void;
  introductionText: string;
  copiedId: string | null;
  handleCopy: (text: string, id: string, isHtml?: boolean) => void;
  isSettingsOpen: boolean;
  setIsSettingsOpen: (open: boolean) => void;
  chapterKeywords: string;
  setChapterKeywords: (val: string) => void;
  customBlockPhrases: string;
  setCustomBlockPhrases: (val: string) => void;
  isBookListOpen: boolean;
  setIsBookListOpen: (open: boolean) => void;
  bookListText: string;
  setBookListText: (val: string) => void;
  parsedBooks: Book[];
  handleSelectBook: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  title1: string;
  setTitle1: (val: string) => void;
  title2: string;
  setTitle2: (val: string) => void;
  author: string;
  setAuthor: (val: string) => void;
  authorEditor: Editor | null;
  authorInfoMap: Record<string, string>;
  genresText: string;
  setGenresText: (val: string) => void;
}

export const FormatterTab: React.FC<FormatterTabProps> = ({
  editor,
  isFormatting,
  isExporting,
  isExportingPDF,
  formatContent,
  triggerExportWord,
  triggerExportPDF,
  detectedChapters,
  setButtonPos,
  setIsChapterListOpen,
  setIsChapterListVisible,
  introductionText,
  copiedId,
  handleCopy,
  isSettingsOpen,
  setIsSettingsOpen,
  chapterKeywords,
  setChapterKeywords,
  customBlockPhrases,
  setCustomBlockPhrases,
  isBookListOpen,
  setIsBookListOpen,
  bookListText,
  setBookListText,
  parsedBooks,
  handleSelectBook,
  title1,
  setTitle1,
  title2,
  setTitle2,
  author,
  setAuthor,
  authorEditor,
  authorInfoMap,
  genresText,
  setGenresText,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Editor, Intro Extractor, Manual */}
      <div className="lg:col-span-2 space-y-6">
        <EditorSection
          editor={editor}
          isFormatting={isFormatting}
          isExporting={isExporting}
          isExportingPDF={isExportingPDF}
          formatContent={formatContent}
          triggerExportWord={triggerExportWord}
          triggerExportPDF={triggerExportPDF}
          detectedChapters={detectedChapters}
          setButtonPos={setButtonPos}
          setIsChapterListOpen={setIsChapterListOpen}
          setIsChapterListVisible={setIsChapterListVisible}
        />

        <IntroExtractorSection
          introductionText={introductionText}
          copiedId={copiedId}
          handleCopy={handleCopy}
        />

        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed">
          <strong>📝 Hướng dẫn sử dụng:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Copy toàn bộ văn bản từ AI Chat và dán vào khung soạn thảo trên.</li>
            <li>
              Bấm <strong>Dọn dẹp & Format</strong> để công cụ tự động căn lề và tạo ngắt trang.
            </li>
            <li>
              Bấm <strong>Xuất File Word</strong> để tải về file <code>.docx</code> chuẩn.
            </li>
          </ul>
        </div>
      </div>

      {/* Right Column: Settings, Book Selector, Covers, Genres */}
      <div className="space-y-6">
        <SettingsSection
          isSettingsOpen={isSettingsOpen}
          setIsSettingsOpen={setIsSettingsOpen}
          chapterKeywords={chapterKeywords}
          setChapterKeywords={setChapterKeywords}
          customBlockPhrases={customBlockPhrases}
          setCustomBlockPhrases={setCustomBlockPhrases}
        />

        <BookListSection
          isBookListOpen={isBookListOpen}
          setIsBookListOpen={setIsBookListOpen}
          bookListText={bookListText}
          setBookListText={setBookListText}
          parsedBooks={parsedBooks}
          handleSelectBook={handleSelectBook}
        />

        <BookCoverSection
          title1={title1}
          setTitle1={setTitle1}
          title2={title2}
          setTitle2={setTitle2}
          author={author}
          setAuthor={setAuthor}
          copiedId={copiedId}
          handleCopy={handleCopy}
          authorEditor={authorEditor}
          authorInfoMap={authorInfoMap}
        />

        <GenresSection
          genresText={genresText}
          setGenresText={setGenresText}
          copiedId={copiedId}
          handleCopy={handleCopy}
        />
      </div>
    </div>
  );
};
