const DATA_URL =
	"https://sleepingpill.javazone.no/public/allSessions/javazone_2026";
const INTERESTED_STORAGE_KEY = "javazone-2026-interested";
const SESSION_CACHE_KEY = "javazone-2026-session-cache";
const SESSION_CACHE_SAVED_AT_KEY = "javazone-2026-session-cache-saved-at";
const OSLO_TIME_ZONE = "Europe/Oslo";

const state = {
	sessions: [],
	interested: loadInterested(),
	expanded: new Set(),
	sync: {
		source: "live",
		savedAt: null,
	},
	filters: {
		search: "",
		day: "all",
		format: "all",
		language: "all",
		interestedOnly: false,
	},
};

const elements = {
	status: document.querySelector("#status-message"),
	schedule: document.querySelector("#schedule"),
	upcomingCount: document.querySelector("#upcoming-count"),
	interestedCount: document.querySelector("#interested-count"),
	syncMessage: document.querySelector("#sync-message"),
	searchInput: document.querySelector("#search-input"),
	dayFilter: document.querySelector("#day-filter"),
	formatFilter: document.querySelector("#format-filter"),
	languageFilter: document.querySelector("#language-filter"),
	interestedOnly: document.querySelector("#interested-only"),
};

const dayLabelFormatter = new Intl.DateTimeFormat("en-GB", {
	weekday: "long",
	day: "numeric",
	month: "long",
	timeZone: OSLO_TIME_ZONE,
});

const dayFilterFormatter = new Intl.DateTimeFormat("en-GB", {
	weekday: "short",
	day: "numeric",
	month: "short",
	timeZone: OSLO_TIME_ZONE,
});

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
	hour: "2-digit",
	minute: "2-digit",
	timeZone: OSLO_TIME_ZONE,
});

const syncFormatter = new Intl.DateTimeFormat("en-GB", {
	day: "numeric",
	month: "short",
	hour: "2-digit",
	minute: "2-digit",
	timeZone: OSLO_TIME_ZONE,
});

const dayKeyFormatter = new Intl.DateTimeFormat("en-CA", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
	timeZone: OSLO_TIME_ZONE,
});

registerServiceWorker();
bindControls();
loadSessions();

function registerServiceWorker() {
	if (!("serviceWorker" in navigator)) {
		return;
	}

	window.addEventListener("load", () => {
		navigator.serviceWorker
			.register("./sw.js", { scope: "./" })
			.catch((error) => console.error(error));
	});
}

function bindControls() {
	elements.searchInput.addEventListener("input", (event) => {
		state.filters.search = event.target.value.trim().toLowerCase();
		render();
	});

	elements.dayFilter.addEventListener("change", (event) => {
		state.filters.day = event.target.value;
		render();
	});

	elements.formatFilter.addEventListener("change", (event) => {
		state.filters.format = event.target.value;
		render();
	});

	elements.languageFilter.addEventListener("change", (event) => {
		state.filters.language = event.target.value;
		render();
	});

	elements.interestedOnly.addEventListener("change", (event) => {
		state.filters.interestedOnly = event.target.checked;
		render();
	});

	elements.schedule.addEventListener("click", (event) => {
		const interestButton = event.target.closest("[data-interest-id]");
		if (interestButton) {
			toggleInterested(interestButton.dataset.interestId);
			return;
		}

		const detailsButton = event.target.closest("[data-details-id]");
		if (detailsButton) {
			toggleExpanded(detailsButton.dataset.detailsId);
		}
	});
}

async function loadSessions() {
	setStatus("Loading upcoming sessions...");

	try {
		const response = await fetch(DATA_URL);
		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		const payload = await response.json();
		const savedAt = Date.now();
		saveSessionPayload(payload, savedAt);
		applyPayload(payload, { source: "live", savedAt });
	} catch (error) {
		console.error(error);
		const cachedPayload = loadCachedSessionPayload();
		if (cachedPayload) {
			applyPayload(cachedPayload.payload, {
				source: "cache",
				savedAt: cachedPayload.savedAt,
			});
			return;
		}

		state.sync = {
			source: "unavailable",
			savedAt: null,
		};
		state.sessions = [];
		populateFilters([]);
		render();
		setStatus("Could not load sessions from JavaZone right now.");
		setSyncMessage("Connect to the internet and try again.");
	}
}

