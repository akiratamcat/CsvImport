# Joplin CSV Import Plugin

> **About this fork (Csv Import i18n — personal test build)**
>
> This is a personal test build of the original [CsvImport](https://github.com/Mick2nd/CsvImport) plugin by Jürgen Habelt, with UI translation added using gettext PO files (`src/locales/*.po`). The UI language automatically follows the Joplin language setting (restart Joplin after changing it). Supported: Japanese, Chinese (Simplified / Traditional), Korean, German, French, Spanish, Italian, Portuguese (Brazil), Russian; other languages fall back to English. The plugin ID is `de.habelt.CsvImport.i18n`, so it can be installed side by side with the original. This build is not an official release.
>
> **このフォークについて（Csv Import i18n — 個人テスト版）**
>
> Jürgen Habelt 氏によるオリジナルの [CsvImport](https://github.com/Mick2nd/CsvImport) プラグインに、gettext の PO ファイル（`src/locales/*.po`）による UI 翻訳を追加した個人テスト版です。UI の言語は Joplin 本体の言語設定に自動で追従します（変更後は Joplin を再起動してください）。対応言語は日本語、中国語（簡体字・繁体字）、韓国語、ドイツ語、フランス語、スペイン語、イタリア語、ポルトガル語（ブラジル）、ロシア語で、それ以外の言語では英語で表示されます。プラグイン ID は `de.habelt.CsvImport.i18n` なので、オリジナル版と並べてインストールできます。公式リリースではありません。
>
> To add a language: copy `src/locales/csvimport.pot` to `src/locales/<lang>.po` (e.g. `pt_BR`, `ja`) and fill in `msgstr`. / 言語を追加するには `src/locales/csvimport.pot` を `src/locales/<言語>.po` にコピーして `msgstr` を埋めてください。

This plugin serves the insertion of a md table from CSV text from either the clipboard or a CSV file.
This plug-in can be used in either of 2 ways:

- You can import a CSV file by using the import command for CSV files:
  Invoke *File - Import - CSV File* and select the CSV file
- You can insert the content of the Clipboard interpreting it as CSV text by using the appropriate command *Paste CSV*:
  Copy the contents to the clipboard (from Excel for instance) and invoke the command *Edit - Paste CSV*

In either case the plug-in tries to interprete the text as CSV and builds a table from it. It uses a simple algorithm to determine the used delimiter. This self-recognition enables the use of 3 different delimiter characters (see: *CSV File Format*)

## CSV File Format

The items in a file line are separated by either of 3 delimiter characters:

- a *comma* **','**
- a *semi-colon* **';'**
- or a *tabulator* **'\t';**

The lines themselves are separated by an optional CARIAGE RETURN and a NEWLINE as usual.

The items in a line may be enclosed by *Double Quotes* enabling them to contain the separator character and escaped quotes.

The first line of the file / text is a header line with item names.

The file / text encoding is assumed to be *UTF-8*.

## Tests

The plugin was tested with  an Excel - exported csv file and with a sheet copied from Excel to the clipboard.

## Algorithm

Although the functionality is relatively simple, the program uses an ANTLR tool for grammatical analysis. In a first run it determines the most common delimiter. In the second run the grammar is analyzed based on this delimiter and the pieces of information are extracted (header, rows, fields) and transformed. I believe this way the program is kept from being too complicated.
