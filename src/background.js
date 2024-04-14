// Define global variables
var browser, chrome, settings;

// These constants control logging behavior
const enableConsoleLog = false;
const logPrepend = "[FediAct]";

// Set interval for refreshing the token in minutes
const tokenInterval = 1;

// API endpoint constants
const mutesApi = "/api/v1/mutes";
const blocksApi = "/api/v1/blocks";
const domainBlocksApi = "/api/v1/domain_blocks";

// Timeout for fetch requests in milliseconds
const timeout = 15000;

// Regex for finding access tokens in returned HTML content
const tokenRegex = /"access_token":".*?",/gm;

// Default settings keys with default values
const settingsDefaults = {
  fediact_homeinstance: null,
  fediact_token: null
};

// Log helper that checks if logging is enabled before outputting to the console
function log(text) {
  if (enableConsoleLog) {
    console.log(logPrepend + ' ' + text);
  }
}

// Function to resolve the home URL of an external toot
async function resolveExternalTootHome(url) {
  return new Promise(async function (resolve) {
    try {
      // Set up controller for aborting the fetch request
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        log("Timed out");
        controller.abort();
      }, timeout);

      // Perform a HEAD request to check for redirection
      var res = await fetch(url, { method: 'HEAD', signal: controller.signal });
      clearTimeout(timeoutId);

      // Resolve with the redirected URL or false if there's no redirection
      if (res.redirected) {
        resolve(res.url);
      } else {
        resolve(false);
      }
    } catch (e) {
      log(e);
      resolve(false);
    }
  });
}

// General function to send various HTTP requests, useful for API interactions
async function generalRequest(data) {
  return new Promise(async function (resolve) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        log("Timed out");
        controller.abort();
      }, timeout);

      var res; // Variable to store the fetch response

      // Set the User-Agent depending on if there is a body or headers provided in the request
      if (data[3]) {
        // Handle the case where JSON data is provided for the request
        data[2]["User-Agent"] = "FediAct Service";
        data[2]["Content-Type"] = "application/json";
        res = await fetch(data[1], {
          method: data[0],
          signal: controller.signal,
          headers: data[2],
          body: JSON.stringify(data[3])
        });
      } else if (data[2]) {
        // Handle the case where only headers are provided, no body
        data[2]["User-Agent"] = "FediAct Service";
        res = await fetch(data[1], {
          method: data[0],
          signal: controller.signal,
          headers: data[2]
        });
      } else {
        // Handle the case where neither headers nor body are provided
        res = await fetch(data[1], {
          method: data[0],
          signal: controller.signal,
          headers: { "User-Agent": "FediAct Service" }
        });
      }

      clearTimeout(timeoutId);

      // Check the response status code and content type to ensure it's JSON
      if (res.status >= 200 && res.status < 300) {
        const contentType = res.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          var restext = await res.text();
          resolve(restext);
        } else {
          resolve(false);
        }
      } else {
        resolve(false);
      }
    } catch (e) {
      log(e);
      resolve(false);
    }
  });
}

