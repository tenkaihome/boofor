import React, { useState } from "react";
import { Plus, X, User } from "lucide-react";
import { AuthorTab } from "@/hooks/useBookState";

interface AuthorTabsProps {
  tabs: AuthorTab[];
  activeTabId: string;
  activeAuthor: string;
  onSelectTab: (id: string) => void;
  onAddTab: () => void;
  onDeleteTab: (id: string, e: React.MouseEvent) => void;
  onRenameTab: (id: string, newName: string) => void;
}

export const AuthorTabs: React.FC<AuthorTabsProps> = ({
  tabs,
  activeTabId,
  activeAuthor,
  onSelectTab,
  onAddTab,
  onDeleteTab,
  onRenameTab,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleStartRename = (id: string, currentName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditValue(currentName);
  };

  const handleFinishRename = (id: string) => {
    if (editValue.trim()) {
      onRenameTab(id, editValue.trim());
    }
    setEditingId(null);
  };

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 pb-px mb-6 overflow-x-auto scrollbar-none">
      {/* Tabs list */}
      <div className="flex items-center gap-1">
        {tabs.map((tab) => {
          const isTabActive = tab.id === activeTabId;
          const displayName = isTabActive
            ? activeAuthor || "Tác giả mới"
            : tab.author || "Tác giả mới";

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              onDoubleClick={(e) => handleStartRename(tab.id, displayName, e)}
              className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-t-xl transition-all duration-200 cursor-pointer select-none border-t border-x ${
                isTabActive
                  ? "bg-white border-gray-200 text-indigo-600 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] translate-y-[1px] z-10 font-semibold"
                  : "bg-gray-150/70 border-transparent text-gray-500 hover:bg-gray-200/80 hover:text-gray-700 hover:translate-y-[-1px]"
              }`}
              style={{ minWidth: "140px", maxWidth: "220px" }}
            >
              {/* Tab Icon */}
              <User className={`w-3.5 h-3.5 flex-shrink-0 ${isTabActive ? "text-indigo-600" : "text-gray-400 group-hover:text-gray-500"}`} />

              {/* Editable Name Input or Text */}
              {editingId === tab.id ? (
                <input
                  type="text"
                  className="bg-transparent border-none focus:outline-none focus:ring-0 p-0 m-0 text-sm font-medium text-gray-900 border-b border-indigo-500 w-full focus:border-b-2"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleFinishRename(tab.id);
                    } else if (e.key === "Escape") {
                      setEditingId(null);
                    }
                  }}
                  onBlur={() => handleFinishRename(tab.id)}
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span className="truncate flex-grow text-left pr-4" title={displayName}>
                  {displayName}
                </span>
              )}

              {/* Delete Button */}
              {tabs.length > 1 && (
                <button
                  onClick={(e) => onDeleteTab(tab.id, e)}
                  className={`absolute right-2 p-0.5 rounded-full hover:bg-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 ${
                    isTabActive ? "opacity-60 text-gray-400" : "text-gray-400"
                  }`}
                  title="Đóng tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Tab Button */}
      <button
        onClick={onAddTab}
        className="flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-200 hover:text-indigo-600 hover:scale-105 transition-all duration-200 ml-1.5 cursor-pointer"
        title="Thêm tác giả mới"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};
