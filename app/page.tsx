"use client";

import { useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import { Save, Wand2, FileText, Loader2 } from "lucide-react";
import { saveAs } from "file-saver";

export default function Home() {
  const [isExporting, setIsExporting] = useState(false);
  const [isFormatting, setIsFormatting] = useState(false);
  const [title1, setTitle1] = useState("");
  const [title2, setTitle2] = useState("");
  const [author, setAuthor] = useState("");

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
    ],
    content: "<p>Dán nội dung vào đây...</p>",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[60vh] max-h-[70vh] overflow-y-auto p-8 border rounded-md shadow-inner bg-white font-serif",
      },
    },
  });

  const formatContent = () => {
    if (!editor) return;
    setIsFormatting(true);

    setTimeout(() => {
      let html = editor.getHTML();
      
      // Sử dụng DOMParser để xử lý HTML an toàn hơn
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");

      // Regex phát hiện tiếng Việt (có dấu)
      const vietnameseRegex = /[àáãạảăắằẳẵặâấầẩẫậèéẹẻẽêềếểễệđìíĩỉịòóõọỏôốồổỗộơớờởỡợùúũũụủưứừửữựỳýỹỷỵ]/i;

      // Các cụm từ tiếng Anh vô nghĩa của AI cần xóa
      const aiPhrases = [
        "certainly! here is",
        "ready for chapter",
        "just say",
        "would you like to continue",
        "absolutely! below is",
        "here is a comprehensive",
        "congratulations! by reaching this point",
        "please confirm",
        "absolutely! here is",
        "next steps:",
        "thank you for your confirmation",
        "end of chapter"
      ];

      // Lặp qua tất cả các thẻ text
      const allElements = doc.body.querySelectorAll("p, h1, h2, h3, h4, h5, h6, li, div");
      
      allElements.forEach((el) => {
        const text = el.textContent?.trim() || "";
        const lowerText = text.toLowerCase();
        
        if (!text) return; // Bỏ qua thẻ rỗng

        // 1. Xóa các đoạn chứa tiếng Việt (Prompt người dùng, câu trả lời của AI bằng tiếng Việt)
        if (vietnameseRegex.test(text)) {
          el.remove();
          return;
        }

        // 2. Xóa các đoạn chat bằng tiếng Anh của AI
        const hasAiPhrase = aiPhrases.some((phrase) => lowerText.includes(phrase));
        if (hasAiPhrase) {
          el.remove();
          return;
        }

        // 3. Nhận diện Chapter, Introduction, Conclusion để làm Heading và Ngắt trang
        // Tiêu đề thường ngắn (dưới 15 từ)
        const wordCount = text.split(/\s+/).length;
        const isHeadingCandidate = wordCount < 15;
        
        const isChapterHeading = /^chapter\s+\d+/i.test(lowerText);
        const isIntroOrConclusion = /(introduction|conclusion)/i.test(lowerText) && isHeadingCandidate;

        if (isChapterHeading || isIntroOrConclusion) {
          // Ép kiểu thành Heading 1 nếu chưa phải
          let headingEl = el;
          if (!["H1", "H2", "H3"].includes(el.tagName)) {
            const h1 = doc.createElement("h1");
            h1.innerHTML = el.innerHTML;
            el.replaceWith(h1);
            headingEl = h1; // Update tham chiếu
          }
          
          // Căn giữa
          (headingEl as HTMLElement).style.textAlign = "center";
          
          // Thêm ngắt trang (Page Break) TRƯỚC thẻ này nếu nó không phải phần tử đầu tiên
          // (Việc chèn page-break thực tế khi xuất DOCX sẽ do hàm exportToWord đảm nhận dựa trên nội dung/tag)
          (headingEl as HTMLElement).classList.add("page-break-before");
        }
      });

      // Lấy HTML đã được dọn dẹp
      let cleanedHtml = doc.body.innerHTML;

      // Đặt lại vào editor
      editor.commands.setContent(cleanedHtml);
      setIsFormatting(false);
    }, 100);
  };

  const exportToWord = async () => {
    if (!editor) return;
    setIsExporting(true);

    try {
      let html = editor.getHTML();
      
      // Tiền xử lý HTML để tương thích tốt nhất với html-to-docx
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      // Áp dụng inline styles cho DOCX
      const allElements = doc.body.querySelectorAll("*");
      allElements.forEach((el) => {
        const hElement = el as HTMLElement;
        // Times New Roman cho tất cả
        hElement.style.fontFamily = "'Times New Roman', serif";
        
        // Căn lề giữa
        if (hElement.style.textAlign === "center" || hElement.getAttribute("data-text-align") === "center") {
          hElement.style.textAlign = "center";
        }

        // Size chữ
        if (["H1", "H2", "H3"].includes(hElement.tagName)) {
          hElement.style.fontSize = "16pt";
        } else {
          // Các thẻ còn lại (p, span, li...) mặc định là 13pt, ta không cần gán cứng trừ khi cần thiết, API đã lo
          if (hElement.tagName === "P" || hElement.tagName === "SPAN") {
             hElement.style.fontSize = "13pt";
          }
        }
      });

      // html-to-docx page break fix: Dùng một thẻ div rỗng có thuộc tính ngắt trang
      const pageBreakElements = doc.body.querySelectorAll(".page-break-before");
      pageBreakElements.forEach((el) => {
        if (el.previousElementSibling) {
          const pageBreakDiv = doc.createElement("div");
          pageBreakDiv.style.pageBreakBefore = "always";
          el.parentNode?.insertBefore(pageBreakDiv, el);
        }
      });

      let processedHtml = doc.body.innerHTML;

      // Xây dựng trang bìa (Title Page) nếu người dùng có nhập
      if (title1 || title2 || author) {
        // html-to-docx tính kích thước chữ theo half-points ở API, nhưng trong CSS inline thì hỗ trợ pt
        const titlePageHtml = `
          <div style="text-align: center; margin-top: 100pt; margin-bottom: 50pt;">
            ${title1 ? `<p style="font-family: 'Times New Roman', serif; font-size: 30pt; font-weight: bold; text-align: center; margin: 0;">${title1}</p>` : ""}
            ${title1 && title2 ? `<hr style="border: none; border-top: 3pt dotted black; width: 100%; margin: 40pt 0;" />` : ""}
            ${title2 ? `<p style="font-family: 'Times New Roman', serif; font-size: 30pt; font-weight: bold; text-align: center; margin: 0;">${title2}</p>` : ""}
          </div>
          <div style="text-align: center; margin-top: 250pt;">
            ${author ? `<p style="font-family: 'Times New Roman', serif; font-size: 20pt; font-weight: bold; text-decoration: underline; text-align: center; margin: 0;">${author}</p>` : ""}
          </div>
          <div style="page-break-before: always;"></div>
        `;
        processedHtml = titlePageHtml + processedHtml;
      }

      const response = await fetch("/api/export-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: processedHtml }),
      });

      if (!response.ok) throw new Error("Failed to export");

      const blob = await response.blob();
      saveAs(blob, "Book_Exported.docx");
    } catch (error) {
      console.error(error);
      alert("Đã có lỗi xảy ra khi xuất file Word.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Book Formatter Pro
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Dán hàng trăm trang văn bản AI vào đây, dọn dẹp và xuất ra file Word siêu tốc.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={formatContent}
              disabled={isFormatting}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70"
            >
              {isFormatting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
              Dọn dẹp & Format
            </button>
            <button
              onClick={exportToWord}
              disabled={isExporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-70"
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Xuất File Word
            </button>
          </div>
        </div>

        {/* Thông tin Sách */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-1">
            <h2 className="text-sm font-semibold text-gray-700">Trang bìa sách (Tùy chọn)</h2>
            <p className="text-xs text-gray-500">Thông tin này sẽ được in ở trang đầu tiên của file Word.</p>
          </div>
          <input
            type="text"
            placeholder="Tên sách (Phần 1) - VD: Master English and Malay"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={title1}
            onChange={(e) => setTitle1(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tên sách (Phần 2) - VD: In Minutes with Fast..."
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            value={title2}
            onChange={(e) => setTitle2(e.target.value)}
          />
          <input
            type="text"
            placeholder="Tên Tác giả - VD: RACHAEL KELLY"
            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm md:col-span-2"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
          />
        </div>

        {/* Editor Area */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 md:p-4">
          <EditorContent editor={editor} />
        </div>
        
        {/* Hướng dẫn */}
        <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm leading-relaxed">
          <strong>📝 Hướng dẫn sử dụng:</strong>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Copy toàn bộ văn bản (hỗ trợ hàng trăm trang) từ AI Chat và dán vào khung soạn thảo trên.</li>
            <li>Bấm <strong>Dọn dẹp & Format</strong> để công cụ tự động: Xóa các câu tiếng Việt (prompt), xóa câu chào của AI (VD: <i>"Certainly! Here is Chapter..."</i>), căn lề giữa và tạo ngắt trang cho các đề mục (Chapter, Introduction, Conclusion).</li>
            <li>Bấm <strong>Xuất File Word</strong> để tải về file <code>.docx</code> chuẩn (Font: Times New Roman, Nội dung: 13pt, Tiêu đề: 16pt, giữ nguyên in đậm/in nghiêng).</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
