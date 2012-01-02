$(document).ready(function(){

	createStructure();

	$("#go").live("click",function(){
		
		var lookatFolder = $("#lookat").val();
		if(lookatFolder.length){
			$.ajax({
				type: "GET",
				url: "setgo",
				data: "folder=" + lookatFolder,
				success: function(folderObj){
					
					listFiles(folderObj);					
					
				}
			});
		}else{
			alert("enter folder");
		}
		
	
	});

});

function listFiles(fol){

	var c = [];
	c.push("<div>" + fol.folder + " (" + fol.numFiles + ")</div");
	
	c.push("<ol>");
	
	$.each(fol.files, function(idx, file){
	
		var gl = "[?]";
		if(file.isFile) gl = "[F]";
		if(file.isDirectory) gl = "[D]";
		c.push("<li>" + gl + " " + file.name + "</li>");
	
	});
	
	
	
	c.push("</ol>");
	
	
	
	
	$("#results").html(c.join(''));


}

function createStructure(){

	var c = [];
	
	c.push('<h3>Test File Viewer</h3>');
	c.push('<div><input id="lookat" size="60"></input><input id="go" value = "Go" type="button"></input></div>');
	c.push('<div id="results"></div>');
	
	$('body').append(c.join(''));

}