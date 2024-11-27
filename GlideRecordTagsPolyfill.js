/**
 * Extends the native GlideRecord object with support for the "tag" field.
 *
 * Use this functionality by calling `gs.include("GlideRecordTagsPolyfill")`
 * 
 * GlideRecord.getTags(): Obtains an array of all the availables tags' labels for the current record
 * GlideRecord.setTags(audience, ...tags): Set the specified tags for the provided audience (optional, if not specified the visibility is "Me")
 * GlideRecord.removeTags(...tags): Remove the specified tags for the current record
 *
 * @author Samuele Berlusconi (GitHub: @SamueleBerlusconi)
 * @license Apache-2.0
 */

/**
 * Verify if the current user has access to the provided label record.
 */
function _userCanReadLabel(record) {
	/**
	 * Intended audience for this label.
	 */
	var audience = record.getValue("viewable_by");

	// Return true if the label is visible by "Me" or "Everyone"
	if (audience === "me" || audience === "everyone") return true;

	/**
	 * Current user reference object.
	 */
	var user = gs.getUser();

	// Admin user will always see all the available labels
	if (user.hasRole("admin")) return true;

	// Verify if the current user is one of the users in the "Users" field
	var users = record.getValue("user_list");
	if (users.indexOf(user.getID())) return true;

	// Verify if the current user is member of one of the groups in the "Groups" field
	var groups = record.group_list.nil() ? [] : record.getValue("group_list").split(",");
	for (var i = 0; i < groups.length; i++) {
	  if (user.isMemberOf(groups[i])) return true;
	}

	// None of the previous conditions were true so it means
	// that the current user cannot access the current label
	return false;
}

/**
 * Return all the tags linked to the current record object.
 */
GlideRecord.prototype.getTags = function () {
	// We need the SysID of the current record to continue
	if (this.sys_id.nil()) return null;

	// Retrieve all the tags linked to the current record
	var grTags = new GlideRecord("label_entry");
	grTags.addQuery("table", this.getTableName());
	grTags.addQuery("table_key", this.getValue("sys_id"));
	grTags.query();

	// For every tag found, verify if the current user can read it
	var tags = [];
	while (grTags.next()) {
		/**
		 * Label object linked to the tag.
		 */
		var label = grTags.label.getRefRecord();

		// If the user can read the label for the current tag, return it
		if (_userCanReadLabel(label)) tags.push(label.getValue("name"));
	}

	return tags;
};

/**
 * Variadic method that set a list of tags for the current record object.
 * 
 * @parameters List of strings to add to the current record as tags.
 * @example record.setTags("foo", "bar");
 */
GlideRecord.prototype.setTags = function (audience) {
	// Parse the desired target audience for the tags
	var VALID_AUDIENCE = ["me", "everyone", "groups and users"];
	var _audience = audience && VALID_AUDIENCE.includes(audience) ? audience : "me";

	/**
	 * Array of tags to add to the current record.
	 */
	var tags = Array.prototype.slice.call(arguments, VALID_AUDIENCE.includes(audience) ? 1 : 0); // Ignore the "audience" parameter (if defined)
	
	// Exclude already added tags
	var currentTags = this.getTags();
	function _deduplicate(tag) { return !currentTags.includes(tag); }
	tags = tags.filter(_deduplicate);

	// For every remaining tags, find the appropriate label record (if existing) or create a new one
	function _retrieveLabel(tag) {
		// Search the label with the provided tag value
		var grLabel = new GlideRecord("label");
		var exists = grLabel.get("name", tag);

		// If the label exists and the user can access it, return its SysID
		if (exists && _userCanReadLabel(grLabel)) return grLabel.getValue("sys_id");
		
		// Otherwise create a new tag
		grLabel = new GlideRecord("label");
		grLabel.initialize();
		grLabel.setValue("name", tag);
		grLabel.setValue("active", "true");
		grLabel.setValue("viewable_by", _audience);
		grLabel.setValue("type", "standard");
		grLabel.setValue("owner", gs.getUserID());
		return grLabel.insert();
	}
	tags = tags.map(_retrieveLabel);

	// Create a new link between the label and the record in the tags table
	function insertTag(label) {
		var grTag = new GlideRecord("label_entry");
		grTag.initialize();
		grTag.setValue("label", label);
		grTag.setValue("table", this.getTableName());
		grTag.setValue("table_key", this.getValue("sys_id"));
		grTag.setValue("title", this.getValue("name") || "");
		grTag.insert();
	}
	tags.forEach(insertTag.bind(this));
};

/**
 * Variadic method that remove a list of tags for the current record object.
 * 
 * @parameters List of tag strings to remove from the current record.
 * @example record.removeTags("foo", "bar");
 */
GlideRecord.prototype.removeTags = function () {
	/**
	 * Array of tags to remove from the current record.
	 */
	var tags = Array.prototype.slice.call(arguments, 0);
	
	// Remove only existing tags in the current record
	var currentTags = this.getTags();
	function _exists(tag) { return currentTags.includes(tag); }
	tags = tags.filter(_exists);

	// Remove link between the label and the record in the tags table
	function removeTag(tag) {
		var grTag = new GlideRecord("label_entry");
		grTag.setValue("label.name", tag);
		grTag.setValue("table", this.getTableName());
		grTag.setValue("table_key", this.getValue("sys_id"));
		grTag.setLimit(1);
		grTag.deleteRecord();
	}
	tags.forEach(removeTag.bind(this));
};
