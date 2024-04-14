# Fork - FediAct (v0.9.8)

A Chrome/Firefox extension that simplifies follow and post interactions on Mastodon servers other than your own.

## Features

- Supports Mastodon v3 + v4 (some features v4 only)
- Follow, boost, bookmark, reply, favorite, vote in polls, and mute/block on external servers while only logged in to your home server
- Indicate following state and toot state (boosted, faved, bookmarked, voted) on external servers
- Single click to execute action only, double click to redirect to content on home server
- Reply button on external servers always redirects to home server and enters reply mode
- Hide muted content on external servers if enabled
- Requires only your home server domain to work

## Navigation

- [Installation](#installation)
- [Setup](#setup)
- [FAQ](#faq)
- [Screenshots / GIFs](#screenshots--gifs)
- [Manual Installation](#manual-installation)
  - [Install in Firefox for Android](#install-in-firefox-for-android)
- [Additional Notes](#additional-notes)
- [Todos / Planned Features](#todos--planned-features)
- [Contributing](#contributing)

## Installation

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/chrome/chrome.svg" width="48" alt="Chrome" />](https://chrome.google.com/webstore/detail/fediact/lmpcajpkjcclkjbliapfjfolocffednm) [![Chrome Webstore](https://img.shields.io/chrome-web-store/v/lmpcajpkjcclkjbliapfjfolocffednm.svg?label=%20)](https://chrome.google.com/webstore/detail/fediact/lmpcajpkjcclkjbliapfjfolocffednm)  
All up-to-date Chromium browsers, including Kiwi and Yandex browsers on Android

[<img src="https://raw.githubusercontent.com/alrra/browser-logos/90fdf03c/src/firefox/firefox.svg" width="48" alt="Firefox" />](https://addons.mozilla.org/en-US/firefox/addon/fediact/) [![Mozilla Addon Store](https://img.shields.io/amo/v/fediact.svg?label=%20%20)](https://addons.mozilla.org/en-US/firefox/addon/fediact/)  
Up-to-date Firefox (v107+), including Firefox Nightly on Android

**Please note:**

- If the webstore release is outdated, consider using the [manual installation method](#manual-installation) to install the latest version.
- Special installation steps for [Firefox on Android](#install-in-firefox-for-android).
- Chrome store updates may take 1-2 days longer.
- If you like this addon, consider donating: [paypal.me/lartsch](https://paypal.me/lartsch)

## Setup

1. Ensure you are logged in to your home server.
2. Click the extension icon or open its settings page.
3. Set your home server domain (required).
4. Check out the other settings (optional).
5. Click "Save" to save your settings.

With the correct home server set, you'll be able to interact on other Mastodon servers.

**Please note:**

- When FediAct is running, a small icon is displayed in the bottom right corner.
- It also indicates while content is resolving or if it could not be resolved.
- Performance depends on your home server and the external server you're browsing (read more [below](#additional-notes)).
- Some toots can't be resolved to your home (e.g., searching the post manually wouldn't work either).
- Disabling the API delay is **not recommended** (servers use rate limiting and might block your IP).

## FAQ

**Why does it need permission for all websites?**

>The addon needs to determine if the site you're browsing is a Mastodon server. Access to all sites is required for this. Otherwise, Mastodon servers would need to be added explicitly.

**Can I use this on Android?**

>Yes! Options include Kiwi Browser, Yandex Browser, and Firefox Nightly (see [below](#install-in-firefox-for-android)).

**Can I use this on iOS?**

>Not reliably, but:
>- Orion Browser may support it soon (see issue [#16](https://github.com/Lartsch/FediAct/issues/16)).
>- There are plans for Safari support (see issue [#17](https://github.com/Lartsch/FediAct/issues/17)).

**Can you add feature XY?**

>Feel free to create an issue on GitHub, and I will look into it.

**Is this safe to use?**

>This project is open source. The code can be reviewed on GitHub or by extracting the addon from the stores. 
>Implementation efforts have been made to prevent server abuse. The addon does not require your username or password. Data is stored locally, with the API token being the only sensitive piece sent solely to your home server. 

## Screenshots / GIFs

v0.9.8

<details>
  <summary>Extension Popup / Settings</summary>
  
  ![Settings Screenshot](https://github.com/lartsch/FediAct/blob/main/img/settings.png?raw=true)
  
</details>

<details>
  <summary>Showcase</summary>
  
  ![Showcase GIF](https://github.com/lartsch/FediAct/blob/main/img/showcase.gif?raw=true)
  
</details>

## Manual Installation

1. Download the [latest GitHub release](https://github.com/Lartsch/FediAct/releases/latest) for Chrome or Firefox.

### Chrome

2. Unzip the downloaded file to a location of your choice.
3. Go to the Chrome extensions page (`chrome://extensions`) and enable developer mode.
4. Click "Load unpacked" and select the unzipped folder.

*Note: Some Chromium browsers allow direct loading of a .zip file; use if available.*

### Firefox

2. Open the debugging page (`about:debugging`).
3. Select "This Firefox".
4. Click "Load Temporary Add-on" and select the downloaded Firefox ZIP file.

### Install in Firefox for Android

Firefox on Android restricts installations to a [curated list of addons](https://addons.mozilla.org/en-US/android/search/?promoted=recommended&sort=random&type=extension), but you can install FediAct with the following steps:

**Requirements:**

- Firefox [**Nightly**](https://play.google.com/store/apps/details?id=org.mozilla.fenix) for Android

**Steps:**

1. In Firefox Nightly, navigate to Settings > About Firefox Nightly.
2. Tap the Firefox logo 5 times to enable Developer options.
3. Return to Settings and select Custom Add-on Collection.
4. Fill in the required details:
   - ID: 17665294
   - Name: FediAct
5. Click OK, and Firefox will restart.
6. FediAct should now appear in the Add-ons menu of Firefox Nightly.

To update the addon, remove and reinstall it. Auto-update times in Firefox are uncertain.

The included collection features all default add-ons, so you won't miss any. You can also create [your own collection](https://support.mozilla.org/en-US/kb/how-use-collections-addonsmozillaorg).

## Additional Notes

1. Support for other Fediverse software is planned.
2. Several factors may affect resolving/interaction success, such as:
    - Not being logged in to your home server.
    - Changed element identifiers or unsupported Mastodon flavors.
    - The external server not being a Mastodon instance.
    - Strong rate limiting by your home server or the external server.
    - Defederation or moderation affecting servers.
    - The toot not yet federated to your home instance (following the account may help federation begin).
    - Absence of 302 redirects for external toots on the server you're browsing.
    - Poor network conditions affecting server response time.
    - The original server's privacy settings for the toot (e.g., unlisted).

3. API call facilities include a delay to avoid error 429 (too many requests), which can cause delays in busy feeds.
4. Failing to resolve content triggers "Unresolved" notices and default popup behavior.
5. Chrome's "Collect errors" may show uncaptured errors for FediAct; this does not impact functionality.

## Todos / Planned Features

For planned features and todos, check the [GitHub project](https://github.com/users/Lartsch/projects/2). Items are sorted by importance.

## Contributing

For bugs and feature suggestions, create [issues](https://github.com/Lartsch/FediAct/issues). Pull requests are welcome for improvements.

## Thanks to...

- **@raikasdev**: For the cross-browser storage API support fix.
- **@rosemarydotworld**: For the jQuery.DOMNodeAppear customization, filling in where MutationObservers and delegation failed.
- All the direct [contributors](https://github.com/Lartsch/FediAct/graphs/contributors) to this repository!
