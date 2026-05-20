import React from "react";
import { X, List } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  isVisible: boolean;
  onClose: () => void;
  title: string;
  detectedChapters: string[];
  buttonPos: { x: number; y: number };
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  isVisible,
  onClose,
  title,
  detectedChapters,
  buttonPos,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 transition-colors duration-300 ${
        isVisible ? "bg-black/50 backdrop-blur-sm" : "bg-transparent backdrop-blur-none"
      }`}
    >
      <div
        className={`absolute inset-0 flex items-center justify-center p-4 pointer-events-none transition-all duration-300
          ${isVisible ? "scale-100 opacity-100" : "scale-50 opacity-0"}`}
        style={{ transformOrigin: `${buttonPos.x}px ${buttonPos.y}px` }}
      >
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[80vh] pointer-events-auto">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <List className="w-5 h-5 text-indigo-600" />
              {title} ({detectedChapters.length})
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-200 rounded-full text-gray-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="p-4 overflow-y-auto">
            {detectedChapters.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">Chưa tìm thấy mục nào.</p>
            ) : (
              <ul className="space-y-2">
                {detectedChapters.map((chapter, idx) => (
                  <li
                    key={idx}
                    className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-800 font-medium"
                  >
                    {chapter}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
