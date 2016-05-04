var withIn = 600000;
var link = FLfile.read(fl.configURI+"Commands/flash-command/Project_URI.txt");
fl.showIdleMessage(false);

var time = new Date();
var output = "";
checkFolder (link);
fl.outputPanel.clear();
fl.trace (output+"Finish");

function checkFolder (folder) {
	var flas = FLfile.listFolder(folder+"*.fla", "files");
	for(var i = 0; i < flas.length; i++) {
		var fla = folder+flas[i];
		if (time - FLfile.getModificationDateObj(fla) < withIn) {
			var doc = fl.openDocument(fla);
			var swf = doc.getSWFPathFromProfile();
			fl.closeDocument(doc);
			if (!FLfile.exists(swf) ||
				FLfile.getModificationDateObj(swf) < FLfile.getModificationDateObj(fla)) {
				Publish (fla);
			}
		}
	}
	var flds = FLfile.listFolder(folder, "directories");
	for(var i = 0; i < flds.length; i++){
		checkFolder(folder+flds[i]+"/");
	}
}

function Publish (uri) {
	fl.publishDocument(uri);
	output += "Publish: "+uri+"\n";
	var errorsLink = fl.scriptURI.replace (fl.scriptURI.replace ("file:///", ""). split ("/").pop (), "") + "errors.log";
	fl.compilerErrors.save(errorsLink);
	var errors = FLfile.read(errorsLink).split ("\r\n");
	FLfile.remove (errorsLink);
	output += "         "+errors[errors.length-1]+"\n";
}