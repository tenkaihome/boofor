import React, { useState, useEffect } from "react";
import { Trash2, Copy, Check, TableProperties } from "lucide-react";
import { generateTOTP } from "@/utils/totp";

interface SplitterTabProps {
  splitterInput: string;
  setSplitterInput: (val: string) => void;
  copiedId: string | null;
  handleCopy: (text: string, id: string, isHtml?: boolean) => void;
}

interface FieldConfig {
  label: string;
  colIndex: number;
  splitChar?: string;
}

const FIELD_CONFIGS: FieldConfig[] = [
  { label: "STT", colIndex: 0 },
  { label: "Mail", colIndex: 1, splitChar: "|" },
  { label: "PASS", colIndex: 2 },
  { label: "2FA", colIndex: 3 },
  { label: "Very Bank", colIndex: 4 },
  { label: "MAIL KP", colIndex: 5 },
  { label: "PHONE", colIndex: 6, splitChar: "|" },
  { label: "RN", colIndex: 7 },
  { label: "AN", colIndex: 8 },
  { label: "NAME", colIndex: 9 },
  { label: "ADRESS", colIndex: 10, splitChar: "," },
  { label: "SSN", colIndex: 11 },
  { label: "PACK", colIndex: 12 },
  { label: "LINK BOOK", colIndex: 13 },
  { label: "PICE", colIndex: 15 },
  { label: "TAX", colIndex: 16 }
];

const US_STATES: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa",
  KS: "Kansas", KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland",
  MA: "Massachusetts", MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri",
  MT: "Montana", NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey",
  NM: "New Mexico", NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio",
  OK: "Oklahoma", OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
  DC: "District of Columbia", PR: "Puerto Rico"
};

function processAddressItems(items: string[]): string[] {
  const result: string[] = [];
  const stateZipRegex = /^([a-zA-Z]{2})\s+(\d+(?:\s*-\s*\d+)?)$/;
  const zipPlus4Regex = /^(\d+)\s*-\s*(\d+)$/;

  for (const item of items) {
    const trimmed = item.trim();
    const match = trimmed.match(stateZipRegex);
    if (match) {
      const stateAbbr = match[1].toUpperCase();
      const zipCode = match[2];
      const stateName = US_STATES[stateAbbr] || match[1];
      result.push(stateName);
      
      const zipMatch = zipCode.match(zipPlus4Regex);
      if (zipMatch) {
        result.push(zipMatch[1]);
        result.push(zipMatch[2]);
      } else {
        result.push(zipCode);
      }
    } else {
      const zipMatch = trimmed.match(zipPlus4Regex);
      if (zipMatch) {
        result.push(zipMatch[1]);
        result.push(zipMatch[2]);
      } else {
        result.push(trimmed);
      }
    }
  }
  return result;
}


interface TotpDisplayProps {
  secret: string;
  copiedId: string | null;
  handleCopy: (text: string, id: string) => void;
}

