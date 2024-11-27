/**
 * Polyfill utility methods to be used on the Server Side of ServiceNow.
 *
 * Use by writing `gs.includes("DatePolyfill")` before using the methods.
 *
 * @author Samuele Berlusconi (GitHub: @SamueleBerlusconi)
 * @license Apache-2.0
 */

/**
 * Add or remove days from the current Date.
 * 
 * @param {Number} days - Positive or negative number of days to add/remove from the current date
 * @returns {Date}
 */
Date.prototype.addDays = function(days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
};

/**
 * Get the current week's Monday.
 * 
 * @returns {Date}
 */
Date.prototype.getMonday = function() {
    var date = new Date(this.valueOf());
    var day = date.getDay();
    var diff = day === 0 ? 6 : (day - 1); // Adjust when day is sunday
    date.setDate(date.getDate() - diff);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Get the current week's Sunday.
 * 
 * @returns {Date}
 */
Date.prototype.getSunday = function() {
    var date = new Date(this.valueOf());
    var day = date.getDay();
    /**
     * Given the date.getDay() map:
     * | M | T | W | T | F | S | S |
     * | 1 | 2 | 3 | 4 | 5 | 6 | 0 |
     * 
     * a. 7 - date.getDay()
     * | 6 | 5 | 4 | 3 | 2 | 1 | 7 |
     * 
     * b. if (diff == 7) diff = 0;
     * | 6 | 5 | 4 | 3 | 2 | 1 | 0 |
     */
    var diff = 7 - date.getDay();
    if (diff === 7) diff = 0; // Adjust when day is sunday
    date.setDate(date.getDate() + diff);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
};

/**
 * Get the current month first day.
 * 
 * @returns {Date}
 */
Date.prototype.getFirstDayOfMonth = function() {
    return new Date(this.getFullYear(), this.getMonth(), 1);
};

/**
 * Get the current month last day.
 * 
 * @returns {Date}
 */
Date.prototype.getLastDayOfMonth = function() {
    return new Date(this.getFullYear(), this.getMonth() + 1, 0);
};

/**
 * Convert a native Javascript Date object into the equivalent GlideDateTime object.
 * 
 * All times are converted in UTC so there is no timezone correction applied.
 * 
 * @returns {GlideDateTime} Converted date object
 */
Date.prototype.toGlideDateTime = function() {
    /**
     * Prepend "0" to a value if lesser than 10.
     */
    function zero(n) { return n < 10 ? "0" + n : n; }

    // Extract date and time components from the Date object
    var year = this.getUTCFullYear();
    var month = this.getUTCMonth() + 1; // Javascript months go from 0 to 11 so we need to add 1
    var day = this.getUTCDate();
    var hours = this.getUTCHours();
    var minutes = this.getUTCMinutes();
    var seconds = this.getUTCSeconds();

    // Format the data into the GlideDateTime format yyyy-MM-dd HH:mm:ss
    var dateTimeString = year + "-" + zero(month) + "-" + zero(day) + " " + zero(hours) + ":" + zero(minutes) + ":" + zero(seconds);

    // Build a new GlideDateTime object using the formated string
    return new GlideDateTime(dateTimeString + " UTC");
};

/**
 * Convert a GlideDate or GlideDateTime object into the equivalent Javascript Date object.
 * 
 * All times are converted in UTC so there is no timezone correction applied.
 * 
 * @param {GlideDate|GlideDateTime} date - GlideDateTime object to convert to native Date
 * @returns {Date} Converted date object
 */
Date.prototype.fromGlide = function(date) {
    /**
     * Prepend "0" to a value if lesser than 10.
     */
    function zero(n) { return n < 10 ? "0" + n : n; }

    // Check the type of parameter to differentiate between GlideDate and GlideDateTime objects
    // Note that, as GlideDateTime extends GlideDate (strange hierarchy, I know), both the
    // classes will be instances of GlideDateTime but only GlideDate will be instace of GlideDate
    var isGlideDate = date instanceof GlideDate;

    // Extract date and time components from the Date object
    var year = date.getYearUTC();
    var month = date.getMonthUTC();
    var day = date.getDayOfMonthUTC();
    var hours = !isGlideDate ? date.getTime().getHourOfDayUTC() : 0;
    var minutes = !isGlideDate ? date.getTime().getMinutesUTC() : 0;
    var seconds = !isGlideDate ? date.getTime().getSeconds() : 0;

    // Format the data into the UTC Date format yyyy-MM-ddTHH:mm:ssZ
    var dateTimeString = year + "-" + zero(month) + "-" + zero(day) + "T" + zero(hours) + ":" + zero(minutes) + ":" + zero(seconds) + "Z";

    // Build a new GlideDateTime object using the formated string
    return new Date(dateTimeString);
};

/**
 * Check if the current date is set at midnight on the local time.
 */
Date.prototype.isMidnight = function() {
    // Return true when the time of the date is zero
    return this.getHours() === 0 &&
        this.getMinutes() === 0 &&
        this.getSeconds() === 0;
};

/**
 * Get the number of days between the current Date object and the provided one.
 * 
 * @author Michael Liu
 * @see https://stackoverflow.com/a/11252167
 * @param {Date} date - Date object to compare with the current one
 * @returns {number} Number of days between the dates
 */
Date.prototype.getDiffDays = function(date) {
    var MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

    var _date = _toMidnight(date.toUTC());
    var _current = _toMidnight(this.toUTC());

    function _toMidnight(date) {
        // If the date is already at midnight, avoid update it or it will display the midnight of the previous day
        if (date.isMidnight()) return date;

        // Set the current date to midnight of the current day
        date.setHours(0, 0, 0);

        return date;
    }

    return Math.floor((_date - _current) / MILLISECONDS_PER_DAY);
};

/**
 * Get the number of days in the current month.
 * 
 * @returns {Number}
 */
Date.prototype.getMonthDays = function() {
    return new Date(this.getFullYear(), this.getMonth() + 1, 0).getDate();
};

/**
 * Obtains the last Sunday in the month.
 *
 * @returns {Date} Last Sunday of the current date month
 */
Date.prototype.getLastSunday = function () {
	var utc = Date.UTC(this.getUTCFullYear(), this.getUTCMonth() + 1, 0);
	var date = new Date(utc); // Get the last day of the month (UTC)
  date.setUTCDate(date.getUTCDate() - date.getUTCDay()); // Subtract current week days to the total amount of month days
  return date;
};

/**
 * Get the current day name in the desired language (if supported).
 * 
 * As the Rhino engine was released before the implementation of the locale options
 * for the Internalization API (see https://stackoverflow.com/a/22469193), it's 
 * necessary to convert the current day number to the equivalent day's name, than
 * translating into into the desired language (if a translaction is available)
 *
 * @param {String} [language] Language used to translate the name (Default: en)
 * @returns {String} Name of the current day
 */
Date.prototype.getDayName = function(language) {
	// Get the current day number
	var DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
	var today = DAY_NAMES[this.getDay()];

  return gs.getMessageLang(today, language || "en");
};

/**
 * Get the current month name in the desired language (if supported).
 * 
 * As the Rhino engine was released before the implementation of the locale options
 * for the Internalization API (see https://stackoverflow.com/a/22469193), it's 
 * necessary to convert the current month number to the equivalent month's name, than
 * translating into into the desired language (if a translaction is available)
 *
 * @param {String} [language] Language used to translate the name (Default: en)
 * @returns {String} Name of the current month
 */
Date.prototype.getMonthName = function(language) {
	// Get the current month number
	var MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
	var today = MONTH_NAMES[this.getMonth()];

  return gs.getMessageLang(today, language || "en");
};

/**
 * Get a new Date based on the current one with the desired timezone offset in minutes.
 * 
 * @param {Number} minutes - Minutes to add from the current date (remove if the value is negative)
 * @returns {Date} New date with the applied offset
 */
Date.prototype.setTimezoneOffset = function(minutes) {
    // Transform the minutes in milliseconds
    var tzDifference = minutes * 60 * 1000;

    // Create a new Date with the desired offset
    return new Date(this.getTime() + tzDifference);
};

/**
 * Convert a local date into the equivalent UTC/GMT one.
 * 
 * Note: The date will always indicate the server timezone even if the date is correctly set as UCT/GMT.
 * 
 * @returns {Date} New date in the GMT timezone
 */
Date.prototype.toUTC = function() {
    var date = new Date(this.valueOf());

    var offset = date.getTimezoneOffset();

    return date.setTimezoneOffset(offset);
};

/**
 * Transform the date into a string using the provided format.
 * 
 * Available placeholders:
 * ##### Date Values
 * - D: Day without padding (i.e. 1-31)
 * - DD: Two digit day number (i.e. 01-31)
 * - ddd: Abbreviation of week day (i.e. Mon)
 * - dddd: Full name of week day (i.e. Monday)
 * - M: Month without padding (i.e. 1-12)
 * - MM: Two digit month number (i.e. 01-12)
 * - YY: Decade only year value (i.e. 24)
 * - YYYY: Full year value (i.e. 2024)
 * ##### Time Values
 * - H: Hours without padding (24h format, i.e. 0-23)
 * - HH: Two digit hours (24h format, i.e. 0-23)
 * - h: Hours without padding (12h format, i.e. 1-12)
 * - hh: Two digit hours (12h format, i.e. 01-12)
 * - m: Minutes without padding (i.e. 0-59)
 * - mm: Two digit minutes (i.e. 00-59)
 * - s: Seconds without padding (i.e. 0-59)
 * - ss: Two digit seconds (i.e. 00-59)
 * - ssss: Milliseconds without padding (i.e. 0-999)
 * - A: Uppercase Antimeridian/Postmeridian indicator (i.e. AM, PM)
 * - a: Lowercase Antimeridian/Postmeridian indicator (i.e. am, pm)
 * 
 * @param {String} format Date formatting using one or more of the allowed placeholders
 * @returns {String} Formatted datetimestamp
 */
Date.prototype.format = function (format) {
	/**
   * Prepend "0" to a value if lesser than 10.
   */
  function zero(n) { return n < 10 ? "0" + n : n; }

	function hasPlaceholder (placeholder) { return new RegExp("\\b" + placeholder + "\\b", "gm").test(format); }

	function replacePlaceholder(placeholder, value) { format = format.replace(new RegExp("\\b" + placeholder + "\\b", "gm"), value); }

	// Handle day placeholder
	if (hasPlaceholder("dddd")) replacePlaceholder("dddd", this.getDayName());
	if (hasPlaceholder("ddd")) replacePlaceholder("ddd", this.getDayName().substring(0, 3));

	if (hasPlaceholder("DD")) replacePlaceholder("DD", zero(this.getDate()));
	if (hasPlaceholder("D")) replacePlaceholder("D", this.getDate());

	// Handle month placeholder
	if (hasPlaceholder("MM")) replacePlaceholder("MM", zero(this.getMonth() + 1));
	if (hasPlaceholder("M")) replacePlaceholder("M", this.getMonth() + 1);

	// Handle year placeholder
	if (hasPlaceholder("YYYY")) replacePlaceholder("YYYY", this.getFullYear());
	if (hasPlaceholder("YY")) replacePlaceholder("YY", zero(this.getFullYear() % 100));

	// Handle hours placeholder
	var hours = this.getHours();
	if (hasPlaceholder("HH")) replacePlaceholder("HH", zero(hours));
	if (hasPlaceholder("H")) replacePlaceholder("H", hours);

	if (hasPlaceholder("hh")) replacePlaceholder("hh", zero(hours >= 12 ? hours - 12 : hours));
	if (hasPlaceholder("h")) replacePlaceholder("h", hours >= 12 ? hours - 12 : hours);

	// Handle minutes placeholder
	if (hasPlaceholder("mm")) replacePlaceholder("mm", zero(this.getMinutes()));
	if (hasPlaceholder("m")) replacePlaceholder("m", this.getMinutes());

	// Handle milliseconds
	if (hasPlaceholder("ssss")) replacePlaceholder("ssss", this.getMilliseconds());

	// Handle seconds placeholder
	if (hasPlaceholder("ss")) replacePlaceholder("ss", zero(this.getSeconds()));
	if (hasPlaceholder("s")) replacePlaceholder("s", this.getSeconds());

	// Handle Antimeridian/Postmeridian indicator
	if (hasPlaceholder("A")) replacePlaceholder("A", hours > 12 ? "PM" : "AM");
	if (hasPlaceholder("a")) replacePlaceholder("a", hours > 12 ? "pm" : "am");

	return format;
};

/**
 * Verify if DST (Daylight Saving Time) is in effect.
 * 
 * Get the timezone of the current machine (ServiceNow Servers)
 * 
 * @author Sheldon Griffin
 * @see https://stackoverflow.com/a/11888430
 * @returns {Boolean} True when DST in effect, false otherwise
 */
Date.prototype.isDST = function () {
	var jan = new Date(this.getFullYear(), 0, 1);
  var jul = new Date(this.getFullYear(), 6, 1);
	
  var stdTimeZone = Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());

	return this.getTimezoneOffset() < stdTimeZone;
};

/**
 * Verify if DST (Daylight Saving Time) is in effect for the European continent.
 * 
 * This is useful when we need to check server-side DST for timezone different than the one
 * where the ServiceNow server is located (Los Angeles UTC-7).
 * 
 * @param {number} [offset] Offset minutes used to handle timezones in the European continent (Default: Current date offset)
 * @returns {Boolean} True when DST in effect, false otherwise
 */
Date.prototype.isEuropeDST = function (offset) {
	// Set the offset value if not provided
	offset = offset || this.getTimezoneOffset();

	// Calculate starting and ending date for DST in Europe
	var startDST = new Date(this.getUTCFullYear(), 2).getLastSunday(); // March
	startDST.setUTCHours(1, 0, 0, 0); // Start DST at 01:00 UTC

	var endDST = new Date(this.getUTCFullYear(), 9).getLastSunday(); // October
	endDST.setUTCHours(1, 0, 0, 0); // End DST at 01:00 UTC

  // Adapt the date to the current timezone (the value is the same if no offset is provided)
  var localDate = this.setTimezoneOffset(offset);

  // Verify if the dtae is between the starting and ending date for european DST
  return startDST <= localDate && localDate < endDST;
};
