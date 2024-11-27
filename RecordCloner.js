var RecordCloner = Class.create();

/**
 * Utility class used to clone records from one table to another.
 *
 * @author Samuele Berlusconi (GitHub: @SamueleBerlusconi)
 * @license Apache-2.0
 */
RecordCloner.prototype = {
    /**
     * Utility class used to clone records from one table to another.
     * 
     * @param {String} source Source table where read the records to clone.
     * @param {String} [target] Target table where write the cloned records. If not specified, the target table is the source table.
     */
    initialize: function(source, target) {
        // Validate parameter
        if (typeof source != "string" || gs.nil(source) || !gs.tableExists(source)) throw new Error("Invalid parameter: the 'source' table is invalid, empty or not existent");
        if (typeof target == "string" && !gs.nil(target) && !gs.tableExists(target)) throw new Error("Invalid parameter: the 'target' table does not exists");

        /**
         * Source table where read the records to clone.
         */
        this.source = source;

        /**
         * Target table where write the cloned records.
         * 
         * If not specified, the target table is the source table.
         */
        this.target = target || source;

        /**
         * Fields excluded from the cloning operation.
         */
        this.excludedFields = [];
    },

    /* ################### Start Public Methods ################### */

    /**
     * Set the subset of fields in the source table that needs to be cloned.
     * 
     * No system field will be cloned even if specified.
     * 
     * Leave the array empty to allow all the fields to be cloned.
     * 
     * @param {String[]} [fields] Array of fields name to clone. Leave empty or undefined to allow all fields.
     */
    allowFields: function(fields) {
        // If the array is empty, allow all the fields to be cloned
        if (gs.nil(fields) || fields.length === 0) {
            this.excludedFields = [];
            return;
        }

        // Get all the fields' names from the source table
        var excludeFields = this._getFieldNames(this.source);

        // Ignore system fields, they will be excluded later
        excludeFields = excludeFields.filter(function(f) { return !f.startsWith("sys_"); });

        // Ignore the fields that we need to allow
        excludeFields = excludeFields.filter(function(f) { return fields.indexOf(f) == -1; });

        // Set all these names as excluded except the requested names
        this.denyFields(excludeFields);
    },

    /**
     * Set the subset of fields in the surce table that needs to be excluded from the cloning operation.
     * 
     * System fields are already excluded by default.
     * 
     * @param {String[]} fields Array fo fields name to exclude from the cloning operation.
     */
    denyFields: function(fields) {
        function lowerPush(field) {
            // Make the field lowercase
            var lower = field.toLowerCase();

            // Push the name in the excluded array
            this.excludedFields.push(lower);
        }

        // Reset the array of excluded fields
        this.excludedFields = [];

        // Make all the fields uppercase and push them in the array
        fields.forEach(lowerPush.bind(this));
    },

    /**
     * Clone the records massively.
     * 
     * @param {SysID[]} array Array of SysID (string) to clone
     * @return {object[]} Array of objects containing the results of every cloning operation
     */
    clone: function(array) {
        // Validate the records array
        if (gs.nil(array) || typeof array != "object" || gs.nil(array.length)) throw new Error("Invalid parameter: the 'array' parameter is invalid, undefined or not an array object");

        // Exclude fields with mismatching type between the tables
        this._excludeFieldsWithMismatchingType();

        /**
         * Result object containing the result of the whole cloning operation.
         */
        var result = {};
        result.source_table = this.source;
        result.target_table = this.target;
        result.excluded_fields = this.excludedFields;

        /**
         * Array containing the result of all the single cloning operations.
         */
        result.operations = [];

        for (var i = 0; i < array.length; i++) {
            // Create the log object for this cloning iteration
            var log = {};

            // Extract the current SysID
            var current = array[i];
            log.source = current; // The original record

            // Read the record and get the data to clone
            var data = this._read(current);
            if (gs.nil(data)) log.message = "Source record not found";

            // Clone the record
            var sys_id = !gs.nil(data) ? this._write(data) : null;
            log.target = sys_id; // The target record (if any)
            if (gs.nil(sys_id) && gs.nil(log.message)) log.message = "Cannot create the target record";

            // Complete the log object
            log.success = !gs.nil(log.target); // The success of this cloning iteration
            if (gs.nil(log.message)) log.message = "Record cloned";
            result.operations.push(log);
        }

        return result;
    },

    /* #################### End Public Methods #################### */

    /* ################### Start Private Methods ################### */

    /**
     * Get all the fields' names for a specific table.
     *
     * Include system fields.
     *
     * @param {String} table Table for ehich retrieve the fields
     * @return {String[]} List of available fields in a record of the table
     */
    _getFieldNames: function(table) {
        // Initialize a mocked record with the fields
        var grRecord = new GlideRecord(table);
        grRecord.initialize();

        // Get all the fields' names as properties of the object
        return Object.keys(grRecord);
    },

    /**
     * Verify that, between two different source and target table, the fields with the same name also have the same internal type. Exclude the mismatching fields.
     */
    _excludeFieldsWithMismatchingType: function() {
        // Ignore this check if the source and target tables are the same
        if (this.source === this.target) return;

        // Get all the fields' names from the source and target tables but retain only the common ones
        var Array = new ArrayUtil();
        var fields = Array.intersect(this._getFieldNames(this.source), this._getFieldNames(this.target));

        // Now create two mocked records, one for the source table, the other for the target
        var grSource = new GlideRecord(this.source);
        var grTarget = new GlideRecord(this.target);
        grSource.initialize();
        grTarget.initialize();

        // Iterate for every common field found and verify that the field
        // with the same name also has the same internal type, otherwise
        // exclude that field
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];
            var sourceType = grSource.getElement(field).getED().getInternalType();
            var targetType = grTarget.getElement(field).getED().getInternalType();

            // The types matches, nothing to see
            if (sourceType == targetType) continue;

            // The types are not the same, exclude them
            this.excludedFields.push(field.toLowerCase());
            gs.warn("RecordCloner | The field " + field + " was excluded because the type is different between the source and target table");
        }
    },

    /**
     * Read the specific record from the source table.
     *
     * @param {SysID} sys_id SysID of the record to retrieve
     */
    _read: function(sys_id) {
        // Read the record from the database
        var grRecord = new GlideRecord(this.source);
        var exists = grRecord.get(sys_id);

        // Return null value when the record doesn't exists
        if (!exists) return null;

        // Get all the fields from this record
        var fields = Object.keys(grRecord);

        // Exclude system fields
        fields = fields.filter(function(f) { return !f.startsWith("sys_"); });

        // Exclude all the fields that are denied by the developer
        function isAllowedField(field) {
            var lower = field.toLowerCase();

            return this.excludedFields.indexOf(lower) == -1;
        }
        fields = fields.filter(isAllowedField.bind(this));

        // Recreate an object from the non-system fields
        var data = {};
        for (var i = 0; i < fields.length; i++) data[fields[i]] = grRecord.getValue(fields[i]);

        return data;
    },

    /**
     * Write a new record in the target table.
     *
     * @param {object} data Object having as keys the field names and containing the values to write
     * @returns {SysID} SysID of the created record
     */
    _write: function(data) {
        // Prepare the new record for insertion
        var grRecord = new GlideRecord(this.target);
        grRecord.newRecord(); // Use "newRecord" instead of "initialize" to automagically set the default values for all fields

        // Get the fields for the current record
        var fields = Object.keys(grRecord);

        // For every field in the current record, if it's present in the "data" object, copy the value
        for (var i = 0; i < fields.length; i++) {
            var field = fields[i];

            // The current field is undefined in the "data" object, skip iteration
            if (gs.nil(data[field])) continue;

            // Set the value of the "data" object in the current record
            grRecord.setValue(field, data[field]);
        }

        // Insert the new record
        return grRecord.insert();
    },

    /* #################### End Private Methods #################### */

    type: "RecordCloner",
};