function applyPayload(payload, sync) {
	const sessions = Array.isArray(payload.sessions) ? payload.sessions : [];

	state.sessions = sessions
		.map(normalizeSession)
		.filter((session) => session && isUpcoming(session))
		.sort((left, right) => left.startDate - right.startDate);
	state.sync = sync;

	state.interested = new Set(
		Array.from(state.interested).filter((sessionId) =>
			state.sessions.some((session) => session.id === sessionId),
		),
	);
	saveInterested();
	populateFilters(state.sessions);
	render();
}

function normalizeSession(session) {
	if (
		!session?.id ||
		!session.startTimeZulu ||
		!session.endTimeZulu ||
		!session.title
	) {
		return null;
	}

	const startDate = new Date(session.startTimeZulu);
	const endDate = new Date(session.endTimeZulu);

	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return null;
	}

	const speakerNames = Array.isArray(session.speakers)
		? session.speakers.map((speaker) => speaker.name).filter(Boolean)
		: [];

	return {
		id: session.id,
		title: session.title.trim(),
		abstract:
			typeof session.abstract === "string" ? session.abstract.trim() : "",
		room: valueOrEmpty(session.room),
		format: valueOrEmpty(session.format),
		language: valueOrEmpty(session.language),
		keywords: parseKeywords(session.suggestedKeywords),
		speakers: speakerNames,
		startDate,
		endDate,
		dayKey: getDayKey(startDate),
	};
}

function populateFilters(sessions) {
	const dayOptions = uniqueBy(sessions, (session) => session.dayKey).map(
		(session) => ({
			value: session.dayKey,
			label: dayFilterFormatter.format(session.startDate),
		}),
	);

	const formatOptions = uniqueValues(sessions.map((session) => session.format));
	const languageOptions = uniqueValues(
		sessions.map((session) => session.language),
	);

	updateSelect(elements.dayFilter, "All days", dayOptions);
	updateSelect(
		elements.formatFilter,
		"All formats",
		formatOptions.map((value) => ({ value, label: value })),
	);
	updateSelect(
		elements.languageFilter,
		"All languages",
		languageOptions.map((value) => ({ value, label: value.toUpperCase() })),
	);
}

function updateSelect(selectElement, allLabel, options) {
	const previousValue = selectElement.value || "all";
	const optionMarkup = [
		`<option value="all">${escapeHtml(allLabel)}</option>`,
	].concat(
		options.map(
			(option) =>
				`<option value="${escapeAttribute(option.value)}">${escapeHtml(option.label)}</option>`,
		),
	);

	selectElement.innerHTML = optionMarkup.join("");
	selectElement.value = options.some((option) => option.value === previousValue)
		? previousValue
		: "all";
	if (selectElement === elements.dayFilter) {
		state.filters.day = selectElement.value;
	}
	if (selectElement === elements.formatFilter) {
		state.filters.format = selectElement.value;
	}
	if (selectElement === elements.languageFilter) {
		state.filters.language = selectElement.value;
	}
}

function render() {
	const visibleSessions = state.sessions.filter(matchesFilters);
	const groups = groupByDay(visibleSessions);
	const interestedVisibleCount = visibleSessions.filter((session) =>
		state.interested.has(session.id),
	).length;

	elements.upcomingCount.textContent = String(visibleSessions.length);
	elements.interestedCount.textContent = String(state.interested.size);

	if (state.sessions.length === 0) {
		elements.schedule.innerHTML = "";
		if (
			elements.status.textContent !==
			"Could not load sessions from JavaZone right now."
		) {
			setStatus("No upcoming sessions are available right now.");
		}
		setSyncMessage(buildSyncMessage());
		return;
	}

	if (visibleSessions.length === 0) {
		elements.schedule.innerHTML = "";
		setStatus("No upcoming sessions match these filters.");
		setSyncMessage(buildSyncMessage());
		return;
	}

	const dayMarkup = groups
		.map(([dayKey, sessions]) => renderDayGroup(dayKey, sessions))
		.join("");
	elements.schedule.innerHTML = dayMarkup;

	const summary =
		interestedVisibleCount > 0
			? `Showing ${visibleSessions.length} of ${state.sessions.length} upcoming sessions. ${interestedVisibleCount} of the shown sessions are marked.`
			: `Showing ${visibleSessions.length} of ${state.sessions.length} upcoming sessions.`;
	setStatus(summary);
	setSyncMessage(buildSyncMessage());
}

