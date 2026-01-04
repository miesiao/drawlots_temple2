
# 行天宮線上求籤 AI 版

這是一個基於 Vite + React + TypeScript 打造的響應式求籤網站。結合了 Google Gemini AI 技術來處理稟告內容，並完整重現了傳統的抽籤與擲筊流程。

## 功能特色

- **AI 稟告處理**：模擬語音稟告，透過 Gemini 3 Flash 模型自動萃取資訊。
- **傳統求籤流程**：從稟告、搖籤筒、看籤號到擲筊確認，完整復刻。
- **戲劇性擲筊**：內建機率引擎，模擬真實擲筊的隨機性與挑戰感。
- **籤詩下載**：內建 Canvas 產圖功能，可將靈籤保存為 PNG 圖片。
- **功德簿**：透過 LocalStorage 儲存歷史紀錄，隨時翻閱。
- **響應式設計**：完美適配桌機與手機瀏覽。

## 快速開始

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **設定環境變數**
   在專案根目錄建立 `.env.local` 並填入您的 Gemini API Key：
   ```env
   GEMINI_API_KEY=您的金鑰
   ```

3. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

4. **建置專案**
   ```bash
   npm run build
   ```

## 技術棧

- **核心**: React 18, TypeScript, Vite
- **AI**: @google/genai (Gemini 3 Flash Preview)
- **UI**: Tailwind CSS, Lucide React
- **Icons**: Lucide
- **Fonts**: Google Fonts (Noto Serif TC, Noto Sans TC)
