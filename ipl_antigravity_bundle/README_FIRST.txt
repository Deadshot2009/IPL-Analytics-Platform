# IPL Analytics — Antigravity handoff package

## Included files
- `prompts/ANTIGRAVITY_MASTER_PROMPT.txt` — paste this entire prompt into Google Antigravity.
- `data/IPL_Stage2_Integrated_Data.zip` — primary cleaned + feature-engineered source datasets.
- `data/IPL_Stage4_Insights_and_Visualizations.zip` — Stage 4 insight tables, charts, workbook, report and validation report.

## How to use
1. Extract this package to a folder on your computer.
2. Open Google Antigravity and create/open a new project folder, e.g. `IPL-Analytics-WebApp`.
3. Copy the two ZIP files from `data/` into the project folder (or a `data/` subfolder).
4. Open `ANTIGRAVITY_MASTER_PROMPT.txt`, copy all its contents, and paste into Antigravity.
5. Attach both ZIP files to the Antigravity task if the interface supports file attachments. Otherwise tell Antigravity their exact local paths.
6. Ask Antigravity to inspect the ZIPs first and then implement the complete working app.

## Important
The app must detect actual completed-match season coverage from the data. A schedule is not proof that a match was played. Keep the source archives unchanged.
