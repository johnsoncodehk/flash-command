for (var i = 0; i < fl.documents.length; i++) {
	fl.setActiveWindow(fl.documents[i]);
	fl.getDocumentDOM().publish();
}