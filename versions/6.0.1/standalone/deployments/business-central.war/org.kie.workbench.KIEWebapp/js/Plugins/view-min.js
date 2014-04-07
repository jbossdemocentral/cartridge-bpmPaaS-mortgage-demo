if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.View={facade:undefined,diffEditor:undefined,diffDialog:undefined,construct:function(b,a){this.facade=b;
this.facade.registerOnEvent(ORYX.CONFIG.VOICE_COMMAND_GENERATE_IMAGE,this.showAsPNG.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.VOICE_COMMAND_VIEW_SOURCE,this.showProcessBPMN.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,this.refreshCanvasforIE.bind(this));
this.zoomLevel=1;
this.maxFitToScreenLevel=1.5;
this.minZoomLevel=0.4;
this.maxZoomLevel=2;
this.diff=5;
if(a.properties){a.properties.each(function(c){if(c.zoomLevel){this.zoomLevel=Number(1)
}if(c.maxFitToScreenLevel){this.maxFitToScreenLevel=Number(c.maxFitToScreenLevel)
}if(c.minZoomLevel){this.minZoomLevel=Number(c.minZoomLevel)
}if(c.maxZoomLevel){this.maxZoomLevel=Number(c.maxZoomLevel)
}}.bind(this))
}this.facade.offer({name:ORYX.I18N.View.zoomIn,functionality:this.zoom.bind(this,[1+ORYX.CONFIG.ZOOM_OFFSET]),group:ORYX.I18N.View.group,icon:ORYX.BASE_FILE_PATH+"images/magnifier_zoom_in.png",description:ORYX.I18N.View.zoomInDesc,index:1,minShape:0,maxShape:0,isEnabled:function(){return this.zoomLevel<this.maxZoomLevel
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.zoomOut,functionality:this.zoom.bind(this,[1-ORYX.CONFIG.ZOOM_OFFSET]),group:ORYX.I18N.View.group,icon:ORYX.BASE_FILE_PATH+"images/magnifier_zoom_out.png",description:ORYX.I18N.View.zoomOutDesc,index:2,minShape:0,maxShape:0,isEnabled:function(){return this._checkSize()
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.zoomStandard,functionality:this.setAFixZoomLevel.bind(this,1),group:ORYX.I18N.View.group,icon:ORYX.BASE_FILE_PATH+"images/zoom_standard.png",cls:"icon-large",description:ORYX.I18N.View.zoomStandardDesc,index:3,minShape:0,maxShape:0,isEnabled:function(){return this.zoomLevel!=1
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.zoomFitToModel,functionality:this.zoomFitToModel.bind(this),group:ORYX.I18N.View.group,icon:ORYX.BASE_FILE_PATH+"images/image.png",description:ORYX.I18N.View.zoomFitToModelDesc,index:4,minShape:0,maxShape:0});
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.view.showFullScreen,functionality:function(c){var d=parent.document.getElementById(ORYX.EDITORID);
if(d.requestFullScreen){d.requestFullScreen()
}else{if(d.mozRequestFullScreen){d.mozRequestFullScreen()
}else{if(d.webkitRequestFullScreen){d.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
}else{ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.failShowFullScreen,title:""})
}}}}.bind(this),group:"fullscreengroup",icon:ORYX.BASE_FILE_PATH+"images/fullscreen.png",description:ORYX.I18N.view.showFullScreen_desc,index:2,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.view.shareProcessImg,functionality:this.shareProcessImage.bind(this),group:"sharegroup",icon:ORYX.BASE_FILE_PATH+"images/share.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/share.png",description:ORYX.I18N.view.shareProcessImg_desc,index:1,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.view.shareProcessPDF,functionality:this.shareProcessPdf.bind(this),group:"sharegroup",icon:ORYX.BASE_FILE_PATH+"images/share.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/share.png",description:ORYX.I18N.view.shareProcessPDF_desc,index:2,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.view.importFromBPMN2,functionality:this.importFromBPMN2.bind(this),group:"importgroup",icon:ORYX.BASE_FILE_PATH+"images/import.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/import.png",description:ORYX.I18N.view.importFromBPMN2_desc,index:1,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.view.importFromJSON,functionality:this.importFromJSON.bind(this),group:"importgroup",icon:ORYX.BASE_FILE_PATH+"images/import.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/import.png",description:ORYX.I18N.view.importFromJSON_desc,index:2,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.view.downloadProcPDF,functionality:this.showAsPDF.bind(this),group:"sharegroup",icon:ORYX.BASE_FILE_PATH+"images/share.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/share.png",description:ORYX.I18N.view.downloadProcPDF_desc,index:4,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.view.downloadProcPNG,functionality:this.showAsPNG.bind(this),group:"sharegroup",icon:ORYX.BASE_FILE_PATH+"images/share.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/share.png",description:ORYX.I18N.view.downloadProcPNG_desc,index:3,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.view.viewProcSources,functionality:this.showProcessSources.bind(this),group:"sharegroup",icon:ORYX.BASE_FILE_PATH+"images/share.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/share.png",description:ORYX.I18N.view.viewProcSources_desc,index:5,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)})
}},setAFixZoomLevel:function(a){this.zoomLevel=a;
this._checkZoomLevelRange();
this.zoom(1)
},showInPopout:function(){uuidParamName="uuid";
uuidParamName=uuidParamName.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
regexS="[\\?&]"+uuidParamName+"=([^&#]*)";
regex=new RegExp(regexS);
uuidParams=regex.exec(window.location.href);
uuidParamValue=uuidParams[1];
window.open(ORYX.EXTERNAL_PROTOCOL+"://"+ORYX.EXTERNAL_HOST+"/"+ORYX.EXTERNAL_SUBDOMAIN+"/org.drools.guvnor.Guvnor/standaloneEditorServlet?assetsUUIDs="+uuidParamValue+"&client=oryx","Process Editor","status=0,toolbar=0,menubar=0,resizable=0,location=no,width=1400,height=1000")
},importFromBPMN2:function(a){var c=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",items:[{text:ORYX.I18N.FromBPMN2Support.selectFile,style:"font-size:12px;margin-bottom:10px;display:block;",anchor:"100%",xtype:"label"},{fieldLabel:ORYX.I18N.FromBPMN2Support.file,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;",itemCls:"ext_specific_window_overflow"},{xtype:"textarea",hideLabel:true,name:"msg",anchor:"100% -63"}]});
var b=new Ext.Window({autoCreate:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.FromBPMN2Support.impBPMN2,height:350,width:500,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[c],buttons:[{text:ORYX.I18N.FromBPMN2Support.impBtn,handler:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.FromBPMN2Support.impProgress,title:""});
var d=c.items.items[2].getValue();
Ext.Ajax.request({url:ORYX.PATH+"transformer",method:"POST",success:function(f){if(f.responseText.length<1){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.importFromBPMN2Error+ORYX.I18N.view.importFromBPMN2ErrorCheckLogs,title:""});
b.hide()
}else{try{this._loadJSON(f.responseText,"BPMN2")
}catch(g){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.importFromBPMN2Error+"<p>"+g+"</p>",title:""})
}b.hide()
}}.createDelegate(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.importFromBPMN2Error+ORYX.I18N.view.importFromBPMN2ErrorCheckLogs,title:""});
b.hide()
}.createDelegate(this),params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,pp:ORYX.PREPROCESSING,bpmn2:d,transformto:"bpmn2json",uuid:ORYX.UUID}})
}.bind(this)},{text:ORYX.I18N.Save.close,handler:function(){b.hide()
}.bind(this)}]});
b.on("hide",function(){b.destroy(true);
delete b
});
b.show();
c.items.items[1].getEl().dom.addEventListener("change",function(e){var d=new FileReader();
d.onload=function(f){c.items.items[2].setValue(f.target.result)
};
d.readAsText(e.target.files[0],"UTF-8")
},true)
},importFromJSON:function(a){var c=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",items:[{text:ORYX.I18N.FromJSONSupport.selectFile,style:"font-size:12px;margin-bottom:10px;display:block;",anchor:"100%",xtype:"label"},{fieldLabel:ORYX.I18N.FromJSONSupport.file,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;",itemCls:"ext_specific_window_overflow"},{xtype:"textarea",hideLabel:true,name:"msg",anchor:"100% -63"}]});
var b=new Ext.Window({autoCreate:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.FromJSONSupport.impBPMN2,height:350,width:500,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[c],buttons:[{text:ORYX.I18N.FromJSONSupport.impBtn,handler:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.FromJSONSupport.impProgress,title:""});
var d=c.items.items[2].getValue();
try{this._loadJSON(d,"JSON")
}catch(f){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.importFromJSONError+"\n"+f,title:""})
}b.hide()
}.bind(this)},{text:ORYX.I18N.Save.close,handler:function(){b.hide()
}.bind(this)}]});
b.on("hide",function(){b.destroy(true);
delete b
});
b.show();
c.items.items[1].getEl().dom.addEventListener("change",function(e){var d=new FileReader();
d.onload=function(f){c.items.items[2].setValue(f.target.result)
};
d.readAsText(e.target.files[0],"UTF-8")
},true)
},shareEmbeddableProcess:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.view.creatingEmbeddableProc,title:""});
Ext.Ajax.request({url:ORYX.PATH+"transformer",method:"POST",success:function(a){try{var b=new Ext.form.TextArea({id:"sharedEmbeddableArea",fieldLabel:ORYX.I18N.view.enbedableProc,width:400,height:250,value:a.responseText});
var d=new Ext.Window({width:400,id:"sharedEmbeddableURL",height:250,autoScroll:true,title:ORYX.I18N.view.enbedableProc,items:[b]});
d.show()
}catch(c){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.enbedableProcFailCreate+": "+c,title:""})
}}.createDelegate(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.enbedableProcFailCreate+".",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,respaction:"showembeddable"}})
},shareProcessPdf:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.view.creatingProcPDF,title:""});
var b=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
var a=DataManager.serialize(ORYX.EDITOR.getCanvas().getRootNode().cloneNode(true));
Ext.Ajax.request({url:ORYX.PATH+"transformer",method:"POST",success:function(c){try{var d=new Ext.form.TextArea({id:"sharedPDFArea",fieldLabel:ORYX.I18N.view.processImgPDF,width:400,height:250,value:c.responseText});
var g=new Ext.Window({width:400,id:"sharedPDFURL",height:250,autoScroll:true,layout:"fit",title:ORYX.I18N.view.processPDFurl,items:[d]});
g.show()
}catch(f){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.processPDFFail+": "+f,title:""})
}}.createDelegate(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.processPDFFail+".",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,fsvg:Base64.encode(b),rsvg:Base64.encode(a),transformto:"pdf",respaction:"showurl"}})
},shareProcessImage:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.view.processCreatingImg,title:""});
var b=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
var a=DataManager.serialize(ORYX.EDITOR.getCanvas().getRootNode().cloneNode(true));
Ext.Ajax.request({url:ORYX.PATH+"transformer",method:"POST",success:function(c){try{var d=new Ext.form.TextArea({id:"sharedImageArea",fieldLabel:ORYX.I18N.view.processImgUrl,width:400,height:250,value:c.responseText});
var g=new Ext.Window({width:400,id:"sharedImageURL",height:250,layout:"fit",autoScroll:true,title:ORYX.I18N.view.processImgUrl,items:[d]});
g.show()
}catch(f){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.processImgFail+": "+f,title:""})
}}.createDelegate(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.processImgFail+".",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,fsvg:Base64.encode(b),rsvg:Base64.encode(a),transformto:"png",respaction:"showurl"}})
},shareProcess:function(){alert("sharing process")
},diffprocess:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.View.viewDiffLoadingVersions,title:""});
Ext.Ajax.request({url:ORYX.PATH+"processdiff",method:"POST",success:function(a){try{this._showProcessDiffDialog(a.responseText)
}catch(b){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.versionsFail+":\n"+b,title:""})
}}.createDelegate(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.versionsFail+".",title:""})
},params:{action:"versions",profile:ORYX.PROFILE,uuid:ORYX.UUID}})
},_showProcessDiffDialog:function(g){var j=g.evalJSON();
var a=[];
var d=0;
for(var h in j){if(j.hasOwnProperty(h)){a.push(parseInt(h));
d++
}}if(d==0){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.versionsNotfound+".",title:"Diff"})
}else{a.sort(function(k,i){return k-i
});
var f=[];
for(var c=0;
c<a.length;
c++){f[c]=[a[c]+""]
}var b=new Ext.data.SimpleStore({fields:["name"],data:f});
var e=new Ext.form.ComboBox({fieldLabel:ORYX.I18N.view.versionsSelect,labelStyle:"width:180px",hiddenName:"version_name",emptyText:ORYX.I18N.view.versionsSelect+"...",store:b,displayField:"name",valueField:"name",mode:"local",typeAhead:true,triggerAction:"all",listeners:{select:{fn:function(l,k){var i=ORYX.EDITOR.getSerializedJSON();
Ext.Ajax.request({url:ORYX.PATH+"uuidRepository",method:"POST",success:function(m){try{var o=m.responseText;
Ext.Ajax.request({url:ORYX.PATH+"processdiff",method:"POST",success:function(q){try{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.view.creatingDiff+"...",title:""});
var u=q.responseText;
var p=new diff_match_patch();
p.Diff_Timeout=0;
var t=p.diff_main(u,o);
p.diff_cleanupSemantic(t);
var r=p.diff_prettyHtml(t);
this.diffDialog.remove(this.diffEditor,true);
this.diffEditor=new Ext.form.HtmlEditor({id:"diffeditor",value:r,enableSourceEdit:false,enableAlignments:false,enableColors:false,enableFont:false,enableFontSize:false,enableFormat:false,enableLinks:false,enableLists:false,autoScroll:true,width:520,height:310});
this.diffDialog.add(this.diffEditor);
this.diffDialog.doLayout()
}catch(s){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.failRetrieveVersionsSource+":"+s,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.failRetrieveVersionsSource+".",title:""})
}.bind(this),params:{action:"getversion",version:l.getValue(),profile:ORYX.PROFILE,uuid:ORYX.UUID}})
}catch(n){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.convertingToBPMN2Fail+":"+n,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.convertingToBPMN2Fail+".",title:""})
},params:{action:"toXML",pp:ORYX.PREPROCESSING,profile:ORYX.PROFILE,data:i}})
}.bind(this)}}});
this.diffEditor=new Ext.form.HtmlEditor({id:"diffeditor",value:"",enableSourceEdit:false,enableAlignments:false,enableColors:false,enableFont:false,enableFontSize:false,enableFormat:false,enableLinks:false,enableLists:false,autoScroll:true,width:520,height:310});
this.diffDialog=new Ext.Window({autoCreate:true,autoScroll:false,plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.view.compareBPMN2PReviousVersions,height:410,width:550,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[this.diffEditor],tbar:[e],buttons:[{text:ORYX.I18N.Save.close,handler:function(){this.diffDialog.hide()
}.bind(this)}]});
this.diffDialog.show();
this.diffDialog.doLayout()
}},_loadJSON:function(a,b){if(a){Ext.MessageBox.confirm("Import",ORYX.I18N.view.replaceExistingModel,function(c){if(c=="yes"){this.facade.setSelection(this.facade.getCanvas().getChildShapes(true));
var h=ORYX.EDITOR.getSerializedJSON();
var d=this.facade.getSelection();
var f=new ORYX.Plugins.Edit.ClipBoard();
f.refresh(d,this.getAllShapesToConsider(d,true));
var g=new ORYX.Plugins.Edit.DeleteCommand(f,this.facade);
this.facade.executeCommands([g]);
try{this.facade.importJSON(a);
ORYX.PROCESS_SAVED=false;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:ORYX.I18N.view.importSuccess+" "+b,title:""})
}catch(e){this.facade.importJSON(h);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.unableImportProvided+" "+b,title:""})
}}else{try{this.facade.importJSON(a);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:ORYX.I18N.view.importSuccess+" "+b,title:""})
}catch(e){var h=ORYX.EDITOR.getSerializedJSON();
this.facade.importJSON(h);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.unableImportProvided+" "+b,title:""})
}}}.bind(this))
}else{this._showErrorMessageBox(ORYX.I18N.Oryx.title,ORYX.I18N.jPDLSupport.impFailedJson)
}},getAllShapesToConsider:function(b,d){var a=[];
var c=[];
b.each(function(f){isChildShapeOfAnother=b.any(function(i){return i.hasChildShape(f)
});
if(isChildShapeOfAnother){return
}a.push(f);
if(f instanceof ORYX.Core.Node){var h=f.getOutgoingNodes();
h=h.findAll(function(i){return !b.include(i)
});
a=a.concat(h)
}c=c.concat(f.getChildShapes(true));
if(d&&!(f instanceof ORYX.Core.Edge)){var g=f.getIncomingShapes().concat(f.getOutgoingShapes());
g.each(function(i){if(i instanceof ORYX.Core.Edge&&i.properties["oryx-conditionexpression"]&&i.properties["oryx-conditionexpression"]!=""){return
}a.push(i)
}.bind(this))
}}.bind(this));
var e=this.facade.getCanvas().getChildEdges().select(function(f){if(a.include(f)){return false
}if(f.getAllDockedShapes().size()===0){return false
}return f.getAllDockedShapes().all(function(g){return g instanceof ORYX.Core.Edge||c.include(g)
})
});
a=a.concat(e);
return a
},_showErrorMessageBox:function(b,a){Ext.MessageBox.show({title:b,msg:a,buttons:Ext.MessageBox.OK,icon:Ext.MessageBox.ERROR})
},showAsPDF:function(){var m="pdf";
var d=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
var i=DataManager.serialize(ORYX.EDITOR.getCanvas().getRootNode().cloneNode(true));
var b="post";
var c=document.createElement("form");
c.setAttribute("name","transformerform");
c.setAttribute("method",b);
c.setAttribute("action",ORYX.CONFIG.TRANSFORMER_URL());
c.setAttribute("target","_blank");
var j=document.createElement("input");
j.setAttribute("type","hidden");
j.setAttribute("name","fsvg");
j.setAttribute("value",Base64.encode(d));
c.appendChild(j);
var g=document.createElement("input");
g.setAttribute("type","hidden");
g.setAttribute("name","rsvg");
g.setAttribute("value",Base64.encode(i));
c.appendChild(g);
var l=document.createElement("input");
l.setAttribute("type","hidden");
l.setAttribute("name","uuid");
l.setAttribute("value",ORYX.UUID);
c.appendChild(l);
var f=document.createElement("input");
f.setAttribute("type","hidden");
f.setAttribute("name","profile");
f.setAttribute("value",ORYX.PROFILE);
c.appendChild(f);
var e=document.createElement("input");
e.setAttribute("type","hidden");
e.setAttribute("name","transformto");
e.setAttribute("value",m);
c.appendChild(e);
var h=ORYX.EDITOR.getSerializedJSON();
var a=jsonPath(h.evalJSON(),"$.properties.id");
var k=document.createElement("input");
k.setAttribute("type","hidden");
k.setAttribute("name","processid");
k.setAttribute("value",a);
c.appendChild(k);
document.body.appendChild(c);
c.submit()
},showProcessSVG:function(){var d=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
var b=new Ext.form.TextArea({id:"svgSourceTextArea",fieldLabel:ORYX.I18N.view.processSVGSource,value:d,autoScroll:true});
var c=new Ext.Window({width:600,id:"processSVGSource",height:550,layout:"fit",title:ORYX.I18N.view.processSVGSource,items:[b],buttons:[{text:ORYX.I18N.Save.close,handler:function(){c.close();
c=null;
b=null;
a=null
}.bind(this)}]});
c.show();
this.foldFunc=CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
var a=CodeMirror.fromTextArea(document.getElementById("svgSourceTextArea"),{mode:"application/xml",lineNumbers:true,lineWrapping:true,onGutterClick:this.foldFunc})
},showProcessERDF:function(){var d=ORYX.EDITOR.getERDF();
var b=new Ext.form.TextArea({id:"erdfSourceTextArea",fieldLabel:ORYX.I18N.view.erdfSource,value:d,autoScroll:true,height:"80%"});
var c=new Ext.Window({width:600,id:"processERDFSource",height:550,layout:"fit",title:ORYX.I18N.view.erdfSource,items:[b],buttons:[{text:ORYX.I18N.Save.close,handler:function(){c.close();
c=null;
b=null;
a=null
}.bind(this)}]});
c.show();
this.foldFunc=CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
var a=CodeMirror.fromTextArea(document.getElementById("erdfSourceTextArea"),{mode:"application/xml",lineNumbers:true,lineWrapping:true,onGutterClick:this.foldFunc})
},showProcessJSON:function(){var b=ORYX.EDITOR.getSerializedJSON();
var c=new Ext.form.TextArea({id:"jsonSourceTextArea",fieldLabel:ORYX.I18N.view.jsonSource,value:b,autoScroll:true});
var d=new Ext.Window({width:600,id:"processJSONSource",height:550,layout:"fit",title:ORYX.I18N.view.jsonSource,items:[c],buttons:[{text:ORYX.I18N.Save.close,handler:function(){d.close();
d=null;
c=null;
a=null
}.bind(this)}]});
d.show();
this.foldFunc=CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
var a=CodeMirror.fromTextArea(document.getElementById("jsonSourceTextArea"),{mode:"application/json",lineNumbers:true,lineWrapping:true,onGutterClick:this.foldFunc})
},showProcessBPMN:function(){var a=ORYX.EDITOR.getSerializedJSON();
Ext.Ajax.request({url:ORYX.PATH+"uuidRepository",method:"POST",success:function(c){try{var d=new Ext.form.TextArea({id:"bpmnSourceTextArea",fieldLabel:ORYX.I18N.view.bpmn2Source,value:c.responseText,autoScroll:true});
var g=new Ext.Window({width:600,id:"processBPMNSource",height:550,layout:"fit",title:ORYX.I18N.view.bpmn2Source,items:[d],buttons:[{text:ORYX.I18N.view.saveToFile,handler:function(){var p=ORYX.EDITOR.getSerializedJSON();
var k=jsonPath(p.evalJSON(),"$.properties.processn");
var n=jsonPath(p.evalJSON(),"$.properties.package");
var l=jsonPath(p.evalJSON(),"$.properties.version");
var j="";
if(n&&n!=""){j+=n
}if(k&&k!=""){if(j!=""){j+="."
}j+=k
}if(l&&l!=""){if(j!=""){j+="."
}j+="v"+l
}if(j==""){j="processbpmn2"
}var m=d.getValue();
var e="post";
var h=document.createElement("form");
h.setAttribute("name","storetofileform");
h.setAttribute("method",e);
h.setAttribute("action",ORYX.PATH+"filestore");
h.setAttribute("target","_blank");
var o=document.createElement("input");
o.setAttribute("type","hidden");
o.setAttribute("name","fname");
o.setAttribute("value",j);
h.appendChild(o);
var i=document.createElement("input");
i.setAttribute("type","hidden");
i.setAttribute("name","fext");
i.setAttribute("value","bpmn2");
h.appendChild(i);
var q=document.createElement("input");
q.setAttribute("type","hidden");
q.setAttribute("name","data");
q.setAttribute("value",m);
h.appendChild(q);
document.body.appendChild(h);
h.submit()
}},{text:ORYX.I18N.Save.close,handler:function(){g.close();
g=null;
d=null;
b=null
}.bind(this)}]});
g.show();
this.foldFunc=CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
var b=CodeMirror.fromTextArea(document.getElementById("bpmnSourceTextArea"),{mode:"application/xml",lineNumbers:true,lineWrapping:true,onGutterClick:this.foldFunc})
}catch(f){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.convertingToBPMN2Fail+":"+f,title:""})
}}.createDelegate(this),failure:function(){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.convertingToBPMN2Fail+".",title:""})
},params:{action:"toXML",pp:ORYX.PREPROCESSING,profile:ORYX.PROFILE,data:a}})
},showProcessSources:function(){var a=ORYX.EDITOR.getSerializedJSON();
var c=ORYX.EDITOR.getERDF();
var b=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
Ext.Ajax.request({url:ORYX.PATH+"uuidRepository",method:"POST",success:function(j){try{var f=new Ext.form.TextArea({id:"bpmnSourceTextArea",fieldLabel:"BPMN2",value:j.responseText,autoScroll:true});
var q=new Ext.Panel({title:"BPMN2",layout:"fit",border:false,items:[f],style:"padding-bottom:20px",listeners:{afterlayout:function(e){this.bpmn2FoldFunc=CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
var s=CodeMirror.fromTextArea(document.getElementById("bpmnSourceTextArea"),{mode:"application/xml",lineNumbers:true,lineWrapping:true,onGutterClick:this.bpmn2FoldFunc})
}}});
var r=new Ext.form.TextArea({id:"jsonSourceTextArea",fieldLabel:"JSON",value:a,autoScroll:true});
var h=new Ext.Panel({title:"JSON",layout:"fit",border:false,items:[r],style:"padding-bottom:20px",listeners:{afterlayout:function(s){this.jsonFoldFunc=CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
var e=CodeMirror.fromTextArea(document.getElementById("jsonSourceTextArea"),{mode:"application/json",lineNumbers:true,lineWrapping:true,onGutterClick:this.jsonFoldFunc})
}}});
var d=new Ext.form.TextArea({id:"erdfSourceTextArea",fieldLabel:"ERDF",value:c,autoScroll:true});
var p=new Ext.Panel({title:"ERDF",layout:"fit",border:false,items:[d],style:"padding-bottom:20px",listeners:{afterlayout:function(s){this.erdfFoldFunc=CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
var e=CodeMirror.fromTextArea(document.getElementById("erdfSourceTextArea"),{mode:"application/xml",lineNumbers:true,lineWrapping:true,onGutterClick:this.erdfFoldFunc})
}}});
var i=new Ext.form.TextArea({id:"svgSourceTextArea",fieldLabel:"SVG",value:b,autoScroll:true});
var l=new Ext.Panel({title:"SVG",layout:"fit",border:false,items:[i],style:"padding-bottom:10px",listeners:{afterlayout:function(s){this.svgFoldFunc=CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
var e=CodeMirror.fromTextArea(document.getElementById("svgSourceTextArea"),{mode:"application/xml",lineNumbers:true,lineWrapping:true,onGutterClick:this.svgFoldFunc})
}}});
var g=new Ext.TabPanel({activeTab:0,border:false,width:"100%",height:"100%",tabPosition:"top",layoutOnTabChange:true,deferredRender:false,defaults:{autoHeight:true,autoScroll:true},items:[q,h,l,p]});
var m=new Ext.Button({text:ORYX.I18N.view.downloadBPMN2,handler:function(){var A=ORYX.EDITOR.getSerializedJSON();
var v=jsonPath(A.evalJSON(),"$.properties.processn");
var y=jsonPath(A.evalJSON(),"$.properties.package");
var w=jsonPath(A.evalJSON(),"$.properties.version");
var u="";
if(y&&y!=""){u+=y
}if(v&&v!=""){if(u!=""){u+="."
}u+=v
}if(w&&w!=""){if(u!=""){u+="."
}u+="v"+w
}if(u==""){u="processbpmn2"
}var x=j.responseText;
var e="post";
var s=document.createElement("form");
s.setAttribute("name","storetofileform");
s.setAttribute("method",e);
s.setAttribute("action",ORYX.PATH+"filestore");
s.setAttribute("target","_blank");
var z=document.createElement("input");
z.setAttribute("type","hidden");
z.setAttribute("name","fname");
z.setAttribute("value",u);
s.appendChild(z);
var t=document.createElement("input");
t.setAttribute("type","hidden");
t.setAttribute("name","fext");
t.setAttribute("value","bpmn2");
s.appendChild(t);
var B=document.createElement("input");
B.setAttribute("type","hidden");
B.setAttribute("name","data");
B.setAttribute("value",x);
s.appendChild(B);
document.body.appendChild(s);
s.submit()
}});
var n=new Ext.Window({width:600,id:"processSources",height:550,layout:"fit",title:ORYX.I18N.view.processSources,items:[g],tbar:[m]});
n.show();
this.bpmn2FoldFunc=CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
var k=CodeMirror.fromTextArea(document.getElementById("bpmnSourceTextArea"),{mode:"application/xml",lineNumbers:true,lineWrapping:true,onGutterClick:this.bpmn2FoldFunc})
}catch(o){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.convertingToBPMN2Fail+":"+o,title:""})
}}.createDelegate(this),failure:function(){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.view.convertingToBPMN2Fail+".",title:""})
},params:{action:"toXML",pp:ORYX.PREPROCESSING,profile:ORYX.PROFILE,data:a}})
},showAsPNG:function(){var m="png";
var d=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
var i=DataManager.serialize(ORYX.EDITOR.getCanvas().getRootNode().cloneNode(true));
var b="post";
var c=document.createElement("form");
c.setAttribute("name","transformerform");
c.setAttribute("method",b);
c.setAttribute("action",ORYX.CONFIG.TRANSFORMER_URL());
c.setAttribute("target","_blank");
var j=document.createElement("input");
j.setAttribute("type","hidden");
j.setAttribute("name","fsvg");
j.setAttribute("value",Base64.encode(d));
c.appendChild(j);
var g=document.createElement("input");
g.setAttribute("type","hidden");
g.setAttribute("name","rsvg");
g.setAttribute("value",Base64.encode(i));
c.appendChild(g);
var l=document.createElement("input");
l.setAttribute("type","hidden");
l.setAttribute("name","uuid");
l.setAttribute("value",ORYX.UUID);
c.appendChild(l);
var f=document.createElement("input");
f.setAttribute("type","hidden");
f.setAttribute("name","profile");
f.setAttribute("value",ORYX.PROFILE);
c.appendChild(f);
var e=document.createElement("input");
e.setAttribute("type","hidden");
e.setAttribute("name","transformto");
e.setAttribute("value",m);
c.appendChild(e);
var h=ORYX.EDITOR.getSerializedJSON();
var a=jsonPath(h.evalJSON(),"$.properties.id");
var k=document.createElement("input");
k.setAttribute("type","hidden");
k.setAttribute("name","processid");
k.setAttribute("value",a);
c.appendChild(k);
document.body.appendChild(c);
c.submit()
},zoom:function(d){this.zoomLevel*=d;
var h=this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
var c=this.facade.getCanvas();
var g=c.bounds.width()*this.zoomLevel;
var a=c.bounds.height()*this.zoomLevel;
var f=(c.node.parentNode.parentNode.parentNode.offsetHeight-a)/2;
f=f>20?f-20:0;
c.node.parentNode.parentNode.style.marginTop=f+"px";
f+=5;
c.getHTMLContainer().style.top=f+"px";
var b=h.scrollTop-Math.round((c.getHTMLContainer().parentNode.getHeight()-a)/2)+this.diff;
var e=h.scrollLeft-Math.round((c.getHTMLContainer().parentNode.getWidth()-g)/2)+this.diff;
c.setSize({width:g,height:a},true);
c.node.setAttributeNS(null,"transform","scale("+this.zoomLevel+")");
this.facade.updateSelection();
h.scrollTop=b;
h.scrollLeft=e;
c.zoomLevel=this.zoomLevel
},zoomFitToModel:function(){var h=this.facade.getCanvas().getHTMLContainer().parentNode.parentNode;
var b=h.getHeight()-30;
var d=h.getWidth()-30;
var c=this.facade.getCanvas().getChildShapes();
if(!c||c.length<1){return false
}var g=c[0].absoluteBounds().clone();
c.each(function(i){g.include(i.absoluteBounds().clone())
});
var f=d/g.width();
var a=b/g.height();
var e=a<f?a:f;
if(e>this.maxFitToScreenLevel){e=this.maxFitToScreenLevel
}this.setAFixZoomLevel(e);
h.scrollTop=Math.round(g.upperLeft().y*this.zoomLevel)-5;
h.scrollLeft=Math.round(g.upperLeft().x*this.zoomLevel)-5
},_checkSize:function(){var a=this.facade.getCanvas().getHTMLContainer().parentNode;
var b=Math.min((a.parentNode.getWidth()/a.getWidth()),(a.parentNode.getHeight()/a.getHeight()));
return 0.7>b
},_checkZoomLevelRange:function(){if(this.zoomLevel<this.minZoomLevel){this.zoomLevel=this.minZoomLevel
}if(this.zoomLevel>this.maxZoomLevel){this.zoomLevel=this.maxZoomLevel
}},refreshCanvasforIE:function(){if(Ext.isIE){var d=ORYX.EDITOR.getSerializedJSON();
var a=this.facade.getSelection();
var b=new ORYX.Plugins.Edit.ClipBoard();
b.refresh(a,this.getAllShapesToConsider(a,true));
var c=new ORYX.Plugins.Edit.DeleteCommand(b,this.facade);
this.facade.executeCommands([c]);
this.facade.importJSON(d);
this.facade.setSelection([])
}}};
ORYX.Plugins.View=Clazz.extend(ORYX.Plugins.View);