// Function to fetch a bearer token using the current session
async function fetchBearerToken() {
  return new Promise(async function (resolve) {
    var url = "https://" + settings.fediact_homeinstance;
    try {
      var res = await fetch(url);
      var text = await res.text();
    } catch (e) {
      log(e);
      resolve(false);
      return;
    }
    if (text) {
      // Processing the response text with regular expressions to extract the token
      // The use of the regex is a workaround due to limitations in background workers
      var content = text.match(tokenRegex);
      if (content) {
        // Extract the token from the matched content
        var indexOne = content[0].search(/"access_token":"/);
        var indexTwo = content[0].search(/",/);
        if (indexOne > -1 && indexTwo > -1) {
          indexOne = indexOne + 16;
          var token = content[0].substring(indexOne, indexTwo);
          if (token.length > 16) {
            settings.fediact_token = token;
            resolve(true);
            return;
          }
        }
      }
    }

    // If no token was found, reset the token setting and log a message
    settings.fediact_token = null;
    log("Token could not be found.");
    resolve(false);
  });
}

// Function to fetch accounts and instances muted/blocked by the user
// This is done in the background to have data available on page load
function fetchMutesAndBlocks() {
  return new Promise(async function (resolve) {
    try {
      // Start with empty arrays for mutes and blocks
      [settings.fediact_mutes, settings.fediact_blocks, settings.fediact_domainblocks] = [[], [], []];

      // Fetch the mute, block, and domain block lists concurrently with Promise.all
      var [mutes, blocks, domainblocks] = await Promise.all([
        fetch("https://" + settings.fediact_homeinstance + mutesApi, { headers: { "Authorization": "Bearer " + settings.fediact_token } }).then((response) => response.json()),
        fetch("https://" + settings.fediact_homeinstance + blocksApi, { headers: { "Authorization": "Bearer " + settings.fediact_token } }).then((response) => response.json()),
        fetch("https://" + settings.fediact_homeinstance + domainBlocksApi, { headers: { "Authorization": "Bearer " + settings.fediact_token } }).then((response) => response.json())
      ]);

      // Process the returned lists and store them in settings
      if (mutes.length) {
        settings.fediact_mutes.push(...mutes.map(acc => acc.acct));
      }
      if (blocks.length) {
        settings.fediact_blocks.push(...blocks.map(acc => acc.acct));
      }
      if (domainblocks.length) {
        settings.fediact_domainblocks = domainblocks;
      }
      resolve(true);
    } catch {
      resolve(false);
    }
  });
}

// Main function to load settings, fetch bearer token, and mutes and blocks
async function fetchData(token, mutesblocks) {
  return new Promise(async function (resolve) {
    var resolved = false;
    try {
      settings = await (browser || chrome).storage.local.get(settingsDefaults);
      if (settings.fediact_homeinstance) {
        if (token || mutesblocks) {
          if (token || !(settings.fediact_token)) {
            await fetchBearerToken();
          }
          if (mutesblocks) {
            await fetchMutesAndBlocks();
          }
          try {
            await (browser || chrome).storage.local.set(settings);
            resolved = true;
          } catch (e) {
            log(e);
          }
        }
      } else {
        log("Home instance not set");
      }
    } catch (e) {
      log(e);
    }
    resolve(resolved);
  });
}

// Function triggered upon changes to refresh relevant scripts
async function reloadListeningScripts() {
  chrome.tabs.query({}, async function (tabs) {
    for (var i = 0; i < tabs.length; ++i) {
      try {
        chrome.tabs.sendMessage(tabs[i].id, { updatedfedisettings: true });
      } catch (e) {
        // Ignoring errors from non-listening tabs
        continue;
      }
    }
  });
}

// Event listener for when the extension is installed to fetch data immediately
chrome.runtime.onInstalled.addListener(function () { fetchData(true, true) });

// Set up a regular alarm to refresh data every few minutes, as specified by `tokenInterval`
chrome.alarms.create('refresh', { periodInMinutes: tokenInterval });
chrome.alarms.onAlarm.addListener(function () { fetchData(true, true) });

// Event listener for messages from other scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.externaltoot) {
    // If we have an external toot request, resolve the home URL
    resolveExternalTootHome(request.externaltoot).then(sendResponse);
    return true; // Keep the messaging channel open for asynchronous response
  }
  if (request.requestdata) {
    // Handle general API requests
    generalRequest(request.requestdata).then(sendResponse);
    return true; // Keep the messaging channel open for asynchronous response
  }
  if (request.updatedsettings) {
    // Refresh settings upon receiving a message that settings were updated
    fetchData(true, true).then(reloadListeningScripts);
    return true; // Indicate an async response to keep the message channel open
  }
  if (request.updatemutedblocked) {
    // Handle updates to muted or blocked lists
    fetchData(false, true).then(sendResponse);
    return true; // Keep the messaging channel open for asynchronous response
  }
  if (request.running) {
    // Detect page URL changes and inform the content script
    chrome.tabs.onUpdated.addListener(async function (tabId, changeInfo, tab) {
      if (tabId === sender.tab.id && changeInfo.url) {
        try {
          await chrome.tabs.sendMessage(tabId, { urlchanged: changeInfo.url });
        } catch (e) {
          log(e);
        }
      }
    });
  }
});
