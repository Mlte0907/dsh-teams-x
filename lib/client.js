window.__ModuleLoader__.load({
	id: "dsh-teams-x",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let react_dom = require("react-dom");
		//#region \0teamsx-css:/tmp/opencode/teamsx-build/src/client/ActivityPanel.module.css.mjs
		const css$2 = ".v91jDa_panel,.v91jDa_panelWindow,.v91jDa_panelSheet,.v91jDa_badgeFab{font-size:var(--tx-fs-sm);--tx-text-1:var(--dsw-alias-label-primary,#e6e8ec);--tx-text-2:var(--dsw-alias-label-secondary,#a8adb4);--tx-text-3:var(--dsw-alias-label-tertiary,#7d828a);--tx-text-on-accent:var(--dsw-alias-label-primary-foreground,#0f1115);--tx-surface:transparent;--tx-surface-hover:var(--dsw-alias-interactive-bg-hover,#7f7f7f14);--tx-hairline:var(--dsw-alias-border-l2,#3c3c3d);--tx-accent:var(--dsw-alias-state-business-primary,#679efe);--tx-ok:var(--dsw-alias-state-success-primary,#22c55e);--tx-warn:var(--dsw-alias-state-warn-primary,#f59e0b);--tx-bad:var(--dsw-alias-state-error-primary,#f25a5a);--tx-mate-0:#4cc2f5;--tx-mate-1:#34d2b2;--tx-mate-2:#a78bfa;--tx-mate-3:#f472b6;--tx-mate-4:#e8b34b;--tx-mate-5:#7c8cff;--tx-viz-track:var(--dsw-alias-border-l3,#7f7f7f40);--tx-viz-edge:color-mix(in srgb, var(--dsw-alias-label-tertiary,#7d828a) 60%, transparent);--tx-fs-2xs:max(10px, calc(var(--dsh-content-font-size-secondary,13px) - 3px));--tx-fs-xs:max(11px, calc(var(--dsh-content-font-size-secondary,13px) - 2px));--tx-fs-sm:var(--dsh-content-font-size-secondary,13px);--tx-fs-lg:var(--dsh-content-font-size,14px);--tx-sp-1:2px;--tx-sp-2:4px;--tx-sp-3:6px;--tx-sp-4:8px;--tx-sp-5:12px;--tx-sp-6:16px;--tx-r-container:12px;--tx-r-inner:8px;--tx-r-ctl:6px;--tx-r-tag:4px;--tx-r-sm:var(--tx-r-tag);--tx-r-md:var(--tx-r-ctl);--tx-r-lg:var(--tx-r-container);--tx-ease-out:cubic-bezier(.23, 1, .32, 1);--tx-ease-inout:cubic-bezier(.77, 0, .175, 1);--tx-dur-press:.12s;--tx-dur-ctl:.16s;--tx-dur-ui:.18s;--tx-dur-viz:.3s;--tx-mono:var(--ds-font-family-code,ui-monospace, \"SF Mono\", \"JetBrains Mono\", monospace)}.v91jDa_panel{flex-direction:column;width:100%;min-width:0;display:flex;position:relative}.v91jDa_panelTab{width:100%;max-width:760px;padding:var(--tx-sp-4) var(--tx-sp-6) var(--tx-sp-6);box-sizing:border-box;margin-inline:auto}.v91jDa_badgeFab{border-radius:var(--tx-r-ctl);width:26px;height:26px;color:var(--tx-text-2);cursor:pointer;transition:background-color var(--tx-dur-ctl) var(--tx-ease-out), color var(--tx-dur-ctl) var(--tx-ease-out), transform var(--tx-dur-press) var(--tx-ease-out);background:0 0;border:none;justify-content:center;align-items:center;display:inline-flex;position:relative}.v91jDa_badgeFab:hover{background:var(--tx-surface-hover);color:var(--tx-text-1)}.v91jDa_badgeFab:active{transform:scale(.97)}.v91jDa_badgeFab svg{flex-shrink:0}.v91jDa_badgeFab[data-expanded]{background:var(--tx-surface-hover);color:var(--tx-text-1)}.v91jDa_badgeFabBusy{corner-shape:round;background:var(--tx-accent);border-radius:999px;width:6px;height:6px;position:absolute;top:-1px;right:-1px}.v91jDa_badgeFab[data-busy]{animation:v91jDa_teamsx-badge-breath 1.6s var(--tx-ease-inout) infinite}.v91jDa_badgeFab[data-expanded][data-busy]{background:color-mix(in srgb, var(--tx-accent) 14%, transparent);border-color:color-mix(in srgb, var(--tx-accent) 45%, transparent);color:var(--tx-accent);animation:none}.v91jDa_panelWindow{z-index:60;width:560px;max-width:calc(100vw - 16px);max-height:min(78vh,720px);padding:var(--tx-sp-5);border:1px solid var(--tx-hairline);border-radius:var(--tx-r-container);background:var(--dsw-alias-bg-base,#1c1d21);transform-origin:0 0;animation:v91jDa_teamsx-window-in var(--tx-dur-ui) var(--tx-ease-out) both;position:fixed;overflow-y:auto;box-shadow:0 12px 32px #00000052}@keyframes v91jDa_teamsx-window-in{0%{opacity:0;transform:scale(.97)translateY(-4px)}to{opacity:1;transform:scale(1)translateY(0)}}.v91jDa_panelSheet{z-index:60;max-height:78dvh;padding:var(--tx-sp-5) var(--tx-sp-4) calc(env(safe-area-inset-bottom,0px) + var(--tx-sp-5));border:none;border-top:1px solid var(--tx-hairline);border-radius:var(--tx-r-container) var(--tx-r-container) 0 0;background:var(--dsw-alias-bg-base,#1c1d21);animation:v91jDa_teamsx-sheet-up .24s var(--tx-ease-out) both;position:fixed;bottom:0;left:0;right:0;overflow-y:auto}@keyframes v91jDa_teamsx-sheet-up{0%{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)}}.v91jDa_panelHeader{justify-content:space-between;align-items:center;gap:var(--tx-sp-3);padding:0 0 var(--tx-sp-3);border-bottom:1px solid var(--tx-hairline);font-size:var(--tx-fs-sm);display:flex}.v91jDa_panelTitle{font-size:var(--tx-fs-sm);letter-spacing:-.01em;color:var(--tx-text-1);align-items:center;gap:6px;margin:0;font-weight:600;display:inline-flex}.v91jDa_panelActions{align-items:center;gap:var(--tx-sp-2);display:inline-flex}.v91jDa_modeToggle{border:1px solid var(--tx-hairline);border-radius:var(--tx-r-ctl);background:0 0;padding:2px;display:inline-flex}.v91jDa_modeOption{color:var(--tx-text-3);font-size:var(--tx-fs-2xs);border-radius:var(--tx-r-tag);cursor:pointer;transition:background-color var(--tx-dur-ctl) var(--tx-ease-out), color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;border:none;padding:2px 8px}.v91jDa_modeOption:hover{color:var(--tx-text-1)}.v91jDa_modeActive{background:var(--tx-surface-hover);color:var(--tx-text-1)}.v91jDa_refreshButton{border-radius:var(--tx-r-tag);width:22px;height:22px;color:var(--tx-text-3);cursor:pointer;transition:background-color var(--tx-dur-ctl) var(--tx-ease-out), color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;border:none;justify-content:center;align-items:center;display:inline-flex}.v91jDa_refreshButton:hover{background:var(--tx-surface-hover);color:var(--tx-text-1)}.v91jDa_emptyState{align-items:center;gap:var(--tx-sp-3);padding:var(--tx-sp-6) var(--tx-sp-4);color:var(--tx-text-3);font-size:var(--tx-fs-sm);flex-direction:column;display:flex}.v91jDa_emptyLogo{opacity:.4}.v91jDa_panelEmpty{font-size:var(--tx-fs-xs);text-align:center;max-width:30ch;margin:0}.v91jDa_errorBox{justify-content:space-between;align-items:center;gap:var(--tx-sp-3);padding:var(--tx-sp-3) var(--tx-sp-4);border:1px solid color-mix(in srgb, var(--tx-bad) 35%, transparent);border-radius:var(--tx-r-inner);background:color-mix(in srgb, var(--tx-bad) 10%, transparent);margin-top:var(--tx-sp-3);display:flex}.v91jDa_panelError{font-size:var(--tx-fs-xs);color:var(--tx-bad);margin:0}.v91jDa_retryButton{border:1px solid var(--tx-hairline);border-radius:var(--tx-r-tag);color:var(--tx-text-2);font-size:var(--tx-fs-2xs);cursor:pointer;transition:background-color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;flex-shrink:0;padding:3px 10px}.v91jDa_retryButton:hover{background:var(--tx-surface-hover);color:var(--tx-text-1)}.v91jDa_staleNote{justify-content:space-between;align-items:center;gap:var(--tx-sp-3);margin-top:var(--tx-sp-3);padding:var(--tx-sp-1) var(--tx-sp-2);border-radius:var(--tx-r-tag);border:1px dashed var(--tx-viz-track);color:var(--tx-text-3);font-size:var(--tx-fs-2xs);display:flex}.v91jDa_staleRetry{color:var(--tx-accent);font-size:var(--tx-fs-2xs);cursor:pointer;background:0 0;border:none;flex-shrink:0;padding:0}.v91jDa_staleRetry:hover{text-decoration:underline}.v91jDa_teamList{flex-direction:column;display:flex}.v91jDa_teamCard{gap:var(--tx-sp-3);padding:var(--tx-sp-4) 0 var(--tx-sp-5);font-size:var(--tx-fs-sm);flex-direction:column;display:flex}.v91jDa_teamCard+.v91jDa_teamCard{border-top:1px solid var(--tx-viz-track)}.v91jDa_teamCard[data-halted]{opacity:.62}.v91jDa_teamHeader{align-items:flex-start;gap:var(--tx-sp-3);display:flex}.v91jDa_teamLogo{color:var(--tx-accent);flex-shrink:0;margin-top:1px}.v91jDa_teamTitleBlock{flex:1;min-width:0}.v91jDa_teamName{font-size:var(--tx-fs-lg);letter-spacing:-.01em;color:var(--tx-text-1);-webkit-line-clamp:2;word-break:break-word;-webkit-box-orient:vertical;margin:0;font-weight:600;line-height:1.25;display:-webkit-box;overflow:hidden}.v91jDa_teamGoal{font-size:var(--tx-fs-xs);color:var(--tx-text-2);-webkit-line-clamp:2;-webkit-box-orient:vertical;margin:2px 0 0;line-height:1.45;display:-webkit-box;overflow:hidden}.v91jDa_phaseTag{font-size:var(--tx-fs-2xs);corner-shape:round;border:1px solid color-mix(in srgb, var(--tx-accent) 45%, transparent);color:var(--tx-accent);font-variant-numeric:tabular-nums;border-radius:999px;flex-shrink:0;align-items:center;padding:0 8px;line-height:18px;display:inline-flex}.v91jDa_phaseTag[data-phase=staged]{border-color:color-mix(in srgb, var(--tx-warn) 45%, transparent);color:var(--tx-warn)}.v91jDa_teamNote{font-size:var(--tx-fs-2xs);color:var(--tx-text-3);flex-shrink:0;align-self:center}.v91jDa_teamNote[data-halted]{color:var(--tx-warn)}.v91jDa_stopButton{border:1px solid var(--tx-hairline);border-radius:var(--tx-r-ctl);color:var(--tx-text-3);font-size:var(--tx-fs-2xs);cursor:pointer;transition:color var(--tx-dur-ctl) var(--tx-ease-out), border-color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;flex-shrink:0;padding:3px 9px}.v91jDa_stopButton:hover{color:var(--tx-bad);border-color:color-mix(in srgb, var(--tx-bad) 40%, transparent)}.v91jDa_headStats{align-items:center;gap:var(--tx-sp-5);padding:0 var(--tx-sp-1);flex-wrap:wrap;display:flex}.v91jDa_headStat{align-items:center;gap:7px;min-width:0;display:inline-flex}.v91jDa_headStatIcon{color:var(--tx-text-3);display:inline-flex}.v91jDa_sl{flex-direction:column;min-width:0;line-height:1.2;display:inline-flex}.v91jDa_sl b{font-family:var(--tx-mono);font-variant-numeric:tabular-nums;font-size:var(--tx-fs-sm);color:var(--tx-text-1);white-space:nowrap;font-weight:600}.v91jDa_sl i{color:var(--tx-text-3);letter-spacing:.05em;white-space:nowrap;font-size:10px;font-style:normal}.v91jDa_headRing{flex:none;width:32px;height:32px;display:inline-flex;position:relative}.v91jDa_headRing[data-mini]{width:26px;height:26px}.v91jDa_headRingValue{font-family:var(--tx-mono);font-variant-numeric:tabular-nums;color:var(--tx-text-1);place-items:center;font-size:8.5px;font-weight:700;display:grid;position:absolute;inset:0}.v91jDa_ringSvg{flex-shrink:0;display:block}.v91jDa_ringSeg{fill:none;transition:stroke-dasharray var(--tx-dur-viz) var(--tx-ease-out), stroke var(--tx-dur-ctl) var(--tx-ease-out)}.v91jDa_tokviz{flex-direction:column;flex:none;gap:3px;width:46px;display:inline-flex}.v91jDa_tokviz i{background:var(--tx-viz-track);border-radius:2px;height:4px;display:block;overflow:hidden}.v91jDa_tokviz i b{background:var(--tx-accent);border-radius:2px;height:100%;display:block}.v91jDa_tokviz i[data-out] b{background:var(--tx-viz-edge)}.v91jDa_stopConfirmBox{border:1px solid color-mix(in srgb, var(--tx-bad) 35%, transparent);border-radius:var(--tx-r-inner);background:color-mix(in srgb, var(--tx-bad) 8%, transparent);padding:var(--tx-sp-3) var(--tx-sp-4)}.v91jDa_stopConfirmBox p{margin:0 0 var(--tx-sp-2);font-size:var(--tx-fs-xs);color:var(--tx-text-2)}.v91jDa_stopError{margin:0 0 var(--tx-sp-2);font-size:var(--tx-fs-2xs);color:var(--tx-bad)}.v91jDa_stopActions{justify-content:flex-end;gap:var(--tx-sp-2);display:flex}.v91jDa_stopCancel,.v91jDa_stopConfirm{border-radius:var(--tx-r-tag);font-size:var(--tx-fs-xs);cursor:pointer;padding:3px 10px}.v91jDa_stopCancel{border:1px solid var(--tx-hairline);color:var(--tx-text-2);background:0 0}.v91jDa_stopConfirm{background:var(--tx-bad);color:var(--tx-text-on-accent);border:none}.v91jDa_segbar{min-width:0}.v91jDa_segtrack{background:var(--tx-viz-track);border-radius:4px;height:8px;display:flex;overflow:hidden}.v91jDa_segtrack i{height:100%;display:block}.v91jDa_segtrack i+i{box-shadow:-1px 0 0 var(--dsw-alias-bg-base,#1c1d21)}.v91jDa_segtrack i[data-seg=done]{background:var(--tx-ok)}.v91jDa_segtrack i[data-seg=running]{background:var(--tx-accent)}.v91jDa_segtrack i[data-seg=failed]{background:var(--tx-bad)}.v91jDa_segtrack i[data-seg=blocked]{background:repeating-linear-gradient(135deg, var(--tx-warn) 0 5px, color-mix(in srgb, var(--tx-warn) 55%, transparent) 5px 10px)}.v91jDa_seglegend{gap:var(--tx-sp-3) var(--tx-sp-4);margin-top:var(--tx-sp-2);font-size:var(--tx-fs-2xs);color:var(--tx-text-2);flex-wrap:wrap;display:flex}.v91jDa_seglegend .v91jDa_lg{align-items:center;gap:5px;display:inline-flex}.v91jDa_seglegend .v91jDa_sw{background:var(--tx-viz-track);border-radius:3px;flex:none;width:9px;height:9px}.v91jDa_seglegend .v91jDa_sw[data-seg=done]{background:var(--tx-ok)}.v91jDa_seglegend .v91jDa_sw[data-seg=running]{background:var(--tx-accent)}.v91jDa_seglegend .v91jDa_sw[data-seg=failed]{background:var(--tx-bad)}.v91jDa_seglegend .v91jDa_sw[data-seg=blocked]{background:var(--tx-warn)}.v91jDa_seglegend b{font-family:var(--tx-mono);font-variant-numeric:tabular-nums;color:var(--tx-text-1)}.v91jDa_nowLabel{align-items:center;gap:var(--tx-sp-4);letter-spacing:.06em;color:var(--tx-text-3);font-size:11px;display:flex}.v91jDa_nowLabel:after{content:\"\";background:var(--tx-viz-track);flex:1;height:1px}.v91jDa_nowbar{gap:var(--tx-sp-2);scrollbar-width:none;padding-bottom:2px;display:flex;overflow-x:auto}.v91jDa_nowbar::-webkit-scrollbar{display:none}.v91jDa_nowitem{corner-shape:round;background:var(--tx-surface-hover);border:1px solid var(--tx-viz-track);font-size:var(--tx-fs-xs);color:var(--tx-text-2);cursor:pointer;max-width:260px;transition:border-color var(--tx-dur-ctl) var(--tx-ease-out), background-color var(--tx-dur-ctl) var(--tx-ease-out);border-radius:999px;flex:none;align-items:center;gap:7px;padding:4px 11px 4px 5px;display:inline-flex}.v91jDa_nowitem:hover{border-color:var(--tx-accent)}.v91jDa_nowitem[data-active]{border-color:var(--tx-accent);background:color-mix(in srgb, var(--tx-accent) 10%, transparent)}.v91jDa_nowName{color:var(--tx-ink,var(--tx-text-1));flex:none;font-weight:600}.v91jDa_nowTaskId{font-family:var(--tx-mono);font-variant-numeric:tabular-nums;color:var(--tx-text-1);flex:none;font-weight:600}.v91jDa_nowText{white-space:nowrap;text-overflow:ellipsis;min-width:0;overflow:hidden}.v91jDa_nowDot{corner-shape:round;background:var(--tx-accent);border-radius:999px;flex:none;width:7px;height:7px;animation:1.8s ease-in-out infinite v91jDa_teamsx-now-pulse}@keyframes v91jDa_teamsx-now-pulse{0%,to{opacity:1}50%{opacity:.35}}.v91jDa_memberStrip{gap:var(--tx-sp-2);flex-wrap:wrap;display:flex}.v91jDa_memberChip{border:1px solid var(--tx-viz-track);corner-shape:round;min-width:0;transition:background-color var(--tx-dur-ctl) var(--tx-ease-out), border-color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;border-radius:999px;align-items:center;gap:5px;padding:2px 9px 2px 3px;display:inline-flex;position:relative}.v91jDa_memberChip:hover{background:var(--tx-surface-hover);border-color:var(--tx-hairline)}.v91jDa_memberChipInfo{cursor:pointer;border-radius:var(--tx-r-tag);background:0 0;border:none;flex:none;padding:0;display:inline-flex}.v91jDa_memberChipIcon{border-radius:var(--tx-r-tag);width:18px;height:18px;color:var(--tx-ink,var(--tx-accent));background:color-mix(in srgb, var(--tx-ink,var(--tx-accent)) 12%, transparent);flex:none;justify-content:center;align-items:center;display:inline-flex}.v91jDa_memberChip[data-activity=working] .v91jDa_memberChipName:after{content:\"\";corner-shape:round;background:var(--tx-accent);vertical-align:1px;border-radius:999px;width:5px;height:5px;margin-left:4px;display:inline-block}.v91jDa_memberChipName{font-size:var(--tx-fs-2xs);color:var(--tx-text-2);text-overflow:ellipsis;white-space:nowrap;background:0 0;border:none;min-width:0;max-width:96px;padding:0;font-family:inherit;overflow:hidden}button.v91jDa_memberChipName{cursor:pointer;transition:color var(--tx-dur-ctl) var(--tx-ease-out)}button.v91jDa_memberChipName:hover{color:var(--tx-accent)}.v91jDa_memberChipUnread{background:var(--tx-bad);color:var(--tx-text-on-accent);corner-shape:round;min-width:14px;height:14px;font-size:9px;line-height:1;font-family:var(--tx-mono);font-variant-numeric:tabular-nums;z-index:1;border-radius:999px;justify-content:center;align-items:center;padding:0 4px;display:inline-flex;position:absolute;top:-5px;right:-5px}.v91jDa_memberChipUnread[data-inline]{flex:none;position:static}.v91jDa_memberChipPop{z-index:20;min-width:172px;padding:var(--tx-sp-2) var(--tx-sp-3);border:1px solid var(--tx-hairline);border-radius:var(--tx-r-inner);background:var(--dsw-alias-bg-base,#1c1d21);font-size:var(--tx-fs-2xs);color:var(--tx-text-2);flex-direction:column;gap:2px;display:none;position:absolute;top:calc(100% + 4px);left:0;box-shadow:0 8px 20px #0000003d}.v91jDa_memberChipPop:before{content:\"\";height:5px;position:absolute;top:-5px;left:0;right:0}.v91jDa_memberChipPop[data-open],.v91jDa_memberChip:focus-within .v91jDa_memberChipPop{display:flex}.v91jDa_memberChipPause{border:1px solid var(--tx-hairline);border-radius:var(--tx-r-tag);color:var(--tx-text-2);font-size:var(--tx-fs-2xs);cursor:pointer;text-align:left;transition:color var(--tx-dur-ctl) var(--tx-ease-out), border-color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;margin-top:2px;padding:2px 6px}.v91jDa_memberChipPause:hover{color:var(--tx-warn);border-color:color-mix(in srgb, var(--tx-warn) 40%, transparent)}.v91jDa_memberChipPause:disabled{opacity:.5;cursor:default}.v91jDa_wmbar{gap:var(--tx-sp-1) 3px;flex-wrap:wrap;align-items:center;display:flex}.v91jDa_wmLabel{letter-spacing:.06em;color:var(--tx-text-3);margin-right:4px;font-size:11px}.v91jDa_wm{border-radius:var(--tx-r-ctl);border:1px solid var(--tx-viz-track);width:34px;height:22px;font-family:var(--tx-mono);font-variant-numeric:tabular-nums;color:var(--tx-text-2);cursor:pointer;transition:border-color var(--tx-dur-ctl) var(--tx-ease-out), box-shadow var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;flex-direction:column;justify-content:center;align-items:center;gap:1px;font-size:9px;display:inline-flex}.v91jDa_wm:hover{border-color:var(--tx-accent)}.v91jDa_wmFill{background:var(--tx-viz-track);border-radius:2px;width:20px;height:3px;overflow:hidden}.v91jDa_wmFill i{background:var(--tx-text-3);border-radius:2px;height:100%;display:block}.v91jDa_wm[data-state=done] .v91jDa_wmFill i{background:var(--tx-ok)}.v91jDa_wm[data-state=running] .v91jDa_wmFill i{background:var(--tx-accent)}.v91jDa_wm[data-state=blocked] .v91jDa_wmFill i{background:var(--tx-warn)}.v91jDa_wm[data-state=failed] .v91jDa_wmFill i{background:var(--tx-bad)}.v91jDa_filters{z-index:10;align-items:center;gap:var(--tx-sp-2);padding:var(--tx-sp-2) 0;margin-top:calc(-1 * var(--tx-sp-2));background:color-mix(in srgb, var(--dsw-alias-bg-base,#1c1d21) 92%, transparent);backdrop-filter:blur(6px);border-bottom:1px solid var(--tx-viz-track);display:flex;position:sticky;top:0}.v91jDa_filterChip{corner-shape:round;background:var(--tx-surface-hover);color:var(--tx-text-2);font-size:var(--tx-fs-xs);cursor:pointer;transition:background-color var(--tx-dur-ctl) var(--tx-ease-out), color var(--tx-dur-ctl) var(--tx-ease-out);border:none;border-radius:999px;padding:2px 11px}.v91jDa_filterChip:hover{background:var(--tx-hairline);color:var(--tx-text-1)}.v91jDa_filterChip[aria-pressed=true]{background:color-mix(in srgb, var(--tx-accent) 16%, transparent);color:var(--tx-accent);font-weight:600}.v91jDa_filterUnread{font-family:var(--tx-mono);font-variant-numeric:tabular-nums;margin-left:4px;font-weight:600}.v91jDa_filterCount{font-size:var(--tx-fs-2xs);color:var(--tx-text-3);font-family:var(--tx-mono);font-variant-numeric:tabular-nums;flex:none;margin-left:auto}.v91jDa_stream{padding:var(--tx-sp-1) 2px var(--tx-sp-3) 88px;min-width:0;position:relative}.v91jDa_stream:before{content:\"\";background:linear-gradient(to bottom, var(--tx-hairline), var(--tx-viz-track) 60%, transparent);border-radius:1px;width:2px;position:absolute;top:12px;bottom:10px;left:40px}.v91jDa_streamRow{font-size:var(--tx-fs-sm);min-width:0;padding:7px 0 7px 24px;position:relative}.v91jDa_streamRow+.v91jDa_streamRow{border-top:1px dashed color-mix(in srgb, var(--tx-viz-track) 60%, transparent)}.v91jDa_streamRow:before{content:\"\";corner-shape:round;background:var(--tx-text-3);border:2px solid var(--tx-text-3);border-radius:999px;width:9px;height:9px;position:absolute;top:14px;left:-52px}.v91jDa_streamRow[data-kind=task]:before,.v91jDa_streamRow[data-kind=inbox]:before{background:var(--tx-accent);border-color:var(--tx-accent)}.v91jDa_streamRow[data-kind=ok]:before{background:var(--tx-ok);border-color:var(--tx-ok)}.v91jDa_streamRow[data-kind=bad]:before{background:color-mix(in srgb, var(--tx-bad) 30%, transparent);border-color:var(--tx-bad);box-shadow:0 0 0 3px color-mix(in srgb, var(--tx-bad) 14%, transparent)}.v91jDa_streamRow[data-flight]:before{background:0 0}.v91jDa_streamRow[data-kind=task][data-flight]:before{box-shadow:0 0 0 3px color-mix(in srgb, var(--tx-accent) 12%, transparent)}.v91jDa_streamTime{text-align:right;width:36px;font-family:var(--tx-mono);font-variant-numeric:tabular-nums;font-size:var(--tx-fs-2xs);color:var(--tx-text-3);position:absolute;top:10px;left:-86px}.v91jDa_streamBody{min-width:0}.v91jDa_streamWho{color:var(--tx-text-2);white-space:nowrap;text-overflow:ellipsis;vertical-align:middle;align-items:center;gap:5px;max-width:110px;font-weight:600;display:inline-flex;overflow:hidden}.v91jDa_streamWho:before{content:\"\";corner-shape:round;background:var(--tx-ink,var(--tx-viz-edge));border-radius:999px;flex:none;width:7px;height:7px}.v91jDa_streamWhoBtn{font:inherit;color:var(--tx-text-2);cursor:pointer;text-overflow:ellipsis;transition:color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;border:none;padding:0;font-weight:600;overflow:hidden}.v91jDa_streamWhoBtn:hover{color:var(--tx-accent)}.v91jDa_streamText{color:var(--tx-text-2)}.v91jDa_streamText b{color:var(--tx-text-1);font-weight:600}.v91jDa_streamTaskId{font-family:var(--tx-mono);font-variant-numeric:tabular-nums;color:var(--tx-text-1);margin-left:4px}.v91jDa_streamDetail{color:var(--tx-text-3);overflow-wrap:anywhere;word-break:break-word;margin-left:6px}.v91jDa_streamMerge{font-family:var(--tx-mono);color:var(--tx-accent);margin-left:4px}.v91jDa_streamEmpty{padding:var(--tx-sp-3) 0;font-size:var(--tx-fs-2xs);color:var(--tx-text-3);margin:0}.v91jDa_daysep{font-size:var(--tx-fs-2xs);color:var(--tx-text-3);align-items:center;gap:10px;margin:10px 0 2px;display:flex}.v91jDa_daysep:before,.v91jDa_daysep:after{content:\"\";background:var(--tx-viz-track);flex:1;height:1px}.v91jDa_older{text-align:center;width:100%;font-size:var(--tx-fs-2xs);color:var(--tx-text-3);border:1px dashed var(--tx-viz-track);border-radius:var(--tx-r-ctl);background:var(--tx-surface-hover);cursor:pointer;transition:color var(--tx-dur-ctl) var(--tx-ease-out), border-color var(--tx-dur-ctl) var(--tx-ease-out);margin-top:4px;padding:8px;display:block}.v91jDa_older:hover{color:var(--tx-accent);border-color:var(--tx-accent)}.v91jDa_skeletonRow{border-radius:var(--tx-r-tag);background:var(--tx-surface-hover);height:10px;display:block}.v91jDa_tcard{border:1px solid var(--tx-hairline);border-radius:var(--tx-r-inner);background:var(--tx-surface);text-align:left;width:100%;font:inherit;color:inherit;cursor:pointer;transition:box-shadow var(--tx-dur-ctl) var(--tx-ease-out), border-color var(--tx-dur-ctl) var(--tx-ease-out);margin-top:8px;padding:9px 12px;display:block}.v91jDa_tcard:hover{border-color:var(--tx-accent);box-shadow:0 1px 2px #0000000f,0 8px 24px #00000014}.v91jDa_tcard[data-state=completed]{background:color-mix(in srgb, var(--tx-ok) 7%, transparent)}.v91jDa_tcard[data-state=running]{background:color-mix(in srgb, var(--tx-accent) 8%, transparent)}.v91jDa_tcard[data-state=blocked]{background:color-mix(in srgb, var(--tx-warn) 7%, transparent)}.v91jDa_tcard[data-state=failed]{background:color-mix(in srgb, var(--tx-bad) 7%, transparent)}.v91jDa_tcard[data-state=cancelled]{opacity:.55}.v91jDa_tcTop{align-items:center;gap:var(--tx-sp-2);font-size:var(--tx-fs-2xs);color:var(--tx-text-3);display:flex}.v91jDa_tcId{font-family:var(--tx-mono);font-variant-numeric:tabular-nums;color:var(--tx-text-2);font-weight:600}.v91jDa_tcElapsed{font-family:var(--tx-mono);font-variant-numeric:tabular-nums;margin-left:auto}.v91jDa_tcSubj{-webkit-line-clamp:2;line-clamp:2;font-size:var(--tx-fs-sm);color:var(--tx-text-1);overflow-wrap:anywhere;word-break:break-word;-webkit-box-orient:vertical;margin:3px 0 5px;font-weight:600;display:-webkit-box;overflow:hidden}.v91jDa_tcFoot{align-items:center;gap:var(--tx-sp-2);font-size:var(--tx-fs-2xs);color:var(--tx-text-2);flex-wrap:wrap;display:flex}.v91jDa_tcStatus{align-items:center;gap:4px;min-width:0;display:inline-flex}.v91jDa_tcStatus svg{flex:none}.v91jDa_tcAssignee{text-overflow:ellipsis;white-space:nowrap;align-items:center;gap:5px;max-width:96px;margin-left:auto;display:inline-flex;overflow:hidden}.v91jDa_tcAssignee:before{content:\"\";corner-shape:round;background:var(--tx-ink,var(--tx-viz-edge));border-radius:999px;flex:none;width:6px;height:6px}.v91jDa_chip{corner-shape:round;background:var(--tx-surface-hover);color:var(--tx-text-2);font-size:9.5px;font-family:var(--tx-mono);font-variant-numeric:tabular-nums;border-radius:999px;flex:none;padding:0 6px;line-height:16px}.v91jDa_chip[data-verdict=pass]{background:color-mix(in srgb, var(--tx-ok) 14%, transparent);color:var(--tx-ok)}.v91jDa_chip[data-verdict=needs_revision]{background:color-mix(in srgb, var(--tx-warn) 14%, transparent);color:var(--tx-warn)}.v91jDa_chip[data-verdict=reject]{background:color-mix(in srgb, var(--tx-bad) 14%, transparent);color:var(--tx-bad)}.v91jDa_chipRepair,.v91jDa_chipTaken{corner-shape:round;background:color-mix(in srgb, var(--tx-mate-1) 14%, transparent);color:var(--tx-mate-1);font-size:9.5px;font-family:var(--tx-mono);font-variant-numeric:tabular-nums;border-radius:999px;flex:none;padding:0 6px;line-height:16px}.v91jDa_trend{align-items:flex-end;gap:2px;height:14px;margin-top:7px;display:flex}.v91jDa_trend i{background:var(--tx-accent);opacity:.45;border-radius:1px 1px 0 0;width:4px}.v91jDa_trend i:last-child{opacity:1}.v91jDa_msg{border-radius:var(--tx-r-tag);border-left:3px solid var(--tx-accent);background:color-mix(in srgb, var(--tx-accent) 8%, transparent);font-size:var(--tx-fs-xs);color:var(--tx-text-2);min-width:0;margin-top:6px;padding:8px 11px;line-height:1.5;display:block}.v91jDa_msgTag{font-size:var(--tx-fs-2xs);color:var(--tx-text-3);margin-bottom:2px;display:inline-block}.v91jDa_msgRich{overflow-wrap:anywhere;word-break:break-word;min-width:0;font-size:var(--tx-fs-xs);color:var(--tx-text-2);-webkit-line-clamp:3;line-clamp:3;-webkit-box-orient:vertical;display:-webkit-box;overflow:hidden}.v91jDa_msgRich p{margin:0}.v91jDa_msgRich p+p,.v91jDa_msgRich pre,.v91jDa_msgRich ul,.v91jDa_msgRich ol{margin-top:2px}.v91jDa_msgRich code{font-family:var(--tx-mono);background:color-mix(in srgb, var(--tx-text-3) 14%, transparent);border-radius:var(--tx-r-tag);padding:0 3px}.v91jDa_msgRich pre{background:color-mix(in srgb, var(--tx-text-3) 10%, transparent);border-radius:var(--tx-r-tag);padding:3px 5px;overflow-x:auto}.v91jDa_msgRich pre code{background:0 0;padding:0}.v91jDa_msgRich ul,.v91jDa_msgRich ol{margin:0;padding-left:14px}.v91jDa_msgRich strong{color:var(--tx-text-1);font-weight:600}.v91jDa_taskPop{z-index:70;width:264px;padding:var(--tx-sp-3) var(--tx-sp-4);border:1px solid var(--tx-hairline);border-radius:var(--tx-r-inner);background:var(--dsw-alias-bg-base,#1c1d21);position:fixed;box-shadow:0 2px 6px #00000014,0 16px 40px #00000047}.v91jDa_taskPop h4{font-size:var(--tx-fs-sm);color:var(--tx-text-1);margin:0 0 2px;line-height:1.35}.v91jDa_taskPopMeta{font-family:var(--tx-mono);font-variant-numeric:tabular-nums;font-size:var(--tx-fs-2xs);color:var(--tx-text-3);margin-bottom:var(--tx-sp-2)}.v91jDa_taskPopDesc{margin:0 0 var(--tx-sp-2);font-size:var(--tx-fs-xs);color:var(--tx-text-2);line-height:1.5}.v91jDa_taskPopRow{gap:var(--tx-sp-3);font-size:var(--tx-fs-2xs);border-top:1px dashed var(--tx-viz-track);color:var(--tx-text-2);min-width:0;padding:3px 0;display:flex}.v91jDa_taskPopRow>span:last-child{text-overflow:ellipsis;min-width:0;display:block;overflow:hidden}.v91jDa_taskPopKey{color:var(--tx-text-3);flex:none;width:58px}.v91jDa_planBar{align-items:center;gap:var(--tx-sp-2) var(--tx-sp-3);padding:var(--tx-sp-3) var(--tx-sp-4);border:1px solid color-mix(in srgb, var(--tx-accent) 30%, transparent);border-radius:var(--tx-r-inner);background:color-mix(in srgb, var(--tx-accent) 8%, transparent);flex-wrap:wrap;display:flex}.v91jDa_planBarText{font-size:var(--tx-fs-xs);color:var(--tx-text-2);flex:1;min-width:140px;margin:0}.v91jDa_planError{font-size:var(--tx-fs-2xs);color:var(--tx-bad);width:100%;margin:0}.v91jDa_planActions{gap:var(--tx-sp-2);flex-wrap:wrap;display:flex}.v91jDa_planApprove,.v91jDa_planChat,.v91jDa_planDiscard,.v91jDa_planDiscardArm,.v91jDa_planCancel{border-radius:var(--tx-r-tag);font-size:var(--tx-fs-xs);cursor:pointer;transition:background-color var(--tx-dur-ctl) var(--tx-ease-out), color var(--tx-dur-ctl) var(--tx-ease-out), transform var(--tx-dur-press) var(--tx-ease-out);padding:3px 12px}.v91jDa_planApprove:active,.v91jDa_planChat:active,.v91jDa_planDiscard:active,.v91jDa_planDiscardArm:active,.v91jDa_planCancel:active{transform:scale(.97)}.v91jDa_planApprove{background:var(--tx-accent);color:var(--tx-text-on-accent);border:1px solid #0000}.v91jDa_planApprove:hover:not(:disabled){background:color-mix(in srgb, var(--tx-accent) 85%, #000)}.v91jDa_planApprove:disabled{opacity:.45;cursor:default}.v91jDa_planChat,.v91jDa_planDiscardArm,.v91jDa_planCancel{border:1px solid var(--tx-hairline);color:var(--tx-text-2);background:0 0}.v91jDa_planChat:hover:not(:disabled),.v91jDa_planDiscardArm:hover:not(:disabled){background:var(--tx-surface-hover);color:var(--tx-text-1)}.v91jDa_planDiscard{border:1px solid color-mix(in srgb, var(--tx-bad) 40%, transparent);background:color-mix(in srgb, var(--tx-bad) 12%, transparent);color:var(--tx-bad)}.v91jDa_planEditor{gap:var(--tx-sp-3);border:1px dashed var(--tx-hairline);border-radius:var(--tx-r-inner);padding:var(--tx-sp-3) var(--tx-sp-4);flex-direction:column;display:flex}.v91jDa_planEditorToggle{color:var(--tx-text-2);font-size:var(--tx-fs-xs);cursor:pointer;text-align:left;transition:color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;border:none;padding:0}.v91jDa_planEditorToggle:hover{color:var(--tx-text-1)}.v91jDa_planEditorSection{gap:var(--tx-sp-2);flex-direction:column;display:flex}.v91jDa_planEditorHeading{font-size:var(--tx-fs-2xs);color:var(--tx-text-3);margin:0;font-weight:500}.v91jDa_planEditorRow{gap:var(--tx-sp-2);grid-template-columns:minmax(64px,.8fr) minmax(0,1.4fr) minmax(96px,1fr) auto;align-items:center;display:grid}.v91jDa_planEditorRow[data-remove]{opacity:.45}.v91jDa_planEditorInput,.v91jDa_planEditorSubject,.v91jDa_planEditorName{border:1px solid var(--tx-hairline);border-radius:var(--tx-r-tag);color:var(--tx-text-1);font-size:var(--tx-fs-xs);background:0 0;min-width:0;padding:3px 7px}.v91jDa_planEditorInput:focus,.v91jDa_planEditorSubject:focus,.v91jDa_planEditorName:focus{border-color:var(--tx-accent);outline:none}.v91jDa_planEditorTaskId{font-family:var(--tx-mono);font-size:var(--tx-fs-2xs);color:var(--tx-text-3)}.v91jDa_planEditorRemove{color:var(--tx-text-3);cursor:pointer;font-size:var(--tx-fs-xs);border-radius:var(--tx-r-tag);transition:color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;border:none;padding:2px 6px}.v91jDa_planEditorRemove:hover{color:var(--tx-bad)}.v91jDa_planEditorActions{gap:var(--tx-sp-2);display:flex}.v91jDa_planEditorAdd{border:1px dashed var(--tx-hairline);border-radius:var(--tx-r-tag);color:var(--tx-text-2);font-size:var(--tx-fs-2xs);cursor:pointer;transition:color var(--tx-dur-ctl) var(--tx-ease-out), border-color var(--tx-dur-ctl) var(--tx-ease-out);background:0 0;padding:3px 10px}.v91jDa_planEditorAdd:hover{color:var(--tx-text-1);border-color:var(--tx-text-3)}.v91jDa_planEditorEmpty{font-size:var(--tx-fs-2xs);color:var(--tx-text-3);margin:0}.v91jDa_tabTitleIcon{vertical-align:-2px;display:inline-flex}.v91jDa_tabTitleLabel{margin-left:4px}@keyframes v91jDa_teamsx-badge-breath{0%,to{color:var(--tx-text-2)}50%{color:var(--tx-accent)}}.v91jDa_animSpin{animation:.9s linear infinite v91jDa_teamsx-spin}@keyframes v91jDa_teamsx-spin{to{transform:rotate(360deg)}}@media (prefers-reduced-motion:reduce){.v91jDa_badgeFab[data-busy],.v91jDa_nowDot,.v91jDa_animSpin{animation:none!important}.v91jDa_badgeFab[data-busy]{background:color-mix(in srgb, var(--tx-accent) 14%, transparent)!important;border-color:color-mix(in srgb, var(--tx-accent) 45%, transparent)!important;color:var(--tx-accent)!important}.v91jDa_nowDot{opacity:1!important}.v91jDa_panelWindow,.v91jDa_panelSheet{animation:.12s ease-out both v91jDa_teamsx-fade-in!important}.v91jDa_ringSeg{transition:stroke var(--tx-dur-ctl) ease-out!important}.v91jDa_planApprove:active,.v91jDa_planChat:active,.v91jDa_planDiscard:active,.v91jDa_planDiscardArm:active,.v91jDa_planCancel:active,.v91jDa_stopButton:active,.v91jDa_stopConfirm:active,.v91jDa_stopCancel:active,.v91jDa_modeOption:active,.v91jDa_refreshButton:active,.v91jDa_badgeFab:active{transform:none!important}}@keyframes v91jDa_teamsx-fade-in{0%{opacity:0}to{opacity:1}}@media (width<=520px){.v91jDa_headStats{gap:var(--tx-sp-4)}.v91jDa_sl i{display:none}.v91jDa_stream{padding-left:30px}.v91jDa_stream:before{left:8px}.v91jDa_streamRow{padding-left:20px}.v91jDa_streamRow:before{left:-26px}.v91jDa_streamTime{text-align:left;vertical-align:middle;width:auto;margin-right:8px;display:inline-block;position:static}.v91jDa_nowitem{max-width:200px}}.v91jDa_badgeFab:focus-visible,.v91jDa_planApprove:focus-visible,.v91jDa_planChat:focus-visible,.v91jDa_planDiscard:focus-visible,.v91jDa_planDiscardArm:focus-visible,.v91jDa_planCancel:focus-visible,.v91jDa_stopButton:focus-visible,.v91jDa_stopConfirm:focus-visible,.v91jDa_stopCancel:focus-visible,.v91jDa_modeOption:focus-visible,.v91jDa_refreshButton:focus-visible,.v91jDa_retryButton:focus-visible,.v91jDa_nowitem:focus-visible,.v91jDa_memberChipInfo:focus-visible,.v91jDa_memberChipName:focus-visible,.v91jDa_memberChipPause:focus-visible,.v91jDa_wm:focus-visible,.v91jDa_filterChip:focus-visible,.v91jDa_older:focus-visible,.v91jDa_tcard:focus-visible,.v91jDa_streamWhoBtn:focus-visible,.v91jDa_planEditorToggle:focus-visible,.v91jDa_planEditorAdd:focus-visible,.v91jDa_planEditorRemove:focus-visible,.v91jDa_planEditorInput:focus-visible,.v91jDa_planEditorSubject:focus-visible,.v91jDa_planEditorName:focus-visible{outline:2px solid var(--tx-accent);outline-offset:1px}";
		const tagId$2 = "dsh-teams-x/ActivityPanel.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$2) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-teams-x";
			tag.dataset.pluginCss = tagId$2;
			tag.textContent = css$2;
			document.head.appendChild(tag);
		}
		var ActivityPanel_module_css_default = {
			"animSpin": "v91jDa_animSpin",
			"badgeFab": "v91jDa_badgeFab",
			"badgeFabBusy": "v91jDa_badgeFabBusy",
			"chip": "v91jDa_chip",
			"chipRepair": "v91jDa_chipRepair",
			"chipTaken": "v91jDa_chipTaken",
			"daysep": "v91jDa_daysep",
			"emptyLogo": "v91jDa_emptyLogo",
			"emptyState": "v91jDa_emptyState",
			"errorBox": "v91jDa_errorBox",
			"filterChip": "v91jDa_filterChip",
			"filterCount": "v91jDa_filterCount",
			"filterUnread": "v91jDa_filterUnread",
			"filters": "v91jDa_filters",
			"headRing": "v91jDa_headRing",
			"headRingValue": "v91jDa_headRingValue",
			"headStat": "v91jDa_headStat",
			"headStatIcon": "v91jDa_headStatIcon",
			"headStats": "v91jDa_headStats",
			"lg": "v91jDa_lg",
			"memberChip": "v91jDa_memberChip",
			"memberChipIcon": "v91jDa_memberChipIcon",
			"memberChipInfo": "v91jDa_memberChipInfo",
			"memberChipName": "v91jDa_memberChipName",
			"memberChipPause": "v91jDa_memberChipPause",
			"memberChipPop": "v91jDa_memberChipPop",
			"memberChipUnread": "v91jDa_memberChipUnread",
			"memberStrip": "v91jDa_memberStrip",
			"modeActive": "v91jDa_modeActive",
			"modeOption": "v91jDa_modeOption",
			"modeToggle": "v91jDa_modeToggle",
			"msg": "v91jDa_msg",
			"msgRich": "v91jDa_msgRich",
			"msgTag": "v91jDa_msgTag",
			"nowDot": "v91jDa_nowDot",
			"nowLabel": "v91jDa_nowLabel",
			"nowName": "v91jDa_nowName",
			"nowTaskId": "v91jDa_nowTaskId",
			"nowText": "v91jDa_nowText",
			"nowbar": "v91jDa_nowbar",
			"nowitem": "v91jDa_nowitem",
			"older": "v91jDa_older",
			"panel": "v91jDa_panel",
			"panelActions": "v91jDa_panelActions",
			"panelEmpty": "v91jDa_panelEmpty",
			"panelError": "v91jDa_panelError",
			"panelHeader": "v91jDa_panelHeader",
			"panelSheet": "v91jDa_panelSheet",
			"panelTab": "v91jDa_panelTab",
			"panelTitle": "v91jDa_panelTitle",
			"panelWindow": "v91jDa_panelWindow",
			"phaseTag": "v91jDa_phaseTag",
			"planActions": "v91jDa_planActions",
			"planApprove": "v91jDa_planApprove",
			"planBar": "v91jDa_planBar",
			"planBarText": "v91jDa_planBarText",
			"planCancel": "v91jDa_planCancel",
			"planChat": "v91jDa_planChat",
			"planDiscard": "v91jDa_planDiscard",
			"planDiscardArm": "v91jDa_planDiscardArm",
			"planEditor": "v91jDa_planEditor",
			"planEditorActions": "v91jDa_planEditorActions",
			"planEditorAdd": "v91jDa_planEditorAdd",
			"planEditorEmpty": "v91jDa_planEditorEmpty",
			"planEditorHeading": "v91jDa_planEditorHeading",
			"planEditorInput": "v91jDa_planEditorInput",
			"planEditorName": "v91jDa_planEditorName",
			"planEditorRemove": "v91jDa_planEditorRemove",
			"planEditorRow": "v91jDa_planEditorRow",
			"planEditorSection": "v91jDa_planEditorSection",
			"planEditorSubject": "v91jDa_planEditorSubject",
			"planEditorTaskId": "v91jDa_planEditorTaskId",
			"planEditorToggle": "v91jDa_planEditorToggle",
			"planError": "v91jDa_planError",
			"refreshButton": "v91jDa_refreshButton",
			"retryButton": "v91jDa_retryButton",
			"ringSeg": "v91jDa_ringSeg",
			"ringSvg": "v91jDa_ringSvg",
			"segbar": "v91jDa_segbar",
			"seglegend": "v91jDa_seglegend",
			"segtrack": "v91jDa_segtrack",
			"skeletonRow": "v91jDa_skeletonRow",
			"sl": "v91jDa_sl",
			"staleNote": "v91jDa_staleNote",
			"staleRetry": "v91jDa_staleRetry",
			"stopActions": "v91jDa_stopActions",
			"stopButton": "v91jDa_stopButton",
			"stopCancel": "v91jDa_stopCancel",
			"stopConfirm": "v91jDa_stopConfirm",
			"stopConfirmBox": "v91jDa_stopConfirmBox",
			"stopError": "v91jDa_stopError",
			"stream": "v91jDa_stream",
			"streamBody": "v91jDa_streamBody",
			"streamDetail": "v91jDa_streamDetail",
			"streamEmpty": "v91jDa_streamEmpty",
			"streamMerge": "v91jDa_streamMerge",
			"streamRow": "v91jDa_streamRow",
			"streamTaskId": "v91jDa_streamTaskId",
			"streamText": "v91jDa_streamText",
			"streamTime": "v91jDa_streamTime",
			"streamWho": "v91jDa_streamWho",
			"streamWhoBtn": "v91jDa_streamWhoBtn",
			"sw": "v91jDa_sw",
			"tabTitleIcon": "v91jDa_tabTitleIcon",
			"tabTitleLabel": "v91jDa_tabTitleLabel",
			"taskPop": "v91jDa_taskPop",
			"taskPopDesc": "v91jDa_taskPopDesc",
			"taskPopKey": "v91jDa_taskPopKey",
			"taskPopMeta": "v91jDa_taskPopMeta",
			"taskPopRow": "v91jDa_taskPopRow",
			"tcAssignee": "v91jDa_tcAssignee",
			"tcElapsed": "v91jDa_tcElapsed",
			"tcFoot": "v91jDa_tcFoot",
			"tcId": "v91jDa_tcId",
			"tcStatus": "v91jDa_tcStatus",
			"tcSubj": "v91jDa_tcSubj",
			"tcTop": "v91jDa_tcTop",
			"tcard": "v91jDa_tcard",
			"teamCard": "v91jDa_teamCard",
			"teamGoal": "v91jDa_teamGoal",
			"teamHeader": "v91jDa_teamHeader",
			"teamList": "v91jDa_teamList",
			"teamLogo": "v91jDa_teamLogo",
			"teamName": "v91jDa_teamName",
			"teamNote": "v91jDa_teamNote",
			"teamTitleBlock": "v91jDa_teamTitleBlock",
			"teamsx-badge-breath": "v91jDa_teamsx-badge-breath",
			"teamsx-fade-in": "v91jDa_teamsx-fade-in",
			"teamsx-now-pulse": "v91jDa_teamsx-now-pulse",
			"teamsx-sheet-up": "v91jDa_teamsx-sheet-up",
			"teamsx-spin": "v91jDa_teamsx-spin",
			"teamsx-window-in": "v91jDa_teamsx-window-in",
			"tokviz": "v91jDa_tokviz",
			"trend": "v91jDa_trend",
			"wm": "v91jDa_wm",
			"wmFill": "v91jDa_wmFill",
			"wmLabel": "v91jDa_wmLabel",
			"wmbar": "v91jDa_wmbar"
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
		/** Shared stroke attributes applied by the shell to every stroke icon. */
		const ICON_STROKE = {
			width: 1.8,
			linecap: "round",
			linejoin: "round"
		};
		const ICONS = {
			"teams-x-logo": {
				label: "TeamsX",
				mode: "fill",
				viewBox: "0 0 1024 1024",
				body: "<path d=\"M329.142857 347.428571a18.285714 18.285714 0 0 1 2.139429 36.443429L329.142857 384h-36.571428a91.428571 91.428571 0 0 0-91.337143 87.460571L201.142857 475.428571v182.857143a91.428571 91.428571 0 0 0 87.460572 91.337143L292.571429 749.714286h438.857142a91.428571 91.428571 0 0 0 91.337143-87.460572L822.857143 658.285714V475.428571a91.428571 91.428571 0 0 0-87.460572-91.337142L731.428571 384h-36.571428a18.285714 18.285714 0 0 1-2.139429-36.443429L694.857143 347.428571h36.571428a128 128 0 0 1 127.926858 123.611429L859.428571 475.428571v182.857143a128 128 0 0 1-123.611428 127.926857L731.428571 786.285714H292.571429a128 128 0 0 1-127.926858-123.611428L164.571429 658.285714V475.428571a128 128 0 0 1 123.611428-127.926857L292.571429 347.428571h36.571428z m54.857143 146.285715a36.571429 36.571429 0 1 1 0 73.142857 36.571429 36.571429 0 0 1 0-73.142857z m256 0a36.571429 36.571429 0 1 1 0 73.142857 36.571429 36.571429 0 0 1 0-73.142857z m44.745143-254.061715a18.285714 18.285714 0 0 1 8.173714 24.521143C664.941714 320.128 581.924571 384 512 384s-152.941714-63.853714-180.918857-119.826286a18.285714 18.285714 0 0 1 32.694857-16.347428C386.084571 292.443429 457.581714 347.428571 512 347.428571s125.915429-55.003429 148.224-99.602285a18.285714 18.285714 0 0 1 24.521143-8.173715z\"/>"
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
		function IconSvg({ definition, label, size = 16, className, decorative }) {
			const fill = definition.mode === "fill";
			return (0, react_jsx_runtime.jsx)("svg", {
				viewBox: definition.viewBox ?? "0 0 24 24",
				width: size,
				height: size,
				fill: fill ? "currentColor" : "none",
				stroke: fill ? "none" : "currentColor",
				strokeWidth: fill ? void 0 : ICON_STROKE.width,
				strokeLinecap: fill ? void 0 : ICON_STROKE.linecap,
				strokeLinejoin: fill ? void 0 : ICON_STROKE.linejoin,
				className,
				role: decorative === true ? void 0 : "img",
				"aria-hidden": decorative === true || void 0,
				"aria-label": decorative === true ? void 0 : label,
				children: (0, react_jsx_runtime.jsx)("g", { dangerouslySetInnerHTML: { __html: definition.body } })
			});
		}
		/** Build one named icon component from the shared data table. */
		function makeIcon(name) {
			const definition = ICONS[name];
			function Component(props) {
				return (0, react_jsx_runtime.jsx)(IconSvg, {
					definition,
					label: props.label ?? definition.label,
					...props
				});
			}
			return Component;
		}
		/** Build a panel-control glyph (refresh/close/pause). These are interface
		* chrome rather than domain icons, so they carry inline bodies here instead
		* of riding the assets/icons pipeline that `pnpm verify:icons` guards. */
		function makeGlyphIcon(body, label) {
			const definition = {
				label,
				body
			};
			function Component(props) {
				return (0, react_jsx_runtime.jsx)(IconSvg, {
					definition,
					label: props.label ?? label,
					...props
				});
			}
			return Component;
		}
		/** Rotate-clockwise arrow, for the panel refresh control. */
		const GlyphRefresh = makeGlyphIcon(`<polyline points='23 4 23 10 17 10'/><path d='M20.49 15a9 9 0 1 1-2.12-9.36L23 10'/>`, "refresh");
		/** Two-stroke X, for the panel close control. */
		const GlyphClose = makeGlyphIcon(`<path d='M18 6 6 18M6 6l12 12'/>`, "close");
		/** Clock face, for the instrument row's elapsed reading. */
		const GlyphClock = makeGlyphIcon(`<circle cx='12' cy='12' r='8.5'/><path d='M12 7.5V12l3 2'/>`, "elapsed");
		/** Build one named status icon component. */
		function makeStatusIcon(name) {
			const definition = STATUS_ICONS[name];
			function Component(props) {
				return (0, react_jsx_runtime.jsx)(IconSvg, {
					definition,
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
		makeIcon("action-working");
		makeIcon("action-thinking");
		makeIcon("action-reporting");
		makeIcon("action-sending");
		makeIcon("action-sleeping");
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
		//#endregion
		//#region lib/client/format.js
		/** Interpolate `{key}` params into a locale string. */
		function format(template, params) {
			if (params === void 0) return template;
			return template.replace(/\{(\w+)\}/gu, (match, key) => Object.prototype.hasOwnProperty.call(params, key) ? String(params[key]) : match);
		}
		/** Wrap the harness translate function with interpolation. */
		function makeT(t) {
			return (key, params) => format(t(key, params), params);
		}
		/** Compact token formatter: 1234 → 1.2k, 45600 → 45.6k. */
		function formatTokens(n) {
			if (n < 1e3) return String(n);
			if (n < 1e6) return `${(n / 1e3).toFixed(n < 1e4 ? 1 : 0)}k`;
			return `${(n / 1e6).toFixed(1)}M`;
		}
		/** Humanize a millisecond duration for the task-age badge. */
		function formatElapsed(ms) {
			const totalSeconds = Math.floor(ms / 1e3);
			if (totalSeconds < 60) return `${totalSeconds}s`;
			const minutes = Math.floor(totalSeconds / 60);
			if (minutes < 60) return `${minutes}m`;
			const hours = Math.floor(minutes / 60);
			const rest = minutes % 60;
			if (hours < 24) return rest === 0 ? `${hours}h` : `${hours}h${rest}m`;
			return `${Math.floor(hours / 24)}d${hours % 24}h`;
		}
		//#endregion
		//#region lib/client/endpoints.js
		/**
		* Leaf module for the plugin's HTTP endpoints. Constants live here (not in
		* ActivityPanel) so editor/card/panel modules can import them without
		* creating an ActivityPanel ↔ editor import cycle.
		* @module dsh-teams-x/client/endpoints
		*/
		/** Panel data endpoint served by the host plane. */
		const TEAMSX_STATE_URL = "/plugins/dsh-teams-x/state";
		/** Halt endpoint served by the host plane. */
		const TEAMSX_HALT_URL = "/plugins/dsh-teams-x/halt";
		/** Per-member pause endpoint served by the host plane. */
		const TEAMSX_PAUSE_URL = "/plugins/dsh-teams-x/member/pause";
		/** Staged-plan review endpoint served by the host plane. */
		const TEAMSX_PLAN_URL = "/plugins/dsh-teams-x/plan";
		//#endregion
		//#region lib/client/api.js
		/** Fetch the state endpoint (live or archived). */
		async function fetchTeams(viewMode) {
			const response = await fetch(viewMode === "archive" ? `${TEAMSX_STATE_URL}?archived=1` : TEAMSX_STATE_URL, { headers: { accept: "application/json" } });
			if (!response.ok) throw new Error(`HTTP ${response.status}`);
			return (await response.json()).teams;
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
		//#endregion
		//#region lib/client/snapshot-compare.js
		/**
		* Deep equality over plain JSON data (objects, arrays, primitives). Snapshot
		* payloads arrive from `JSON.parse`, so prototypes are `Object.prototype` and
		* `undefined`-valued keys are impossible — key-set equality is sound.
		*/
		function sameValue(a, b) {
			if (a === b) return true;
			if (typeof a !== "object" || typeof b !== "object" || a === null || b === null) return false;
			const arrayA = Array.isArray(a);
			if (arrayA !== Array.isArray(b)) return false;
			if (arrayA) {
				if (a.length !== b.length) return false;
				return a.every((item, index) => sameValue(item, b[index]));
			}
			const keysA = Object.keys(a);
			const keysB = Object.keys(b);
			if (keysA.length !== keysB.length) return false;
			return keysA.every((key) => Object.prototype.hasOwnProperty.call(b, key) && sameValue(a[key], b[key]));
		}
		/**
		* True when both poll results would render identically. Snapshot arrays are
		* compared position-by-position; the assembler emits a stable order, so a
		* reordered roster is a real change worth re-rendering.
		*/
		function sameTeamsSnapshots(a, b) {
			if (a === b) return true;
			if (a.length !== b.length) return false;
			return a.every((team, index) => sameValue(team, b[index]));
		}
		//#endregion
		//#region lib/client/plan-review.js
		/**
		* The staged-plan review bar: approve, return-to-chat, and discard (2-step).
		* Behavior-preserving extraction from ActivityPanel (v0.9 P0).
		* @module dsh-teams-x/client/plan-review
		*/
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
		//#endregion
		//#region lib/client/StagedPlanEditor.js
		/**
		* Inline staged-plan editor rendered under the review bar for staged teams.
		*
		* Edits accumulate locally as pending mutations; "save" posts them as one
		* atomic batch through the /plan edit route, then the panel's poll cycle
		* renders disk truth. Collapsed by default so the review bar stays primary.
		* All types come from the zero-import snapshot module, so this file never
		* pulls in the host graph.
		* @module dsh-teams-x/client/StagedPlanEditor
		*/
		/** Split a free-form dependency input ("t1, t2 / t3") into clean ids. */
		function splitDeps(raw) {
			return raw.split(/[,，、;；]/gu).map((item) => item.trim()).filter((item) => item !== "");
		}
		/** POST one atomic staged-plan edit batch. */
		async function planEdit(captainSessionId, teamId, mutations) {
			const response = await fetch(TEAMSX_PLAN_URL, {
				method: "POST",
				headers: { "content-type": "application/json" },
				body: JSON.stringify({
					sessionId: captainSessionId,
					teamId,
					action: "edit",
					mutations
				})
			});
			if (!response.ok) {
				const body = await response.json().catch(() => ({ error: `HTTP ${response.status}` }));
				throw new Error(body.error ?? `HTTP ${response.status}`);
			}
		}
		function initialMembers(team) {
			return team.members.map((member) => ({
				name: member.name,
				role: member.role,
				provider: member.provider,
				model: member.model,
				remove: false
			}));
		}
		function initialTasks(team) {
			return team.tasks.map((task) => ({
				id: task.id,
				subject: task.subject,
				assignee: task.assignee,
				deps: task.dependencies.join(", "),
				remove: false,
				isNew: false
			}));
		}
		/** The staged-plan editor: roster rows + task rows + one atomic save. */
		function StagedPlanEditor({ team, t, onSaved }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [members, setMembers] = (0, react.useState)(() => initialMembers(team));
			const [tasks, setTasks] = (0, react.useState)(() => initialTasks(team));
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(void 0);
			const reset = () => {
				setMembers(initialMembers(team));
				setTasks(initialTasks(team));
				setError(void 0);
			};
			const save = async () => {
				const mutations = [];
				for (const draft of members) {
					if (draft.remove) {
						mutations.push({
							action: "remove_member",
							memberName: draft.name
						});
						continue;
					}
					const initial = team.members.find((member) => member.name === draft.name);
					if (initial === void 0) continue;
					if (initial.role === draft.role && initial.provider === draft.provider && initial.model === draft.model) continue;
					if (draft.provider.trim() === "" || draft.model.trim() === "") {
						setError(t("editor.subjectRequired"));
						return;
					}
					mutations.push({
						action: "update_member",
						memberName: draft.name,
						role: draft.role.trim() || null,
						provider: draft.provider.trim(),
						model: draft.model.trim(),
						reasoningEffort: null,
						executionPrompt: null
					});
				}
				for (const draft of tasks) {
					if (draft.isNew) {
						if (draft.subject.trim() === "" && draft.assignee.trim() === "" && draft.deps.trim() === "") continue;
						if (draft.subject.trim() === "") {
							setError(t("editor.subjectRequired"));
							return;
						}
						mutations.push({
							action: "add_task",
							subject: draft.subject.trim(),
							assignee: draft.assignee.trim() || null,
							dependencies: splitDeps(draft.deps)
						});
						continue;
					}
					if (draft.remove) {
						mutations.push({
							action: "remove_task",
							taskId: draft.id
						});
						continue;
					}
					const initial = team.tasks.find((task) => task.id === draft.id);
					if (initial === void 0) continue;
					const deps = splitDeps(draft.deps);
					if (initial.subject === draft.subject && initial.assignee === draft.assignee && initial.dependencies.join(", ") === deps.join(", ")) continue;
					if (draft.subject.trim() === "") {
						setError(t("editor.subjectRequired"));
						return;
					}
					mutations.push({
						action: "update_task",
						taskId: draft.id,
						subject: draft.subject.trim(),
						assignee: draft.assignee.trim() || null,
						dependencies: deps
					});
				}
				if (mutations.length === 0) {
					setOpen(false);
					return;
				}
				setBusy(true);
				setError(void 0);
				try {
					await planEdit(team.captainSessionId, team.teamId, mutations);
					setBusy(false);
					setOpen(false);
					onSaved();
				} catch (cause) {
					setError(cause instanceof Error ? cause.message : String(cause));
					setBusy(false);
				}
			};
			if (!open) return (0, react_jsx_runtime.jsx)("div", {
				className: ActivityPanel_module_css_default.planEditor,
				children: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ActivityPanel_module_css_default.planEditorToggle,
					onClick: () => {
						setOpen(true);
					},
					children: ["✎ ", t("editor.open")]
				})
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ActivityPanel_module_css_default.planEditor,
				role: "form",
				"aria-label": t("editor.open"),
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.planEditorSection,
						children: [
							(0, react_jsx_runtime.jsx)("h5", {
								className: ActivityPanel_module_css_default.planEditorHeading,
								children: t("editor.members")
							}),
							members.map((draft, index) => (0, react_jsx_runtime.jsxs)("div", {
								className: ActivityPanel_module_css_default.planEditorRow,
								"data-remove": draft.remove === true || void 0,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.planEditorName,
										title: draft.name,
										children: draft.name
									}),
									(0, react_jsx_runtime.jsx)("input", {
										className: ActivityPanel_module_css_default.planEditorInput,
										"aria-label": t("editor.role"),
										placeholder: t("editor.role"),
										value: draft.role,
										disabled: busy || draft.remove,
										onChange: (event) => {
											const value = event.target.value;
											setMembers((prev) => prev.map((item, i) => i === index ? {
												...item,
												role: value
											} : item));
										}
									}),
									(0, react_jsx_runtime.jsx)("input", {
										className: ActivityPanel_module_css_default.planEditorInput,
										"aria-label": t("editor.provider"),
										placeholder: t("editor.provider"),
										value: draft.provider,
										disabled: busy || draft.remove,
										onChange: (event) => {
											const value = event.target.value;
											setMembers((prev) => prev.map((item, i) => i === index ? {
												...item,
												provider: value
											} : item));
										}
									}),
									(0, react_jsx_runtime.jsx)("input", {
										className: ActivityPanel_module_css_default.planEditorInput,
										"aria-label": t("editor.model"),
										placeholder: t("editor.model"),
										value: draft.model,
										disabled: busy || draft.remove,
										onChange: (event) => {
											const value = event.target.value;
											setMembers((prev) => prev.map((item, i) => i === index ? {
												...item,
												model: value
											} : item));
										}
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ActivityPanel_module_css_default.planEditorRemove,
										disabled: busy,
										onClick: () => {
											setMembers((prev) => prev.map((item, i) => i === index ? {
												...item,
												remove: !item.remove
											} : item));
										},
										children: draft.remove ? t("editor.restore") : t("editor.remove")
									})
								]
							}, draft.name)),
							members.length === 0 && (0, react_jsx_runtime.jsxs)("p", {
								className: ActivityPanel_module_css_default.planEditorEmpty,
								children: [t("editor.members"), ": 0"]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.planEditorSection,
						children: [
							(0, react_jsx_runtime.jsx)("h5", {
								className: ActivityPanel_module_css_default.planEditorHeading,
								children: t("editor.tasks")
							}),
							tasks.map((draft, index) => (0, react_jsx_runtime.jsxs)("div", {
								className: ActivityPanel_module_css_default.planEditorRow,
								"data-remove": draft.remove === true || void 0,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.planEditorTaskId,
										children: draft.isNew ? "＋" : draft.id
									}),
									(0, react_jsx_runtime.jsx)("input", {
										className: `${ActivityPanel_module_css_default.planEditorInput} ${ActivityPanel_module_css_default.planEditorSubject}`,
										"aria-label": t("editor.subject"),
										placeholder: t("editor.subject"),
										value: draft.subject,
										disabled: busy || draft.remove,
										onChange: (event) => {
											const value = event.target.value;
											setTasks((prev) => prev.map((item, i) => i === index ? {
												...item,
												subject: value
											} : item));
										}
									}),
									(0, react_jsx_runtime.jsx)("input", {
										className: ActivityPanel_module_css_default.planEditorInput,
										"aria-label": t("editor.assignee"),
										placeholder: t("editor.assignee"),
										value: draft.assignee,
										disabled: busy || draft.remove,
										onChange: (event) => {
											const value = event.target.value;
											setTasks((prev) => prev.map((item, i) => i === index ? {
												...item,
												assignee: value
											} : item));
										}
									}),
									(0, react_jsx_runtime.jsx)("input", {
										className: ActivityPanel_module_css_default.planEditorInput,
										"aria-label": t("editor.deps"),
										placeholder: t("editor.depsHint"),
										value: draft.deps,
										disabled: busy || draft.remove,
										onChange: (event) => {
											const value = event.target.value;
											setTasks((prev) => prev.map((item, i) => i === index ? {
												...item,
												deps: value
											} : item));
										}
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: ActivityPanel_module_css_default.planEditorRemove,
										disabled: busy,
										onClick: () => {
											setTasks((prev) => prev.map((item, i) => i === index ? {
												...item,
												remove: !item.remove
											} : item));
										},
										children: draft.remove ? t("editor.restore") : t("editor.remove")
									})
								]
							}, draft.id)),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.planEditorAdd,
								disabled: busy,
								onClick: () => {
									setTasks((prev) => [...prev, {
										id: `new-${prev.length + 1}`,
										subject: "",
										assignee: "",
										deps: "",
										remove: false,
										isNew: true
									}]);
								},
								children: t("editor.addTask")
							})
						]
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.planError,
						children: error
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.planEditorActions,
						children: [(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ActivityPanel_module_css_default.planApprove,
							disabled: busy,
							onClick: () => {
								save();
							},
							children: busy ? t("editor.saving") : t("editor.save")
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ActivityPanel_module_css_default.planCancel,
							disabled: busy,
							onClick: () => {
								reset();
								setOpen(false);
							},
							children: t("editor.cancel")
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/client/progress-ring.js
		/** Group the six task statuses into the ring's four segments. */
		function countTasks(tasks) {
			const counts = {
				completed: 0,
				running: 0,
				failed: 0,
				open: 0,
				cancelled: 0
			};
			for (const task of tasks) {
				if (task.status === "cancelled") {
					counts.cancelled += 1;
					continue;
				}
				if (task.status === "completed") {
					counts.completed += 1;
					continue;
				}
				if (task.status === "in_progress" || task.status === "claimed") {
					counts.running += 1;
					continue;
				}
				if (task.status === "failed") {
					counts.failed += 1;
					continue;
				}
				counts.open += 1;
			}
			const denom = tasks.length - counts.cancelled;
			return {
				...counts,
				denom
			};
		}
		//#endregion
		//#region lib/client/client-runtime.js
		let sessions;
		/** Called once by the plugin shell with the injected sessions service. */
		function provideSessions(face) {
			sessions = face;
		}
		/** The provided face, or undefined on hosts where apply never ran. */
		function peekSessions() {
			return sessions;
		}
		//#endregion
		//#region lib/client/live-activity.js
		/**
		* 脉搏层（live beats）— subscription-first member activity.
		*
		* The snapshot poll is the panel's backbone, but a fixed cadence is the wrong
		* physics for "did a member just start (or stop) working": the answer arrives
		* up to one poll interval late. This layer subscribes to the host session
		* faces for the members it can see and exposes their `running` bit as beats —
		* a working/idle flip lands within one host event, not one poll.
		*
		* Authority model, per member:
		*   1. a fresh beat (younger than the TTL) wins — the subscription is the
		*      fast path and corrects a stale poll within milliseconds;
		*   2. no beat / expired beat → the polled `activity` field stays
		*      authoritative, so members whose sessions were never materialized
		*      (cold subagents) behave exactly as before.
		*
		* Everything is feature-detected and try-caught: a host without the scope
		* face, or a session that refuses to scope, silently keeps poll authority.
		* @module dsh-teams-x/client/live-activity
		*/
		/** Beats older than this hand authority back to the poll. */
		const BEAT_TTL_MS = 3e4;
		/** Sweep cadence for expired beats. */
		const SWEEP_INTERVAL_MS = 15e3;
		/**
		* Subscribe to every listed member session that the host can scope. Re-runs
		* only when the id set changes (keyed by the joined ids, not the array
		* identity). Beat expiry is swept on a slow timer; subscriptions live for the
		* panel body's lifetime.
		*/
		function useLiveBeats(memberIds) {
			const [beats, setBeats] = (0, react.useState)({});
			const idsKey = memberIds.join("\0");
			(0, react.useEffect)(() => {
				const sessions = peekSessions();
				if (sessions === void 0) return void 0;
				const ids = idsKey === "" ? [] : idsKey.split("\0");
				const disposers = /* @__PURE__ */ new Map();
				const publish = (id, running) => {
					setBeats((prev) => {
						const current = prev[id];
						if (current !== void 0 && current.running === running) return prev;
						return {
							...prev,
							[id]: {
								running,
								seenAt: Date.now()
							}
						};
					});
				};
				for (const id of ids) {
					if (id === "" || disposers.has(id)) continue;
					try {
						const scope = sessions.scope(id);
						const face = scope === void 0 ? void 0 : sessions.sessionOf(scope);
						if (face === void 0) continue;
						const onBeat = () => {
							const snapshot = face.getSnapshot();
							publish(id, snapshot.running);
						};
						const dispose = face.subscribe(onBeat);
						disposers.set(id, typeof dispose === "function" ? dispose : () => {});
						onBeat();
					} catch {}
				}
				return () => {
					for (const dispose of disposers.values()) dispose();
				};
			}, [idsKey]);
			(0, react.useEffect)(() => {
				const timer = window.setInterval(() => {
					setBeats((prev) => {
						const now = Date.now();
						const expired = Object.keys(prev).filter((id) => now - (prev[id]?.seenAt ?? 0) > BEAT_TTL_MS);
						if (expired.length === 0) return prev;
						const next = { ...prev };
						for (const id of expired) delete next[id];
						return next;
					});
				}, SWEEP_INTERVAL_MS);
				return () => {
					window.clearInterval(timer);
				};
			}, []);
			return beats;
		}
		/**
		* Fold a member's beat into its polled activity: a fresh running beat reads
		* `working`; a fresh not-running beat demotes a polled `working` to `idle`
		* but never invents a state the poll never saw.
		*/
		function beatActivity(activity, beat, now = Date.now()) {
			if (beat === void 0 || now - beat.seenAt > BEAT_TTL_MS) return activity;
			if (beat.running) return "working";
			return activity === "working" ? "idle" : activity;
		}
		/** FNV-1a (32-bit) over the member name — short, order-sensitive, stable. */
		function memberInkIndex(name) {
			let hash = 2166136261;
			for (let index = 0; index < name.length; index++) {
				hash ^= name.charCodeAt(index);
				hash = Math.imul(hash, 16777619) >>> 0;
			}
			return hash % 6;
		}
		/** The CSS custom property holding this member's identity ink. */
		function memberInk(name) {
			return `var(--tx-mate-${memberInkIndex(name)})`;
		}
		/**
		* Keyword buckets, specific before broad. Matching runs over the member's
		* name and role together (lowercased), so either string can carry the signal
		* and both zh and en vocabularies resolve.
		*/
		const SIGIL_RULES = [
			[/队长|captain|\blead\b|统筹|拆解|派发|汇总|协调/, "lead"],
			[/secur|审计|安全|风险|threat|audit/, "security"],
			[/\bqa\b|测试|质量|验证|验收|\btest|verif|quality/, "qa"],
			[/审阅|评审|校对|proofread|\breview/, "reviewer"],
			[/调研|研究|论文|科研|科学|实验|research|scientif/, "researcher"],
			[/文档|写作|文案|撰写|规范|\bdoc|writer|\bspec/, "docs"],
			[/数据|分析|指标|资料|\bdata\b|analys|metric/, "data"],
			[/设计|视觉|交互|前端|\bui\b|\bux\b|design|front/, "designer"],
			[/运维|部署|发布|构建|\bops\b|deploy|release|\bci\b|\bbuild\b/, "operator"],
			[/工程|开发|编程|代码|后端|实现|求解|engineer|\bdev\b|backend|\bapi\b|program|coding/, "engineer"]
		];
		/**
		* The sigil key for a member, or undefined when nothing matches (the roster
		* renders the plugin logo instead — a real fallback, not a blank).
		*/
		function memberSigil(name, role) {
			const identity = `${name} ${role}`.toLowerCase();
			for (const [pattern, sigil] of SIGIL_RULES) if (pattern.test(identity)) return sigil;
		}
		//#endregion
		//#region lib/client/rich-text.js
		/** Inline marks, tried left to right; code spans win so their markers survive. */
		const INLINE_PATTERN = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*)|(\*[^*\n]+\*)|(~~[^~\n]+~~)/g;
		function renderInline(text, keyPrefix) {
			const nodes = [];
			let cursor = 0;
			let index = 0;
			for (const match of text.matchAll(INLINE_PATTERN)) {
				if (match.index === void 0) continue;
				if (match.index > cursor) nodes.push(text.slice(cursor, match.index));
				const [raw] = match;
				const key = `${keyPrefix}i${index++}`;
				if (raw.startsWith("`")) nodes.push((0, react_jsx_runtime.jsx)("code", { children: raw.slice(1, -1) }, key));
				else if (raw.startsWith("**")) nodes.push((0, react_jsx_runtime.jsx)("strong", { children: raw.slice(2, -2) }, key));
				else if (raw.startsWith("~~")) nodes.push((0, react_jsx_runtime.jsx)("del", { children: raw.slice(2, -2) }, key));
				else nodes.push((0, react_jsx_runtime.jsx)("em", { children: raw.slice(1, -1) }, key));
				cursor = match.index + raw.length;
			}
			if (cursor < text.length) nodes.push(text.slice(cursor));
			return nodes;
		}
		const LIST_ITEM_PATTERN = /^\s*(?:[-*+]|\d+[.)])\s+(.+)$/;
		const FENCE_PATTERN = /^\s*```/;
		function renderBlocks(text) {
			const lines = String(text ?? "").split("\n");
			const blocks = [];
			let index = 0;
			let key = 0;
			while (index < lines.length) {
				const line = lines[index] ?? "";
				if (line.trim() === "") {
					index++;
					continue;
				}
				if (FENCE_PATTERN.test(line)) {
					const code = [];
					index++;
					while (index < lines.length && !FENCE_PATTERN.test(lines[index] ?? "")) {
						code.push(lines[index] ?? "");
						index++;
					}
					index++;
					blocks.push((0, react_jsx_runtime.jsx)("pre", { children: (0, react_jsx_runtime.jsx)("code", { children: code.join("\n") }) }, `b${key++}`));
					continue;
				}
				if (LIST_ITEM_PATTERN.exec(line) !== null) {
					const ordered = /^\s*\d/.test(line);
					const items = [];
					while (index < lines.length) {
						const next = LIST_ITEM_PATTERN.exec(lines[index] ?? "");
						if (next === null) break;
						items.push((0, react_jsx_runtime.jsx)("li", { children: renderInline(next[1] ?? "", `l${key}`) }, `l${key++}`));
						index++;
					}
					blocks.push(ordered ? (0, react_jsx_runtime.jsx)("ol", { children: items }, `b${key++}`) : (0, react_jsx_runtime.jsx)("ul", { children: items }, `b${key++}`));
					continue;
				}
				const paragraph = [];
				while (index < lines.length) {
					const current = lines[index] ?? "";
					if (current.trim() === "" || FENCE_PATTERN.test(current) || LIST_ITEM_PATTERN.test(current)) break;
					if (paragraph.length > 0) paragraph.push((0, react_jsx_runtime.jsx)("br", {}, `br${key++}`));
					paragraph.push(...renderInline(current, `p${key}-`));
					index++;
				}
				blocks.push((0, react_jsx_runtime.jsx)("p", { children: paragraph }, `b${key++}`));
			}
			return blocks;
		}
		/** Render agent text as React elements. Empty input renders nothing. */
		function RichText({ text, className }) {
			if (text === void 0 || text.trim() === "") return null;
			return (0, react_jsx_runtime.jsx)("div", {
				className,
				children: renderBlocks(text)
			});
		}
		//#endregion
		//#region lib/client/timeline-stream.js
		/**
		* 统一时间流（timeline stream）— the Direction-C narrative core.
		*
		* One rail, everything in occurrence order: structured operations and
		* captain-inbox mail interleave by timestamp, each task expands a compact
		* state card at its NEWEST event (the card is the task, the events are its
		* story), and the viewer reads one column instead of hopping between a
		* roster block, a task block, and a ticker.
		*
		* Discipline carried over from the ticker it replaces:
		* - consecutive same-actor same-action operations inside 60s fold into one
		*   row with a ×N counter (poll bursts read as one beat);
		* - unmatched server actions fall back to their raw kebab string (never
		*   blank);
		* - poll-driven text swaps render directly, no entry animation.
		* @module dsh-teams-x/client/timeline-stream
		*/
		/** Locale keys for the frequent operation verbs (zh dictionary is truth). */
		const OP_VERB_KEYS = {
			"task-dispatched": "op.task-dispatched",
			"task-claimed": "op.task-claimed",
			"task-progress": "op.task-progress",
			"task-updated": "op.task-updated",
			"task-shadow-takeover": "op.task-shadow-takeover",
			"dispatch-rolled-back": "op.dispatch-rolled-back",
			"repair-derived": "op.repair-derived",
			"repair-cancelled": "op.repair-cancelled",
			"repair-round-limit": "op.repair-round-limit",
			"repair-skip-duplicate": "op.repair-skip-duplicate",
			"stalled-orphan-requeued": "op.stalled-orphan-requeued",
			"stranded-captain-task-requeued": "op.stranded-captain-task-requeued",
			"stall-parked-notify": "op.stall-parked-notify",
			"stall-running-notify": "op.stall-running-notify"
		};
		/** Human verb for an operation action; unmatched actions fall back to raw. */
		function operationVerb(t, action) {
			const key = OP_VERB_KEYS[action];
			return key !== void 0 ? t(key) : action;
		}
		/** Actions that were in-flight when logged (hollow rail dots). */
		const IN_FLIGHT = /* @__PURE__ */ new Set([
			"task-dispatched",
			"task-claimed",
			"task-progress"
		]);
		/** Merge window for consecutive same-actor same-action operations. */
		const MERGE_WINDOW_MS = 6e4;
		/** Rows shown before the "load earlier" fold. */
		const FRESH_ROW_LIMIT = 10;
		/** Merge operations + mail into one newest-first stream with fold + anchors. */
		function buildStreamEntries(operations, messages) {
			const newestByTask = /* @__PURE__ */ new Map();
			for (const op of operations) {
				if (op.taskId === void 0) continue;
				const current = newestByTask.get(op.taskId);
				if (current === void 0 || op.ts >= current.ts) newestByTask.set(op.taskId, op);
			}
			const raw = [...operations.map((op) => ({
				key: `op-${op.ts}-${op.actor}-${op.action}`,
				kind: "op",
				ts: op.ts,
				op,
				count: 1,
				anchor: op.taskId !== void 0 && newestByTask.get(op.taskId) === op
			})), ...messages.map((message, index) => ({
				key: `msg-${message.ts ?? 0}-${index}`,
				kind: "inbox",
				ts: message.ts ?? 0,
				message,
				count: 1,
				anchor: false
			}))].sort((a, b) => b.ts - a.ts);
			const merged = [];
			for (const entry of raw) {
				const last = merged[merged.length - 1];
				if (entry.kind === "op" && last !== void 0 && last.kind === "op" && last.op !== void 0 && entry.op !== void 0 && last.op.actor === entry.op.actor && last.op.action === entry.op.action && last.op.ts - entry.op.ts <= MERGE_WINDOW_MS) {
					merged[merged.length - 1] = {
						...last,
						count: last.count + 1
					};
					continue;
				}
				merged.push(entry);
			}
			return merged;
		}
		/** Visual row kind: drives the rail dot's shape/color. */
		function rowKind(entry) {
			if (entry.kind === "inbox") return "inbox";
			const action = entry.op?.action;
			if (action === "task-failed") return "bad";
			if (action === "task-completed") return "ok";
			if (entry.op?.taskId !== void 0) return "task";
			return "op";
		}
		/** Apply a stream filter to merged entries (shared by the filter chips row). */
		function applyStreamFilter(entries, filter) {
			if (filter === "all") return entries;
			if (filter === "task") return entries.filter((entry) => entry.kind === "op" && entry.op?.taskId !== void 0);
			if (filter === "msg") return entries.filter((entry) => entry.kind === "inbox");
			return entries.filter((entry) => entry.kind === "inbox" ? entry.message?.from === filter.member : entry.op?.actor === filter.member);
		}
		function sameFilter(a, b) {
			if (a === b) return true;
			if (typeof a === "object" && typeof b === "object") return a.member === b.member;
			return false;
		}
		function formatClock(ts) {
			return new Date(ts).toLocaleTimeString([], {
				hour: "2-digit",
				minute: "2-digit",
				hourCycle: "h23"
			});
		}
		function formatDay(ts) {
			return new Date(ts).toLocaleDateString([], {
				month: "numeric",
				day: "numeric",
				weekday: "short"
			});
		}
		/** Progress-note sparkline: up to 8 ascending bars. */
		function Trend({ count }) {
			const steps = Math.min(count, 8);
			if (steps < 2) return null;
			return (0, react_jsx_runtime.jsx)("span", {
				className: ActivityPanel_module_css_default.trend,
				"aria-hidden": true,
				children: Array.from({ length: steps }, (_, index) => (0, react_jsx_runtime.jsx)("i", { style: { height: `${Math.min(14, 3 + index * 2)}px` } }, index))
			});
		}
		function TaskStreamCard({ task, t, onOpen }) {
			const StateIcon = VISUAL_STATE_ICONS[task.state];
			const statusKey = `task.status.${task.status}`;
			const shared = task.assignee === "";
			const assignee = shared ? t("task.assignee.shared") : task.assignee === "captain" ? t("task.assignee.captain") : task.assignee;
			const inkStyle = shared ? void 0 : { "--tx-ink": memberInk(task.assignee) };
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: ActivityPanel_module_css_default.tcard,
				"data-state": task.state,
				onClick: (event) => {
					onOpen(task, event.currentTarget);
				},
				"aria-label": `${task.id} ${t(statusKey)} ${assignee}`,
				children: [
					(0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.tcTop,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.tcId,
								children: task.id
							}),
							task.kind === "repair" && task.round !== void 0 && task.round > 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.chipRepair,
								title: t("task.roundTitle", { round: task.round }),
								children: `R${task.round}`
							}),
							task.takenOverBy === "captain" && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.chipTaken,
								title: t("task.takenTitle"),
								children: t("task.taken")
							}),
							typeof task.elapsedMs === "number" && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.tcElapsed,
								title: t("task.elapsedTitle"),
								children: formatElapsed(task.elapsedMs)
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.tcSubj,
						title: task.description || task.subject,
						children: task.subject
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.tcFoot,
						children: [
							(0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.tcStatus,
								children: [StateIcon !== void 0 && (0, react_jsx_runtime.jsx)(StateIcon, {
									size: 11,
									decorative: true
								}), t(statusKey)]
							}),
							task.depth > 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.chip,
								children: t("task.depth", { depth: task.depth })
							}),
							task.kind === "repair" && task.dependencies.length > 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.chip,
								"data-note": "source",
								title: t("task.sourceTitle", { taskId: task.dependencies[0] ?? "" }),
								children: `↻ ${task.dependencies[0] ?? ""}`
							}),
							typeof task.progressCount === "number" && task.progressCount > 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.chip,
								"data-note": "progress",
								title: task.progressLatest ?? "",
								children: `${task.progressCount}×${t("op.task-progress")}`
							}),
							task.verdict !== void 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.chip,
								"data-verdict": task.verdict,
								children: t(`task.verdict.${task.verdict}`)
							}),
							task.dependencies.length > 0 && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.chip,
								title: t("task.depsNote", { deps: task.dependencies.join(" ") }),
								children: `deps ${task.dependencies.join(" ")}`
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.tcAssignee,
								style: inkStyle,
								children: assignee
							})
						]
					}),
					task.status === "in_progress" && (task.progressCount ?? 0) > 1 && (0, react_jsx_runtime.jsx)(Trend, { count: task.progressCount ?? 0 })
				]
			});
		}
		function TaskPopover({ task, anchor, t, onClose }) {
			const ref = (0, react.useRef)(null);
			const [pos, setPos] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				const rect = anchor.getBoundingClientRect();
				const left = Math.min(Math.max(8, rect.left), window.innerWidth - 264 - 8);
				let top = rect.bottom + 6;
				if (top + 200 > window.innerHeight - 8) top = Math.max(8, rect.top - 206);
				setPos({
					left,
					top
				});
				const close = (event) => {
					const target = event.target;
					if (target === null) return;
					if (ref.current?.contains(target) === true || anchor.contains(target) === true) return;
					onClose();
				};
				const onKey = (event) => {
					if (event.key === "Escape") {
						event.stopPropagation();
						onClose();
					}
				};
				const onScroll = () => {
					onClose();
				};
				document.addEventListener("pointerdown", close);
				document.addEventListener("keydown", onKey, true);
				document.addEventListener("scroll", onScroll, true);
				return () => {
					document.removeEventListener("pointerdown", close);
					document.removeEventListener("keydown", onKey, true);
					document.removeEventListener("scroll", onScroll, true);
				};
			}, [anchor, onClose]);
			const statusKey = `task.status.${task.status}`;
			return (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
				ref,
				className: ActivityPanel_module_css_default.taskPop,
				style: pos === void 0 ? { visibility: "hidden" } : {
					left: `${pos.left}px`,
					top: `${pos.top}px`
				},
				role: "dialog",
				"aria-label": task.subject,
				children: [
					(0, react_jsx_runtime.jsx)("h4", { children: task.subject }),
					(0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.taskPopMeta,
						children: `${task.id} · ${t(statusKey)}${task.round !== void 0 && task.round > 0 ? ` · R${task.round}` : ""}`
					}),
					task.description !== "" && (0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.taskPopDesc,
						children: task.description
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.taskPopRow,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.taskPopKey,
							children: t("pop.assignee")
						}), (0, react_jsx_runtime.jsx)("span", { children: task.assignee === "" ? t("task.assignee.shared") : task.assignee === "captain" ? t("task.assignee.captain") : task.assignee })]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.taskPopRow,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.taskPopKey,
							children: t("pop.deps")
						}), (0, react_jsx_runtime.jsx)("span", { children: task.dependencies.length > 0 ? task.dependencies.join(", ") : "—" })]
					}),
					task.progressLatest !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.taskPopRow,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.taskPopKey,
							children: t("pop.latest")
						}), (0, react_jsx_runtime.jsx)("span", { children: task.progressLatest })]
					}),
					typeof task.elapsedMs === "number" && (0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.taskPopRow,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.taskPopKey,
							children: t("pop.elapsed")
						}), (0, react_jsx_runtime.jsx)("span", { children: formatElapsed(task.elapsedMs) })]
					})
				]
			}), document.body);
		}
		function TimelineStream({ team, t, openMember, readOnly, filter, decomposing, focusTaskId, onFocusHandled }) {
			const [olderShown, setOlderShown] = (0, react.useState)(false);
			const [pop, setPop] = (0, react.useState)(void 0);
			const rowRefs = (0, react.useRef)(/* @__PURE__ */ new Map());
			const entries = (0, react.useMemo)(() => buildStreamEntries(team.operations, team.captainInbox), [team.operations, team.captainInbox]);
			const tasksById = (0, react.useMemo)(() => new Map(team.tasks.map((task) => [task.id, task])), [team.tasks]);
			const filtered = (0, react.useMemo)(() => applyStreamFilter(entries, filter), [entries, filter]);
			const folded = !olderShown && sameFilter(filter, "all") && filtered.length > FRESH_ROW_LIMIT;
			const visible = folded ? filtered.slice(0, FRESH_ROW_LIMIT) : filtered;
			(0, react.useEffect)(() => {
				if (focusTaskId === void 0) return;
				setOlderShown(true);
				rowRefs.current.get(`anchor-${focusTaskId}`)?.scrollIntoView({
					behavior: "smooth",
					block: "center"
				});
				onFocusHandled?.();
			}, [focusTaskId, onFocusHandled]);
			const openTaskCard = (task, anchor) => {
				if (readOnly) return;
				setPop({
					task,
					anchor
				});
			};
			const openActor = (name) => {
				const member = team.members.find((candidate) => candidate.name === name);
				if (member === void 0 || member.id === "") return false;
				openMember(team.captainSessionId, member.id);
				return true;
			};
			if (decomposing) return (0, react_jsx_runtime.jsx)("div", {
				className: ActivityPanel_module_css_default.stream,
				role: "status",
				"aria-label": t("task.decomposing"),
				children: [
					86,
					64,
					78,
					58
				].map((width, index) => (0, react_jsx_runtime.jsxs)("div", {
					className: ActivityPanel_module_css_default.streamRow,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.streamTime,
						children: "--:--"
					}), (0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.streamBody,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.skeletonRow,
							style: { width: `${width}%` }
						})
					})]
				}, index))
			});
			if (filtered.length === 0) return (0, react_jsx_runtime.jsx)("div", {
				className: ActivityPanel_module_css_default.stream,
				children: (0, react_jsx_runtime.jsx)("p", {
					className: ActivityPanel_module_css_default.streamEmpty,
					children: entries.length === 0 ? t("stream.empty") : t("stream.count", {
						shown: 0,
						total: entries.length
					})
				})
			});
			let prevTs;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ActivityPanel_module_css_default.stream,
				role: "feed",
				"aria-label": t("ticker.aria"),
				children: [visible.map((entry, index) => {
					const dayBreak = prevTs !== void 0 && formatDay(prevTs) !== formatDay(entry.ts);
					prevTs = entry.ts;
					const kind = rowKind(entry);
					const actor = entry.kind === "inbox" ? entry.message?.from ?? "" : entry.op?.actor ?? "";
					const verb = entry.kind === "op" && entry.op !== void 0 ? operationVerb(t, entry.op.action) : "";
					const taskId = entry.op?.taskId;
					const anchorTask = entry.anchor && taskId !== void 0 ? tasksById.get(taskId) : void 0;
					const member = team.members.find((candidate) => candidate.name === actor);
					const openable = member !== void 0 && member.id !== "" && member.status !== "removed";
					const last = index === visible.length - 1;
					return (0, react_jsx_runtime.jsxs)("div", { children: [
						dayBreak && (0, react_jsx_runtime.jsx)("div", {
							className: ActivityPanel_module_css_default.daysep,
							role: "separator",
							children: formatDay(entry.ts)
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							ref: (node) => {
								if (anchorTask !== void 0 && node !== null) rowRefs.current.set(`anchor-${anchorTask.id}`, node);
							},
							className: ActivityPanel_module_css_default.streamRow,
							"data-kind": kind,
							"data-flight": entry.kind === "op" && IN_FLIGHT.has(entry.op?.action ?? "") || void 0,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.streamTime,
								children: formatClock(entry.ts)
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: ActivityPanel_module_css_default.streamBody,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.streamWho,
										style: { "--tx-ink": memberInk(actor) },
										children: openable ? (0, react_jsx_runtime.jsx)("button", {
											type: "button",
											className: ActivityPanel_module_css_default.streamWhoBtn,
											onClick: () => {
												openActor(actor);
											},
											title: t("member.openSession"),
											children: actor
										}) : actor
									}),
									entry.kind === "inbox" ? (0, react_jsx_runtime.jsxs)("span", {
										className: ActivityPanel_module_css_default.msg,
										children: [(0, react_jsx_runtime.jsx)("span", {
											className: ActivityPanel_module_css_default.msgTag,
											children: t("stream.from")
										}), (0, react_jsx_runtime.jsx)(RichText, {
											text: entry.message?.content ?? "",
											className: ActivityPanel_module_css_default.msgRich
										})]
									}) : (0, react_jsx_runtime.jsxs)("span", {
										className: ActivityPanel_module_css_default.streamText,
										children: [
											(0, react_jsx_runtime.jsx)("b", { children: verb }),
											taskId !== void 0 && (0, react_jsx_runtime.jsx)("span", {
												className: ActivityPanel_module_css_default.streamTaskId,
												children: taskId
											}),
											entry.count > 1 && (0, react_jsx_runtime.jsx)("span", {
												className: ActivityPanel_module_css_default.streamMerge,
												children: `×${entry.count}`
											}),
											entry.op?.detail !== void 0 && (0, react_jsx_runtime.jsx)("span", {
												className: ActivityPanel_module_css_default.streamDetail,
												children: entry.op.detail
											})
										]
									}),
									anchorTask !== void 0 && (0, react_jsx_runtime.jsx)(TaskStreamCard, {
										task: anchorTask,
										t,
										onOpen: openTaskCard
									})
								]
							})]
						}),
						last && folded && (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ActivityPanel_module_css_default.older,
							onClick: () => {
								setOlderShown(true);
							},
							children: t("stream.older")
						})
					] }, entry.key);
				}), pop !== void 0 && (0, react_jsx_runtime.jsx)(TaskPopover, {
					task: pop.task,
					anchor: pop.anchor,
					t,
					onClose: () => {
						setPop(void 0);
					}
				})]
			});
		}
		//#endregion
		//#region lib/client/team-card.js
		/**
		* One team card, v0.10 「时间线叙事流」form (Direction C).
		*
		* Single-column narrative: the identity header keeps its compact instruments
		* (completion ring, elapsed, token bars) plus a task-status segmented bar;
		* 「正在发生」 pins who is working right now; a slim member strip preserves
		* transcript/pause/unread reachability without re-erecting the roster block;
		* the task meter locates any task in the stream; and ONE unified timeline
		* (operations + mail + per-task state cards) carries the story below.
		* No module boxes: hairlines and the rail do the separating (DENSITY 8).
		* @module dsh-teams-x/client/team-card
		*/
		/**
		* Total task elapsed time: every task contributes its wall-clock run time —
		* terminal tasks their final duration, running tasks their growing current
		* elapsed — so the tile always reads the team's accumulated working time
		* instead of going blank the moment the last task completes.
		*/
		function totalElapsedMs(tasks) {
			let total;
			for (const task of tasks) {
				if (typeof task.elapsedMs !== "number") continue;
				total = (total ?? 0) + task.elapsedMs;
			}
			return total;
		}
		/**
		* Team-wide cumulative token total: each member owns a dedicated session, so
		* summing the per-member cumulative usage never double-counts.
		*/
		function sumTokens(members) {
			let input;
			let output;
			for (const member of members) {
				if (member.usage === void 0) continue;
				input = (input ?? 0) + member.usage.inputTokens;
				output = (output ?? 0) + member.usage.outputTokens;
			}
			return input === void 0 || output === void 0 ? void 0 : {
				input,
				output
			};
		}
		/** Visual task state used by the segmented bar and the task meter. */
		function nodeStateOf(task) {
			if (task.state === "blocked") return "blocked";
			if (task.status === "in_progress" || task.status === "claimed") return "running";
			if (task.status === "completed") return "done";
			if (task.status === "failed") return "failed";
			return "pending";
		}
		const SEGMENT_ORDER = [
			"done",
			"running",
			"failed",
			"blocked",
			"pending"
		];
		const SEGMENT_KEYS = {
			done: "task.status.completed",
			running: "task.status.in_progress",
			failed: "task.status.failed",
			blocked: "task.visual.blocked",
			pending: "task.status.pending"
		};
		function HeadRing({ done, denom, t }) {
			const pct = denom > 0 ? Math.round(done / denom * 100) : 0;
			const size = 32;
			const stroke = 3.5;
			const r = (size - stroke) / 2 - .5;
			const c = 2 * Math.PI * r;
			return (0, react_jsx_runtime.jsxs)("span", {
				className: ActivityPanel_module_css_default.headStat,
				children: [(0, react_jsx_runtime.jsxs)("span", {
					className: ActivityPanel_module_css_default.headRing,
					role: "img",
					"aria-label": t("team.done", {
						done,
						total: denom
					}),
					title: t("team.done", {
						done,
						total: denom
					}),
					children: [(0, react_jsx_runtime.jsx)("svg", {
						className: ActivityPanel_module_css_default.ringSvg,
						width: size,
						height: size,
						viewBox: `0 0 ${size} ${size}`,
						"aria-hidden": true,
						children: (0, react_jsx_runtime.jsxs)("g", {
							transform: `rotate(-90 ${size / 2} ${size / 2})`,
							children: [(0, react_jsx_runtime.jsx)("circle", {
								cx: size / 2,
								cy: size / 2,
								r,
								fill: "none",
								stroke: "var(--tx-viz-track)",
								strokeWidth: stroke
							}), (0, react_jsx_runtime.jsx)("circle", {
								className: ActivityPanel_module_css_default.ringSeg,
								cx: size / 2,
								cy: size / 2,
								r,
								fill: "none",
								stroke: pct >= 100 ? "var(--tx-ok)" : "var(--tx-accent)",
								strokeWidth: stroke,
								strokeLinecap: "round",
								strokeDasharray: `${(c * pct / 100).toFixed(1)} ${c.toFixed(1)}`
							})]
						})
					}), (0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.headRingValue,
						children: `${done}/${denom}`
					})]
				}), (0, react_jsx_runtime.jsxs)("span", {
					className: ActivityPanel_module_css_default.sl,
					children: [(0, react_jsx_runtime.jsx)("b", { children: `${pct}%` }), (0, react_jsx_runtime.jsx)("i", { children: t("team.progressLabel") })]
				})]
			});
		}
		function TokenViz({ tokens }) {
			const max = Math.max(tokens.input, tokens.output, 1);
			const width = (value) => `${Math.min(100, Math.round(value / max * 100))}%`;
			return (0, react_jsx_runtime.jsxs)("span", {
				className: ActivityPanel_module_css_default.headStat,
				children: [(0, react_jsx_runtime.jsxs)("span", {
					className: ActivityPanel_module_css_default.tokviz,
					title: `↑${formatTokens(tokens.input)} / ↓${formatTokens(tokens.output)}`,
					"aria-hidden": true,
					children: [(0, react_jsx_runtime.jsx)("i", { children: (0, react_jsx_runtime.jsx)("b", { style: { width: width(tokens.input) } }) }), (0, react_jsx_runtime.jsx)("i", {
						"data-out": true,
						children: (0, react_jsx_runtime.jsx)("b", { style: { width: width(tokens.output) } })
					})]
				}), (0, react_jsx_runtime.jsxs)("span", {
					className: ActivityPanel_module_css_default.sl,
					children: [(0, react_jsx_runtime.jsx)("b", { children: `↑${formatTokens(tokens.input)}` }), (0, react_jsx_runtime.jsx)("i", { children: `↓${formatTokens(tokens.output)}` })]
				})]
			});
		}
		/** 26px mini progress ring for the 「正在发生」 pills. */
		function MiniRing({ pct, color }) {
			const size = 26;
			const stroke = 3;
			const r = (size - stroke) / 2;
			const c = 2 * Math.PI * r;
			return (0, react_jsx_runtime.jsxs)("span", {
				className: ActivityPanel_module_css_default.headRing,
				"data-mini": true,
				"aria-hidden": true,
				children: [(0, react_jsx_runtime.jsx)("svg", {
					className: ActivityPanel_module_css_default.ringSvg,
					width: size,
					height: size,
					viewBox: `0 0 ${size} ${size}`,
					children: (0, react_jsx_runtime.jsxs)("g", {
						transform: `rotate(-90 ${size / 2} ${size / 2})`,
						children: [(0, react_jsx_runtime.jsx)("circle", {
							cx: size / 2,
							cy: size / 2,
							r,
							fill: "none",
							stroke: "var(--tx-viz-track)",
							strokeWidth: stroke
						}), (0, react_jsx_runtime.jsx)("circle", {
							cx: size / 2,
							cy: size / 2,
							r,
							fill: "none",
							stroke: color,
							strokeWidth: stroke,
							strokeLinecap: "round",
							strokeDasharray: `${(c * Math.max(0, Math.min(100, pct)) / 100).toFixed(1)} ${c.toFixed(1)}`
						})]
					})
				}), (0, react_jsx_runtime.jsx)("span", {
					className: ActivityPanel_module_css_default.headRingValue,
					children: pct
				})]
			});
		}
		function SegBar({ team, t }) {
			const counts = (0, react.useMemo)(() => {
				const result = /* @__PURE__ */ new Map();
				for (const task of team.tasks) {
					const state = nodeStateOf(task);
					result.set(state, (result.get(state) ?? 0) + 1);
				}
				return result;
			}, [team.tasks]);
			const total = team.tasks.length;
			if (total === 0) return null;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ActivityPanel_module_css_default.segbar,
				"aria-hidden": true,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: ActivityPanel_module_css_default.segtrack,
					children: SEGMENT_ORDER.map((state) => {
						const count = counts.get(state) ?? 0;
						if (count === 0) return null;
						return (0, react_jsx_runtime.jsx)("i", {
							"data-seg": state,
							style: { width: `${(count / total * 100).toFixed(2)}%` }
						}, state);
					})
				}), (0, react_jsx_runtime.jsx)("div", {
					className: ActivityPanel_module_css_default.seglegend,
					children: SEGMENT_ORDER.map((state) => {
						const count = counts.get(state) ?? 0;
						if (count === 0) return null;
						return (0, react_jsx_runtime.jsxs)("span", {
							className: ActivityPanel_module_css_default.lg,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.sw,
									"data-seg": state
								}),
								t(SEGMENT_KEYS[state]),
								(0, react_jsx_runtime.jsx)("b", { children: count })
							]
						}, state);
					})
				})]
			});
		}
		function MemberChip({ member, team, t, openMember, readOnly, beat }) {
			const [pinned, setPinned] = (0, react.useState)(false);
			const [hover, setHover] = (0, react.useState)(false);
			const [pausing, setPausing] = (0, react.useState)(false);
			const [pauseError, setPauseError] = (0, react.useState)(void 0);
			const infoOpen = pinned || hover;
			const sigil = memberSigil(member.name, member.role);
			const Sigil = sigil !== void 0 ? ROLE_ICONS[sigil] : void 0;
			const activity = beatActivity(member.activity, beat);
			const stateKey = activity === "working" ? "member.state.working" : activity === "idle" ? "member.state.idle" : "member.state.unknown";
			const openable = member.id !== "" && member.status !== "removed";
			const inkStyle = { "--tx-ink": memberInk(member.name) };
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
			return (0, react_jsx_runtime.jsxs)("span", {
				className: ActivityPanel_module_css_default.memberChip,
				style: inkStyle,
				"data-activity": activity,
				onMouseEnter: () => {
					setHover(true);
				},
				onMouseLeave: () => {
					setHover(false);
				},
				children: [
					member.unread > 0 && (0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.memberChipUnread,
						title: t("member.unread", { count: member.unread }),
						children: member.unread
					}),
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ActivityPanel_module_css_default.memberChipInfo,
						onClick: () => {
							setPinned((value) => !value);
						},
						"aria-expanded": infoOpen === true || void 0,
						"aria-label": `${t("member.info")} · ${member.name}`,
						title: `${member.name} · ${t(stateKey)}`,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.memberChipIcon,
							children: Sigil !== void 0 ? (0, react_jsx_runtime.jsx)(Sigil, {
								size: 13,
								decorative: true
							}) : (0, react_jsx_runtime.jsx)(TeamsXLogo, {
								size: 13,
								label: member.name
							})
						})
					}),
					openable ? (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ActivityPanel_module_css_default.memberChipName,
						onClick: () => {
							openMember(team.captainSessionId, member.id);
						},
						title: t("member.openSession"),
						children: member.name
					}) : (0, react_jsx_runtime.jsx)("span", {
						className: ActivityPanel_module_css_default.memberChipName,
						title: `${member.name} · ${t(stateKey)}`,
						children: member.name
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						className: ActivityPanel_module_css_default.memberChipPop,
						"data-open": infoOpen === true || void 0,
						role: "status",
						children: [
							(0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.taskPopRow,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.taskPopKey,
									children: t("member.model")
								}), (0, react_jsx_runtime.jsx)("span", { children: pauseError ?? member.model })]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.taskPopRow,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.taskPopKey,
									children: t("member.tokensTitle")
								}), (0, react_jsx_runtime.jsx)("span", { children: member.usage !== void 0 ? `↑${formatTokens(member.usage.inputTokens)} ↓${formatTokens(member.usage.outputTokens)}` : "--" })]
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.taskPopRow,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.taskPopKey,
									children: t("editor.tasks")
								}), (0, react_jsx_runtime.jsx)("span", { children: t("member.progress", {
									done: member.done,
									total: member.total
								}) })]
							}),
							!readOnly && activity === "working" && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.memberChipPause,
								onClick: () => {
									pause();
								},
								disabled: pausing,
								children: pausing ? "…" : t("member.pause")
							})
						]
					})
				]
			});
		}
		function TeamCard({ team, t, openMember, readOnly, onSaved }) {
			const [confirming, setConfirming] = (0, react.useState)(false);
			const [stopping, setStopping] = (0, react.useState)(false);
			const [stopError, setStopError] = (0, react.useState)(void 0);
			const [filter, setFilter] = (0, react.useState)("all");
			const [focusTaskId, setFocusTaskId] = (0, react.useState)(void 0);
			const counts = countTasks(team.tasks);
			const phaseKey = team.phase === "staged" ? "team.phase.staged" : "team.phase.running";
			const beats = useLiveBeats((0, react.useMemo)(() => team.members.map((member) => member.id), [team.members]));
			const elapsed = totalElapsedMs(team.tasks);
			const tokens = sumTokens(team.members);
			const staged = team.phase === "staged";
			const running = team.phase === "running";
			const entries = (0, react.useMemo)(() => buildStreamEntries(team.operations, team.captainInbox), [team.operations, team.captainInbox]);
			const filteredCount = applyStreamFilter(entries, filter).length;
			const unread = team.messageCount;
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
			const toggleMemberFilter = (name) => {
				setFilter((prev) => typeof prev === "object" && prev.member === name ? "all" : { member: name });
			};
			const workingMembers = team.members.filter((member) => beatActivity(member.activity, beats[member.id]) === "working");
			const workingNames = new Set(workingMembers.map((member) => member.name));
			const orphanRunning = running ? team.tasks.filter((task) => task.status === "in_progress" && !workingNames.has(task.assignee)) : [];
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ActivityPanel_module_css_default.teamCard,
				"data-phase": team.phase,
				"data-halted": team.halted === true || void 0,
				children: [
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
									title: team.name,
									children: team.name
								}), team.description !== void 0 && (0, react_jsx_runtime.jsx)("p", {
									className: ActivityPanel_module_css_default.teamGoal,
									children: team.description
								})]
							}),
							readOnly && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.teamNote,
								children: t("card.readonly")
							}),
							team.planReviewState === "awaiting_feedback" && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.teamNote,
								children: t("team.planReview.awaiting_feedback")
							}),
							team.halted === true && (0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.teamNote,
								"data-halted": true,
								children: t("team.halted")
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.phaseTag,
								"data-phase": team.phase,
								children: t(phaseKey)
							}),
							!readOnly && running && team.halted !== true && !confirming && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.stopButton,
								onClick: () => {
									setConfirming(true);
								},
								children: t("team.stop")
							})
						]
					}),
					staged && !readOnly && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(PlanReviewBar, {
						team,
						t
					}), (0, react_jsx_runtime.jsx)(StagedPlanEditor, {
						team,
						t,
						onSaved
					})] }),
					(0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.headStats,
						children: running ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							(0, react_jsx_runtime.jsx)(HeadRing, {
								done: counts.completed,
								denom: counts.denom,
								t
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.headStat,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.headStatIcon,
									children: (0, react_jsx_runtime.jsx)(GlyphClock, {
										size: 13,
										decorative: true
									})
								}), (0, react_jsx_runtime.jsxs)("span", {
									className: ActivityPanel_module_css_default.sl,
									children: [(0, react_jsx_runtime.jsx)("b", { children: elapsed !== void 0 ? formatElapsed(elapsed) : "--" }), (0, react_jsx_runtime.jsx)("i", { children: t("task.elapsedTitle") })]
								})]
							}),
							tokens !== void 0 && (0, react_jsx_runtime.jsx)(TokenViz, { tokens })
						] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.headStat,
							children: (0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.sl,
								children: [(0, react_jsx_runtime.jsx)("b", { children: team.members.length }), (0, react_jsx_runtime.jsx)("i", { children: t("editor.members") })]
							})
						}), (0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.headStat,
							children: (0, react_jsx_runtime.jsxs)("span", {
								className: ActivityPanel_module_css_default.sl,
								children: [(0, react_jsx_runtime.jsx)("b", { children: team.tasks.length }), (0, react_jsx_runtime.jsx)("i", { children: t("editor.tasks") })]
							})
						})] })
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
					running && (0, react_jsx_runtime.jsx)(SegBar, {
						team,
						t
					}),
					(workingMembers.length > 0 || orphanRunning.length > 0) && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.nowLabel,
						children: t("now.title")
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.nowbar,
						role: "group",
						"aria-label": t("now.title"),
						children: [workingMembers.map((member) => {
							const task = team.tasks.find((candidate) => candidate.status === "in_progress" && candidate.assignee === member.name);
							return (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.nowitem,
								style: { "--tx-ink": memberInk(member.name) },
								"data-active": typeof filter === "object" && filter.member === member.name || void 0,
								onClick: () => {
									toggleMemberFilter(member.name);
								},
								title: t("now.hint", { name: member.name }),
								children: [
									(0, react_jsx_runtime.jsx)(MiniRing, {
										pct: member.progress,
										color: memberInk(member.name)
									}),
									(0, react_jsx_runtime.jsx)("b", {
										className: ActivityPanel_module_css_default.nowName,
										children: member.name
									}),
									task !== void 0 && (0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.nowTaskId,
										children: task.id
									}),
									(0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.nowText,
										children: task !== void 0 ? task.subject : member.currentTask !== "" ? member.currentTask : t("member.state.working")
									}),
									member.unread > 0 && (0, react_jsx_runtime.jsx)("span", {
										className: ActivityPanel_module_css_default.memberChipUnread,
										"data-inline": true,
										children: member.unread
									})
								]
							}, member.id !== "" ? member.id : member.name);
						}), orphanRunning.map((task) => (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: ActivityPanel_module_css_default.nowitem,
							onClick: () => {
								setFilter("all");
								setFocusTaskId(task.id);
							},
							title: t("wm.hint", { status: t(`task.status.${task.status}`) }),
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.nowDot,
									"aria-hidden": true
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.nowTaskId,
									children: task.id
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.nowText,
									children: task.subject
								})
							]
						}, task.id))]
					})] }),
					team.members.length > 0 && (0, react_jsx_runtime.jsx)("div", {
						className: ActivityPanel_module_css_default.memberStrip,
						role: "group",
						"aria-label": t("editor.members"),
						children: team.members.map((member) => (0, react_jsx_runtime.jsx)(MemberChip, {
							member,
							team,
							t,
							openMember,
							readOnly,
							beat: beats[member.id]
						}, member.id !== "" ? member.id : member.name))
					}),
					running && team.tasks.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.wmbar,
						role: "group",
						"aria-label": t("wm.title"),
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ActivityPanel_module_css_default.wmLabel,
							children: t("wm.title")
						}), team.tasks.map((task) => {
							const state = nodeStateOf(task);
							const statusLabel = t(`task.status.${task.status}`);
							return (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.wm,
								"data-state": state,
								onClick: () => {
									setFilter("all");
									setFocusTaskId(task.id);
								},
								title: `${task.subject} · ${t("wm.hint", { status: statusLabel })}`,
								"aria-label": `${task.subject} · ${statusLabel}`,
								children: [(0, react_jsx_runtime.jsx)("span", { children: task.id }), (0, react_jsx_runtime.jsx)("span", {
									className: ActivityPanel_module_css_default.wmFill,
									"aria-hidden": true,
									children: (0, react_jsx_runtime.jsx)("i", { style: { width: state === "done" || state === "failed" ? "100%" : state === "running" || state === "blocked" ? "52%" : "0%" } })
								})]
							}, task.id);
						})]
					}),
					(running || entries.length > 0) && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", {
						className: ActivityPanel_module_css_default.filters,
						role: "group",
						"aria-label": t("ticker.aria"),
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.filterChip,
								"aria-pressed": filter === "all",
								onClick: () => {
									setFilter("all");
								},
								children: t("stream.filter.all")
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.filterChip,
								"aria-pressed": filter === "task",
								onClick: () => {
									setFilter("task");
								},
								children: t("stream.filter.task")
							}),
							(0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.filterChip,
								"aria-pressed": filter === "msg",
								onClick: () => {
									setFilter("msg");
								},
								children: [t("stream.filter.msg"), unread > 0 && (0, react_jsx_runtime.jsx)("b", {
									className: ActivityPanel_module_css_default.filterUnread,
									children: unread
								})]
							}),
							typeof filter === "object" && (0, react_jsx_runtime.jsxs)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.filterChip,
								"data-member": true,
								"aria-pressed": "true",
								onClick: () => {
									setFilter("all");
								},
								children: [t("stream.filter.member", { name: filter.member }), (0, react_jsx_runtime.jsx)("span", {
									"aria-hidden": true,
									children: " ✕"
								})]
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: ActivityPanel_module_css_default.filterCount,
								children: t("stream.count", {
									shown: filteredCount,
									total: entries.length
								})
							})
						]
					}), (0, react_jsx_runtime.jsx)(TimelineStream, {
						team,
						t,
						openMember,
						readOnly,
						filter,
						decomposing: running && team.tasks.length === 0,
						focusTaskId,
						onFocusHandled: () => {
							setFocusTaskId(void 0);
						}
					})] })
				]
			});
		}
		//#endregion
		//#region lib/client/panel-body.js
		/**
		* The activity body every host shares: the live/archive toggle, refresh, the
		* error and empty states, and the team cards. Self-contained — it owns its
		* view mode and its polling — so the session-header dropdown, the right
		* Sidebar tab and the main-column panel are one component with one data path.
		* Behavior-preserving extraction from ActivityPanel (v0.9 P0).
		* @module dsh-teams-x/client/panel-body
		*/
		/** Poll cadence for the live view. */
		const POLL_INTERVAL_MS = 4e3;
		/** Collapsed discovery cadence: slow, but fast enough to notice a team the
		* session creates after this badge mounted. */
		const DISCOVERY_INTERVAL_MS = 1e4;
		/**
		* Fetch team snapshots. `live` mode polls (slow cadence when collapsed,
		* fast when expanded); `archive` mode fetches once on mount and on
		* explicit reload only (static historical data, no auto-refresh).
		*
		* 静默轮询（quiet polling）: a tick whose payload would render identically
		* commits no state — same reference in, no re-render, control states stay
		* put. When a poll fails, the last-known-good list stays on screen and the
		* panel flips to `stale` (a quiet note, not an error wall); the error box is
		* reserved for "nothing to show at all". `busy` is the manual-reload spinner
		* only — background ticks are invisible unless data changed.
		*/
		function useTeamData(expanded, viewMode) {
			const [teams, setTeams] = (0, react.useState)([]);
			const [error, setError] = (0, react.useState)(void 0);
			const [stale, setStale] = (0, react.useState)(false);
			const [busy, setBusy] = (0, react.useState)(false);
			const [tick, setTick] = (0, react.useState)(0);
			const [fast, setFast] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				let disposed = false;
				const load = async () => {
					try {
						const data = await fetchTeams(viewMode);
						if (disposed) return;
						setTeams((prev) => sameTeamsSnapshots(prev, data) ? prev : data);
						setFast(data.length > 0);
						setError(void 0);
						setStale(false);
					} catch (cause) {
						if (disposed) return;
						setError(cause instanceof Error ? cause.message : String(cause));
						setStale(true);
					} finally {
						if (!disposed) setBusy(false);
					}
				};
				load();
				if (viewMode === "archive") return () => {
					disposed = true;
				};
				const interval = expanded || fast ? POLL_INTERVAL_MS : DISCOVERY_INTERVAL_MS;
				const timer = window.setInterval(() => {
					load();
				}, interval);
				return () => {
					disposed = true;
					window.clearInterval(timer);
				};
			}, [
				expanded,
				viewMode,
				tick,
				fast
			]);
			return {
				teams,
				error,
				stale,
				busy,
				reload: (0, react.useCallback)(() => {
					setBusy(true);
					setTick((value) => value + 1);
				}, [])
			};
		}
		function TeamsXPanelBody({ sessionId, t, openMember, onClose }) {
			const translate = (0, react.useMemo)(() => makeT(t), [t]);
			const [viewMode, setViewMode] = (0, react.useState)("live");
			const { teams, error, stale, busy, reload } = useTeamData(true, viewMode);
			const sessionTeams = (0, react.useMemo)(() => teams.filter((team) => team.captainSessionId === sessionId || team.members.some((member) => member.id === sessionId)), [teams, sessionId]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
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
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: ActivityPanel_module_css_default.modeToggle,
								role: "radiogroup",
								"aria-label": translate("panel.live"),
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `${ActivityPanel_module_css_default.modeOption} ${viewMode === "live" ? ActivityPanel_module_css_default.modeActive : ""}`,
									onClick: () => {
										setViewMode("live");
									},
									"aria-pressed": viewMode === "live",
									children: translate("panel.live")
								}), (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: `${ActivityPanel_module_css_default.modeOption} ${viewMode === "archive" ? ActivityPanel_module_css_default.modeActive : ""}`,
									onClick: () => {
										setViewMode("archive");
									},
									"aria-pressed": viewMode === "archive",
									children: translate("panel.archived")
								})]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.refreshButton,
								onClick: reload,
								"data-loading": busy === true || void 0,
								"aria-label": translate("panel.refresh"),
								title: translate("panel.refresh"),
								children: (0, react_jsx_runtime.jsx)(GlyphRefresh, {
									size: 13,
									className: busy === true ? ActivityPanel_module_css_default.animSpin : void 0,
									decorative: true
								})
							}),
							onClose !== void 0 && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ActivityPanel_module_css_default.refreshButton,
								onClick: onClose,
								"aria-label": translate("panel.close"),
								title: translate("panel.close"),
								children: (0, react_jsx_runtime.jsx)(GlyphClose, {
									size: 13,
									decorative: true
								})
							})
						]
					})]
				}),
				error !== void 0 && sessionTeams.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
					className: ActivityPanel_module_css_default.staleNote,
					role: "status",
					children: [(0, react_jsx_runtime.jsx)("span", { children: translate("panel.stale") }), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ActivityPanel_module_css_default.staleRetry,
						onClick: reload,
						children: translate("panel.refresh")
					})]
				}),
				error !== void 0 && sessionTeams.length === 0 && (0, react_jsx_runtime.jsxs)("div", {
					className: ActivityPanel_module_css_default.errorBox,
					children: [(0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.panelError,
						children: translate("panel.error", { message: error })
					}), (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: ActivityPanel_module_css_default.retryButton,
						onClick: reload,
						children: translate("panel.refresh")
					})]
				}),
				error === void 0 && sessionTeams.length === 0 && (0, react_jsx_runtime.jsxs)("div", {
					className: ActivityPanel_module_css_default.emptyState,
					children: [(0, react_jsx_runtime.jsx)(TeamsXLogo, {
						size: 48,
						className: ActivityPanel_module_css_default.emptyLogo
					}), (0, react_jsx_runtime.jsx)("p", {
						className: ActivityPanel_module_css_default.panelEmpty,
						children: translate("panel.empty")
					})]
				}),
				(0, react_jsx_runtime.jsx)("div", {
					className: ActivityPanel_module_css_default.teamList,
					children: sessionTeams.map((team) => (0, react_jsx_runtime.jsx)(TeamCard, {
						team,
						t: translate,
						openMember,
						readOnly: viewMode === "archive",
						onSaved: reload
					}, `${team.workspace}/${team.teamId}`))
				})
			] });
		}
		//#endregion
		//#region lib/client/sheet-visibility.js
		/**
		* Narrow-viewport coordination between the panel hosts. On a phone the
		* right-Sidebar pane and the badge's bottom sheet can both be mounted; when
		* the sheet is open the tab body hides itself — two copies of the same team
		* card stacked on a 390px screen read as a rendering bug (seen in browser
		* acceptance 2026-09-13).
		* @module dsh-teams-x/client/sheet-visibility
		*/
		const listeners$1 = /* @__PURE__ */ new Set();
		let sheetOpen = false;
		/** Publish the badge sheet's open state (narrow viewports only matter). */
		function setSheetOpen(open) {
			if (sheetOpen === open) return;
			sheetOpen = open;
			for (const listener of listeners$1) listener(open);
		}
		/** Subscribe to the badge sheet's open state; returns the unsubscriber. */
		function onSheetOpen(listener) {
			listeners$1.add(listener);
			return () => {
				listeners$1.delete(listener);
			};
		}
		/** Current state (used to initialize subscribers without a missed frame). */
		function isSheetOpen() {
			return sheetOpen;
		}
		//#endregion
		//#region lib/client/open-request.js
		/**
		* Module-level open-request channel from the `/teamsx` slash command to the
		* session-scoped ActivityPanel instance (whose `open` flag is component
		* state). Plain listener set — no store dependency, safe for the bundle.
		*
		* Two signals flow through this module:
		* 1. **Delivery / claim** — `requestTeamsXPanel` asks the panel of `sessionId`
		*    to expand. Each listener returns `true` when it claims the request (the
		*    panel is mounted for that session and has expanded). The call returns
		*    `true` iff at least one listener claimed.
		* 2. **Unclaimed fallback** — when no listener claims (the panel is not
		*    mounted for this session, e.g. the host home screen), the same synchronous
		*    call stack notifies `unclaimedListeners` so a global hint host can show a
		*    user-visible message instead of the legacy silent no-op.
		*
		* Both channels are plain `Set` listeners with no store dependency.
		* @module dsh-teams-x/client/open-request
		*/
		const listeners = /* @__PURE__ */ new Set();
		const unclaimedListeners = /* @__PURE__ */ new Set();
		/**
		* Ask the panel of `sessionId` to expand. Returns `true` iff at least one
		* listener claimed the request. When nobody claims, synchronously triggers
		* the unclaimed fallback channel (same call stack, no async race).
		*/
		function requestTeamsXPanel(sessionId) {
			let claimed = false;
			for (const listener of [...listeners]) if (listener(sessionId) === true) claimed = true;
			if (!claimed) for (const listener of [...unclaimedListeners]) listener(sessionId);
			return claimed;
		}
		/** Subscribe to open requests; returns the unsubscribe function. */
		function onTeamsXPanelRequest(listener) {
			listeners.add(listener);
			return () => {
				listeners.delete(listener);
			};
		}
		/** Subscribe to unclaimed fallback; returns the unsubscribe function. */
		function onTeamsXPanelUnclaimed(listener) {
			unclaimedListeners.add(listener);
			return () => {
				unclaimedListeners.delete(listener);
			};
		}
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
		*
		* v0.10 split: the shared body lives in panel-body.tsx, the team card in
		* team-card.tsx, the unified timeline in timeline-stream.tsx, the review bar
		* in plan-review.tsx, endpoints in endpoints.ts, API helpers in api.ts, and
		* formatting in format.ts. This file keeps the session-scoped shell plus the
		* historical export surface (TeamsXPanelBody, PanelTranslate, URL constants).
		* @module dsh-teams-x/client/ActivityPanel
		*/
		/**
		* Detect narrow viewports (mobile web / remote): the expanded panel renders
		* as a full-width bottom sheet instead of a badge-anchored dropdown.
		*/
		function useIsNarrow() {
			const [isNarrow, setIsNarrow] = (0, react.useState)(() => window.matchMedia("(max-width: 768px)").matches);
			(0, react.useEffect)(() => {
				const mq = window.matchMedia("(max-width: 768px)");
				const onChange = (e) => {
					setIsNarrow(e.matches);
				};
				mq.addEventListener("change", onChange);
				return () => {
					mq.removeEventListener("change", onChange);
				};
			}, []);
			return isNarrow;
		}
		/**
		* Place the expanded panel flush against the LEFT sidebar's right edge —
		* the user-facing anchor is the sidebar, not the mid-header badge — and
		* cleared below the session tab bar. Placement runs ONCE on open (plus on
		* resize): no periodic re-probing, so the panel never visibly jumps after
		* settling.
		*
		* (2026-09-12) Horizontal anchor history: badge right edge, then badge left
		* edge. (2026-09-13, user direction) The panel docks next to the host's left
		* sidebar column (`[class*="sidebarCol"]`, the hashed-suffix local name
		* survives host rebuilds) with a 10px gap, falling back to the session tab
		* strip's left edge and finally the badge — with a viewport clamp for narrow
		* desktops.
		*/
		function usePanelPlacement(badgeRef, panelRef, expanded) {
			const [pos, setPos] = (0, react.useState)({
				top: 96,
				left: 96
			});
			(0, react.useEffect)(() => {
				if (!expanded) return;
				const place = () => {
					const badge = badgeRef.current;
					if (badge === null) return;
					const rect = badge.getBoundingClientRect();
					const tablist = document.querySelector("[role=\"tablist\"]");
					const tablistRect = tablist === null ? null : tablist.getBoundingClientRect();
					const tablistBottom = tablistRect?.bottom ?? 0;
					let top = Math.max(rect.bottom + 6, tablistBottom + 8, 8);
					const maxH = Math.min(window.innerHeight * .72, 640);
					if (top + maxH > window.innerHeight - 8) top = Math.max(8, window.innerHeight - maxH - 8);
					const width = panelRef.current?.getBoundingClientRect().width ?? 0;
					const sidebarRight = document.querySelector("[class*=\"sidebarCol\"]")?.getBoundingClientRect().right;
					let left = sidebarRight !== void 0 ? sidebarRight + 10 : tablistRect?.left ?? rect.left;
					if (width > 0 && left + width > window.innerWidth - 8) left = window.innerWidth - width - 8;
					left = Math.max(8, left);
					setPos((prev) => prev.top === top && prev.left === left ? prev : {
						top,
						left
					});
				};
				place();
				window.addEventListener("resize", place);
				let resizeObserver;
				const badgeEl = badgeRef.current;
				if (badgeEl !== null && typeof ResizeObserver !== "undefined") {
					const parent = badgeEl.offsetParent;
					if (parent !== null) {
						resizeObserver = new ResizeObserver(() => place());
						resizeObserver.observe(parent);
					}
				}
				return () => {
					window.removeEventListener("resize", place);
					resizeObserver?.disconnect();
				};
			}, [
				badgeRef,
				panelRef,
				expanded
			]);
			return pos;
		}
		/**
		* The session-scoped shell: a header chip that exists only when THIS session
		* owns or participates in a live team; the expanded panel portals to body.
		*/
		function ActivityPanel({ sessionId, t, openMember }) {
			const translate = (0, react.useMemo)(() => makeT(t), [t]);
			const [expanded, setExpanded] = (0, react.useState)(false);
			const [hasArchived, setHasArchived] = (0, react.useState)(false);
			const badgeRef = (0, react.useRef)(null);
			const panelRef = (0, react.useRef)(null);
			const isNarrow = useIsNarrow();
			(0, react.useEffect)(() => onTeamsXPanelRequest((target) => {
				if (target === sessionId) {
					setExpanded(true);
					return true;
				}
				return false;
			}), [sessionId]);
			const { teams, error } = useTeamData(false, "live");
			(0, react.useEffect)(() => {
				if (hasArchived) return;
				fetchTeams("archive").then((data) => {
					if (data.some((team) => team.captainSessionId === sessionId || team.members.some((member) => member.id === sessionId))) setHasArchived(true);
				}).catch(() => {});
			}, [sessionId, hasArchived]);
			const sessionTeams = (0, react.useMemo)(() => teams.filter((team) => team.captainSessionId === sessionId || team.members.some((member) => member.id === sessionId)), [teams, sessionId]);
			const workingCount = sessionTeams.reduce((count, team) => count + team.members.filter((member) => member.activity === "working").length, 0);
			const runningTasks = sessionTeams.reduce((count, team) => count + team.tasks.filter((task) => task.status === "claimed" || task.status === "in_progress").length, 0);
			const placement = usePanelPlacement(badgeRef, panelRef, expanded && !isNarrow);
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
			(0, react.useEffect)(() => {
				if (!expanded) return;
				const onKeyDown = (event) => {
					if (event.key === "Escape") {
						event.stopPropagation();
						setExpanded(false);
					}
				};
				document.addEventListener("keydown", onKeyDown, true);
				return () => {
					document.removeEventListener("keydown", onKeyDown, true);
				};
			}, [expanded]);
			(0, react.useEffect)(() => {
				if (!isNarrow) return;
				setSheetOpen(expanded);
				return () => {
					setSheetOpen(false);
				};
			}, [expanded, isNarrow]);
			if (sessionTeams.length === 0 && !hasArchived && error === void 0 && !expanded) return null;
			const badgeLabel = workingCount > 0 ? `${translate("panel.aria")} (${workingCount})` : translate("panel.aria");
			const badgeDetail = runningTasks > 0 ? `${translate("panel.title")} · ${translate("task.status.in_progress")} ${runningTasks}` : workingCount > 0 ? `${translate("panel.title")} · ${t("member.state.working")} ${workingCount}` : translate("panel.title");
			const badge = (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				ref: badgeRef,
				className: ActivityPanel_module_css_default.badgeFab,
				"data-expanded": expanded === true || void 0,
				"data-busy": runningTasks > 0 || void 0,
				onClick: () => {
					setExpanded((value) => !value);
				},
				"aria-label": badgeLabel,
				"aria-expanded": expanded === true || void 0,
				title: badgeDetail,
				children: [(0, react_jsx_runtime.jsx)(TeamsXLogo, {
					size: 16,
					decorative: true
				}), workingCount > 0 && (0, react_jsx_runtime.jsx)("span", {
					className: ActivityPanel_module_css_default.badgeFabBusy,
					"aria-hidden": true
				})]
			});
			if (!expanded) return badge;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [badge, (0, react_dom.createPortal)((0, react_jsx_runtime.jsx)("div", {
				className: isNarrow ? ActivityPanel_module_css_default.panelSheet : ActivityPanel_module_css_default.panelWindow,
				ref: panelRef,
				style: isNarrow ? void 0 : {
					top: `${placement.top}px`,
					left: `${placement.left}px`
				},
				role: "region",
				"aria-label": translate("panel.aria"),
				children: (0, react_jsx_runtime.jsx)(TeamsXPanelBody, {
					sessionId,
					t,
					openMember,
					onClose: () => {
						setExpanded(false);
					}
				})
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
			"panel.empty": "暂无团队活动，在会话中说\"用 TeamsX 做 X\"即可组建团队",
			"panel.pickSession": "先在左侧选择一个会话，这里会显示它的团队活动",
			"panel.refresh": "刷新",
			"panel.close": "关闭面板",
			"panel.live": "实时",
			"panel.archived": "历史",
			"panel.error": "加载团队状态失败：{message}",
			"panel.stale": "连接断开，显示的是最后一次成功的数据",
			"tab": "TeamsX",
			"sidebar.guideDescription": "团队活动：成员、任务依赖与收件箱",
			"team.progressLabel": "已完成",
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
			"plan.needsReview": "计划待审批：确认无误后批准运行，或回聊天修改",
			"plan.approve": "批准并运行",
			"plan.returnToChat": "回聊天修改",
			"plan.discard": "放弃计划",
			"plan.discardConfirm": "确认放弃？",
			"plan.notRunnable": "需要至少一名成员和一项任务才能运行",
			"plan.review": "{review}",
			"editor.open": "编辑计划",
			"editor.members": "成员",
			"editor.tasks": "任务",
			"editor.name": "名称",
			"editor.role": "角色",
			"editor.provider": "Provider",
			"editor.model": "模型",
			"editor.subject": "主题",
			"editor.assignee": "指派",
			"editor.deps": "依赖",
			"editor.depsHint": "多个依赖用逗号分隔",
			"editor.addTask": "+ 添加任务",
			"editor.remove": "移除",
			"editor.restore": "恢复",
			"editor.save": "保存修改",
			"editor.cancel": "放弃更改",
			"editor.saving": "保存中…",
			"editor.subjectRequired": "新任务与修改后的任务必须有非空主题",
			"card.phase.deleted": "已归档",
			"card.more": "还有 {count} 项任务",
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
			"task.decomposing": "队长正在把目标拆解成任务",
			"task.depsNote": "依赖 {deps}",
			"task.cancelledDep": "依赖中含已取消任务：可能永久阻塞",
			"task.roundTitle": "第 {round} 轮修复",
			"task.sourceTitle": "修复自 {taskId}",
			"task.takenTitle": "队长影子接管中：成员保留提交权",
			"task.taken": "队长接管",
			"task.verdict.pass": "pass",
			"task.verdict.needs_revision": "待修",
			"task.verdict.reject": "拒绝",
			"task.elapsedTitle": "任务总耗时",
			"member.tokensTitle": "累计 token",
			"member.info": "成员详情",
			"member.model": "模型",
			"ticker.aria": "活动时间线",
			"now.title": "正在发生",
			"now.hint": "点击只看 {name} 的动态",
			"stream.filter.all": "全部",
			"stream.filter.task": "任务",
			"stream.filter.msg": "消息",
			"stream.filter.member": "只看 {name}",
			"stream.msgUnread": "{count} 未读",
			"stream.count": "{shown}/{total} 条",
			"stream.older": "载入更早",
			"stream.empty": "还没有动态：任务派发、进度上报与来信都会按时间出现在这里",
			"stream.from": "来信",
			"wm.title": "任务水位",
			"wm.hint": "{status} · 点击在时间流中定位",
			"card.readonly": "历史快照 · 只读",
			"pop.latest": "最新进度",
			"pop.assignee": "执行人",
			"pop.deps": "依赖",
			"pop.elapsed": "耗时",
			"op.task-dispatched": "派发",
			"op.task-claimed": "认领",
			"op.task-progress": "上报",
			"op.task-updated": "更新",
			"op.task-shadow-takeover": "影子接管",
			"op.dispatch-rolled-back": "派发回滚",
			"op.repair-derived": "派生修复",
			"op.repair-cancelled": "修复取消",
			"op.repair-round-limit": "修复轮次耗尽",
			"op.repair-skip-duplicate": "修复去重",
			"op.stalled-orphan-requeued": "孤儿回收",
			"op.stranded-captain-task-requeued": "搁浅回收",
			"op.stall-parked-notify": "停车停滞提醒",
			"op.stall-running-notify": "运行停滞提醒",
			"inbox.title": "队长收件箱",
			"section.tasks": "任务",
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
			"role.data": "数据",
			"command.panelUnavailable": "没有可响应的 TeamsX 面板 — 请先进入一个会话，再执行 /teamsx",
			"command.hintDismiss": "关闭提示"
		};
		/** English dictionary. */
		const en = {
			"panel.aria": "TeamsX activity panel",
			"panel.title": "TeamsX team activity",
			"panel.empty": "No team activity yet. Say \"use TeamsX to do X\" in a session to assemble a team",
			"panel.pickSession": "Select a session on the left to see its team activity here",
			"panel.refresh": "Refresh",
			"panel.close": "Close panel",
			"panel.live": "Live",
			"panel.archived": "Archive",
			"panel.error": "Failed to load team state: {message}",
			"panel.stale": "Connection lost — showing the last successful data",
			"tab": "TeamsX",
			"sidebar.guideDescription": "Team activity: members, task dependencies, and mailboxes",
			"team.progressLabel": "done",
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
			"plan.needsReview": "Plan awaiting review. Approve to run, or return to chat to revise",
			"plan.approve": "Approve & run",
			"plan.returnToChat": "Return to chat",
			"plan.discard": "Discard plan",
			"plan.discardConfirm": "Discard for sure?",
			"plan.notRunnable": "At least one member and one task are required to run",
			"plan.review": "{review}",
			"editor.open": "Edit plan",
			"editor.members": "Members",
			"editor.tasks": "Tasks",
			"editor.name": "Name",
			"editor.role": "Role",
			"editor.provider": "Provider",
			"editor.model": "Model",
			"editor.subject": "Subject",
			"editor.assignee": "Assignee",
			"editor.deps": "Dependencies",
			"editor.depsHint": "Comma-separated task ids",
			"editor.addTask": "+ Add task",
			"editor.remove": "Remove",
			"editor.restore": "Restore",
			"editor.save": "Save changes",
			"editor.cancel": "Discard changes",
			"editor.saving": "Saving…",
			"editor.subjectRequired": "New and edited tasks need a non-empty subject",
			"card.phase.deleted": "Archived",
			"card.more": "{count} more tasks",
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
			"task.decomposing": "The captain is breaking the goal into tasks",
			"task.depsNote": "deps {deps}",
			"task.cancelledDep": "A dependency was cancelled: possibly blocked for good",
			"task.roundTitle": "Repair round {round}",
			"task.sourceTitle": "Repairing {taskId}",
			"task.takenTitle": "Captain shadow takeover: the member keeps commit rights",
			"task.taken": "Captain takeover",
			"task.verdict.pass": "pass",
			"task.verdict.needs_revision": "revise",
			"task.verdict.reject": "reject",
			"task.elapsedTitle": "Total task time",
			"member.tokensTitle": "Cumulative tokens",
			"member.info": "Member details",
			"member.model": "Model",
			"ticker.aria": "Activity timeline",
			"now.title": "Happening now",
			"now.hint": "Click to follow {name} only",
			"stream.filter.all": "All",
			"stream.filter.task": "Tasks",
			"stream.filter.msg": "Messages",
			"stream.filter.member": "Following {name}",
			"stream.msgUnread": "{count} unread",
			"stream.count": "{shown}/{total}",
			"stream.older": "Load earlier",
			"stream.empty": "Nothing yet — dispatches, progress notes, and mail land here in order",
			"stream.from": "wrote",
			"wm.title": "Task meter",
			"wm.hint": "{status} · click to locate in the stream",
			"card.readonly": "Archived snapshot · read-only",
			"pop.latest": "Latest progress",
			"pop.assignee": "Assignee",
			"pop.deps": "Dependencies",
			"pop.elapsed": "Elapsed",
			"op.task-dispatched": "dispatch",
			"op.task-claimed": "claim",
			"op.task-progress": "progress",
			"op.task-updated": "update",
			"op.task-shadow-takeover": "shadow takeover",
			"op.dispatch-rolled-back": "dispatch rolled back",
			"op.repair-derived": "repair derived",
			"op.repair-cancelled": "repair cancelled",
			"op.repair-round-limit": "repair rounds exhausted",
			"op.repair-skip-duplicate": "repair deduped",
			"op.stalled-orphan-requeued": "orphan requeued",
			"op.stranded-captain-task-requeued": "stranded task requeued",
			"op.stall-parked-notify": "parked-stall notice",
			"op.stall-running-notify": "running-stall notice",
			"inbox.title": "Captain inbox",
			"section.tasks": "Tasks",
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
			"role.data": "Data",
			"command.panelUnavailable": "No TeamsX panel is available to respond — enter a session first, then run /teamsx",
			"command.hintDismiss": "Dismiss hint"
		};
		//#endregion
		//#region lib/client/panel-hosts.js
		/**
		* The 0.1.5-only hosts for the shared TeamsX activity body.
		*
		* The right Sidebar tab is the extra way into the same content the
		* session-header badge opens as a dropdown — and on a phone the right Sidebar
		* is the full-width drawer, so this is the mobile-reachable one.
		*
		* (2026-09-12) The sidebar panel-icon row entry and its main-column panel are
		* GONE by product decision: the desktop left sidebar must not offer a TeamsX
		* button (its panel duplicated the badge dropdown and the right-Sidebar tab).
		* Only the right-Sidebar tab registration remains here.
		*
		* OPTIONAL BY CONTRACT. `ctx.sidebarRightTabs` and the keyed `main` dispatch
		* ship on the 0.1.5-rc.1 line only, so every registration here rides a
		* DEFERRED inject and is guarded: the plugin's hard injects stay `slots` +
		* `locale`, and on a host without these seats nothing is registered, the
		* callback never fires, and the shipped badge keeps working.
		* A foreign registry (a throwing `register`, a taken id) costs the extra host,
		* never the browser.
		* @module dsh-teams-x/client/panel-hosts
		*/
		/**
		* On a phone the badge's bottom sheet can stack right on top of this pane —
		* the same team card twice on a 390px screen reads as broken. While the sheet
		* is open on a narrow viewport, this pane steps aside.
		*/
		function useSheetOccluded() {
			const [occluded, setOccluded] = (0, react.useState)(() => isSheetOpen() && window.matchMedia("(max-width: 768px)").matches);
			(0, react.useEffect)(() => {
				const mq = window.matchMedia("(max-width: 768px)");
				const sync = () => {
					setOccluded(isSheetOpen() && mq.matches);
				};
				sync();
				const unsubscribe = onSheetOpen(sync);
				mq.addEventListener("change", sync);
				return () => {
					unsubscribe();
					mq.removeEventListener("change", sync);
				};
			}, []);
			return occluded;
		}
		/**
		* Tab type id, its body/title seat key, and the tab's `kind`. One value, so
		* the registry, the seats and the open-tab dispatch all address this tab.
		*/
		const HOST_ID = "teams-x";
		/** Tab kind `openTab` names; namespaced because another plugin may own `teams`. */
		const HOST_KIND = "teams-x";
		/** Guide capsule order: after the shipped entries (Files is 10). */
		const GUIDE_ORDER = 30;
		function TabBody({ sessionId, t, openMember }) {
			return (0, react_jsx_runtime.jsx)("div", {
				className: `${ActivityPanel_module_css_default.panel} ${ActivityPanel_module_css_default.panelTab}`,
				children: (0, react_jsx_runtime.jsx)(TeamsXPanelBody, {
					sessionId,
					t,
					openMember
				})
			});
		}
		/** The right Sidebar tab: the shared body in the panel's own scrolling column. */
		function TeamsXTabBody(props) {
			if (useSheetOccluded()) return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, {});
			return (0, react_jsx_runtime.jsx)(TabBody, { ...props });
		}
		/**
		* The tab chip's title seat. It reads the plugin's own bound translate rather
		* than the tab-information hook: a foreign or not-yet-committed tab record can
		* throw there, and the chip still has to draw.
		* @param t - the plugin-namespace translate.
		* @returns the chip's title component.
		*/
		function makeTabTitle(t) {
			return function TeamsXTabTitle() {
				return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(TeamsXLogo, {
					size: 16,
					className: ActivityPanel_module_css_default.tabTitleIcon,
					decorative: true
				}), (0, react_jsx_runtime.jsx)("span", {
					className: ActivityPanel_module_css_default.tabTitleLabel,
					children: t("tab")
				})] });
			};
		}
		/**
		* Register the right Sidebar tab type, its body and its chip title when the
		* host serves the sidebar tab registry. Contributes the guide capsule too, so
		* the sidebar's own guide page offers TeamsX — the product's path, the same one
		* the shipped Files type takes.
		* @param ctx - client root context carrying `slots`.
		* @param openMember - member-transcript navigation.
		* @param t - the plugin-namespace translate for labels and copy.
		*/
		function registerSidebarTab(ctx, openMember, t) {
			ctx.inject(["sidebarRightTabs"], (injected) => {
				const disposers = [];
				const own = (result) => {
					if (typeof result === "function") disposers.push(result);
				};
				try {
					const tabs = injected.sidebarRightTabs;
					if (tabs === void 0 || typeof tabs.register !== "function") return;
					own(tabs.register({
						id: HOST_ID,
						kind: HOST_KIND,
						title: () => t("tab"),
						guide: [{
							order: GUIDE_ORDER,
							title: () => t("tab"),
							description: () => t("sidebar.guideDescription"),
							icon: TeamsXLogo
						}]
					}));
					own(injected.slots.inject("sidebar.right.pane.tab", () => injected.slots.register({
						name: "sidebar.right.pane.tab",
						key: HOST_ID,
						locale: TEAMSX_LOCALE_NAMESPACE,
						inject: () => ({ openMember })
					}, TeamsXTabBody)));
					own(injected.slots.inject("sidebar.right.pane.tab.title", () => injected.slots.register({
						name: "sidebar.right.pane.tab.title",
						key: HOST_ID
					}, makeTabTitle(t))));
				} catch (error) {
					for (const dispose of disposers) dispose();
					console.warn("teams-x: right Sidebar tab unavailable on this host", error);
					return;
				}
				return () => {
					for (const dispose of disposers) dispose();
				};
			});
		}
		/**
		* Contribute every 0.1.5-only host. Called from `apply` after the badge is
		* mounted, so a host that serves none of these seats still has the panel.
		*
		* The labels of a seat registered outside React are read through the plugin's
		* own bound translate, so a locale service without `bind` (an older or minimal
		* host) costs the extra hosts and nothing else.
		* @param ctx - client root context.
		* @param openMember - member-transcript navigation.
		*/
		function registerPanelHosts(ctx, openMember) {
			const locale = ctx.locale;
			if (typeof locale.bind !== "function") {
				console.warn("teams-x: locale.bind unavailable; the right Sidebar tab is disabled");
				return;
			}
			registerSidebarTab(ctx, openMember, locale.bind(TEAMSX_LOCALE_NAMESPACE));
		}
		//#endregion
		//#region \0teamsx-css:/tmp/opencode/teamsx-build/src/client/hint-host.module.css.mjs
		const css$1 = ".DdvVIG_hint{z-index:10000;max-width:480px;color:var(--dsw-alias-label-primary,#f9fafb);background:var(--dsw-alias-bg-base,#1e293b);border-radius:8px;align-items:center;gap:12px;padding:10px 16px;font-size:13px;line-height:1.5;animation:.2s ease-out DdvVIG_teamsx-hint-fade-in;display:flex;position:fixed;bottom:24px;left:50%;transform:translate(-50%);box-shadow:0 4px 12px #0000004d}.DdvVIG_message{flex:1;min-width:0}.DdvVIG_close{cursor:pointer;width:24px;height:24px;color:var(--dsw-alias-label-secondary,#94a3b8);background:0 0;border:none;border-radius:4px;flex-shrink:0;justify-content:center;align-items:center;font-size:16px;line-height:1;display:inline-flex}.DdvVIG_close:hover{color:var(--dsw-alias-label-primary,#f9fafb);background:var(--dsw-alias-interactive-bg-hover,#ffffff14)}@keyframes DdvVIG_teamsx-hint-fade-in{0%{opacity:0;transform:translate(-50%)translateY(8px)}to{opacity:1;transform:translate(-50%)translateY(0)}}";
		const tagId$1 = "dsh-teams-x/hint-host.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId$1) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-teams-x";
			tag.dataset.pluginCss = tagId$1;
			tag.textContent = css$1;
			document.head.appendChild(tag);
		}
		var hint_host_module_css_default = {
			"close": "DdvVIG_close",
			"hint": "DdvVIG_hint",
			"message": "DdvVIG_message",
			"teamsx-hint-fade-in": "DdvVIG_teamsx-hint-fade-in"
		};
		//#endregion
		//#region lib/client/hint-host.js
		/**
		* Global hint host for the `/teamsx` empty-state fallback.
		*
		* Mounted via the `sidebar.footer.action` slot (root scope, always present),
		* this component subscribes to the open-request unclaimed channel. When
		* `/teamsx` is invoked but no ActivityPanel is mounted to claim it (e.g. the
		* host home screen), a fixed-position overlay appears with a guidance message
		* and auto-dismisses after 6 seconds. Repeated triggers reset the timer
		* (renewal, not stacking).
		* @module dsh-teams-x/client/hint-host
		*/
		const AUTO_DISMISS_MS = 6e3;
		function TeamsXHintHost(props) {
			const { t } = props;
			const [visible, setVisible] = (0, react.useState)(false);
			const timerRef = (0, react.useRef)(void 0);
			(0, react.useEffect)(() => {
				const unsubscribe = onTeamsXPanelUnclaimed((_sessionId) => {
					setVisible(true);
					if (timerRef.current !== void 0) clearTimeout(timerRef.current);
					timerRef.current = setTimeout(() => {
						setVisible(false);
						timerRef.current = void 0;
					}, AUTO_DISMISS_MS);
				});
				return () => {
					unsubscribe();
					if (timerRef.current !== void 0) clearTimeout(timerRef.current);
				};
			}, []);
			if (!visible || typeof document === "undefined") return null;
			return (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
				className: hint_host_module_css_default.hint,
				role: "status",
				"aria-live": "polite",
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: hint_host_module_css_default.message,
					children: t("command.panelUnavailable")
				}), (0, react_jsx_runtime.jsx)("button", {
					className: hint_host_module_css_default.close,
					"aria-label": t("command.hintDismiss"),
					title: t("command.hintDismiss"),
					onClick: () => {
						setVisible(false);
						if (timerRef.current !== void 0) {
							clearTimeout(timerRef.current);
							timerRef.current = void 0;
						}
					},
					children: "×"
				})]
			}), document.body);
		}
		//#endregion
		//#region lib/client/card-state.js
		/**
		* Pure fold logic for the TeamsX conversation card.
		*
		* Zero imports — no React, no host packages, no CSS — so the host test
		* suite can exercise the exact same state machine the browser bundle runs
		* (full-functional-test.mjs imports the compiled output directly).
		* @module dsh-teams-x/client/card-state
		*/
		/** Every session event type the card folds. */
		const TEAMSX_CARD_EVENT_TYPES = [
			"teamsx/team-created",
			"teamsx/team-approved",
			"teamsx/team-halted",
			"teamsx/team-resumed",
			"teamsx/team-deleted",
			"teamsx/plan-discarded",
			"teamsx/member-added",
			"teamsx/member-removed",
			"teamsx/task-created",
			"teamsx/task-updated",
			"teamsx/message-sent"
		];
		/** Read a string field off an unknown event payload. */
		function stringField(data, key) {
			if (typeof data !== "object" || data === null) return "";
			const value = data[key];
			return typeof value === "string" ? value : "";
		}
		/**
		* Resolve the assembler match for one session event: only `team-created`
		* starts a card; every other TeamsX event updates the team it names.
		* Returns null for foreign events and malformed payloads.
		*/
		function teamsXCardMatchRole(eventType, data) {
			if (!TEAMSX_CARD_EVENT_TYPES.includes(eventType)) return null;
			const teamId = stringField(data, "teamId");
			if (teamId === "") return null;
			return {
				id: teamId,
				role: eventType === "teamsx/team-created" ? "start" : "update"
			};
		}
		/** Initial card state from the `team-created` payload. */
		function teamsXCardStart(data) {
			const phase = stringField(data, "phase");
			return {
				name: stringField(data, "name"),
				captainSessionId: stringField(data, "captainSessionId"),
				phase: phase === "running" ? "running" : "staged",
				halted: false,
				members: [],
				tasks: []
			};
		}
		/**
		* Fold one update event into the card state. Never returns undefined —
		* the conversation assembler fails loud on `update() -> undefined`.
		*/
		function teamsXCardUpdate(state, eventType, data) {
			switch (eventType) {
				case "teamsx/team-approved": return {
					...state,
					phase: "running"
				};
				case "teamsx/team-halted": return {
					...state,
					halted: true
				};
				case "teamsx/team-resumed": return {
					...state,
					halted: false
				};
				case "teamsx/team-deleted":
				case "teamsx/plan-discarded": return {
					...state,
					phase: "deleted"
				};
				case "teamsx/member-added": {
					const name = stringField(data, "name");
					if (name === "") return state;
					const childId = stringField(data, "memberId");
					const role = stringField(data, "role") !== "" ? stringField(data, "role") : void 0;
					const member = {
						name,
						status: "active",
						...childId !== "" ? { childId } : {},
						...role !== void 0 ? { role } : {}
					};
					return {
						...state,
						members: [...state.members.filter((item) => item.name !== name), member]
					};
				}
				case "teamsx/member-removed": {
					const memberId = stringField(data, "memberId");
					const name = stringField(data, "name");
					return {
						...state,
						members: state.members.map((member) => member.name === name || memberId !== "" && member.childId === memberId ? {
							...member,
							status: "removed"
						} : member)
					};
				}
				case "teamsx/task-created": {
					const taskId = stringField(data, "taskId");
					if (taskId === "") return state;
					const assignee = stringField(data, "assignee");
					const task = {
						id: taskId,
						subject: stringField(data, "subject"),
						status: "pending",
						...assignee !== "" ? { assignee } : {}
					};
					return {
						...state,
						tasks: [...state.tasks.filter((item) => item.id !== taskId), task]
					};
				}
				case "teamsx/task-updated": {
					const taskId = stringField(data, "taskId");
					const status = stringField(data, "status");
					const assignee = stringField(data, "assignee");
					const round = typeof data?.round === "number" ? data.round : void 0;
					const takenOverBy = stringField(data, "takenOverBy") === "captain" ? "captain" : void 0;
					return {
						...state,
						tasks: state.tasks.map((task) => task.id === taskId ? {
							...task,
							...status !== "" ? { status } : {},
							...assignee !== "" ? { assignee } : {},
							...round !== void 0 ? { round } : {},
							...data !== null && typeof data === "object" && "takenOverBy" in data ? { takenOverBy } : {}
						} : task)
					};
				}
				default: return state;
			}
		}
		//#endregion
		//#region lib/client/card-definition.js
		/**
		* The assembler-facing definition. `update()` always returns a state object
		* (the assembler fails loud on undefined), and `buildViewNode` returns null
		* only when the window does not contain the creating event.
		*/
		const teamsXCardDefinition = {
			kind: "teamsx",
			target: "chat",
			match: (event) => {
				if (!TEAMSX_CARD_EVENT_TYPES.includes(event.type)) return null;
				return teamsXCardMatchRole(event.type, event.data);
			},
			start: (_context, match) => {
				if (match.event.type !== "teamsx/team-created") throw new Error("teamsx card start requires teamsx/team-created");
				return teamsXCardStart(match.event.data);
			},
			update: (context, match) => teamsXCardUpdate(context.state, match.event.type, match.event.data),
			buildViewNode: (context) => {
				if (context.start === void 0) return null;
				return {
					key: context.key,
					kind: "teamsx-card",
					id: context.id,
					target: "chat",
					anchorSeq: context.start.event.seq,
					location: context.start.location,
					visibility: "visible",
					data: context.state
				};
			}
		};
		//#endregion
		//#region \0teamsx-css:/tmp/opencode/teamsx-build/src/client/TeamsXCard.module.css.mjs
		const css = ".g8HmkW_card{border:.5px solid var(--dsw-alias-border-l3,#3c3c3d);background:var(--dsw-alias-bg-base);border-radius:10px;flex-direction:column;gap:6px;max-width:560px;padding:8px 10px;display:flex}.g8HmkW_cardHeader{flex-wrap:wrap;align-items:center;gap:6px;display:flex}.g8HmkW_cardName{color:var(--dsw-alias-label-primary,#f9fafb);text-overflow:ellipsis;white-space:nowrap;max-width:200px;font-size:12px;font-weight:600;overflow:hidden}.g8HmkW_cardBadge{border:1px solid var(--dsw-alias-border-l2,#3c3c3d);color:var(--dsw-alias-label-secondary,#9ba0aa);border-radius:999px;padding:1px 8px;font-size:10px}.g8HmkW_cardBadge[data-phase=running]{color:var(--dsw-alias-state-business-primary,#679efe);border-color:var(--dsw-alias-state-business-primary,#679efe)}.g8HmkW_cardBadge[data-phase=deleted]{text-decoration:line-through}.g8HmkW_cardHalted{color:var(--dsw-alias-state-warning-primary,#f5a623);border:1px solid var(--dsw-alias-state-warning-primary,#f5a623);border-radius:999px;padding:1px 8px;font-size:10px}.g8HmkW_cardCounts{color:var(--dsw-alias-label-secondary,#9ba0aa);font-variant-numeric:tabular-nums;margin-left:auto;font-size:11px}.g8HmkW_cardRoster{flex-direction:column;gap:2px;display:flex}.g8HmkW_cardMember{color:var(--dsw-alias-label-primary,#f9fafb);text-align:left;background:0 0;border:none;border-radius:5px;align-items:center;gap:6px;min-width:0;padding:2px 4px;font-size:12px;display:flex}button.g8HmkW_cardMember{cursor:pointer}button.g8HmkW_cardMember:hover{background:var(--dsw-alias-interactive-bg-hover,#ffffff14)}.g8HmkW_cardMember[data-status=removed]{opacity:.5}.g8HmkW_cardDot{background:var(--dsw-alias-state-business-primary,#679efe);border-radius:999px;flex:none;width:7px;height:7px}.g8HmkW_cardDot[data-state=removed]{background:var(--dsw-alias-label-tertiary,#6b7280)}.g8HmkW_cardMemberName{text-overflow:ellipsis;white-space:nowrap;overflow:hidden}.g8HmkW_cardMemberRole{color:var(--dsw-alias-label-secondary,#9ba0aa);font-size:10px}.g8HmkW_cardMemberState{color:var(--dsw-alias-label-tertiary,#6b7280);font-size:10px}.g8HmkW_cardTasks{border-top:.5px solid var(--dsw-alias-border-l3,#3c3c3d);flex-direction:column;gap:2px;padding-top:4px;display:flex}.g8HmkW_cardTask{align-items:center;gap:6px;min-width:0;font-size:12px;display:flex}.g8HmkW_cardTask[data-status=completed] .g8HmkW_cardTaskSubject{color:var(--dsw-alias-label-secondary,#9ba0aa);text-decoration:line-through}.g8HmkW_cardTask[data-status=failed] .g8HmkW_cardTaskStatus{color:var(--dsw-alias-state-error-primary,#f25a5a)}.g8HmkW_cardTaskId{font-variant-numeric:tabular-nums;color:var(--dsw-alias-label-tertiary,#6b7280);flex:none;min-width:22px;font-size:10px}.g8HmkW_cardTaskSubject{text-overflow:ellipsis;white-space:nowrap;min-width:0;overflow:hidden}.g8HmkW_cardTaskStatus{color:var(--dsw-alias-label-secondary,#9ba0aa);flex:none;margin-left:auto;font-size:10px}.g8HmkW_cardMore{color:var(--dsw-alias-label-tertiary,#6b7280);padding-left:28px;font-size:11px}";
		const tagId = "dsh-teams-x/TeamsXCard.module.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-teams-x";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var TeamsXCard_module_css_default = {
			"card": "g8HmkW_card",
			"cardBadge": "g8HmkW_cardBadge",
			"cardCounts": "g8HmkW_cardCounts",
			"cardDot": "g8HmkW_cardDot",
			"cardHalted": "g8HmkW_cardHalted",
			"cardHeader": "g8HmkW_cardHeader",
			"cardMember": "g8HmkW_cardMember",
			"cardMemberName": "g8HmkW_cardMemberName",
			"cardMemberRole": "g8HmkW_cardMemberRole",
			"cardMemberState": "g8HmkW_cardMemberState",
			"cardMore": "g8HmkW_cardMore",
			"cardName": "g8HmkW_cardName",
			"cardRoster": "g8HmkW_cardRoster",
			"cardTask": "g8HmkW_cardTask",
			"cardTaskId": "g8HmkW_cardTaskId",
			"cardTaskStatus": "g8HmkW_cardTaskStatus",
			"cardTaskSubject": "g8HmkW_cardTaskSubject",
			"cardTasks": "g8HmkW_cardTasks"
		};
		//#endregion
		//#region lib/client/TeamsXCardPanel.js
		/** Task rows rendered before the "+N more" digest line. */
		const MAX_TASK_ROWS = 8;
		function phaseKey(phase) {
			return phase === "running" ? "team.phase.running" : phase === "deleted" ? "card.phase.deleted" : "team.phase.staged";
		}
		function CardMemberRow({ member, captainSessionId, openMember, t }) {
			const openable = member.status === "active" && member.childId !== void 0;
			const content = (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)("span", {
					className: TeamsXCard_module_css_default.cardDot,
					"data-state": member.status,
					"aria-hidden": true
				}),
				(0, react_jsx_runtime.jsx)("span", {
					className: TeamsXCard_module_css_default.cardMemberName,
					children: member.name
				}),
				member.role !== void 0 && (0, react_jsx_runtime.jsx)("span", {
					className: TeamsXCard_module_css_default.cardMemberRole,
					children: member.role
				}),
				member.status === "removed" && (0, react_jsx_runtime.jsx)("span", {
					className: TeamsXCard_module_css_default.cardMemberState,
					children: t("member.state.removed")
				})
			] });
			if (!openable || member.childId === void 0) return (0, react_jsx_runtime.jsx)("span", {
				className: TeamsXCard_module_css_default.cardMember,
				"data-status": member.status,
				children: content
			});
			const childId = member.childId;
			return (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: TeamsXCard_module_css_default.cardMember,
				"data-status": member.status,
				onClick: () => {
					openMember(captainSessionId, childId);
				},
				title: t("member.openSession"),
				children: content
			});
		}
		/** The team card body. Renders nothing for an unnamed state. */
		function TeamsXCardPanel({ node, t, openMember }) {
			const data = node.data;
			if (typeof data?.name !== "string" || data.name === "") return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, {});
			const done = data.tasks.filter((task) => task.status === "completed").length;
			const visible = data.tasks.slice(0, MAX_TASK_ROWS);
			const hidden = data.tasks.length - visible.length;
			const activeMembers = data.members.filter((member) => member.status === "active").length;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TeamsXCard_module_css_default.card,
				"data-phase": data.phase,
				"data-halted": data.halted === true || void 0,
				children: [
					(0, react_jsx_runtime.jsxs)("header", {
						className: TeamsXCard_module_css_default.cardHeader,
						children: [
							(0, react_jsx_runtime.jsx)(TeamsXLogo, {
								size: 16,
								decorative: true
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TeamsXCard_module_css_default.cardName,
								title: data.name,
								children: data.name
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: TeamsXCard_module_css_default.cardBadge,
								"data-phase": data.phase,
								children: t(phaseKey(data.phase))
							}),
							data.halted === true && (0, react_jsx_runtime.jsx)("span", {
								className: TeamsXCard_module_css_default.cardHalted,
								children: t("team.halted")
							}),
							(0, react_jsx_runtime.jsxs)("span", {
								className: TeamsXCard_module_css_default.cardCounts,
								children: [
									t("editor.members"),
									" ",
									activeMembers,
									" · ",
									t("team.done", {
										done,
										total: data.tasks.length
									})
								]
							})
						]
					}),
					data.members.length > 0 && (0, react_jsx_runtime.jsx)("div", {
						className: TeamsXCard_module_css_default.cardRoster,
						children: data.members.map((member) => (0, react_jsx_runtime.jsx)(CardMemberRow, {
							member,
							captainSessionId: data.captainSessionId,
							openMember,
							t
						}, member.name))
					}),
					visible.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: TeamsXCard_module_css_default.cardTasks,
						children: [visible.map((task) => (0, react_jsx_runtime.jsxs)("div", {
							className: TeamsXCard_module_css_default.cardTask,
							"data-status": task.status,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: TeamsXCard_module_css_default.cardTaskId,
									children: task.id
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: TeamsXCard_module_css_default.cardTaskSubject,
									title: task.subject,
									children: task.subject
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: TeamsXCard_module_css_default.cardTaskStatus,
									children: t(`task.status.${task.status}`)
								})
							]
						}, task.id)), hidden > 0 && (0, react_jsx_runtime.jsx)("span", {
							className: TeamsXCard_module_css_default.cardMore,
							children: t("card.more", { count: hidden })
						})]
					})
				]
			});
		}
		//#endregion
		//#region lib/client/index.js
		/** Required services: slots (mount point), locale (dictionaries), sessions (member transcript navigation), uiConversation (card registration). */
		const inject = [
			"slots",
			"locale",
			"sessions",
			"uiConversation"
		];
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(TEAMSX_LOCALE_NAMESPACE, {
				zh,
				en
			}), "teams-x: dictionaries");
			const sessions = ctx.sessions;
			provideSessions(sessions);
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
			registerConversationCard(ctx, openMember);
			registerTeamsXCommand(ctx);
			registerPanelHintHost(ctx);
			registerPanelHosts(ctx, openMember);
		}
		/**
		* Fold `teamsx/*` events into in-chat cards. Feature-detected: a host
		* without the conversation registries (or a contract drift) only loses the
		* card — the header badge and panel keep working.
		*/
		function registerConversationCard(ctx, openMember) {
			try {
				const events = ctx.uiConversation?.events;
				if (typeof events?.register !== "function") {
					console.warn("teams-x: conversation events registry unavailable; in-chat team cards disabled");
					return;
				}
				events.register(teamsXCardDefinition);
			} catch (error) {
				console.warn("teams-x: failed to register team cards; keeping the header panel only", error);
				return;
			}
			try {
				ctx.slots.inject("conversation.chat.node", () => ctx.slots.register({
					name: "conversation.chat.node",
					key: "teamsx-card",
					locale: TEAMSX_LOCALE_NAMESPACE,
					inject: () => ({ openMember })
				}, TeamsXCardPanel));
			} catch (error) {
				console.warn("teams-x: failed to register the team card renderer", error);
			}
		}
		/**
		* Contribute the `/teamsx` slash command (popupSelect) that expands the
		* session's TeamsX panel. The commandUi service is requested through a
		* nested inject so a host without it cannot break the main apply path.
		*/
		function registerTeamsXCommand(ctx) {
			try {
				ctx.inject(["commandUi"], (scope) => {
					try {
						const command = scope.get("commandUi");
						ctx.effect(() => command.register({
							name: "teamsx",
							description: () => "Open the TeamsX team panel",
							available: (session) => {
								const sessions = ctx.sessions;
								if (typeof sessions.subagentAddress !== "function") return true;
								return sessions.subagentAddress(session.sessionId) === void 0;
							},
							ui: {
								kind: "popupSelect",
								options: async () => [{
									id: "open",
									label: "TeamsX"
								}],
								onSelect: async (_option, session) => {
									requestTeamsXPanel(session.sessionId);
								}
							}
						}), "teams-x: /teamsx command");
					} catch (error) {
						console.warn("teams-x: commandUi unavailable; the /teamsx command is disabled", error);
					}
				});
			} catch (error) {
				console.warn("teams-x: commandUi service missing; the /teamsx command is disabled", error);
			}
		}
		/**
		* Mount the global hint host into the sidebar footer slot. Shown when
		* `/teamsx` is invoked but no panel is mounted (e.g. home screen). Feature-
		* detected: a host without the sidebar slot silently skips the hint.
		*/
		function registerPanelHintHost(ctx) {
			try {
				ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
					name: "sidebar.footer.action",
					id: "teams-x-hint-host",
					locale: TEAMSX_LOCALE_NAMESPACE
				}, (props) => (0, react_jsx_runtime.jsx)(TeamsXHintHost, { ...props })));
			} catch (error) {
				console.warn("teams-x: sidebar.footer.action slot unavailable; the /teamsx empty-state hint is disabled", error);
			}
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map