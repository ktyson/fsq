var currentFolder;

$(document).ready(function(){

	createStructure();
	
	$("#chop").live("click",function(){
		chopToSlash();
	});

	$("#go").live("click",function(){
		
		
		//before leaving, gather the game
		if($("#viewMode").val()=="Game"){
			gatherGame();
		
		}
		
		$("#results").html('');
		var lookatFolder = $("#lookat").val();
		if(lookatFolder.length){
			$.ajax({
				type: "GET",
				url: "setgo",
				data: "folder=" + lookatFolder,
				success: function(folderObj){
					//console.log(folderObj);
					
					currentFolder = folderObj;
					
					if($("#viewMode").val()=="Text"){					
						setFontSize();
						setOpacity();
						listFiles();					
						$('ol').makeacolumnlists({cols:4,colWidth:0,equalHeight:false,startN:1});
					
					}else if($("#viewMode").val()=="Game"){	
						
						setOpacity();
						setDiameter();
						makeFeatures();
					
					}
				}
			});
		}else{
			alert("enter folder");
		}
		
	
	});
	
	$(".fsqDir").live("click", function(){
	
		var idx = $(this).attr("id").substring(5);
		var f = currentFolder.files[idx];
		
		setLookat(f);
	
	});
});


function setLookat(file){

	if(file.isDirectory){
		var isNow = $("#lookat").val();	
		var slash = (isNow == '/' ? '' : '/');
		$("#lookat").val(isNow + slash + file.name);
	}

}


function makeFeatures(){
	
	var c = [];	

	//create container divs
	$.each(currentFolder.files,function(idx, file){
		c.push("<div id='f_"+idx+"' class='features'>");
		c.push("<span class='sig'>" + currentFolder.name + "</span>");
		c.push("</div>");
		$("#results").append(c.join(''));
	});
	
	var currSide = 100;
	var currLeft = 0;
	var currTop = 130;
	
	//add background and icons
	$.each(currentFolder.files,function(idx, file){
		
		
		//find the div
		var divB = $("#f_"+idx);	
		
		
		//standard sizing and set into grid
		var leftB = currLeft + ((idx % 10) * 100)+"px";
		var topB = currTop + (Math.floor(idx / 10) * 100)+"px";
		var sideB = currSide+"px";
		$(divB).css("width",sideB);
		$(divB).css("height",sideB);
		$(divB).css("top",topB);
		$(divB).css("left",leftB);
		
		//background
		$(divB).css("background","rgba(0, 140, 0, .3)");

		//svg
		var pct = (file.diameter ? file.diameter : 0.1);
		var circum = Math.ceil(currSide * pct/2); //circum based on size
		var fillColor = "red"; //based on ext
		var opacity = 1.0; //based on age
		var rectOffset = Math.ceil(currSide/2) - circum;
		var rectSide = circum*2;
		
		c = [];		
		c.push("<svg xmlns='http://www.w3.org/2000/svg' version='1.1'>");
		
		if(file.isDirectory){
			c.push("<circle cx='50' cy='50' r='" + circum + "' stroke='black'");
			c.push("stroke-width='2' fill='red' opacity='0.9'/>");
		}else{
			c.push('<rect x="'+rectOffset+'" y="'+rectOffset+'" width="'+rectSide+'" height="'+rectSide+'"');
			c.push(' style="fill: blue; stroke: black; stroke-width: 2;"/>');
		
		}
		
		
		c.push("</svg>");		
		$(divB).append(c.join(''));
		
		
		//functionality
		$(divB).draggable({ snap: true, snapTolerance: 100 });		
		$(divB).hover(
			function () {
				$(this).append($("<span class='label'>" + file.name + "</span>"));
			}, 
			function () {
				$(this).find("span:last").remove();
			}
		);
		$(divB).click(function(){
		
			var idx = $(this).attr("id").substring(2);
			var f = currentFolder.files[idx];
			setLookat(f);
			
		});


	});		

	

}



