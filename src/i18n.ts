import joplin from 'api';
const fs = require('fs-extra');
const path = require('path');

/**
	@abstract Minimal gettext PO based translation support.

	The PO files live in "locales/<lang>.po" inside the plugin installation directory
	(copied there from src/locales by the build). The language follows the Joplin
	application locale (e.g. "ja_JP", "zh_TW"). Lookup order:
	exact locale -> language part -> English (the msgid itself).
 */

type Catalog = { [msgid: string]: string };

let catalog: Catalog = {};

/**
	@abstract Unescapes a C-style PO string literal content
 */
function unescapePo(s: string): string
{
	return s.replace(/\\(.)/g, (_m: string, c: string) =>
	{
		switch (c)
		{
			case 'n': return '\n';
			case 't': return '\t';
			case 'r': return '\r';
			default: return c;	// covers \" and \\
		}
	});
}

/**
	@abstract Parses the content of a PO file into a msgid -> msgstr map.
	Supports multi-line strings, comments and msgctxt-less singular entries.
	Empty translations and the header entry are skipped.
 */
export function parsePo(content: string): Catalog
{
	const result: Catalog = {};
	let msgid: string | null = null;
	let msgstr: string | null = null;
	let current: 'msgid' | 'msgstr' | null = null;

	const flush = () =>
	{
		if (msgid !== null && msgid !== '' && msgstr !== null && msgstr !== '')
		{
			result[msgid] = msgstr;
		}
		msgid = null;
		msgstr = null;
		current = null;
	};

	for (const rawLine of content.split(/\r?\n/))
	{
		const line = rawLine.trim();
		if (line === '' || line.startsWith('#'))
		{
			if (line === '') flush();
			continue;
		}

		let m: RegExpMatchArray | null;
		if ((m = line.match(/^msgid\s+"(.*)"$/)))
		{
			if (msgid !== null) flush();
			msgid = unescapePo(m[1]);
			current = 'msgid';
		}
		else if ((m = line.match(/^msgstr(?:\[0\])?\s+"(.*)"$/)))
		{
			msgstr = unescapePo(m[1]);
			current = 'msgstr';
		}
		else if ((m = line.match(/^"(.*)"$/)))
		{
			const part = unescapePo(m[1]);
			if (current === 'msgid' && msgid !== null) msgid += part;
			else if (current === 'msgstr' && msgstr !== null) msgstr += part;
		}
		else
		{
			// msgctxt, msgid_plural, msgstr[n>0] etc. are not used by this plugin
			current = null;
		}
	}
	flush();

	return result;
}

/**
	@abstract Returns candidate PO file base names for a given Joplin locale
 */
export function localeCandidates(locale: string): string[]
{
	if (!locale) return [];
	const normalized = locale.replace('-', '_');
	const lang = normalized.split('_')[0];
	return normalized === lang ? [ lang ] : [ normalized, lang ];
}

/**
	@abstract Loads the catalog matching the given locale from the locales directory.
	Returns an empty catalog (English) if no file matches or on errors.
 */
export async function loadCatalog(localesDir: string, locale: string): Promise<Catalog>
{
	for (const name of localeCandidates(locale))
	{
		const file = path.join(localesDir, `${name}.po`);
		try
		{
			if (await fs.pathExists(file))
			{
				return parsePo(await fs.readFile(file, 'utf-8'));
			}
		}
		catch (e)
		{
			console.error(`i18n: failed to load ${file}: ${e}`);
		}
	}
	return {};
}

/**
	@abstract Initializes translations according to the Joplin application locale
 */
export async function initI18n(): Promise<void>
{
	try
	{
		const locale: string = await joplin.settings.globalValue('locale');
		const dir = path.join(await joplin.plugins.installationDir(), 'locales');
		catalog = await loadCatalog(dir, locale);
		console.info(`i18n: locale "${locale}", ${Object.keys(catalog).length} translations loaded`);
	}
	catch (e)
	{
		console.error('i18n: initialization failed, using English: ' + e);
		catalog = {};
	}
}

/**
	@abstract Translates a message id, falling back to the id itself (English)
 */
export function _(msgid: string): string
{
	return catalog[msgid] || msgid;
}
