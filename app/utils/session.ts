/**
 * Session- und User-Identifikation fuer Frontend-Telemetry.
 *
 * Session-ID: Stabil pro Browser-Tab (ueberlebt SPA-Navigationen,
 * aber nicht Tab-Schliessen oder Hard-Refresh).
 *
 * User-ID: Wird in sessionStorage persistiert damit sie Page-Refreshes
 * ueberlebt und early Logs sofort eine User-Zuordnung haben.
 */

const SESSION_ID_KEY = "__otel_session_id";
const USER_ID_KEY = "__otel_user_id";

let _userId: string | undefined;

export function getSessionId(): string {
	let sessionId = sessionStorage.getItem(SESSION_ID_KEY);
	if (!sessionId) {
		sessionId = crypto.randomUUID();
		sessionStorage.setItem(SESSION_ID_KEY, sessionId);
	}
	return sessionId;
}

export function setUserId(id: string | undefined) {
	_userId = id;
	if (id) {
		sessionStorage.setItem(USER_ID_KEY, id);
	} else {
		sessionStorage.removeItem(USER_ID_KEY);
	}
}

export function getUserId(): string | undefined {
	if (!_userId) {
		_userId = sessionStorage.getItem(USER_ID_KEY) || undefined;
	}
	return _userId;
}