function renderDayGroup(dayKey, sessions) {
	const title = dayLabelFormatter.format(sessions[0].startDate);
	const countLabel = `${sessions.length} ${sessions.length === 1 ? "session" : "sessions"}`;

	return `
    <section class="day-group" aria-labelledby="day-${escapeAttribute(dayKey)}">
      <div class="day-group__header">
        <h2 class="day-group__title" id="day-${escapeAttribute(dayKey)}">${escapeHtml(title)}</h2>
        <span class="day-group__count">${escapeHtml(countLabel)}</span>
      </div>
      <div class="session-list">
        ${sessions.map(renderSession).join("")}
      </div>
    </section>
  `;
}

function renderSession(session) {
	const speakers =
		session.speakers.length > 0
			? session.speakers.join(", ")
			: "Speaker details not listed";
	const meta = [session.room, session.format, session.language].filter(Boolean);
	const abstractId = `abstract-${session.id}`;
	const expanded = state.expanded.has(session.id);
	const interested = state.interested.has(session.id);

	return `
    <article class="session ${interested ? "session--interested" : ""}">
      <div class="session__lead">
        <span class="session__time">${escapeHtml(formatTimeRange(session.startDate, session.endDate))}</span>
        <h3 class="session__title">${escapeHtml(session.title)}</h3>
        <p class="session__speakers">${escapeHtml(speakers)}</p>
        ${meta.length > 0 ? `<div class="session__meta">${meta.map((item) => `<span class="session__meta-item">${escapeHtml(item)}</span>`).join("")}</div>` : ""}
        ${session.keywords.length > 0 ? `<div class="session__keywords">${session.keywords.map((keyword) => `<span class="session__keyword">${escapeHtml(keyword)}</span>`).join("")}</div>` : ""}
        ${session.abstract ? `<button class="details-button" type="button" data-details-id="${escapeAttribute(session.id)}" aria-expanded="${expanded}" aria-controls="${escapeAttribute(abstractId)}">${expanded ? "Hide details" : "Show details"}</button>` : ""}
        ${session.abstract ? `<p class="session__abstract" id="${escapeAttribute(abstractId)}" ${expanded ? "" : "hidden"}>${escapeHtml(session.abstract)}</p>` : ""}
      </div>
      <div class="session__actions">
        <button class="interest-button" type="button" data-interest-id="${escapeAttribute(session.id)}" aria-pressed="${interested}">${interested ? "Marked" : "Interested"}</button>
      </div>
    </article>
  `;
}

function matchesFilters(session) {
	if (state.filters.day !== "all" && session.dayKey !== state.filters.day) {
		return false;
	}

	if (
		state.filters.format !== "all" &&
		session.format !== state.filters.format
	) {
		return false;
	}

	if (
		state.filters.language !== "all" &&
		session.language !== state.filters.language
	) {
		return false;
	}

	if (state.filters.interestedOnly && !state.interested.has(session.id)) {
		return false;
	}

	if (!state.filters.search) {
		return true;
	}

	const haystack = [
		session.title,
		session.room,
		session.format,
		session.language,
		session.abstract,
		session.speakers.join(" "),
		session.keywords.join(" "),
	]
		.join(" ")
		.toLowerCase();

	return haystack.includes(state.filters.search);
}

function groupByDay(sessions) {
	const groups = new Map();
	for (const session of sessions) {
		const group = groups.get(session.dayKey) || [];
		group.push(session);
		groups.set(session.dayKey, group);
	}

	return Array.from(groups.entries());
}

