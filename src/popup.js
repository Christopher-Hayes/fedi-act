// Settings keys with default values
const settingsDefaults = {
	// The user's instance URL
	fediact_homeinstance: null,
	// Enable alerts
	fediact_alert: false,
	// Mode could be either 'whitelist' or 'blacklist'
	fediact_mode: "blacklist",
	// Specific accounts to always allow
	fediact_whitelist: null,
	// Specific accounts to always block
	fediact_blacklist: null,
	// Where to open links by default (_self for the same tab, _blank for a new tab)
	fediact_target: "_self",
	// Whether actions should be taken automatically
	fediact_autoaction: true,
	// Whether redirects should be followed
	fediact_redirects: true,
	// Whether to enable a delay before actions are taken
	fediact_enabledelay: true,
	// Whether muted accounts should be hidden
	fediact_hidemuted: false,
	// Should the extension run even if the user is logged in
	fediact_runifloggedin: false,
}

// Fix for cross-browser storage API compatibility
var browser, chrome, settings;
// Enable logging for this file
const enableConsoleLog = true;
const logPrepend = "[FediAct]";

// Wrapper to prepend to log messages
function log(text) {
	if (enableConsoleLog) {
		console.log(logPrepend + ' ' + text);
	}
}

// Handles loading, displaying, and saving settings in the popup
function popupTasks() {
	// Displays a confirmation message when settings are saved
	function showConfirmation() {
		$("span#indicator").show();
		setTimeout(function() {
			$("span#indicator").hide();
		}, 1500);
	}

	// Saves the form data to local storage
	async function updateSettings() {
		try {
			// Update settings to reflect the form inputs
			settings.fediact_homeinstance = $("input#homeinstance").val().trim().toLowerCase();
			settings.fediact_alert = $("input#alert").is(':checked');
			settings.fediact_mode = $("select#mode").val();
			settings.fediact_whitelist = $("textarea#whitelist_content").val();
			settings.fediact_blacklist = $("textarea#blacklist_content").val();
			settings.fediact_target = $("select#target").val();
			settings.fediact_autoaction = $("input#autoaction").is(':checked');
			settings.fediact_redirects = $("input#redirects").is(':checked');
			settings.fediact_enabledelay = $("input#delay").is(':checked');
			settings.fediact_hidemuted = $("input#hidemuted").is(':checked');
			settings.fediact_runifloggedin = $("input#runifloggedin").is(':checked');

			// Save the updated settings to the local storage
			await (browser || chrome).storage.local.set(settings);

			// Show visual confirmation after successful save
			showConfirmation();
		} catch (e) {
			// Log error and indicate that saving failed
			log(e);
			return false;
		}
	}

	// Populates the popup form fields based on saved settings
	function restoreForm() {
		// Set form inputs to reflect the current settings
		$("input#homeinstance").val(settings.fediact_homeinstance);
		$("textarea#blacklist_content").val(settings.fediact_blacklist);
		$("textarea#whitelist_content").val(settings.fediact_whitelist);
		$("select#mode").val(settings.fediact_mode);
		$("select#target").val(settings.fediact_target);
		$("input#alert").prop('checked', settings.fediact_alert);
		$("input#autoaction").prop('checked', settings.fediact_autoaction);
		$("input#redirects").prop('checked', settings.fediact_redirects);
		$("input#delay").prop('checked', settings.fediact_enabledelay);
		$("input#hidemuted").prop('checked', settings.fediact_hidemuted);
		$("input#runifloggedin").prop('checked', settings.fediact_runifloggedin);

		// Initially hide both whitelist and blacklist containers
		// Then show the appropriate one based on the selected mode
		if ($("select#mode").val() == "whitelist") {
			$("div#whitelist_input").removeClass("hide");
			$("span#allowlabel").removeClass("hide");
		} else {
			$("div#blacklist_input").removeClass("hide");
			$("span#denylabel").removeClass("hide");
		}

		// Listen for changes on the mode select input
		// to toggle between whitelist and blacklist fields
		$("select#mode").change(function() {
			if ($("select#mode").val() == "whitelist") {
				$("div#blacklist_input").addClass("hide");
				$("span#denylabel").addClass("hide");
				$("div#whitelist_input").removeClass("hide");
				$("span#allowlabel").removeClass("hide");
			} else {
				$("div#whitelist_input").addClass("hide");
				$("span#allowlabel").addClass("hide");
				$("div#blacklist_input").removeClass("hide");
				$("span#denylabel").removeClass("hide");
			}
		});
	}

	// Initialize when the document is ready
	$(document).ready(function() {
		// Restore current settings to the form on load
		restoreForm();

		// On form submission, update the settings and send a message to the background script
		$("form#fediact-settings").on('submit', async function(e) {
			e.preventDefault(); // Prevent the form from submitting normally
			await updateSettings(); // Update the settings
			try {
				// Inform the background script that settings have been updated
				await chrome.runtime.sendMessage({updatedsettings: true});
			} catch(e) {
				log(e);
			}
		});
	});
}

// Main function to load settings and start popup tasks
async function loadAndRun() {
	try {
		// Fetch the current settings from local storage
		settings = await (browser || chrome).storage.local.get(settingsDefaults);
	} catch(e) {
		log(e); // Log an error if this fails
		return false;
	}

	// If settings were loaded successfully, start the popup tasks
	if (settings) {
		popupTasks();
	}
}

// Trigger the main function to load settings and initialize the popup
loadAndRun();
