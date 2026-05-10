# Western Province Education Provider (WPEP) - AI Assistant Context

## Project Overview
An offline-first risk assessment tool for schools in the Solomon Islands.

## Technical Architecture
- **State Management:** React + IndexedDB (via `idb` library) for persistence.
- **Backend:** Supabase (Database + Auth + Storage).
- **AI Integration:** Google Gemini API (`@google/genai`) for disaster impact analysis in the `AnalysisDashboard`.
- **UI Components:** Lucide Icons, Framer Motion for animations, Tailwind CSS for styling.
- **Reporting:** `jspdf` and `html2canvas` for PDF generation, CSV export for data analysis.

## Key Files
- `src/lib/db.ts`: IndexedDB service layer.
- `src/App.tsx`: Main application containing the form, dashboard, and map.
- `src/supabase.ts`: Supabase configuration and helpers.
- `src/constants.ts`: School directory and initial form state.

## Operational Rules
- **Offline First:** Always save to IndexedDB before attempting cloud sync.
- **Permissions:** Check auth state before performing Supabase writes.
- **AI Analysis:** Use the `generateAISummary` function in `AnalysisDashboard` for situational intelligence.