function gatherGame(){

if(currentFolder){
	//only look at the game piece divs
	var baseSig = {};
	baseSig.sig = currentFolder.folder;
	
	var sigs=[];
	alert($(".features").length);
	$.each($(".features"),function(idx, file){
		var sig={};
		sig.sig=$(file).find(".sig").text();
	/*	sig.x=$(file).attr("left");
		sig.y=$(file).attr("top");
		sigs.push(sig);	*/
	});
	
	baseSig.sigs = sigs;
	
	console.log(JSON.stringify(baseSig));
}	


}

function listFiles(){

	var c = [];
	c.push("<div>" + currentFolder.folder + " (" + currentFolder.numFiles + ")</div>");
	
	c.push("<ol>");
	
	$.each(currentFolder.files, function(idx, file){
	
		var gl = "[?]"; //stand in for glyph
		var cl = "fsqNA";
		var fsz = "10pt";
		var op = "1.0";
		
		if(file.isFile) {
			gl = "[F]";
			cl = "fsqFile";
			fsz = file.fontSize;
		}
		if(file.isDirectory) {
			gl = "[D]";
			cl = "fsqDir";
		}
		c.push("<li style='opacity:" + op + ";font-size:" + fsz + ";' class='fsqItem " + cl + "' id='f_id_" + idx + "'>" + gl + " " + file.name + "     " + file.stats.size + "</li>");
	
	});	
	
	c.push("</ol>");	
	
	$("#results").html(c.join(''));


}

function createStructure(){

	var c = [];
	
	c.push('<h3>fsq File System Viewer (Beta)</h3>');
	c.push('<div><select id="viewMode">');
	c.push('<option value="Text">Text</option>');
	c.push('<option value="Game" selected="selected">Game</option>');
	c.push('</select></div>');
	c.push('<div><input id="lookat" value="/" size="160"></input><br/>');
	c.push('<input id="go" value = "Go" type="button"></input>');
	c.push('<input id="chop" value = "Chop" type="button"></input></div>');
	c.push('<div id="results"></div>');
	
	$('body').append(c.join(''));
	
	

}

function chopToSlash(){
	
	var idx = $("#lookat").val().lastIndexOf("/");
	var newSearch = $("#lookat").val().substring(0,idx);
	newSearch = (newSearch == '' ? '/' : newSearch);
	$("#lookat").val(newSearch);

}

function setOpacity(){
	//in days
	var xTiles = [
		[1,'1.0'],
		[7,'0.9'],
		[14,'0.8'],
		[30,'0.7'],
		[90,'0.6'],
		[180,'0.5'],
		[365,'0.4'],
		[700,'0.3'],
		[1200,'0.2'],
		[100000,'0.1']
	];

	$.each(currentFolder.files, function(idx, file){
		if(file.isFile){
			file.opacity = getOpacity(file.stats.ctime);
		}
	});
	
	function getOpacity(time){
		var op;
		$.each(xTiles, function(idx, val){
			var diff = (($.now()-time)/(1000*60*60*24));

			if (diff > val[0]){
				op = val[1];
				return false;
			}		
		});
		
		return op;

	}		

}


function setFontSize(){

	var xTiles = [
		[10,'8pt'],
		[100,'9pt'],
		[1000,'10pt'],
		[10000,'11pt'],
		[100000,'12pt'],
		[1000000,'13pt'],
		[10000000,'14pt'],
		[100000000,'15pt']	
	];

	$.each(currentFolder.files, function(idx, file){
		if(file.isFile){
			file.fontSize = getFontSize(file.stats.size);
		}
	});
	
	function getFontSize(size){
		var size;
		$.each(xTiles, function(idx, val){	

			if (size < val[0]){
				size = val[1];
				return false;
			}		
		});
		
		return size;

	}	

}

