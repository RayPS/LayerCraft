////////////////////////////////////////////
////                                    ////
////        Ray Panel 2 (LayerCraft)    ////
////        www.RayPS.com               ////
////        Create at 2013-11-05        ////
////        Update at 2014-12-16        ////
////                                    ////
////////////////////////////////////////////


(function () {
	'use strict';

	var csInterface = new CSInterface();
	var myExtensionId = "layercraft"
	var configFile = csInterface.getSystemPath(SystemPath.EXTENSION) + "/config"
	var desktop
	var setting

	csInterface.evalScript("Folder.desktop", function(callback){
		desktop = callback
		setting = callback + "/Output"
	})


	function init() {

		readConfig()
		flyoutMenuInit(true)
		
		themeManager.init();

		Persistent(true)

		refreshDocInfo()
		checkNewVersion("1.3")
	}
	
	init();

	// -------------
	$(".icon-info-sign").click(function () {$("#about").animate({top:"10px"}, 500) });
	$("#about .close").click(function () {$("#about").animate({top:"150px"}, 500) });

	$("#about .ray").click(function(event) {csInterface.openURLInDefaultBrowser("http://www.RayPS.com") });
	$("#about .mail").click(function(event) {csInterface.openURLInDefaultBrowser("mailto:ray@rayps.com") });
	$("#about .donate").click(function(event) {csInterface.openURLInDefaultBrowser("http://lab.rayps.com/lc#donate") });
	// -------------


	// --- SETTINGS ---
	function writeConfig(content){window.cep.fs.writeFile(configFile, content)}
	function readConfig(){
		var configFileData = window.cep.fs.readFile(configFile).data
		if (configFileData !== "") {setting = configFileData}
		else {setting = "~/Desktop/Output"}
	}
	// --- SETTINGS ---

	$("body").mouseenter(function() {refreshDocInfo()})
	


	// --- SCALE ---
	$("#scale-200").click(function() {csInterface.evalScript("scale(200)")})
	$("#scale-50").click(function() {csInterface.evalScript("scale(50)")})
	// --- SCALE ---



	// --- TOOLS ---
	$("#tool-make").click(function() {csInterface.evalScript("make()")})
	$("#tool-trim").click(function() {csInterface.evalScript("trim()")})
	$("#tool-mktm").click(function() {csInterface.evalScript("make()");
									  csInterface.evalScript("trim()")})
	// --- TOOLS ---



	// --- SAVE ---
	$("#save-savebtn").click(function() {

		notify("Processing...",false)

		csInterface.evalScript("getSelectedLayersCount()",function(callback){
			if (callback > 0) {

				var isRetinaActive = $("#save-retina").hasClass('active')
				var isDPIsActive = $("#save-android").hasClass('active')
				var isTrimActive = $("#save-trim").hasClass('active')


				if (isDPIsActive) {csInterface.evalScript("createDPIsFolders('" + setting + "')")}

				csInterface.evalScript("createAssetsFolder('" + setting + "')")
				csInterface.evalScript("make()")
				csInterface.evalScript("outputAllLayers(" + isRetinaActive + "," + isTrimActive + "," + isDPIsActive + ",'" + setting + "')")
				csInterface.evalScript("closeDocument(false)")
				csInterface.evalScript("openAssetsFolder('" + setting + "')")
				notifyEnd()
			} else {
				notify("You didn't select any layers.",true)
			}
			
		})
	})
	// --- SAVE ---



	function notify (text,allow_close){
		$(".btn,hr").css('opacity',.25)
		$("#mask").show()
		$("#notify").show()
		$("#notify p").html(text)

		if (allow_close == true) {
			$("#notify i").show()
			$("#notify p").removeClass('nobtn')
		} else {
			$("#notify i").hide()
			$("#notify p").addClass('nobtn')
		}

		$("#notify i").click(function() {
			notifyEnd()
		})
 }

	function notifyEnd() {
		$(".btn,hr").css('opacity',1)
		$("#mask").hide()
		$("#notify").hide()
		$("#notify p").html("")
	}

	function checkNewVersion(currentVersion){
		$.getJSON('http://lab.rayps.com/lc/info.json', function(data) {
			if (currentVersion !== data.version) {
				$("#update").show().click(function(event) {
					csInterface.openURLInDefaultBrowser(data.update_url)
				})
			}
		})
	}

	function refreshDocInfo () {

		csInterface.evalScript("getDocumentsLength()",function(callback){
			if (callback > 0){
				if ($('#notify').is(":hidden")) {
					$(".btn,hr").css('opacity',1)
					$("#mask").hide()
				}

			} else {
				$(".btn,hr").css('opacity',.25)
				$("#mask").show()
			}
		})
	}

	function getFileName(fullFileName) {
		var fileNameWithoutExt = /.*(?=\.)/.exec(fullFileName)
		if (!fileNameWithoutExt) {
			fileNameWithoutExt = fullFileName
		}
		return fileNameWithoutExt
	}


	function Persistent(inOn) {
	
	    if (inOn){
	        var event = new CSEvent("com.adobe.PhotoshopPersistent", "APPLICATION");
	    } else {
	        var event = new CSEvent("com.adobe.PhotoshopUnPersistent", "APPLICATION");
	    }
	    event.extensionId = myExtensionId;
	    csInterface.dispatchEvent(event);
	}


	function flyoutMenuInit(first) {
		// Flyout menu XML string 
		var flyoutXML = '<Menu> \
							<MenuItem Id="setOutputFolder" Label="Set Output Folder" Enabled="true" Checked="false"/> \
							<MenuItem Id="labelMenuItem" Label="Current Output Folder:" Enabled="false" Checked="false"/> \
							<MenuItem Id="currentOutputFolder" Label="' + setting + '" Enabled="false" Checked="false"/> \
							\
							<MenuItem Label="---" /> \
							\
							<MenuItem Id="aboutMenuItem" Label="About" Enabled="true" Checked="false"/> \
							<MenuItem Id="donateMenuItem" Label="Donate" Enabled="true" Checked="false"/> \
							\
						</Menu>';

		csInterface.setPanelFlyoutMenu(flyoutXML);
		
		if (first) {
			// Listen for the Flyout menu clicks
			csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", flyoutMenuClickedHandler);
		}
	}

	function flyoutMenuClickedHandler (event) {

		// the event's "data" attribute is an object, which contains "menuId" and "menuName"
		// console.dir(event); 
		switch (event.data.menuId) {
			
			case "setOutputFolder": 
				var newPath = window.cep.fs.showOpenDialog(false,true,"Select a Folder",setting).data[0]
				if (newPath !== "") {
					setting = newPath
					console.log(newPath)
					writeConfig(newPath)
					flyoutMenuInit()
				}
				break;

			case "aboutMenuItem": 
				$(".icon-info-sign").trigger('click')
				break;

			case "donateMenuItem": 
				$(".donate").trigger('click')
				break;

			default: 
				console.log("test")
		}
	}

}());

//EOF