function toggleInterested(sessionId) {
	if (state.interested.has(sessionId)) {
		state.interested.delete(sessionId);
	} else {
		state.interested.add(sessionId);
	}

	saveInterested();
	render();
}

function toggleExpanded(sessionId) {
	if (state.expanded.has(sessionId)) {
		state.expanded.delete(sessionId);
	} else {
		state.expanded.add(sessionId);
	}

	render();
}

function isUpcoming(session) {
	return session.endDate.getTime() > Date.now();
}

function formatTimeRange(startDate, endDate) {
	return `${timeFormatter.format(startDate)}-${timeFormatter.format(endDate)}`;
}

function getDayKey(date) {
	const parts = dayKeyFormatter.formatToParts(date);

	const yearPart = parts.find((part) => part.type === "year");
	const monthPart = parts.find((part) => part.type === "month");
	const dayPart = parts.find((part) => part.type === "day");
	const year = yearPart ? yearPart.value : "0000";
	const month = monthPart ? monthPart.value : "00";
	const day = dayPart ? dayPart.value : "00";
	return `${year}-${month}-${day}`;
}

function parseKeywords(keywords) {
	if (typeof keywords !== "string") {
		return [];
	}

	return keywords
		.split(",")
		.map((keyword) => keyword.trim())
		.filter(Boolean);
}

function uniqueValues(values) {
	return Array.from(new Set(values.filter(Boolean))).sort((left, right) =>
		left.localeCompare(right),
	);
}

function uniqueBy(items, keySelector) {
	const seen = new Set();
	return items.filter((item) => {
		const key = keySelector(item);
		if (seen.has(key)) {
			return false;
		}
		seen.add(key);
		return true;
	});
}

function loadInterested() {
	try {
		const rawValue = localStorage.getItem(INTERESTED_STORAGE_KEY);
		if (!rawValue) {
			return new Set();
		}

		const parsed = JSON.parse(rawValue);
		return Array.isArray(parsed)
			? new Set(parsed.filter((value) => typeof value === "string"))
			: new Set();
	} catch (error) {
		console.error(error);
		return new Set();
	}
}

function saveSessionPayload(payload, savedAt) {
	try {
		localStorage.setItem(SESSION_CACHE_KEY, JSON.stringify(payload));
		localStorage.setItem(SESSION_CACHE_SAVED_AT_KEY, String(savedAt));
	} catch (error) {
		console.error(error);
	}
}

function loadCachedSessionPayload() {
	try {
		const rawPayload = localStorage.getItem(SESSION_CACHE_KEY);
		if (!rawPayload) {
			return null;
		}

		const payload = JSON.parse(rawPayload);
		const rawSavedAt = localStorage.getItem(SESSION_CACHE_SAVED_AT_KEY);
		const savedAt = rawSavedAt ? Number(rawSavedAt) : null;
		return {
			payload,
			savedAt: Number.isFinite(savedAt) ? savedAt : null,
		};
	} catch (error) {
		console.error(error);
		return null;
	}
}

function saveInterested() {
	localStorage.setItem(
		INTERESTED_STORAGE_KEY,
		JSON.stringify(Array.from(state.interested)),
	);
}

function setStatus(message) {
	elements.status.textContent = message;
}

function setSyncMessage(message) {
	elements.syncMessage.textContent = message;
}

function buildSyncMessage() {
	if (state.sync.source === "cache") {
		return state.sync.savedAt
			? `Offline fallback. Showing the last saved schedule from ${formatSavedAt(state.sync.savedAt)} Oslo.`
			: "Offline fallback. Showing the last saved schedule.";
	}

	if (state.sync.source === "live") {
		return state.sync.savedAt
			? `Live schedule. Saved for offline use at ${formatSavedAt(state.sync.savedAt)} Oslo.`
			: "Live schedule. Saved for offline use.";
	}

	return "";
}

function formatSavedAt(timestamp) {
	return syncFormatter.format(new Date(timestamp));
}

function valueOrEmpty(value) {
	return typeof value === "string" ? value.trim() : "";
}

function escapeHtml(value) {
	return String(value)
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function escapeAttribute(value) {
	return escapeHtml(value);
}