const TotpDisplay: React.FC<TotpDisplayProps> = ({
  secret,
  copiedId,
  handleCopy
}) => {
  const [code, setCode] = useState<string>("------");
  const [timeLeft, setTimeLeft] = useState<number>(30);

  useEffect(() => {
    if (!secret || secret.trim().length < 8) {
      setCode("Mã lỗi / Ngắn");
      return;
    }

    let active = true;

    const updateTotp = async () => {
      const res = await generateTOTP(secret);
      if (active) {
        setCode(res.code);
        setTimeLeft(res.timeLeft);
      }
    };

    updateTotp();
    const interval = setInterval(updateTotp, 1000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [secret]);

  const progressPercent = (timeLeft / 30) * 100;

  return (
    <div className="space-y-2 mt-2 bg-indigo-50/50 p-3 rounded-lg border border-indigo-100">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
          Mã 2FA Live
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-indigo-500 font-semibold">{timeLeft}s</span>
          <div className="w-8 h-1.5 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                timeLeft < 6 ? "bg-red-500 animate-pulse" : "bg-indigo-600"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      <button
        onClick={() => handleCopy(code, `totp-${secret}`)}
        className="w-full flex items-center justify-between bg-white hover:bg-indigo-100 active:bg-indigo-200 border border-indigo-200 hover:border-indigo-400 rounded-lg px-3 py-2 transition-all cursor-pointer text-left group"
        title="Click để copy mã 2FA"
      >
        <span className="text-xl font-mono font-bold tracking-widest text-indigo-700">
          {code}
        </span>
        <span className="shrink-0 text-indigo-400 group-hover:text-indigo-700 transition-colors">
          {copiedId === `totp-${secret}` ? (
            <Check className="w-4 h-4 text-green-600" />
          ) : (
            <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100" />
          )}
        </span>
      </button>
    </div>
  );
};

export const SplitterTab: React.FC<SplitterTabProps> = ({
  splitterInput,
  setSplitterInput,
  copiedId,
  handleCopy
}) => {
  // Split input into lines and take the first non-empty line
  const rows = splitterInput.split("\n").map(r => r.trim()).filter(r => r);
  const activeRow = rows[0] || "";
  // Split cells by tab character
  const columns = activeRow ? activeRow.split("\t").map(col => col.trim()) : [];

  const visibleConfigs = FIELD_CONFIGS.filter(config => {
    const rawValue = columns[config.colIndex] || "";
    return rawValue.trim() !== "";
  });

  return (
    <div className="space-y-6">
      {/* Top Input & Control Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <TableProperties className="w-5 h-5 text-indigo-600" />
              Sheet Column Splitter
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Dán một hàng dữ liệu từ Google Sheets/Excel (ngăn cách bằng phím Tab), hệ thống sẽ tự phân tách các cột và mục nhỏ.
            </p>
          </div>
          {splitterInput && (
            <button
              onClick={() => setSplitterInput("")}
              className="flex items-center gap-1.5 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer border border-red-200"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Reset / Clear
            </button>
          )}
        </div>

        <textarea
          rows={3}
          value={splitterInput}
          onChange={(e) => setSplitterInput(e.target.value)}
          placeholder="Dán hàng dữ liệu từ Sheet tại đây (Ví dụ: 103  muhammaduy95@gmail.com|DungGameRefundSTT176...)"
          className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-900 font-mono"
        />
      </div>

      {/* Grid of Parsed Cards */}
      {splitterInput ? (
        visibleConfigs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleConfigs.map((config, cardIdx) => {
              const rawValue = columns[config.colIndex] || "";
              // Split if splitChar exists
              let items = config.splitChar && rawValue
                ? rawValue.split(config.splitChar).map(item => item.trim()).filter(item => item)
                : [rawValue];

              if (config.label === "ADRESS") {
                items = processAddressItems(items);
              }

              return (
                <div
                  key={cardIdx}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between"
                >
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                      {config.label}
                    </h3>
                    <div className="space-y-2">
                      {items.map((item, itemIdx) => {
                        const copyKey = `splitter-${config.label}-${itemIdx}`;
                        return (
                          <button
                            key={itemIdx}
                            onClick={() => handleCopy(item, copyKey)}
                            className="w-full flex items-center justify-between gap-2 bg-gray-50 hover:bg-indigo-50 active:bg-indigo-100 border border-gray-200 hover:border-indigo-300 rounded-lg px-3 py-2 text-sm text-gray-800 font-medium transition-all cursor-pointer text-left group"
                            title={`Click to copy: ${item}`}
                          >
                            <span className="flex-1 min-w-0 truncate select-all">{item}</span>
                            <span className="shrink-0 text-gray-400 group-hover:text-indigo-600 transition-colors">
                              {copiedId === copyKey ? (
                                <Check className="w-4 h-4 text-green-600 animate-scale" />
                              ) : (
                                <Copy className="w-4 h-4 opacity-50 group-hover:opacity-100" />
                              )}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Render Live TOTP code if it is the 2FA key field */}
                    {config.label === "2FA" && rawValue && (
                      <TotpDisplay
                        secret={rawValue}
                        copiedId={copiedId}
                        handleCopy={handleCopy}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 text-sm">
            Tất cả các cột dữ liệu đều trống.
          </div>
        )
      ) : (
        <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center text-gray-400 text-sm">
          Vui lòng dán dữ liệu hàng từ Sheet để bắt đầu phân tách.
        </div>
      )}
    </div>
  );
};
