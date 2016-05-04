var cantDeleteItem = ["component", "font", "compiled clip", "screen", "video"];
checkDom();

function checkDom() {
	fl.outputPanel.clear();
	useItem = [];
	sceneItem = {};
	checkTimeline(fl.getDocumentDOM().timelines[0]);
	checkLibrary();
	fl.trace(useItem.length+" library item used");//(in scene item / have linkage item / have item folder / in frame sound / font)
	checkUnusedItem();
	var sceneItemCount = 0;
	for each (var i in sceneItem) {
		sceneItemCount += i;
	}
	fl.trace("");
	fl.trace(sceneItemCount + " used");
	for (var i in sceneItem) {
		fl.trace("	" + sceneItem[i] + " " + i);
	}
}

function checkUnusedItem() {
	var library = fl.getDocumentDOM().library;
	var items = library.items;
	var useItemStr = ","+useItem.toString();
	library.selectNone();
	var n = 0;
	var unusedItem = {};
	for each(var item in items) {
		if (cantDeleteItem.indexOf(item.itemType) == -1) {
			if ((item.itemType == "folder" && useItemStr.indexOf(","+item.name+"/") == -1) ||
				(item.itemType != "folder" && useItem.indexOf(item.name) == -1)) {
				library.selectItem(item.name, false, true);
				n++;
				if (!unusedItem[item.itemType]) unusedItem[item.itemType] = 0;
				unusedItem[item.itemType]++;
			}
		}
		else {
			//fl.trace("A "+item.itemType+" break;");
		}
	}
	fl.trace("");
	fl.trace(n+" unused item select");
	for (var i in unusedItem) {
		fl.trace("	" + unusedItem[i] + " " + i);
	}
}

function checkTimeline(timeline) {
	for each(var layer in timeline.layers) {
		for each(var frame in layer.frames) {
			for each(var element in frame.elements) {
				checkSceneItem(element);
			}
			if (frame.soundLibraryItem) {
				if (!sceneItem["sound"]) sceneItem["sound"] = 0;
				sceneItem["sound"] ++;
				if (useItem.indexOf(frame.soundLibraryItem.name) == -1) {
					useItem.push(frame.soundLibraryItem.name);
				}
			}
		}
	}
}

function checkSceneItem(element) {
	var type = element.isGroup ? "group" : element.elementType;
	if (!sceneItem[type]) sceneItem[type] = 0;
	sceneItem[type] ++;
	if (element.elementType == "instance") {
		checkInstance(element.libraryItem);
	}
	else if (element.elementType == "shape") {
		for each (var contour in element.contours) {
			if (contour.fill.style == "bitmap") {
				if (useItem.indexOf(contour.fill.bitmapPath) == -1) {
					useItem.push(contour.fill.bitmapPath);
					//fl.trace(contour.fill.bitmapPath);
				}
			}
		}
		if (element.isGroup) {
			for each(var member in element.members) {
				checkSceneItem(member);
			}
		}
	}
}

function checkLibrary() {
	for each(var item in fl.getDocumentDOM().library.items) {
		if (item.itemType == "font") {
			if (useItem.indexOf(item.name) == -1) {
				useItem.push(item.name);
			}
		}
		if (item.linkageBaseClass || item.linkageClassName) {
			checkInstance(item);
		}
	}
}

function checkInstance(item) {
	if (useItem.indexOf(item.name) == -1) {
		useItem.push(item.name);
		if (item.timeline) {
			checkTimeline(item.timeline);
		}
	}
}