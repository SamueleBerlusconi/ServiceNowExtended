var HtmlStringUtils = Class.create();

HtmlStringUtils.CHARSET = {};

/**
 * The ASCII charset is the basic charset containing the most common characters for the english language.
 * 
 * This charset is a subset of only the characters that HTML cannot handle.
 */
HtmlStringUtils.CHARSET.ASCII = {
    "&": "&amp;", // Ampersand
    "\"": "&quot;", // Double quotation mark
    "<": "&lt;", // Less-than sign
    ">": "&gt;", // Greater-than sign
    "'": "&apos;" // Apostrophe (HTML5; not standard in HTML 4.01)
};

/**
 * The Latin 1 charset (ISO-8859-1) supports languages from Western Europe but not from Central or Eastern Europe.
 * 
 * This charset is a subset of the most common characters.
 */
HtmlStringUtils.CHARSET.LATIN_1 = {
    "À": "&Agrave;",
    "Á": "&Aacute;",
    "Â": "&Acirc;",
    "Ã": "&Atilde;",
    "Ä": "&Auml;",
    "Å": "&Aring;",
    "Æ": "&AElig;",
    "Ç": "&Ccedil;",
    "È": "&Egrave;",
    "É": "&Eacute;",
    "Ê": "&Ecirc;",
    "Ë": "&Euml;",
    "Ì": "&Igrave;",
    "Í": "&Iacute;",
    "Î": "&Icirc;",
    "Ï": "&Iuml;",
    "Ð": "&ETH;",
    "Ñ": "&Ntilde;",
    "Ò": "&Ograve;",
    "Ó": "&Oacute;",
    "Ô": "&Ocirc;",
    "Õ": "&Otilde;",
    "Ö": "&Ouml;",
    "Ø": "&Oslash;",
    "Ù": "&Ugrave;",
    "Ú": "&Uacute;",
    "Û": "&Ucirc;",
    "Ü": "&Uuml;",
    "Ý": "&Yacute;",
    "Þ": "&THORN;",
    "ß": "&szlig;",
    "à": "&agrave;",
    "á": "&aacute;",
    "â": "&acirc;",
    "ã": "&atilde;",
    "ä": "&auml;",
    "å": "&aring;",
    "æ": "&aelig;",
    "ç": "&ccedil;",
    "è": "&egrave;",
    "é": "&eacute;",
    "ê": "&ecirc;",
    "ë": "&euml;",
    "ì": "&igrave;",
    "í": "&iacute;",
    "î": "&icirc;",
    "ï": "&iuml;",
    "ð": "&eth;",
    "ñ": "&ntilde;",
    "ò": "&ograve;",
    "ó": "&oacute;",
    "ô": "&ocirc;",
    "õ": "&otilde;",
    "ö": "&ouml;",
    "ø": "&oslash;",
    "ù": "&ugrave;",
    "ú": "&uacute;",
    "û": "&ucirc;",
    "ü": "&uuml;",
    "ý": "&yacute;",
    "þ": "&thorn;",
    "ÿ": "&yuml;"
};

/**
 * The Latin 2 charset (ISO-8859-2) supports languages from Central and Eastern Europe but not from Western Europe.
 * 
 * This charset is a subset of the most common characters.
 */
HtmlStringUtils.CHARSET.LATIN_2 = {
    "Č": "&Ccaron;",
    "č": "&ccaron;",
    "Ď": "&Dcaron;",
    "ď": "&dcaron;",
    "Ě": "&Ecaron;",
    "ě": "&ecaron;",
    "Ī": "&Imacr;",
    "ī": "&imacr;",
    "Ľ": "&Lcaron;",
    "ľ": "&lcaron;",
    "Ń": "&Ntilde;",
    "ń": "&ntilde;",
    "Ř": "&Rcaron;",
    "ř": "&rcaron;",
    "Š": "&Scaron;",
    "š": "&scaron;",
    "Ť": "&Tcaron;",
    "ť": "&tcaron;",
    "Ů": "&Uring;",
    "ů": "&uring;",
    "Ÿ": "&Yuml;",
    "Ź": "&Zacute;",
    "ź": "&zacute;",
    "Ż": "&Zdot;",
    "ż": "&zdot;",
    "Ž": "&Zcaron;",
    "ž": "&zcaron;",
    "€": "&euro;", // Although technically part of ISO-8859-15, it's commonly used.
    "°": "&deg;",
    "²": "&sup2;",
    "³": "&sup3;",
    "¼": "&frac14;",
    "½": "&frac12;",
    "¾": "&frac34;",
    "×": "&times;",
    "÷": "&divide;",
    "±": "&plusmn;",
    "•": "&bull;",
    "¶": "&para;",
    "§": "&sect;",
    "©": "&copy;",
    "®": "&reg;",
    "™": "&trade;",
    "–": "&ndash;",
    "—": "&mdash;",
    "«": "&laquo;",
    "»": "&raquo;",
    "…": "&hellip;",
    "‰": "&permil;",
    "¡": "&iexcl;",
    "¿": "&iquest;"
};

