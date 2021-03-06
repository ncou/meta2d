"use strict";

meta.Event = {
	UPDATE: "update",
	RESIZE: "resize",
	WORLD_RESIZE: "world-resize",
	CAMERA_MOVE: "camera-move",
	CAMERA_RESIZE: "camera-resize",
	BLUR: "blur",
	FOCUS: "focus",
	FULLSCREEN: "fullscreen",
	ADAPT: "adapt",
	DEBUG: "debug",
	RENDER_DEBUG: "debug-draw"
};

meta.Priority = {
	LOW: 0,
	MEDIUM: 5000,
	HIGH: 10000
};

meta.Cursor = {
	ALIAS: "alias",
	ALL_SCROLL: "all-scroll",
	CELL: "cell",
	CONTEXT_MENU: "context-menu",
	COL_RESIZE: "col-resize",
	COPY: "copy",
	CROSSHAIR: "crosshair",
	DEFAULT: "default",
	E_RESIZE: "e-resize",
	EW_RESIZE: "ew-resize",
	GRAB: "grab",
	GRABBING: "grabbing",
	HELP: "help",
	MOVE: "move",
	N_RESIZE: "n-resize",
	NE_RESIZE: "ne-resize",
	NESW_RESIZE: "nesw-resize",
	NS_RESIZE: "ns-reisize",
	NW_RESIZE: "nw-resize",
	NWSE_RESIZE: "nwse-resize",
	NO_DROP: "no-drop",
	NONE: "none",
	NOT_ALLOWED: "not-allowed",
	POINTER: "pointer",
	PROGRESS: "progress",
	ROW_RESIZE: "row-resize",
	S_RESIZE: "s-resize",
	SE_RESIZE: "se-resize",
	SW_RESIZE: "sw-resize",
	TEXT: "text",
	VERTICAL_TEXT: "vertical-text",
	W_RESIZE: "w-resize",
	WAIT: "wait",
	ZOOM_IN: "zoom-in",
	ZOOM_OUT: "zoom-out",
	INITIAL: "initial"
};
