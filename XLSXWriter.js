/**
 * !!! This script is a WIP, do not use in production as untested !!!
 *
 * @author Samuele Berlusconi (GitHub: @SamueleBerlusconi)
 * @license Apache-2.0
 */
var XLSWriter = {};

XLSWriter.Writer = Class.create();
XLSWriter.Writer.prototype = {
    initialize: function() {
		this.FILE_EXTENSION = "xls";
		this.sheets = [];

		// Include extended methods for the Array objects
		var ArrayPolyfiller = new global.ArrayExtendedPolyfill();
		ArrayPolyfiller.get();
		ArrayPolyfiller.flat();
		ArrayPolyfiller.unique();
    },

	addSheet: function (sheet) {
		var isSheet = sheet instanceof XLSWriter.Sheet;
		if (!isSheet) throw new TypeError("Invalid parameter: sheet must be a XLSWriter.Sheet object");

		this.sheets.push(sheet);
	},

	removeSheet: function (sheet) {
		var isSheet = sheet instanceof XLSWriter.Sheet;
		if (!isSheet) throw new TypeError("Invalid parameter: sheet must be a XLSWriter.Sheet object");

		var index = this.sheets.indexOf(sheet);
		this.sheets.splice(index, 1);
	},

	write: function (table, sys_id, filename) {
		var record = new GlideRecord(table);
		var exists = record.get(sys_id);

		if (!exists) throw new Error("Invalid record: no record exists in table " + table + " with SysID " + sys_id);

		if (!filename) filename = "file.xls";
		if (!filename.endsWith("." + this.FILE_EXTENSION)) filename += "." + this.FILE_EXTENSION;

		var attachment = new GlideSysAttachment();
        return attachment.write(record, filename, "application/vnd.ms-excel", this._xml());
	},

	_xml: function () {
		var sheets = this.sheets.map(function (s) { return s._xml(); });

		// Parse all the fonts in the sheet
		var rows = this.sheets.get("_rows").flat();
		var cells = rows.get("_cells").flat();
		var fonts = cells.get("_font").flat().unique().filter(Boolean);

		var sfonts = fonts.map(function (f) { return f._xml(); });

		var data = 
		'<?xml version="1.0"?>' + 
		'<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
			'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
			'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
			'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
			'xmlns:html="http://www.w3.org/TR/REC-html40">' +

			'<Styles>' +
				sfonts.join("\n") +
			'</Styles>' +

			sheets.join("\n") + 
		'</Workbook>';

		return data;
	},

    type: "XLSWriter"
};

XLSWriter.Sheet = Class.create();
XLSWriter.Sheet.prototype = {
    initialize: function(name) {
		this._name = name || "Sheet";
		this._rows = [];
	},

	// Property Getters
	get name() { return this._name; },
	get rows() { return this._rows; },

	// Property Setters
	set name(value) { this._name = value; },

	addRow: function (row) {
		var isRow = row instanceof XLSWriter.Row;
		if (!isRow) throw new TypeError("Invalid parameter: row must be a XLSWriter.Row object");

		row._sheet = this;
		this._rows.push(row);
	},

	removeRow: function (row) {
		var isRow = row instanceof XLSWriter.Row;
		if (!isRow) throw new TypeError("Invalid parameter: row must be a XLSWriter.Row object");

		var index = this._rows.indexOf(row);
		this._rows[index]._sheet = null;
		this._rows.splice(index, 1);
	},

	_xml: function () {
		var name = 'ss:Name="' + this._name + '"';
		var rows = this._rows.map(function (r) { return r._xml(); });

		var data = 
		'<Worksheet ' + name + '>' + 
			'<Table>' +
				rows.join("\n") + 
			'</Table>' + 
		'</Worksheet>';

		return data;
	},

    type: "Sheet"
};

XLSWriter.Row = Class.create();
XLSWriter.Row.prototype = {
    initialize: function() {
		this._cells = [];
		this._sheet = null;
	},

	// Property Getters
	get cells() { return this._cells; },
	get sheet() { return this._sheet; },

	addCell: function (cell) {
		var isCell = cell instanceof XLSWriter.Cell;
		if (!isCell) throw new TypeError("Invalid parameter: cell must be a XLSWriter.Cell object");

		cell._row = this;
		this._cells.push(cell);
	},

	removeCell: function (cell) {
		var isCell = cell instanceof XLSWriter.Cell;
		if (!isCell) throw new TypeError("Invalid parameter: cell must be a XLSWriter.Cell object");

		var index = this._cells.indexOf(cell);
		this._cells[index]._row = null;
		this._cells.splice(index, 1);
	},

	_xml: function () {
		var cells = this._cells.map(function (c) { return c._xml(); });

		var data = '<Row>' + cells.join("\n") + '</Row>';

		return data;
	},

    type: "Row"
};