/**
 * The UTF-8 charset is the most complete and supports almost all languages.
 * 
 * This charset is a subset of the most common characters.
 */
HtmlStringUtils.CHARSET.UTF8 = {
    "©": "&copy;",
    "®": "&reg;",
    "™": "&trade;",
    "€": "&euro;",
    "£": "&pound;",
    "¥": "&yen;",
    "¢": "&cent;",
    "§": "&sect;",
    "¶": "&para;",
    "•": "&bull;",
    "†": "&dagger;",
    "‡": "&Dagger;",
    "‰": "&permil;",
    "∞": "&infin;",
    "≠": "&ne;",
    "≤": "&le;",
    "≥": "&ge;",
    "√": "&radic;",
    "≈": "&asymp;",
    "±": "&plusmn;",
    "÷": "&divide;",
    "×": "&times;",
    "¬": "&not;",
    "°": "&deg;",
    "µ": "&micro;",
    "‾": "&oline;",
    "½": "&frac12;",
    "¼": "&frac14;",
    "¾": "&frac34;",
    "¹": "&sup1;",
    "²": "&sup2;",
    "³": "&sup3;",
    "æ": "&aelig;",
    "Æ": "&AElig;",
    "œ": "&oelig;",
    "Œ": "&OElig;",
    "ß": "&szlig;",
    "ñ": "&ntilde;",
    "Ñ": "&Ntilde;",
    "ç": "&ccedil;",
    "Ç": "&Ccedil;",
    "á": "&aacute;",
    "Á": "&Aacute;",
    "é": "&eacute;",
    "É": "&Eacute;",
    "í": "&iacute;",
    "Í": "&Iacute;",
    "ó": "&oacute;",
    "Ó": "&Oacute;",
    "ú": "&uacute;",
    "Ú": "&Uacute;",
    "à": "&agrave;",
    "À": "&Agrave;",
    "è": "&egrave;",
    "È": "&Egrave;",
    "ì": "&igrave;",
    "Ì": "&Igrave;",
    "ò": "&ograve;",
    "Ò": "&Ograve;",
    "ù": "&ugrave;",
    "Ù": "&Ugrave;",
    "â": "&acirc;",
    "Â": "&Acirc;",
    "ê": "&ecirc;",
    "Ê": "&Ecirc;",
    "î": "&icirc;",
    "Î": "&Icirc;",
    "ô": "&ocirc;",
    "Ô": "&Ocirc;",
    "û": "&ucirc;",
    "Û": "&Ucirc;",
    "ä": "&auml;",
    "Ä": "&Auml;",
    "ë": "&euml;",
    "Ë": "&Euml;",
    "ï": "&iuml;",
    "Ï": "&Iuml;",
    "ö": "&ouml;",
    "Ö": "&Ouml;",
    "ü": "&uuml;",
    "Ü": "&Uuml;",
    "ÿ": "&yuml;",
    "Ÿ": "&Yuml;",
    "ø": "&oslash;",
    "Ø": "&Oslash;",
    "å": "&aring;",
    "Å": "&Aring;"
};

/**
 * Handle characters encoding to avoid displaying corrupted or unsafe values into a HTML string.
 *
 * @author SamueleBerlusconi (GitHub: @SamueleBerlusconi)
 * @license Apache-2.0
 */
