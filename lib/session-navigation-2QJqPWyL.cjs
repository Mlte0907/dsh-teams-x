window.__ModuleLoader__.load({
	id: "dsh-teams-x",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		//#region lib/client/session-navigation.js
		/**
		* Open one member's persisted transcript. Harness removed cold subagents
		* from the ordinary session list: they must first be rediscovered in their
		* parent's catalog, then opened with the exact parent/child/mode address.
		*/
		async function openTeamsXMember(sessions, parentSessionId, childSessionId) {
			if (sessions.openSubagent === void 0 || sessions.refreshSubagents === void 0) {
				sessions.open(childSessionId);
				return "session";
			}
			await sessions.refreshSubagents(parentSessionId);
			const retained = sessions.subagentAddress?.(childSessionId);
			sessions.openSubagent(retained?.parentSessionId === parentSessionId ? retained : {
				parentSessionId,
				childSessionId,
				mode: "continuable"
			});
			return "subagent";
		}
		//#endregion
		exports.openTeamsXMember = openTeamsXMember;
		return module.exports;
	}
});

//# sourceMappingURL=session-navigation-2QJqPWyL.cjs.map