XLSWriter.Cell = Class.create();
XLSWriter.Cell.prototype = {
    initialize: function(text) {
		this._text = text || "";
		this._cellType = "String";
		this._font = null;
		this._row = null;
	},

	// Property Getters
	get text() { return this._text; },
	get cellType() { return this._cellType; },
	get font() { return this._font; },
	get row() { return this._row; },

	// Property Setters
	set text(value) { this._text = value; },
	set cellType(value) { this._cellType = value; },
	set font(value) { this._font = value; },

	_xml: function () {
		var font = !gs.nil(this._font) ? 'ss:StyleID="' + this._font._id + '"' : "";

		var data = 
		'<Cell ' + font + '>' +
			'<Data ss:Type="' + this._cellType + '" >' +
				this._text + 
			'</Data>' + 
		'</Cell>';

		return data;
	},

    type: "Cell"
};

XLSWriter.Font = Class.create();
XLSWriter.Font.prototype = {
    initialize: function(id) {
		if (gs.nil(id)) throw TypeError("Invalid parameter: the 'id' parameter must be defined");

		this._id = "f" + id;
		this._bold = false;
		this._italic = false;
		this._strike = false;
		this._underline = null;
		this._name = "";
		this._size = "";
		this._color = "";
	},

	// Property Getters
	get bold() { return this._bold; },
	get italic() { return this._italic; },
	get strike() { return this._strike; },
	get underline() { return this._underline; },
	get name() { return this._name; },
	get size() { return this._size; },
	get color() { return this._color; },

	// Property Setters
	set bold(value) { this._bold = value; },
	set italic(value) { this._italic = value; },
	set strike(value) { this._strike = value; },
	/**
	 * Could be "Single", "Double" or null.
	 */
	set underline(value) { this._underline = value; },
	set name(value) { this._name = value; },
	/**
	 * Pixel size in number.
	 */
	set size(value) { this._size = value; },
	/**
	 * Must be hexadecimal.
	 */
	set color(value) { this._color = value; },

	_xml: function () {
		var attributes = [];

		if (this._bold) attributes.push('ss:Bold="1"');
		if (this._italic) attributes.push('ss:Italic="1"');
		if (this._strike) attributes.push('ss:StrikeThrough="1"');
		if (this._underline) attributes.push('ss:Underline="' + this._underline + '"');
		if (this._name) attributes.push('ss:FontName="' + this._name + '"');
		if (this._size) attributes.push('ss:Size="'+ this._size + '"');
		if (this._color) attributes.push('ss:Color="' + this._color + '"');

		var data = 
		'<Style ss:ID="' + this._id + '">' +
			'<Font ' + attributes.join(" ") + '/>' +
		'</Style>';

		return data;
	},

    type: "Font"
};

/*

var xmlData = '<?xml version="1.0"?>' + 
			'<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" ' +
					'xmlns:o="urn:schemas-microsoft-com:office:office" ' +
					'xmlns:x="urn:schemas-microsoft-com:office:excel" ' +
					'xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet" ' +
					'xmlns:html="http://www.w3.org/TR/REC-html40">' +

				'<Styles>' +
					'<Style ss:ID="sBold">' +
						'<Font ss:Bold="1"/>' +
					'</Style>' +
				'</Styles>' +

				'<Worksheet ss:Name="Sheet1">' +
					'<Table>' +
					'<Row>' +
						'<Cell ss:StyleID="sBold"><Data ss:Type="String">Header 1</Data></Cell>' +
						'<Cell ss:StyleID="sBold"><Data ss:Type="String">Header 2</Data></Cell>' +
						'<Cell ss:StyleID="sBold"><Data ss:Type="String">Header 3</Data></Cell>' +
					'</Row>' +
					'<Row>' +
						'<Cell><Data ss:Type="String">Valore 1</Data></Cell>' +
						'<Cell><Data ss:Type="String">Valore 2</Data></Cell>' +
						'<Cell><Data ss:Type="String">Valore 3</Data></Cell>' +
					'</Row>' +
					'<Row>' +
						'<Cell><Data ss:Type="String">Valore 4</Data></Cell>' +
						'<Cell><Data ss:Type="String">Valore 5</Data></Cell>' +
						'<Cell><Data ss:Type="String">Valore 6</Data></Cell>' +
					'</Row>' +
					'</Table>' +

					'<WorksheetOptions xmlns="urn:schemas-microsoft-com:office:excel">' +
						'<FreezePanes/>' +
						'<FrozenNoSplit/>' +
						'<SplitHorizontal>1</SplitHorizontal>' +
						'<TopRowBottomPane>2</TopRowBottomPane>' +
					'</WorksheetOptions>' +
				'</Worksheet>' +
			'</Workbook>';

*/
