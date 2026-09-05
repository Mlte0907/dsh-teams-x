window.__ModuleLoader__.load({
	id: "dsh-teams-x",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region \0teamsx-css:/home/xiaoxin/dsh-teams-x/src/client/ActivityPanel.module.css.mjs
		const css = ".ccAtPW_panel{color:var(--dsw-alias-label-primary,#f9fafb);flex-direction:column;gap:10px;padding:12px;font-size:13px;display:flex;overflow-y:auto}.ccAtPW_badgeFab{border:1px solid var(--dsw-alias-border-l2,#3c3c3d);background:var(--dsw-alias-bg-layer-2,#2c2c2e);height:26px;color:var(--dsw-alias-state-business-primary,#679efe);cursor:pointer;border-radius:999px;align-items:center;gap:6px;padding:0 10px;font-size:12px;transition:border-color .12s,background .12s;display:inline-flex}.ccAtPW_badgeFab:hover{border-color:var(--dsw-alias-state-business-primary,#679efe)}.ccAtPW_badgeFab svg,.ccAtPW_memberLink svg{pointer-events:none}.ccAtPW_badgeFab[data-expanded]{border-color:var(--dsw-alias-state-business-primary,#679efe);background:var(--dsw-alias-interactive-bg-active,#ffffff24)}.ccAtPW_badgeFabCount{color:var(--dsw-alias-label-primary,#f9fafb);font-weight:600}.ccAtPW_badgeFabBusy{background:var(--dsw-alias-state-business-primary,#679efe);min-width:16px;height:16px;color:var(--dsw-alias-label-primary-foreground,#0f1115);border-radius:999px;justify-content:center;align-items:center;padding:0 4px;font-size:10px;animation:1.6s ease-in-out infinite ccAtPW_teamsx-pulse;display:inline-flex}.ccAtPW_panelWindow{border:1px solid var(--dsw-alias-border-l2,#3c3c3d);background:var(--dsw-alias-bg-layer-1,#232324);width:400px;max-width:calc(100vw - 32px);max-height:min(72vh,640px);box-shadow:0 8px 28px var(--dsw-alias-bg-mask-drop,#272730b3);color:var(--dsw-alias-label-primary,#f9fafb);border-radius:12px;flex-direction:column;gap:10px;padding:12px;font-size:13px;animation:.14s ccAtPW_teamsx-enter;display:flex;position:fixed;overflow-y:auto}@keyframes ccAtPW_teamsx-enter{0%{opacity:0;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}.ccAtPW_panelHeader{justify-content:space-between;align-items:center;gap:8px;display:flex}.ccAtPW_panelTitle{align-items:center;gap:8px;margin:0;font-size:14px;font-weight:600;display:flex}.ccAtPW_panelActions{align-items:center;gap:2px;display:inline-flex}.ccAtPW_refreshButton{color:var(--dsw-alias-label-secondary,#a8adb4);cursor:pointer;background:0 0;border:none;border-radius:6px;justify-content:center;align-items:center;width:24px;height:24px;font-size:13px;display:inline-flex}.ccAtPW_refreshButton:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff14);color:var(--dsw-alias-label-primary,#f9fafb)}.ccAtPW_panelEmpty{color:var(--dsw-alias-label-tertiary,#7d828a);text-align:center;padding:18px 8px}.ccAtPW_panelError{color:var(--dsw-alias-state-error-primary,#f25a5a);padding:8px}.ccAtPW_teamList{flex-direction:column;gap:12px;display:flex}.ccAtPW_teamCard{border:1px solid var(--dsw-alias-border-l2,#3c3c3d);background:var(--dsw-alias-bg-layer-2,#2c2c2e);border-radius:10px;flex-direction:column;gap:8px;padding:10px;display:flex}.ccAtPW_teamCard[data-halted]{opacity:.75}.ccAtPW_planBar{border:1px solid var(--dsw-alias-state-business-primary,#679efe);border-radius:8px;flex-direction:column;gap:6px;padding:8px 10px;display:flex}.ccAtPW_planBarText{margin:0;font-size:12px}.ccAtPW_planError{color:var(--dsw-alias-state-error-primary,#f25a5a);margin:0;font-size:12px}.ccAtPW_planActions{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.ccAtPW_planApprove,.ccAtPW_planChat,.ccAtPW_planDiscard,.ccAtPW_planDiscardArm,.ccAtPW_planCancel{cursor:pointer;border-radius:6px;padding:3px 10px;font-size:12px}.ccAtPW_planApprove{background:var(--dsw-alias-state-business-primary,#679efe);color:var(--dsw-alias-label-primary-foreground,#0f1115);border:none;font-weight:600}.ccAtPW_planApprove:disabled{opacity:.45;cursor:default}.ccAtPW_planChat,.ccAtPW_planDiscardArm,.ccAtPW_planCancel{border:1px solid var(--dsw-alias-border-l2,#3c3c3d);color:var(--dsw-alias-label-primary,#f9fafb);background:0 0}.ccAtPW_planChat:hover:not(:disabled),.ccAtPW_planDiscardArm:hover:not(:disabled){background:var(--dsw-alias-interactive-bg-hover,#ffffff14)}.ccAtPW_planDiscard{background:var(--dsw-alias-state-error-primary,#f25a5a);color:var(--dsw-alias-label-primary-foreground,#0f1115);border:none}.ccAtPW_teamHeader{flex-wrap:wrap;align-items:flex-start;gap:8px;display:flex}.ccAtPW_teamLogo{color:var(--dsw-alias-state-business-primary,#679efe);flex-shrink:0;margin-top:2px}.ccAtPW_teamTitleBlock{flex:auto;min-width:0}.ccAtPW_teamName{margin:0;font-size:13px;font-weight:600}.ccAtPW_teamGoal{color:var(--dsw-alias-label-secondary,#a8adb4);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:2px 0 0;display:-webkit-box;overflow:hidden}.ccAtPW_teamBadges{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.ccAtPW_badge,.ccAtPW_badgeMuted,.ccAtPW_badgeWarn{white-space:nowrap;border-radius:999px;padding:1px 8px;font-size:11px}.ccAtPW_badge{background:var(--dsw-alias-interactive-bg-active,#ffffff24);color:var(--dsw-alias-state-business-primary,#679efe)}.ccAtPW_badgeMuted{background:var(--dsw-alias-interactive-bg-hover,#ffffff14);color:var(--dsw-alias-label-secondary,#a8adb4)}.ccAtPW_badgeWarn{background:var(--dsw-alias-state-warn-tertiary,#27241f);color:var(--dsw-alias-state-warn-label,#dd8629)}.ccAtPW_stopButton{border:1px solid var(--dsw-alias-state-error-primary,#f25a5a);color:var(--dsw-alias-state-error-primary,#f25a5a);cursor:pointer;background:0 0;border-radius:6px;align-self:center;padding:2px 10px;font-size:12px}.ccAtPW_stopButton:hover{background:var(--dsw-alias-interactive-bg-hover-danger,#f25a5a26)}.ccAtPW_stopConfirmBox{border:1px solid var(--dsw-alias-state-error-primary,#f25a5a);border-radius:8px;flex-direction:column;gap:6px;padding:8px 10px;display:flex}.ccAtPW_stopConfirmBox p{margin:0}.ccAtPW_stopError{color:var(--dsw-alias-state-error-primary,#f25a5a)}.ccAtPW_stopActions{justify-content:flex-end;gap:8px;display:flex}.ccAtPW_stopCancel,.ccAtPW_stopConfirm{cursor:pointer;border-radius:6px;padding:2px 10px;font-size:12px}.ccAtPW_stopCancel{border:1px solid var(--dsw-alias-border-l2,#3c3c3d);color:inherit;background:0 0}.ccAtPW_stopConfirm{background:var(--dsw-alias-state-error-primary,#f25a5a);color:var(--dsw-alias-label-primary-foreground,#0f1115);border:none}.ccAtPW_roster{flex-direction:column;gap:2px;display:flex}.ccAtPW_memberRow{border-radius:6px;grid-template-columns:22px minmax(72px,1.2fr) minmax(0,1.6fr) auto auto minmax(96px,auto);align-items:center;gap:6px;padding:3px 4px;display:grid}.ccAtPW_memberRow[data-activity=working]{background:var(--dsw-alias-interactive-bg-hover,#ffffff14)}.ccAtPW_memberIcon{color:var(--dsw-alias-state-business-primary,#679efe);display:inline-flex}.ccAtPW_memberName{text-overflow:ellipsis;white-space:nowrap;font-weight:600;overflow:hidden}.ccAtPW_memberLink{color:inherit;font:inherit;cursor:pointer;border:none;border-bottom:1px dotted var(--dsw-alias-border-l2,#3c3c3d);background:0 0;padding:0;font-weight:600;text-decoration:none}.ccAtPW_memberLink:hover{color:var(--dsw-alias-state-business-primary,#679efe);border-bottom-color:var(--dsw-alias-state-business-primary,#679efe)}.ccAtPW_memberMeta{color:var(--dsw-alias-label-tertiary,#7d828a);text-overflow:ellipsis;white-space:nowrap;font-size:11px;overflow:hidden}.ccAtPW_memberProgress{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-secondary,#a8adb4);align-items:center;gap:5px;font-size:11px;display:inline-flex}.ccAtPW_memberProgressBar{background:var(--dsw-alias-interactive-bg-hover,#ffffff14);border-radius:999px;width:42px;height:3px;display:inline-block;overflow:hidden}.ccAtPW_memberProgressFill{background:var(--dsw-alias-label-tertiary,#7d828a);border-radius:999px;height:100%;display:block}.ccAtPW_memberProgressFill[data-active]{background:var(--dsw-alias-state-business-primary,#679efe)}.ccAtPW_memberProgressFill[data-done]{background:var(--dsw-alias-state-success-primary,#22c55e)}.ccAtPW_memberUnread{background:var(--dsw-alias-state-error-primary,#f25a5a);color:var(--dsw-alias-label-primary-foreground,#0f1115);border-radius:999px;justify-content:center;align-items:center;min-width:16px;height:16px;padding:0 4px;font-size:10px;display:inline-flex}.ccAtPW_memberState{color:var(--dsw-alias-label-secondary,#a8adb4);align-items:center;gap:4px;font-size:11px;display:inline-flex}.ccAtPW_memberPause{color:var(--dsw-alias-label-tertiary,#7d828a);cursor:pointer;background:0 0;border:none;border-radius:4px;justify-content:center;align-items:center;width:18px;height:18px;font-size:10px;display:inline-flex}.ccAtPW_memberPause:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff14);color:var(--dsw-alias-state-warn-primary,#f59e0b)}.ccAtPW_memberPause:disabled{opacity:.5;cursor:default}.ccAtPW_dag{flex-direction:column;gap:2px;display:flex}.ccAtPW_taskRow{border:1px solid #0000;border-radius:6px;grid-template-columns:18px 34px minmax(0,1fr) auto auto;align-items:center;gap:6px;padding:3px 4px;display:grid}.ccAtPW_taskRow[data-state=running]{border-color:var(--dsw-alias-state-business-primary,#679efe)}.ccAtPW_taskRow[data-state=failed]{background:var(--dsw-alias-interactive-bg-hover-danger,#f25a5a26)}.ccAtPW_taskIcon{display:inline-flex}.ccAtPW_taskRow[data-state=completed] .ccAtPW_taskIcon{color:var(--dsw-alias-state-success-primary,#22c55e)}.ccAtPW_taskRow[data-state=failed] .ccAtPW_taskIcon{color:var(--dsw-alias-state-error-primary,#f25a5a)}.ccAtPW_taskRow[data-state=running] .ccAtPW_taskIcon{color:var(--dsw-alias-state-business-primary,#679efe)}.ccAtPW_taskRow[data-state=blocked] .ccAtPW_taskIcon{color:var(--dsw-alias-state-warn-primary,#f59e0b)}.ccAtPW_taskId{font-family:var(--dsw-font-family,inherit);color:var(--dsw-alias-label-tertiary,#7d828a);letter-spacing:.02em;font-size:11px}.ccAtPW_taskSubject{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.ccAtPW_taskAssignee{color:var(--dsw-alias-label-secondary,#a8adb4);font-size:11px}.ccAtPW_taskStatus{white-space:nowrap;font-size:11px}.ccAtPW_inbox{border-top:1px dashed var(--dsw-alias-border-l2,#3c3c3d);padding-top:6px}.ccAtPW_inboxTitle{text-transform:uppercase;letter-spacing:.04em;color:var(--dsw-alias-label-tertiary,#7d828a);margin:0 0 4px;font-size:11px;font-weight:600}.ccAtPW_inboxEmpty{color:var(--dsw-alias-label-tertiary,#7d828a);margin:0;font-size:12px}.ccAtPW_inboxList{flex-direction:column;gap:4px;margin:0;padding:0;list-style:none;display:flex}.ccAtPW_inboxItem{gap:6px;font-size:12px;display:flex}.ccAtPW_inboxFrom{flex-shrink:0;font-weight:600}.ccAtPW_inboxContent{color:var(--dsw-alias-label-secondary,#a8adb4);-webkit-line-clamp:2;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.ccAtPW_animPulse{transform-origin:50%;animation:1.6s ease-in-out infinite ccAtPW_teamsx-pulse}@keyframes ccAtPW_teamsx-pulse{0%,to{opacity:1;transform:scale(1)}50%{opacity:.55;transform:scale(.92)}}.ccAtPW_animSpin{animation:1.2s linear infinite ccAtPW_teamsx-spin;display:inline-block}@keyframes ccAtPW_teamsx-spin{to{transform:rotate(360deg)}}";
		const tagId = "dsh-teams-x/ActivityPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-teams-x";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var ActivityPanel_module_css_default = {
			"animPulse": "ccAtPW_animPulse",
			"animSpin": "ccAtPW_animSpin",
			"badge": "ccAtPW_badge",
			"badgeFab": "ccAtPW_badgeFab",
			"badgeFabBusy": "ccAtPW_badgeFabBusy",
			"badgeFabCount": "ccAtPW_badgeFabCount",
			"badgeMuted": "ccAtPW_badgeMuted",
			"badgeWarn": "ccAtPW_badgeWarn",
			"dag": "ccAtPW_dag",
			"inbox": "ccAtPW_inbox",
			"inboxContent": "ccAtPW_inboxContent",
			"inboxEmpty": "ccAtPW_inboxEmpty",
			"inboxFrom": "ccAtPW_inboxFrom",
			"inboxItem": "ccAtPW_inboxItem",
			"inboxList": "ccAtPW_inboxList",
			"inboxTitle": "ccAtPW_inboxTitle",
			"memberIcon": "ccAtPW_memberIcon",
			"memberLink": "ccAtPW_memberLink",
			"memberMeta": "ccAtPW_memberMeta",
			"memberName": "ccAtPW_memberName",
			"memberPause": "ccAtPW_memberPause",
			"memberProgress": "ccAtPW_memberProgress",
			"memberProgressBar": "ccAtPW_memberProgressBar",
			"memberProgressFill": "ccAtPW_memberProgressFill",
			"memberRow": "ccAtPW_memberRow",
			"memberState": "ccAtPW_memberState",
			"memberUnread": "ccAtPW_memberUnread",
			"panel": "ccAtPW_panel",
			"panelActions": "ccAtPW_panelActions",
			"panelEmpty": "ccAtPW_panelEmpty",
			"panelError": "ccAtPW_panelError",
			"panelHeader": "ccAtPW_panelHeader",
			"panelTitle": "ccAtPW_panelTitle",
			"panelWindow": "ccAtPW_panelWindow",
			"planActions": "ccAtPW_planActions",
			"planApprove": "ccAtPW_planApprove",
			"planBar": "ccAtPW_planBar",
			"planBarText": "ccAtPW_planBarText",
			"planCancel": "ccAtPW_planCancel",
			"planChat": "ccAtPW_planChat",
			"planDiscard": "ccAtPW_planDiscard",
			"planDiscardArm": "ccAtPW_planDiscardArm",
			"planError": "ccAtPW_planError",
			"refreshButton": "ccAtPW_refreshButton",
			"roster": "ccAtPW_roster",
			"stopActions": "ccAtPW_stopActions",
			"stopButton": "ccAtPW_stopButton",
			"stopCancel": "ccAtPW_stopCancel",
			"stopConfirm": "ccAtPW_stopConfirm",
			"stopConfirmBox": "ccAtPW_stopConfirmBox",
			"stopError": "ccAtPW_stopError",
			"taskAssignee": "ccAtPW_taskAssignee",
			"taskIcon": "ccAtPW_taskIcon",
			"taskId": "ccAtPW_taskId",
			"taskRow": "ccAtPW_taskRow",
			"taskStatus": "ccAtPW_taskStatus",
			"taskSubject": "ccAtPW_taskSubject",
			"teamBadges": "ccAtPW_teamBadges",
			"teamCard": "ccAtPW_teamCard",
			"teamGoal": "ccAtPW_teamGoal",
			"teamHeader": "ccAtPW_teamHeader",
			"teamList": "ccAtPW_teamList",
			"teamLogo": "ccAtPW_teamLogo",
			"teamName": "ccAtPW_teamName",
			"teamTitleBlock": "ccAtPW_teamTitleBlock",
			"teamsx-enter": "ccAtPW_teamsx-enter",
			"teamsx-pulse": "ccAtPW_teamsx-pulse",
			"teamsx-spin": "ccAtPW_teamsx-spin"
		};
		//#endregion
		//#region lib/client/icon-data.js
		/**
		* Single source of truth for every TeamsX icon — all SVG, zero PNG.
		*
		* Each entry is the inner markup of a 24×24 stroke icon. `icons.tsx` renders
		* these inline as React components (currentColor-themable, CSS-animatable);
		* `scripts/export-icons.mjs` wraps the same bodies into standalone
		* `assets/icons/*.svg` files for README and marketplace use. Editing a path
		* here updates both surfaces on the next build.
		* @module dsh-teams-x/client/icon-data
		*/
		/** Shared stroke attributes applied by the shell to every icon. */
		const ICON_STROKE = {
			width: 1.8,
			linecap: "round",
			linejoin: "round"
		};
		const ICONS = {
			"teams-x-logo": {
				label: "TeamsX",
				body: [
					"<circle cx=\"12\" cy=\"6\" r=\"2.6\"/>",
					"<circle cx=\"5.5\" cy=\"17\" r=\"2.6\"/>",
					"<circle cx=\"18.5\" cy=\"17\" r=\"2.6\"/>",
					"<path d=\"M10.6 8.2 7 14.8\"/>",
					"<path d=\"M13.4 8.2 17 14.8\"/>",
					"<path d=\"M8.1 17h7.8\"/>"
				].join("")
			},
			"role-lead": {
				label: "Team lead",
				body: "<path d=\"M12 3l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.5-4.8 2.5.9-5.4L4.2 8.7l5.4-.8z\"/>"
			},
			"role-researcher": {
				label: "Researcher",
				body: [
					"<circle cx=\"10.5\" cy=\"10.5\" r=\"5.5\"/>",
					"<path d=\"M14.7 14.7 20 20\"/>",
					"<path d=\"M8 10.5h5\"/>",
					"<path d=\"M10.5 8v5\"/>"
				].join("")
			},
			"role-engineer": {
				label: "Engineer",
				body: ["<path d=\"M14.7 6.3a4.2 4.2 0 0 0-5.6 5.6L4 17v3h3l5.1-5.1a4.2 4.2 0 0 0 5.6-5.6l-2.6 2.6-2.4-.6-.6-2.4z\"/>"].join("")
			},
			"role-reviewer": {
				label: "Reviewer",
				body: [
					"<circle cx=\"11\" cy=\"11\" r=\"6.5\"/>",
					"<path d=\"M15.8 15.8 21 21\"/>",
					"<path d=\"m8.2 11 2 2 3.6-3.8\"/>"
				].join("")
			},
			"role-qa": {
				label: "QA",
				body: ["<path d=\"M12 3 4.5 6v5c0 4.6 3.2 8 7.5 9.6 4.3-1.6 7.5-5 7.5-9.6V6z\"/>", "<path d=\"m9 11.6 2.1 2.1L15.3 9.5\"/>"].join("")
			},
			"role-security": {
				label: "Security",
				body: [
					"<path d=\"M12 3 4.5 6v5c0 4.6 3.2 8 7.5 9.6 4.3-1.6 7.5-5 7.5-9.6V6z\"/>",
					"<circle cx=\"12\" cy=\"10.5\" r=\"1.9\"/>",
					"<path d=\"M12 12.4v3.4\"/>"
				].join("")
			},
			"role-docs": {
				label: "Docs",
				body: [
					"<path d=\"M6 3h8l4 4v14H6z\"/>",
					"<path d=\"M14 3v4h4\"/>",
					"<path d=\"M9 12h6\"/>",
					"<path d=\"M9 16h6\"/>"
				].join("")
			},
			"role-designer": {
				label: "Designer",
				body: [
					"<rect x=\"4\" y=\"4\" width=\"16\" height=\"16\" rx=\"2.5\"/>",
					"<circle cx=\"9\" cy=\"9\" r=\"1.7\"/>",
					"<path d=\"m4.5 17 4.5-4.5 3 3 4-4 3.5 3.5\"/>"
				].join("")
			},
			"role-operator": {
				label: "Operator",
				body: ["<circle cx=\"12\" cy=\"12\" r=\"3\"/>", "<path d=\"M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.7 6.7l1.6 1.6M15.7 15.7l1.6 1.6M17.3 6.7l-1.6 1.6M8.3 15.7l-1.6 1.6\"/>"].join("")
			},
			"role-data": {
				label: "Data",
				body: [
					"<ellipse cx=\"12\" cy=\"5.5\" rx=\"7\" ry=\"2.7\"/>",
					"<path d=\"M5 5.5v13c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7v-13\"/>",
					"<path d=\"M5 12c0 1.5 3.1 2.7 7 2.7s7-1.2 7-2.7\"/>"
				].join("")
			},
			"action-working": {
				label: "Working",
				body: "<path d=\"M14.7 6.3a4.2 4.2 0 0 0-5.6 5.6L4 17v3h3l5.1-5.1a4.2 4.2 0 0 0 5.6-5.6l-2.6 2.6-2.4-.6-.6-2.4z\"/>"
			},
			"action-thinking": {
				label: "Thinking",
				body: [
					"<path d=\"M11 4a6.2 6.2 0 0 0-6.2 6.2c0 2.2 1.1 3.7 2.2 5 .8.9 1.2 1.9 1.2 3v.3h6.4v-.6c0-1.1.5-2 1.3-2.9A6.2 6.2 0 0 0 11 4z\"/>",
					"<path d=\"M9.4 21.5h3.6\"/>",
					"<path d=\"M18.5 5.5v-3M20 4h-3\"/>"
				].join("")
			},
			"action-reporting": {
				label: "Reporting",
				body: [
					"<rect x=\"5.5\" y=\"4.5\" width=\"13\" height=\"17\" rx=\"2\"/>",
					"<path d=\"M9 4.5V3h6v1.5\"/>",
					"<path d=\"m9 13 2.1 2.1 4.2-4.2\"/>"
				].join("")
			},
			"action-sending": {
				label: "Sending",
				body: "<path d=\"M21 3 3.8 10.2l6.4 2.4 2.4 6.4z\"/><path d=\"M21 3 10.2 12.6\"/>"
			},
			"action-sleeping": {
				label: "Sleeping",
				body: ["<path d=\"M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z\"/>", "<path d=\"M16.5 4.5h3.5l-3.5 3.5h3.5\"/>"].join("")
			},
			"action-celebrating": {
				label: "Celebrating",
				body: [
					"<path d=\"m5.2 12.2 6.6 6.6-7.6 2.2a1 1 0 0 1-1.2-1.2z\"/>",
					"<path d=\"M10 8 8.5 9.5\"/>",
					"<path d=\"M14.5 4.5c.5 2-.5 3.5-2 4\"/>",
					"<path d=\"M19.5 9.5c-2-.5-3.5.5-4 2\"/>",
					"<path d=\"M17.5 3.5 16 5\"/>",
					"<path d=\"M20.5 14.5 19 16\"/>"
				].join("")
			}
		};
		/** Team status icons used by the panel header and task rows. */
		const STATUS_ICONS = {
			"status-open": {
				label: "Open",
				body: "<circle cx=\"12\" cy=\"12\" r=\"8\"/>"
			},
			"status-running": {
				label: "Running",
				body: "<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M12 7.5V12l3 2\"/>"
			},
			"status-blocked": {
				label: "Blocked",
				body: "<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M5.8 5.8l12.4 12.4\"/>"
			},
			"status-completed": {
				label: "Completed",
				body: "<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"m8.2 12.2 2.6 2.6 5-5.4\"/>"
			},
			"status-failed": {
				label: "Failed",
				body: "<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M9.2 9.2l5.6 5.6M14.8 9.2l-5.6 5.6\"/>"
			},
			"status-cancelled": {
				label: "Cancelled",
				body: "<circle cx=\"12\" cy=\"12\" r=\"8\"/><path d=\"M8.5 12h7\"/>"
			}
		};
		//#endregion
		//#region lib/client/icons.js
		function IconSvg({ body, label, size = 16, className, decorative }) {
			return (0, react_jsx_runtime.jsx)("svg", {
				viewBox: "0 0 24 24",
				width: size,
				height: size,
				fill: "none",
				stroke: "currentColor",
				strokeWidth: ICON_STROKE.width,
				strokeLinecap: ICON_STROKE.linecap,
				strokeLinejoin: ICON_STROKE.linejoin,
				className,
				role: decorative === true ? void 0 : "img",
				"aria-hidden": decorative === true || void 0,
				"aria-label": decorative === true ? void 0 : label,
				children: (0, react_jsx_runtime.jsx)("g", { dangerouslySetInnerHTML: { __html: body } })
			});
		}
		/** Build one named icon component from the shared data table. */
		function makeIcon(name) {
			const definition = ICONS[name];
			function Component(props) {
				return (0, react_jsx_runtime.jsx)(IconSvg, {
					body: definition.body,
					label: props.label ?? definition.label,
					...props
				});
			}
			return Component;
		}
		/** Build one named status icon component. */
		function makeStatusIcon(name) {
			const definition = STATUS_ICONS[name];
			function Component(props) {
				return (0, react_jsx_runtime.jsx)(IconSvg, {
					body: definition.body,
					label: props.label ?? definition.label,
					...props
				});
			}
			return Component;
		}
		const TeamsXLogo = makeIcon("teams-x-logo");
		const RoleLead = makeIcon("role-lead");
		/** Role → icon map used by the roster renderer. */
		const ROLE_ICONS = {
			lead: RoleLead,
			captain: RoleLead,
			researcher: makeIcon("role-researcher"),
			engineer: makeIcon("role-engineer"),
			reviewer: makeIcon("role-reviewer"),
			qa: makeIcon("role-qa"),
			security: makeIcon("role-security"),
			docs: makeIcon("role-docs"),
			designer: makeIcon("role-designer"),
			operator: makeIcon("role-operator"),
			data: makeIcon("role-data")
		};
		const ActionWorking = makeIcon("action-working");
		const ActionThinking = makeIcon("action-thinking");
		makeIcon("action-reporting");
		makeIcon("action-sending");
		const ActionSleeping = makeIcon("action-sleeping");
		makeIcon("action-celebrating");
		/** Visual task state → status icon map used by the DAG renderer. */
		const VISUAL_STATE_ICONS = {
			open: makeStatusIcon("status-open"),
			running: makeStatusIcon("status-running"),
			blocked: makeStatusIcon("status-blocked"),
			completed: makeStatusIcon("status-completed"),
			failed: makeStatusIcon("status-failed"),
			cancelled: makeStatusIcon("status-cancelled")
		};
		/** Member activity → action icon map used by the roster renderer. */
		const ACTIVITY_ICONS = {
			working: ActionWorking,
			idle: ActionSleeping,
			unknown: ActionThinking
		};
		//#endregion
		//#region lib/client/ActivityPanel.js
		/**
		* TeamsX activity panel, mounted as a session-scoped header action.
		*
		* The badge registers into `conversation.session.header.actions` (next to the
		* autonomous-mode and Session-log controls), so it only ever exists inside an
		* open session's title bar. The framework resolves `sessionId` for
		* session-scoped slots, and the badge renders nothing unless a team belongs
		* to THIS session (captain or member id match) — switching to a session that
		* never used TeamsX shows no badge at all.
		*
		* The expanded panel portals to document.body as a fixed-position card
		* anchored under the badge; placement probes elementFromPoint so third-party
		* higher-layer docks (better-sidebar) cannot cover it.
		* @module dsh-teams-x/client/ActivityPanel
		*/
		/** Panel data endpoint served by the host plane. */
		const TEAMSX_STATE_URL = "/plugins/dsh-teams-x/state";
		/** Halt endpoint served by the host plane. */
		const TEAMSX_HALT_URL = "/plugins/dsh-teams-x/halt";
		/** Per-member pause endpoint served by the host plane. */
		const TEAMSX_PAUSE_URL = "/plugins/dsh-teams-x/member/pause";
		/** Staged-plan review endpoint served by the host plane. */
		const TEAMSX_PLAN_URL = "/plugins/dsh-teams-x/plan";
		/** Poll cadence for the live view. */
		const POLL_INTERVAL_MS = 4e3;
		/** Collapsed discovery cadence: slow, but fast enough to notice a team the
		* session creates after this badge mounted. */
		const DISCOVERY_INTERVAL_MS = 1e4;
		/** Interpolate `{key}` params into a locale string. */
		function format(template, params) {
			if (params === void 0) return template;
			return template.replace(/\{(\w+)\}/gu, (match, key) => Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match);
		}
		/** Wrap the harness translate function with interpolation. */
		function makeT(t) {
			return (key, params) => format(t(key, params), params);
		}
		/** Poll the state endpoint: once on mount, then on an interval ONLY while expanded. */
		function useTeamSnapshots(expanded) {
			const [teams, setTeams] = (0, react.useState)([]);
			const [error, setError] = (0, react.useState)(void 0);
			const [loading, setLoading] = (0, react.useState)(false);
			const [tick, setTick] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				let disposed = false;
				const load = async () => {
					setLoading(true);
					try {
						const response = await fetch(TEAMSX_STATE_URL, { headers: { accept: "application/json" } });
						if (!response.ok) throw new Error(`HTTP ${response.status}`);
						const body = await response.json();
						if (!disposed) {
							setTeams(body.teams);
							setError(void 0);
						}
					} catch (cause) {
						if (!disposed) setError(cause instanceof Error ? cause.message : String(cause));
					} finally {
						if (!disposed) setLoading(false);
					}
				};
				load();
				const interval = expanded ? POLL_INTERVAL_MS : DISCOVERY_INTERVAL_MS;
				const timer = window.setInterval(() => {
					load();
				}, interval);
				return () => {
					disposed = true;
					window.clearInterval(timer);
				};
			}, [expanded, tick]);
			return {
				teams,
				error,
				loading,
				reload: () => setTick((value) => value + 1)
			};
		}
		/**
		* Place the expanded panel as a dropdown under the badge, cleared below the
		* session tab bar. Placement runs ONCE on open (plus on resize): no periodic
		* re-probing, so the panel never visibly jumps after settling. The one-shot
		* horizontal probe still dodges a higher-layer dock that would cover it.
		*/
		function usePanelPlacement(badgeRef, panelRef, expanded) {
			const [pos, setPos] = (0, react.useState)({
				top: 96,
				right: 18
			});
			(0, react.useEffect)(() => {
				if (!expanded) return;
				const place = () => {
					const badge = badgeRef.current;
					if (badge === null) return;
					const rect = badge.getBoundingClientRect();
					const tablist = document.querySelector("[role=\"tablist\"]");
					const tablistBottom = tablist === null ? 0 : tablist.getBoundingClientRect().bottom;
					let top = Math.max(rect.bottom + 6, tablistBottom + 8, 8);
					const maxH = Math.min(window.innerHeight * .72, 640);
					if (top + maxH > window.innerHeight - 8) top = Math.max(8, window.innerHeight - maxH - 8);
					const preferred = Math.max(8, window.innerWidth - rect.right);
					const panel = panelRef.current;
					let right = preferred;
					if (panel !== null) {
						const candidates = [
							preferred,
							preferred + 80,
							preferred + 180,
							preferred + 320,
							preferred + 480
						];
						for (const candidate of candidates) {
							panel.style.right = `${candidate}px`;
							const r = panel.getBoundingClientRect();
							if (r.width === 0) break;
							const probeY = Math.min(r.top + 20, window.innerHeight - 1);
							const topEl = document.elementFromPoint(r.left + Math.min(60, r.width / 2), probeY);
							if (topEl === null || panel === topEl || panel.contains(topEl)) {
								right = candidate;
								break;
							}
							right = candidate;
						}
					}
					setPos((prev) => prev.top === top && prev.right === right ? prev : {
						top,
						right
					});
				};
				place();
				window.addEventListener("resize", place);
				return () => {
					window.removeEventListener("resize", place);
				};
			}, [
				badgeRef,
				panelRef,
				expanded
			]);
			return pos;
		}
		/** POST the halt route for one team. */
		async function haltTeam(captainSessionId, teamId) {
			const response = await fetch(TEAMSX_HALT_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					sessionId: captainSessionId,
					teamId
				})
			});
			if (!response.ok) {
				const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
				throw new Error(body.error ?? `HTTP ${response.status}`);
			}
		}
		/** POST the pause route for one member (interrupt; attempt stays parked). */
		async function pauseMember(captainSessionId, teamId, memberName) {
			const response = await fetch(TEAMSX_PAUSE_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					sessionId: captainSessionId,
					teamId,
					memberName
				})
			});
			if (!response.ok) {
				const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
				throw new Error(body.error ?? `HTTP ${response.status}`);
			}
		}
		/** One member row of the roster. */
		function MemberRow({ member, team, t, openMember }) {
			const [pausing, setPausing] = (0, react.useState)(false);
			const [pauseError, setPauseError] = (0, react.useState)(void 0);
			const RoleIcon = ROLE_ICONS[member.role?.trim().toLowerCase() ?? ""];
			const ActivityIcon = ACTIVITY_ICONS[member.activity];
			const stateKey = member.activity === "working" ? "member.state.working" : member.activity === "idle" ? "member.state.idle" : "member.state.unknown";
			const openable = member.id !== "";
			const pause = async () => {
				setPausing(true);
				setPauseError(void 0);
				try {
					await pauseMember(team.captainSessionId, team.teamId, member.name);
				} catch (cause) {
					setPauseError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setPausing(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ActivityPanel_module_css_default.memberRow,
				"data-activity": member.activity,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.memberIcon,
						children: RoleIcon !== void 0 ? (0, react_jsx_runtime.jsx)(RoleIcon, {
							size: 18,
							decorative: true
						}) : (0, react_jsx_runtime.jsx)(TeamsXLogo, {
							size: 18,
							label: member.name
						})
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.memberName,
						title: member.name,
						children: openable ? (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ActivityPanel_module_css_default.memberLink,
							onClick: () => {
								openMember(team.captainSessionId, member.id);
							},
							title: t("member.openSession"),
							children: member.name
						}) : member.name
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.memberMeta,
						children: pauseError ?? member.model
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.memberProgress,
						title: t("member.progress", {
							done: member.done,
							total: member.total
						}),
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.memberProgressBar,
							"aria-hidden": true,
							children: (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.memberProgressFill,
								style: { width: `${member.progress}%` },
								"data-active": member.progress > 0 && member.progress < 100 || void 0,
								"data-done": member.progress >= 100 || void 0
							})
						}), t("member.progress", {
							done: member.done,
							total: member.total
						})]
					}),
					member.unread > 0 && (0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.memberUnread,
						title: t("member.unread", { count: member.unread }),
						children: member.unread
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.memberState,
						children: [
							ActivityIcon !== void 0 && (0, react_jsx_runtime.jsx)(ActivityIcon, {
								size: 14,
								className: member.activity === "working" ? ActivityPanel_module_css_default.animPulse : void 0,
								decorative: true
							}),
							t(stateKey),
							member.activity === "working" && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.memberPause,
								onClick: () => {
									pause();
								},
								disabled: pausing,
								"aria-label": t("member.pause"),
								title: t("member.pause"),
								children: pausing ? "…" : "⏸"
							})
						]
					})
				]
			});
		}
		/** One task row of the DAG list, indented by dependency depth. */
		function TaskRow({ task, t }) {
			const StateIcon = VISUAL_STATE_ICONS[task.state];
			const statusKey = `task.status.${task.status}`;
			const visualKey = `task.visual.${task.state}`;
			const assignee = task.assignee === "" ? t("task.assignee.shared") : task.assignee === "captain" ? t("task.assignee.captain") : task.assignee;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ActivityPanel_module_css_default.taskRow,
				"data-state": task.state,
				style: { marginInlineStart: `${Math.min(task.depth, 4) * 18}px` },
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.taskIcon,
						children: StateIcon !== void 0 && (0, react_jsx_runtime.jsx)(StateIcon, {
							size: 14,
							className: task.state === "running" ? ActivityPanel_module_css_default.animPulse : void 0,
							decorative: true
						})
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.taskId,
						children: task.id
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.taskSubject,
						title: task.description || task.subject,
						children: task.subject
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.taskAssignee,
						children: assignee
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.taskStatus,
						title: t(visualKey),
						children: t(statusKey)
					})
				]
			});
		}
		/** POST one staged-plan review action. */
		async function planAction(captainSessionId, teamId, action) {
			const response = await fetch(TEAMSX_PLAN_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					sessionId: captainSessionId,
					teamId,
					action
				})
			});
			if (!response.ok) {
				const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
				throw new Error(body.error ?? `HTTP ${response.status}`);
			}
		}
		/** The staged-plan review bar: approve, return-to-chat, and discard (2-step). */
		function PlanReviewBar({ team, t }) {
			const [busy, setBusy] = (0, react.useState)(void 0);
			const [discardArmed, setDiscardArmed] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(void 0);
			const runnable = team.members.length > 0 && team.tasks.length > 0;
			const run = async (action) => {
				setBusy(action);
				setError(void 0);
				try {
					await planAction(team.captainSessionId, team.teamId, action);
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
					setBusy(void 0);
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ActivityPanel_module_css_default.planBar,
				role: "group",
				"aria-label": t("plan.needsReview"),
				children: [
					(0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.planBarText,
						children: t("plan.needsReview")
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.planError,
						children: error
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.planActions,
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.planApprove,
								disabled: busy !== void 0 || !runnable,
								title: runnable ? void 0 : t("plan.notRunnable"),
								onClick: () => {
									run("approve");
								},
								children: busy === "approve" ? "…" : t("plan.approve")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.planChat,
								disabled: busy !== void 0,
								onClick: () => {
									run("continue");
								},
								children: busy === "continue" ? "…" : t("plan.returnToChat")
							}),
							discardArmed ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.planCancel,
								onClick: () => {
									setDiscardArmed(false);
								},
								disabled: busy !== void 0,
								children: t("team.stopCancel")
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.planDiscard,
								onClick: () => {
									run("discard");
								},
								disabled: busy !== void 0,
								children: busy === "discard" ? "…" : t("plan.discardConfirm")
							})] }) : (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.planDiscardArm,
								onClick: () => {
									setDiscardArmed(true);
								},
								disabled: busy !== void 0,
								children: t("plan.discard")
							})
						]
					})
				]
			});
		}
		/** One team card: header, roster, DAG, inbox preview, and stop control. */
		function TeamCard({ team, t, openMember }) {
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [stopping, setStopping] = (0, react.useState)(false);
			const [stopError, setStopError] = (0, react.useState)(void 0);
			const done = team.tasks.filter((task) => task.status === "completed").length;
			const stop = async () => {
				setStopping(true);
				setStopError(void 0);
				try {
					await haltTeam(team.captainSessionId, team.teamId);
					setConfirming(false);
				} catch (cause) {
					setStopError(cause instanceof Error ? cause.message : String(cause));
				} finally {
					setStopping(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ActivityPanel_module_css_default.teamCard,
				"data-phase": team.phase,
				"data-halted": team.halted === true || void 0,
				children: [
					team.phase === "staged" && (0, react_jsx_runtime.jsx)(PlanReviewBar, {
						team,
						t
					}),
					(0, react_jsx_runtime.jsxs)("header", {
						className: ActivityPanel_module_css_default.teamHeader,
						children: [
							(0, react_jsx_runtime.jsx)(TeamsXLogo, {
								size: 20,
								className: ActivityPanel_module_css_default.teamLogo,
								decorative: true
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: ActivityPanel_module_css_default.teamTitleBlock,
								children: [(0, react_jsx_runtime.jsx)("h3", {
									className: ActivityPanel_module_css_default.teamName,
									children: team.name
								}), team.description !== void 0 && (0, react_jsx_runtime.jsx)("p", {
									className: ActivityPanel_module_css_default.teamGoal,
									children: team.description
								})]
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: ActivityPanel_module_css_default.teamBadges,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.badge,
										children: t(team.phase === "staged" ? "team.phase.staged" : "team.phase.running")
									}),
									team.planReviewState !== void 0 && (0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.badgeMuted,
										children: t(`team.planReview.${team.planReviewState}`)
									}),
									team.halted === true && (0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.badgeWarn,
										children: t("team.halted")
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.badgeMuted,
										children: t("team.members", { count: team.members.length })
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.badgeMuted,
										children: t("team.done", {
											done,
											total: team.tasks.length
										})
									})
								]
							}),
							team.phase === "running" && team.halted !== true && !confirming && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.stopButton,
								onClick: () => {
									setConfirming(true);
								},
								children: t("team.stop")
							})
						]
					}),
					confirming && (0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.stopConfirmBox,
						role: "alertdialog",
						"aria-label": t("team.stopTitle", { team: team.name }),
						children: [
							(0, react_jsx_runtime.jsx)("p", { children: t("team.stopDescription", {
								tasks: team.tasks.filter((task) => task.status === "pending" || task.status === "claimed" || task.status === "in_progress").length,
								members: team.members.filter((member) => member.activity === "working").length
							}) }),
							stopError !== void 0 && (0, react_jsx_runtime.jsx)("p", {
								className: ActivityPanel_module_css_default.stopError,
								children: t("team.stopFailed", { message: stopError })
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: ActivityPanel_module_css_default.stopActions,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ActivityPanel_module_css_default.stopCancel,
									onClick: () => {
										setConfirming(false);
									},
									disabled: stopping,
									children: t("team.stopCancel")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: ActivityPanel_module_css_default.stopConfirm,
									onClick: () => {
										stop();
									},
									disabled: stopping,
									children: stopping ? t("team.stopping") : t("team.stopConfirm")
								})]
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.roster,
						children: team.members.map((member) => (0, react_jsx_runtime.jsx)(MemberRow, {
							member,
							team,
							t,
							openMember
						}, member.id !== "" ? member.id : member.name))
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.dag,
						children: team.tasks.map((task) => (0, react_jsx_runtime.jsx)(TaskRow, {
							task,
							t
						}, task.id))
					}),
					(0, react_jsx_runtime.jsxs)("footer", {
						className: ActivityPanel_module_css_default.inbox,
						children: [(0, react_jsx_runtime.jsx)("h4", {
							className: ActivityPanel_module_css_default.inboxTitle,
							children: t("inbox.title")
						}), team.captainInbox.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: ActivityPanel_module_css_default.inboxEmpty,
							children: t("inbox.empty")
						}) : (0, react_jsx_runtime.jsx)("ul", {
							className: ActivityPanel_module_css_default.inboxList,
							children: team.captainInbox.map((message, index) => (0, react_jsx_runtime.jsxs)("li", {
								className: ActivityPanel_module_css_default.inboxItem,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.inboxFrom,
									children: message.from
								}), (0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.inboxContent,
									children: message.content
								})]
							}, `${message.from}-${index}`))
						})]
					})
				]
			});
		}
		/**
		* The session-scoped shell: a header chip that exists only when THIS session
		* owns or participates in a live team; the expanded panel portals to body.
		*/
		function ActivityPanel({ sessionId, t, openMember }) {
			const translate = (0, react.useMemo)(() => makeT(t), [t]);
			const [expanded, setExpanded] = (0, react.useState)(false);
			const badgeRef = (0, react.useRef)(null);
			const panelRef = (0, react.useRef)(null);
			const { teams, error, loading, reload } = useTeamSnapshots(expanded);
			const sessionTeams = (0, react.useMemo)(() => teams.filter((team) => team.captainSessionId === sessionId || team.members.some((member) => member.id === sessionId)), [teams, sessionId]);
			const workingCount = sessionTeams.reduce((count, team) => count + team.members.filter((member) => member.activity === "working").length, 0);
			const placement = usePanelPlacement(badgeRef, panelRef, expanded);
			(0, react.useEffect)(() => {
				if (!expanded) return;
				const onPointerDown = (event) => {
					const target = event.target;
					if (target === null) return;
					if (panelRef.current?.contains(target) === true) return;
					if (badgeRef.current?.contains(target) === true) return;
					setExpanded(false);
				};
				document.addEventListener("pointerdown", onPointerDown);
				return () => {
					document.removeEventListener("pointerdown", onPointerDown);
				};
			}, [expanded]);
			if (sessionTeams.length === 0 && error === void 0) return null;
			const badge = (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				ref: badgeRef,
				className: ActivityPanel_module_css_default.badgeFab,
				"data-expanded": expanded === true || void 0,
				onClick: () => {
					setExpanded((value) => !value);
				},
				"aria-label": translate("panel.aria"),
				"aria-expanded": expanded === true || void 0,
				title: translate("panel.title"),
				children: [
					(0, react_jsx_runtime.jsx)(TeamsXLogo, {
						size: 14,
						decorative: true
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.badgeFabCount,
						children: sessionTeams.length
					}),
					workingCount > 0 && (0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.badgeFabBusy,
						"data-busy": true,
						children: workingCount
					})
				]
			});
			if (!expanded) return badge;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [badge, (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
				className: ActivityPanel_module_css_default.panelWindow,
				ref: panelRef,
				style: {
					top: `${placement.top}px`,
					right: `${placement.right}px`,
					maxWidth: `${Math.max(280, window.innerWidth - placement.right - 16)}px`
				},
				role: "region",
				"aria-label": translate("panel.aria"),
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: ActivityPanel_module_css_default.panelHeader,
						children: [(0, react_jsx_runtime.jsxs)("h2", {
							className: ActivityPanel_module_css_default.panelTitle,
							children: [
								(0, react_jsx_runtime.jsx)(TeamsXLogo, {
									size: 18,
									decorative: true
								}),
								" ",
								translate("panel.title")
							]
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: ActivityPanel_module_css_default.panelActions,
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.refreshButton,
								onClick: reload,
								"data-loading": loading === true || void 0,
								"aria-label": translate("panel.refresh"),
								title: translate("panel.refresh"),
								children: (0, react_jsx_runtime.jsx)("span", {
									className: loading === true ? ActivityPanel_module_css_default.animSpin : void 0,
									children: "⟳"
								})
							}), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.refreshButton,
								onClick: () => {
									setExpanded(false);
								},
								"aria-label": translate("panel.close"),
								title: translate("panel.close"),
								children: "✕"
							})]
						})]
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.panelError,
						children: translate("panel.error", { message: error })
					}),
					error === void 0 && sessionTeams.length === 0 && (0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.panelEmpty,
						children: translate("panel.empty")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.teamList,
						children: sessionTeams.map((team) => (0, react_jsx_runtime.jsx)(TeamCard, {
							team,
							t: translate,
							openMember
						}, `${team.workspace}/${team.teamId}`))
					})
				]
			}), document.body)] });
		}
		//#endregion
		//#region lib/client/locales.js
		/**
		* `teamsX` namespace dictionaries for the TeamsX activity panel.
		* The Simplified Chinese dictionary is the key-set source of truth.
		* @module dsh-teams-x/client/locales
		*/
		/** Dictionary namespace owned by the TeamsX client plugin. */
		const TEAMSX_LOCALE_NAMESPACE = "teamsX";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"panel.aria": "TeamsX 活动面板",
			"panel.title": "TeamsX 团队活动",
			"panel.empty": "暂无团队活动 — 在会话中说\"用 TeamsX 做 X\"即可组建团队",
			"panel.refresh": "刷新",
			"panel.close": "关闭面板",
			"panel.live": "实时",
			"panel.archived": "历史",
			"panel.error": "加载团队状态失败：{message}",
			"team.phase.staged": "待审批",
			"team.phase.running": "运行中",
			"team.halted": "已停止",
			"team.planReview.awaiting_review": "等待用户审批",
			"team.planReview.awaiting_feedback": "回到对话修改计划",
			"team.members": "{count} 名成员",
			"team.tasks": "{count} 项任务",
			"team.done": "{done}/{total} 已完成",
			"team.stop": "停止团队",
			"team.stopConfirm": "确认停止",
			"team.stopCancel": "继续运行",
			"team.stopTitle": "确认停止\"{team}\"？",
			"team.stopDescription": "将取消 {tasks} 项未完成任务，并中断 {members} 名成员的当前回合。",
			"team.stopping": "正在停止…",
			"team.stopFailed": "停止失败：{message}",
			"plan.needsReview": "计划待审批 — 确认无误后批准运行，或回聊天修改",
			"plan.approve": "批准并运行",
			"plan.returnToChat": "回聊天修改",
			"plan.discard": "放弃计划",
			"plan.discardConfirm": "确认放弃？",
			"plan.notRunnable": "需要至少一名成员和一项任务才能运行",
			"plan.review": "{review}",
			"format.listSeparator": "、",
			"member.state.idle": "空闲",
			"member.state.working": "工作中",
			"member.state.removed": "已移除",
			"member.state.unknown": "状态未知",
			"member.state.unspawned": "待创建",
			"member.unread": "{count} 条未读",
			"member.progress": "{done}/{total}",
			"member.pause": "暂停该成员（当前尝试保持挂起，可恢复）",
			"member.openSession": "打开该成员的会话记录",
			"task.status.pending": "待执行",
			"task.status.claimed": "已认领",
			"task.status.in_progress": "进行中",
			"task.status.completed": "已完成",
			"task.status.failed": "失败",
			"task.status.cancelled": "已取消",
			"task.visual.blocked": "被阻塞",
			"task.visual.open": "可执行",
			"task.visual.running": "进行中",
			"task.visual.completed": "已完成",
			"task.visual.failed": "失败",
			"task.visual.cancelled": "已取消",
			"task.kind.work": "常规",
			"task.kind.requirements": "需求",
			"task.kind.implementation": "实现",
			"task.kind.verification": "验证",
			"task.kind.review": "评审",
			"task.kind.repair": "修复",
			"task.kind.integration": "集成",
			"task.assignee.shared": "共享池",
			"task.assignee.captain": "队长",
			"task.depth": "第 {depth} 层",
			"inbox.title": "队长收件箱",
			"inbox.empty": "收件箱为空",
			"inbox.more": "还有 {count} 条…",
			"role.lead": "队长",
			"role.researcher": "研究员",
			"role.engineer": "工程师",
			"role.reviewer": "评审员",
			"role.qa": "测试",
			"role.security": "安全",
			"role.docs": "文档",
			"role.designer": "设计",
			"role.operator": "运维",
			"role.data": "数据"
		};
		/** English dictionary. */
		const en = {
			"panel.aria": "TeamsX activity panel",
			"panel.title": "TeamsX team activity",
			"panel.empty": "No team activity yet — say \"use TeamsX to do X\" in a session to assemble a team",
			"panel.refresh": "Refresh",
			"panel.close": "Close panel",
			"panel.live": "Live",
			"panel.archived": "Archive",
			"panel.error": "Failed to load team state: {message}",
			"team.phase.staged": "Awaiting approval",
			"team.phase.running": "Running",
			"team.halted": "Halted",
			"team.planReview.awaiting_review": "Waiting for user approval",
			"team.planReview.awaiting_feedback": "Returned to chat for revision",
			"team.members": "{count} members",
			"team.tasks": "{count} tasks",
			"team.done": "{done}/{total} completed",
			"team.stop": "Stop team",
			"team.stopConfirm": "Confirm stop",
			"team.stopCancel": "Keep running",
			"team.stopTitle": "Stop \"{team}\"?",
			"team.stopDescription": "This cancels {tasks} unfinished tasks and interrupts {members} member turns.",
			"team.stopping": "Stopping…",
			"team.stopFailed": "Stop failed: {message}",
			"plan.needsReview": "Plan awaiting review — approve to run, or return to chat to revise",
			"plan.approve": "Approve & run",
			"plan.returnToChat": "Return to chat",
			"plan.discard": "Discard plan",
			"plan.discardConfirm": "Discard for sure?",
			"plan.notRunnable": "At least one member and one task are required to run",
			"plan.review": "{review}",
			"format.listSeparator": ", ",
			"member.state.idle": "Idle",
			"member.state.working": "Working",
			"member.state.removed": "Removed",
			"member.state.unknown": "Unknown",
			"member.state.unspawned": "Unspawned",
			"member.unread": "{count} unread",
			"member.progress": "{done}/{total}",
			"member.pause": "Pause member (the open attempt stays parked)",
			"member.openSession": "Open this member's transcript",
			"task.status.pending": "Pending",
			"task.status.claimed": "Claimed",
			"task.status.in_progress": "In progress",
			"task.status.completed": "Completed",
			"task.status.failed": "Failed",
			"task.status.cancelled": "Cancelled",
			"task.visual.blocked": "Blocked",
			"task.visual.open": "Ready",
			"task.visual.running": "Running",
			"task.visual.completed": "Completed",
			"task.visual.failed": "Failed",
			"task.visual.cancelled": "Cancelled",
			"task.kind.work": "Work",
			"task.kind.requirements": "Requirements",
			"task.kind.implementation": "Implementation",
			"task.kind.verification": "Verification",
			"task.kind.review": "Review",
			"task.kind.repair": "Repair",
			"task.kind.integration": "Integration",
			"task.assignee.shared": "Shared pool",
			"task.assignee.captain": "Captain",
			"task.depth": "Depth {depth}",
			"inbox.title": "Captain inbox",
			"inbox.empty": "Inbox is empty",
			"inbox.more": "{count} more…",
			"role.lead": "Lead",
			"role.researcher": "Researcher",
			"role.engineer": "Engineer",
			"role.reviewer": "Reviewer",
			"role.qa": "QA",
			"role.security": "Security",
			"role.docs": "Docs",
			"role.designer": "Designer",
			"role.operator": "Operator",
			"role.data": "Data"
		};
		//#endregion
		//#region lib/client/index.js
		/** Required services: slots (mount point), locale (dictionaries), sessions (member transcript navigation). */
		const inject = [
			"slots",
			"locale",
			"sessions"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(TEAMSX_LOCALE_NAMESPACE, {
				zh,
				en
			}), "teams-x: dictionaries");
			const sessions = ctx.sessions;
			const openMember = (parentId, childId) => {
				Promise.resolve().then(() => require("./session-navigation-2QJqPWyL.cjs")).then(({ openTeamsXMember }) => openTeamsXMember(sessions, parentId, childId)).catch((error) => {
					console.warn(`teams-x: failed to open member transcript ${childId}: ${String(error)}`);
				});
			};
			ctx.slots.inject("conversation.session.header.actions", () => ctx.slots.register({
				name: "conversation.session.header.actions",
				id: "teams-x-activity",
				order: 30,
				label: "TeamsX activity",
				locale: TEAMSX_LOCALE_NAMESPACE
			}, (props) => (0, react_jsx_runtime.jsx)(ActivityPanel, {
				...props,
				sessions,
				openMember
			})));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map