function setDiameter(){

	var xTiles = [
		[10,0.1],
		[100,0.2],
		[1000,0.3],
		[10000,0.4],
		[100000,0.5],
		[1000000,0.6],
		[10000000,0.7],
		[100000000,0.8]
	];

	$.each(currentFolder.files, function(idx, file){
		if(file.isFile){
			file.diameter = getDiameter(file.stats.size);
		}
	});
	
	function getDiameter(size){
		var size;
		$.each(xTiles, function(idx, val){	

			if (size < val[0]){
				size = val[1];
				return false;
			}		
		});

		return size;

	}	

}









/** 
#  * Copyright (c) 2008 Pasyuk Sergey (www.codeasily.com) 
#  * Licensed under the MIT License: 
#  * http://www.opensource.org/licenses/mit-license.php 
#  *  
#  * Splits a <ul>/<ol>-list into equal-sized columns. 
#  *  
#  * Requirements:  
#  * <ul> 
#  * <li>"ul" or "ol" element must be styled with margin</li> 
#  * </ul> 
#  *  
#  * @see http://www.codeasily.com/jquery/multi-column-list-with-jquery 
#  */  
jQuery.fn.makeacolumnlists = function(settings){
	settings = jQuery.extend({
		cols: 3,		// set number of columns
		colWidth: 0,		// set width for each column or leave 0 for auto width
		equalHeight: false, 	// can be false, 'ul', 'ol', 'li'
		startN: 1		// first number on your ordered list
	}, settings);
 
	if(jQuery('> li', this)) {
		this.each(function(y) {
			var y=jQuery('.li_container').size(),
		    	height = 0, 
		        maxHeight = 0,
				t = jQuery(this),
				classN = t.attr('class'),
				listsize = jQuery('> li', this).size(),
				percol = Math.ceil(listsize/settings.cols),
				contW = t.width(),
				bl = ( isNaN(parseInt(t.css('borderLeftWidth'),10)) ? 0 : parseInt(t.css('borderLeftWidth'),10) ),
				br = ( isNaN(parseInt(t.css('borderRightWidth'),10)) ? 0 : parseInt(t.css('borderRightWidth'),10) ),
				pl = parseInt(t.css('paddingLeft'),10),
				pr = parseInt(t.css('paddingRight'),10),
				ml = parseInt(t.css('marginLeft'),10),
				mr = parseInt(t.css('marginRight'),10),
				col_Width = Math.floor((contW - (settings.cols-1)*(bl+br+pl+pr+ml+mr))/settings.cols);
			if (settings.colWidth) {
				col_Width = settings.colWidth; 
			}
			var colnum=1,
				percol2=percol;
			jQuery(this).addClass('li_cont1').wrap('<div id="li_container' + (++y) + '" class="li_container"></div>');
			if (settings.equalHeight=='li') {
			    jQuery('> li', this).each(function() {
			        var e = jQuery(this);
			        var border_top = ( isNaN(parseInt(e.css('borderTopWidth'),10)) ? 0 : parseInt(e.css('borderTopWidth'),10) );
			        var border_bottom = ( isNaN(parseInt(e.css('borderBottomWidth'),10)) ? 0 : parseInt(e.css('borderBottomWidth'),10) );
			        height = e.height() + parseInt(e.css('paddingTop'), 10) + parseInt(e.css('paddingBottom'), 10) + border_top + border_bottom;
			        maxHeight = (height > maxHeight) ? height : maxHeight;
			    });
			}
			for (var i=0; i<=listsize; i++) {
				if(i>=percol2) { percol2+=percol; colnum++; }
				var eh = jQuery('> li:eq('+i+')',this);
				eh.addClass('li_col'+ colnum);
				if(jQuery(this).is('ol')){eh.attr('value', ''+(i+settings.startN))+'';}
				if (settings.equalHeight=='li') {
			        var border_top = ( isNaN(parseInt(eh.css('borderTopWidth'),10)) ? 0 : parseInt(eh.css('borderTopWidth'),10) );
			        var border_bottom = ( isNaN(parseInt(eh.css('borderBottomWidth'),10)) ? 0 : parseInt(eh.css('borderBottomWidth'),10) );
					mh = maxHeight - (parseInt(eh.css('paddingTop'), 10) + parseInt(eh.css('paddingBottom'), 10) + border_top + border_bottom );
			        eh.height(mh);
				}
			}
			jQuery(this).css({cssFloat:'left', width:''+col_Width+'px'});
			for (colnum=2; colnum<=settings.cols; colnum++) {
				if(jQuery(this).is('ol')) {
					jQuery('li.li_col'+ colnum, this).appendTo('#li_container' + y).wrapAll('<ol class="li_cont'+colnum +' ' + classN + '" style="float:left; width: '+col_Width+'px;"></ol>');
				} else {
					jQuery('li.li_col'+ colnum, this).appendTo('#li_container' + y).wrapAll('<ul class="li_cont'+colnum +' ' + classN + '" style="float:left; width: '+col_Width+'px;"></ul>');
				}
			}
			if (settings.equalHeight=='ul' || settings.equalHeight=='ol') {
				for (colnum=1; colnum<=settings.cols; colnum++) {
				    jQuery('#li_container'+ y +' .li_cont'+colnum).each(function() {
				        var e = jQuery(this);
				        var border_top = ( isNaN(parseInt(e.css('borderTopWidth'),10)) ? 0 : parseInt(e.css('borderTopWidth'),10) );
				        var border_bottom = ( isNaN(parseInt(e.css('borderBottomWidth'),10)) ? 0 : parseInt(e.css('borderBottomWidth'),10) );
				        height = e.height() + parseInt(e.css('paddingTop'), 10) + parseInt(e.css('paddingBottom'), 10) + border_top + border_bottom;
				        maxHeight = (height > maxHeight) ? height : maxHeight;
				    });
				}
				for (colnum=1; colnum<=settings.cols; colnum++) {
					var eh = jQuery('#li_container'+ y +' .li_cont'+colnum);
			        var border_top = ( isNaN(parseInt(eh.css('borderTopWidth'),10)) ? 0 : parseInt(eh.css('borderTopWidth'),10) );
			        var border_bottom = ( isNaN(parseInt(eh.css('borderBottomWidth'),10)) ? 0 : parseInt(eh.css('borderBottomWidth'),10) );
					mh = maxHeight - (parseInt(eh.css('paddingTop'), 10) + parseInt(eh.css('paddingBottom'), 10) + border_top + border_bottom );
			        eh.height(mh);
				}
			}
		    jQuery('#li_container' + y).append('<div style="clear:both; overflow:hidden; height:0px;"></div>');
		});
	}
}
 
jQuery.fn.uncolumnlists = function(){
	jQuery('.li_cont1').each(function(i) {
		var onecolSize = jQuery('#li_container' + (++i) + ' .li_cont1 > li').size();
		if(jQuery('#li_container' + i + ' .li_cont1').is('ul')) {
			jQuery('#li_container' + i + ' > ul > li').appendTo('#li_container' + i + ' ul:first');
			for (var j=1; j<=onecolSize; j++) {
				jQuery('#li_container' + i + ' ul:first li').removeAttr('class').removeAttr('style');
			}
			jQuery('#li_container' + i + ' ul:first').removeAttr('style').removeClass('li_cont1').insertBefore('#li_container' + i);
		} else {
			jQuery('#li_container' + i + ' > ol > li').appendTo('#li_container' + i + ' ol:first');
			for (var j=1; j<=onecolSize; j++) {
				jQuery('#li_container' + i + ' ol:first li').removeAttr('class').removeAttr('style');
			}
			jQuery('#li_container' + i + ' ol:first').removeAttr('style').removeClass('li_cont1').insertBefore('#li_container' + i);
		}
		jQuery('#li_container' + i).remove();
	});
}