HtmlStringUtils.prototype = {
    initialize: function() {},

    /**
     * Encode a string with the provided charset.
     *
     * Available charsets are: ALL, ASCII, LATIN-1, LATIN-2, UTF-8.
     *
     * When ALL is defined as parameter, all the available charsets are used to encode the string.
     *
     * @param {String} str String to encode
     * @param {String} [charset] Name of the charset to use for the encoding (Default: ALL)
     * @returns {String} Encoded string with characters translated into HTML entities based on the charset selected
     */
    encode: function(str, charset) {
        // Fail fast if the provided string is empty
        if (gs.nil(str)) return "";

        // Verify if the requested charset exists
        var _charset = gs.nil(charset) ? "ALL" : charset.toUpperCase();
        var supportedCharset = Object.keys(HtmlStringUtils.CHARSET).includes(_charset);
        if (_charset != "ALL" && !supportedCharset) throw new Error("Invalid parameter: the requested charset (" + _charset + ") is not supported");

        // Prepare the context to use
        var context = {};
        context.entities = _charset === "ALL" ? this._joinCharsets(Object.keys(HtmlStringUtils.CHARSET)) : HtmlStringUtils.CHARSET[_charset];

        // Replace characters with HTML entities from the included charsets
        var regex = new RegExp("[" + Object.keys(context.entities).join("") + "]", "g");
        return str.replace(regex, this._replace.bind(context));
    },

    /**
     * Decode a string using the provided charset.
     *
     * Available charsets are: ALL, ASCII, LATIN-1, LATIN-2, UTF-8.
     *
     * When ALL is defined as parameter, all the available charsets are used to decode the string.
     *
     * @param {String} str String to decode
     * @param {String} [charset] Name of the charset to use for the decoding (Default: ALL)
     * @returns {String} Decoded string with HTML entities translated into characters based on the charset selected
     */
    decode: function(str, charset) {
        // Fail fast if the provided string is empty
        if (gs.nil(str)) return "";

        // Verify if the requested charset exists
        var _charset = gs.nil(charset) ? "ALL" : charset.toUpperCase();
        var supportedCharset = Object.keys(HtmlStringUtils.CHARSET).includes(_charset);
        if (_charset != "ALL" && !supportedCharset) throw new Error("Invalid parameter: the requested charset (" + _charset + ") is not supported");

        // In order to decode the string, we use the provided charsets but we need to invert the key/value pairs (&: &amp -> &amp: &)
        var charsetToInvert = _charset === "ALL" ? this._joinCharsets(Object.keys(HtmlStringUtils.CHARSET)) : HtmlStringUtils.CHARSET[_charset];

        // Prepare the context to use
        var context = {};
        context.entities = this._invertObjectKeysAndValues(charsetToInvert);

        // Replace characters with HTML entities from the included charsets
        var regex = new RegExp("[" + Object.keys(context.entities).join("") + "]", "g");
        return str.replace(regex, this._replace.bind(context));
    },

    /**
     * Replace the match value with the corresponding value in the defined charset.
     *
     * @param {String} match Value to find in the charset
     * @returns {String} Converted value
     */
    _replace: function(match) {
        var context = this;

        // If a conversion character is found return it,
        // otherwise return the original char
        return context.entities[match] || match;
    },

    /**
     * Merge multiple charset given an array of names.
     * 
     * @param {String[]} charsets Array of charset names from the HtmlStringUtils.CHARSET dictionary
     * @returns {object} Merged dictionary with unique pairs from all the provided charsets
     */
    _joinCharsets: function(charsets) {
        var merged = {};

        for (var i = 0; i < charsets.length; i++) {
            var name = charsets[i];
            var charset = HtmlStringUtils.CHARSET[name];

            // Skip the current charset if it doesn't exists
            if (!charset) continue;

            // Extract all the available charset's characters
            var keys = Object.keys(charset);

            for (var j = 0; j < keys.length; j++) {
                var key = keys[j];

                // Skip the current iteration if the key already exists
                if (merged[key]) continue;

                // Otherwise add the pair to the new dictionary
                merged[key] = charset[key];
            }
        }

        return merged;
    },

    /**
     * Given an object, invert keys and values.
     * 
     * Duplicate values will not be inserted in the inverted dictionary.
     */
    _invertObjectKeysAndValues: function(obj) {
        var inverted = {};

        var keys = Object.keys(obj);

        for (var i = 0; i < keys.length; i++) {
            // Extract values
            var key = keys[i];
            var value = obj[key];

            // Avoid duplicate keys in the inverted dictionary
            if (inverted[value]) continue;

            inverted[value] = key;
        }

        return inverted;
    },

    type: "HtmlStringUtils"
};
