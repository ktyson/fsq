var currentFolder;

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
					
					currentFolder = folderObj;
					listFiles(currentFolder);					
					
				}
			});
		}else{
			alert("enter folder");
		}
		
	
	});
	
	$(".fsqFile").live("click", function(){
	
		var idx = $(this).attr("id").substring(5);
		var f = currentFolder.files[idx];
		
		if(f.isDirectory){
			var isNow = $("#lookat").val();	
			var slash = (isNow == '/' ? '' : '/');
			$("#lookat").val(isNow + slash + f.name);
		}
	
	});
});

function listFiles(fol){

	var c = [];
	c.push("<div>" + fol.folder + " (" + fol.numFiles + ")</div");
	
	c.push("<ul>");
	
	$.each(fol.files, function(idx, file){
	
		var gl = "[?]";
		if(file.isFile) gl = "[F]";
		if(file.isDirectory) gl = "[D]";
		
		c.push("<li class='fsqFile' id='f_id_" + idx + "'>" + gl + " " + file.name + "</li>");
	
	});
	
	
	
	c.push("</ul>");
	
	
	
	
	$("#results").html(c.join(''));


}

function createStructure(){

	var c = [];
	
	c.push('<h3>fsq File System Viewer (Beta)</h3>');
	c.push('<div><input id="lookat" value="/" size="160"></input><br/>');
	c.push('<input id="go" value = "Go" type="button"></input></div>');
	c.push('<div id="results"></div>');
	
	$('body').append(c.join(''));

}