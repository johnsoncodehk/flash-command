fl.outputPanel.clear();

var time0 = new Date();
deleteFolder();
var time1 = new Date();
fl.trace(time1 - time0 + " deleteFolder()");
setParent();
var time2 = new Date();
fl.trace(time2 - time1 + " setParent()");
groupType();
var time3 = new Date();
fl.trace(time3 - time2 + " groupType()");
groupAs();
var time4 = new Date();
fl.trace(time4 - time3 + " groupAs()");
group();
var time5 = new Date();
fl.trace(time5 - time4 + " group()");
deleteNoItemFolder();
var time6 = new Date();
fl.trace(time6 - time5 + " deleteNoItemFolder()");
fl.trace((time6 - time0) / 1000 + " s");
fl.trace(((time6 - time0) / fl.getDocumentDOM().library.items.length / 1000) + " s / item");

function deleteFolder() {
	var library = fl.getDocumentDOM().library;
	var items = library.items;
	for each(var item in items) {
		library.moveToFolder("", item.name, false); 
	}
	for each(var item in items) {
		if (item.itemType == "folder") {
			library.deleteItem(item.name);
		}
	}
}
function deleteNoItemFolder() {
	var library = fl.getDocumentDOM().library;
	var items = library.items;
	var itemsStr = "";
	var isDelete = false;
	for each(var item in items) {
		itemsStr += ","+item.name;
	}
	for each(var item in items) {
		if (item.itemType == "folder" && itemsStr.indexOf(","+item.name+"/") == -1) {
			library.deleteItem(item.name);
			isDelete = true;
		}
	}
	if (isDelete) {
		deleteNoItemFolder();
	}
}
function hasProperty(object, property) {
	for (var child in object) {
		if (child == property) {
			return true;
		}
	}
	return false;
}
function setParent() {
	var library = fl.getDocumentDOM().library;
	var items = library.items;
	for each(var item in items) {
		if (hasProperty(item, "timeline") && item.timeline) {
			for each(var layer in item.timeline.layers) {
				for each(var frame in layer.frames) {
					for each(var element in frame.elements) {
						checkSceneItem(element, item);
					}
					if (frame.soundLibraryItem) {
						frame.soundLibraryItem.parent = item;
					}
				}
			}
		}
	}
}
function checkSceneItem(element, item) {
	var library = fl.getDocumentDOM().library;
	var items = library.items;
	if (element.elementType == "instance" && element.libraryItem) {
		element.libraryItem.parent = item;
	}
	else if (element.elementType == "shape") {
		for each (var contour in element.contours) {
			if (contour.fill.style == "bitmap") {
				items[library.findItemIndex(contour.fill.bitmapPath)].parent = item;
			}
		}
		if (element.isGroup) {
			for each(var member in element.members) {
				checkSceneItem(member, item);
			}
		}
	}
}
function groupType() {
	var library = fl.getDocumentDOM().library;
	var items = library.items;
	var tmpFolderName = "tmpFolderxxxxxxxxxasdf";
	library.newFolder(tmpFolderName);
	for each(var item in items) {
		library.moveToFolder(tmpFolderName, item.name, false);
	}
	for each(var item in items) {
		if (!library.itemExists(item.itemType)) {
			library.newFolder(item.itemType);
		}
		library.moveToFolder(item.itemType, item.name, false);
	}
}
function group() {
	var library = fl.getDocumentDOM().library;
	var items = fl.getDocumentDOM().library.items;
	for each(var item in items) {
		if (hasProperty(item, "parent") && item.parent) {
			var sub = "_part";
			var folder = item.parent.name+sub;
			if (!library.itemExists(folder)) {
				library.newFolder(folder);
			}
			library = fl.getDocumentDOM().library;
			var folderChild = item.name+sub;
			if (library.itemExists(folderChild)) {
				library.moveToFolder(folder, folderChild, false); 
			}
			library.moveToFolder(folder, item.name, false); 
		}
	}
}
function groupAs() {
	var library = fl.getDocumentDOM().library;
	var items = library.items;
	var as = [];
	var asb = [];
	for each(var item in items) {
		if (item.linkageBaseClass || item.linkageClassName) {
			var asLinkage = item.linkageBaseClass ? item.linkageBaseClass : item.linkageClassName;
			asLinkage = asLinkage.split("_")[0];
			if (as.indexOf(asLinkage) >= 0) {
				if (asb.indexOf(asLinkage) == -1) {
					asb.push(asLinkage);
				}
			}
			as.push(asLinkage);
		}
	}
	for each(var folder in asb) {
		library.newFolder(folder);
	}
	var groupFolder = "as";
	library.newFolder(groupFolder);
	library.newFolder(groupFolder+"_");
	for each(var item in items) {
		if (item.linkageBaseClass || item.linkageClassName) {
			var asLinkage = item.linkageBaseClass ? item.linkageBaseClass : item.linkageClassName;
			asLinkage = asLinkage.split("_")[0];
			if (library.itemExists(asLinkage)) {
				library.moveToFolder(asLinkage, item.name, false); 
			}
			else {
				library.moveToFolder(groupFolder+"_", item.name, false); 
			}
		}
	}
	for each(var folder in asb) {
		library.moveToFolder(groupFolder, folder, false); 
	}
}