if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SelectStencilSetPerspective={facade:undefined,extensions:undefined,perspectives:undefined,construct:function(c){this.facade=c;
var b=ORYX.BASE_FILE_PATH+"stencilsets/extensions/extensions.json";
new Ajax.Request(b,{method:"GET",asynchronous:false,onSuccess:(function(h){try{var d=h.responseText;
var f=d.evalJSON();
this.extensions={};
f.extensions.each(function(e){this.extensions[e.namespace]=e
}.bind(this));
this.perspectives={};
f.perspectives.each(function(e){this.perspectives[e.namespace]=e
}.bind(this));
this.facade.getStencilSets().values().each((function(i){var e=f.perspectives.findAll(function(j){if(j.stencilset==i.namespace()){return true
}else{return false
}});
if(e.size()>0){this.createPerspectivesCombobox(i,e)
}}).bind(this))
}catch(g){ORYX.Log.debug(ORYX.I18N.SSExtensionLoader.failed1);
Ext.Msg.alert("Oryx",ORYX.I18N.SSExtensionLoader.failed1)
}}).bind(this),onFailure:(function(d){Ext.Msg.alert("Oryx",ORYX.I18N.SSExtensionLoader.failed2)
}).bind(this)});
if(ORYX.PRESET_PERSPECTIVE.length>0){if(ORYX.PRESET_PERSPECTIVE=="full"){this._updateStencil(ORYX.FULL_PERSPECTIVE)
}else{if(ORYX.PRESET_PERSPECTIVE=="simple"){this._updateStencil(ORYX.SIMPLE_PERSPECTIVE)
}else{if(ORYX.PRESET_PERSPECTIVE=="ruleflow"){this._updateStencil(ORYX.RULEFLOW_PERSPECTIVE)
}}}}var a=this._readCookie("designerperspective");
if(a!=null){this._updateStencil(a)
}},createPerspectivesCombobox:function(a,f){var e=new Array();
f.each(function(g){e.push([g.namespace,g.title,g.description])
});
var d=new Ext.data.SimpleStore({fields:["namespace","title","tooltip"],data:e});
var c=new Ext.form.ComboBox({store:d,displayField:"title",forceSelection:true,typeAhead:true,mode:"local",width:168,triggerAction:"all",selectOnFocus:true});
c.on("select",this.onSelect,this);
var b=new Ext.Panel({bodyStyle:"background:#eee;font-size:9px;font-family:Verdana, Geneva, Arial, Helvetica, sans-serif;",autoScroll:true,lines:false,items:[new Ext.form.Label({text:"Choose library set:",style:"font-size:12px;"}),c]});
this.facade.addToRegion("west",b);
b.show();
b.doLayout()
},onSelect:function(b,a){var c=a.json[0];
this._updateStencil(c);
this._createCookie("designerperspective",c,365)
},_updateStencil:function(d){ORYX.CURRENT_PERSPECTIVE=d;
var c=this.facade.getStencilSets();
var b=new Object();
c.values().each(function(f){f.changeTitle(this.perspectives[d].title);
f.extensions().values().each(function(g){if(this.extensions[g.namespace]){b[g.namespace]=g
}}.bind(this))
}.bind(this));
var a=new Array();
if(this.perspectives[d].addExtensions){this.perspectives[d].addExtensions.each(function(f){if(!f.ifIsLoaded){a.push(this.extensions[f]);
return
}if(b[f.ifIsLoaded]&&this.extensions[f.add]){a.push(this.extensions[f.add])
}else{if(f["default"]&&this.extensions[f["default"]]){a.push(this.extensions[f["default"]])
}}}.bind(this))
}if(this.perspectives[d].removeAllExtensions){this._loadExtensions(a,undefined,true);
return
}var e=new Array();
if(this.perspectives[d].removeExtensions){this.perspectives[d].removeExtensions.each(function(f){e.push(this.extensions[f])
}.bind(this))
}this._loadExtensions(a,e,false)
},_loadExtensions:function(a,d,c){var e=this.facade.getStencilSets();
var f=false;
e.values().each(function(g){var h=g.extensions().values().select(function(i){return a[i.namespace]==undefined
});
if(c){h.each(function(i){g.removeExtension(i.namespace);
f=true
})
}else{h.each(function(j){var i=d.find(function(k){return j.namespace===k.namespace
});
if(i){g.removeExtension(j.namespace);
f=true
}})
}});
a.each(function(h){var g=e[h["extends"]];
if(g){g.addExtensionFromDefinition(ORYX.CONFIG.ROOT_PATH+"/stencilset/extensions/"+h.definition);
f=true
}}.bind(this));
if(f){e.values().each(function(g){this.facade.getRules().initializeRules(g)
}.bind(this));
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
var b=this.facade.getSelection();
this.facade.setSelection();
this.facade.setSelection(b)
}},_createCookie:function(c,d,e){if(e){var b=new Date();
b.setTime(b.getTime()+(e*24*60*60*1000));
var a="; expires="+b.toGMTString()
}else{var a=""
}document.cookie=c+"="+d+a+"; path=/"
},_readCookie:function(b){var e=b+"=";
var a=document.cookie.split(";");
for(var d=0;
d<a.length;
d++){var f=a[d];
while(f.charAt(0)==" "){f=f.substring(1,f.length)
}if(f.indexOf(e)==0){return f.substring(e.length,f.length)
}}return null
}};
ORYX.Plugins.SelectStencilSetPerspective=Clazz.extend(ORYX.Plugins.SelectStencilSetPerspective);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Toolbar=Clazz.extend({facade:undefined,plugs:[],construct:function(b,a){this.facade=b;
this.groupIndex=new Hash();
if(ORYX.CONFIG.MENU_INDEX){this.groupIndex=ORYX.CONFIG.MENU_INDEX
}else{a.properties.each((function(c){if(c.group&&c.index!=undefined){this.groupIndex[c.group]=c.index
}}).bind(this))
}Ext.QuickTips.init();
this.buttons=[];
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_BUTTON_UPDATE,this.onButtonUpdate.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,this.onSelectionChanged.bind(this))
},onButtonUpdate:function(b){var a=this.buttons.find(function(c){return c.id===b.id
});
if(b.pressed!==undefined){a.buttonInstance.toggle(b.pressed)
}},registryChanged:function(e){var i=e.sortBy((function(j){return((this.groupIndex[j.group]!=undefined?this.groupIndex[j.group]:"")+j.group+""+j.index).toLowerCase()
}).bind(this));
var f=$A(i).findAll(function(j){if(j.group&&j.group.indexOf("footer")===0){return false
}return !this.plugs.include(j)
}.bind(this));
if(f.length<1){return
}this.buttons=[];
ORYX.Log.trace("Creating a toolbar.");
if(!this.toolbar){this.toolbar=new Ext.ux.SlicedToolbar({height:24});
var g=this.facade.addToRegion("north",this.toolbar,"Toolbar")
}var c=this.plugs.last()?this.plugs.last().group:f[0].group;
var a={};
if(ORYX.READONLY!=true){if(("webkitSpeech" in document.createElement("input"))){var d=new Ext.form.TextField({id:"micinput"});
this.toolbar.add(d);
this.toolbar.add("-");
var b={"x-webkit-speech":"true"};
Ext.get("micinput").set(b);
var h=document.getElementById("micinput");
h.onfocus=h.blur;
h.onwebkitspeechchange=function(j){var k=h.value;
ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_VOICE_COMMAND,entry:k});
h.blur;
h.value=""
}
}}f.each((function(l){if(!l.name){return
}this.plugs.push(l);
if(c!=l.group){this.toolbar.add("-");
c=l.group;
a={}
}var k=l.functionality;
l.functionality=function(){if("undefined"!=typeof(pageTracker)&&"function"==typeof(pageTracker._trackEvent)){pageTracker._trackEvent("ToolbarButton",l.name)
}return k.apply(this,arguments)
};
if(l.dropDownGroupIcon){var n=a[l.dropDownGroupIcon];
if(n===undefined){n=a[l.dropDownGroupIcon]=new Ext.Toolbar.SplitButton({cls:"x-btn-icon",icon:l.dropDownGroupIcon,menu:new Ext.menu.Menu({items:[]}),listeners:{click:function(o,p){if(!o.menu.isVisible()&&!o.ignoreNextClick){o.showMenu()
}else{o.hideMenu()
}}}});
this.toolbar.add(n)
}var m={icon:l.icon,text:l.name,itemId:l.id,handler:l.toggle?undefined:l.functionality,checkHandler:l.toggle?l.functionality:undefined,listeners:{render:function(o){if(l.description){new Ext.ToolTip({target:o.getEl(),title:l.description})
}}}};
if(l.toggle){var j=new Ext.menu.CheckItem(m)
}else{var j=new Ext.menu.Item(m)
}n.menu.add(j)
}else{var j=new Ext.Toolbar.Button({icon:l.icon,cls:"x-btn-icon",itemId:l.id,tooltip:l.description,tooltipType:"title",handler:l.toggle?null:l.functionality,enableToggle:l.toggle,toggleHandler:l.toggle?l.functionality:null});
this.toolbar.add(j);
j.getEl().onclick=function(){this.blur()
}
}l.buttonInstance=j;
this.buttons.push(l)
}).bind(this));
this.enableButtons([]);
this.toolbar.calcSlices();
window.addEventListener("resize",function(j){this.toolbar.calcSlices()
}.bind(this),false);
window.addEventListener("onresize",function(j){this.toolbar.calcSlices()
}.bind(this),false)
},onSelectionChanged:function(a){if(!a.elements){this.enableButtons([])
}else{this.enableButtons(a.elements)
}},enableButtons:function(a){this.buttons.each((function(b){b.buttonInstance.enable();
if(b.minShape&&b.minShape>a.length){b.buttonInstance.disable()
}if(b.maxShape&&b.maxShape<a.length){b.buttonInstance.disable()
}if(b.isEnabled&&!b.isEnabled()){b.buttonInstance.disable()
}}).bind(this))
}});
Ext.ns("Ext.ux");
Ext.ux.SlicedToolbar=Ext.extend(Ext.Toolbar,{currentSlice:0,iconStandardWidth:22,seperatorStandardWidth:2,toolbarStandardPadding:2,initComponent:function(){Ext.apply(this,{});
Ext.ux.SlicedToolbar.superclass.initComponent.apply(this,arguments)
},onRender:function(){Ext.ux.SlicedToolbar.superclass.onRender.apply(this,arguments)
},onResize:function(){Ext.ux.SlicedToolbar.superclass.onResize.apply(this,arguments)
},calcSlices:function(){var d=0;
this.sliceMap={};
var c=0;
var a=this.getEl().getWidth();
this.items.getRange().each(function(g,e){if(g.helperItem){g.destroy();
return
}var h=g.getEl().getWidth();
if(c+h+5*this.iconStandardWidth>a){var f=this.items.indexOf(g);
this.insertSlicingButton("next",d,f);
if(d!==0){this.insertSlicingButton("prev",d,f)
}this.insertSlicingSeperator(d,f);
d+=1;
c=0
}this.sliceMap[g.id]=d;
c+=h
}.bind(this));
if(d>0){this.insertSlicingSeperator(d,this.items.getCount()+1);
this.insertSlicingButton("prev",d,this.items.getCount()+1);
var b=new Ext.Toolbar.Spacer();
this.insertSlicedHelperButton(b,d,this.items.getCount()+1);
Ext.get(b.id).setWidth(this.iconStandardWidth)
}this.maxSlice=d;
this.setCurrentSlice(this.currentSlice)
},insertSlicedButton:function(b,c,a){this.insertButton(a,b);
this.sliceMap[b.id]=c
},insertSlicedHelperButton:function(b,c,a){b.helperItem=true;
this.insertSlicedButton(b,c,a)
},insertSlicingSeperator:function(b,a){this.insertSlicedHelperButton(new Ext.Toolbar.Fill(),b,a)
},insertSlicingButton:function(e,f,b){var d=function(){this.setCurrentSlice(this.currentSlice+1)
}.bind(this);
var a=function(){this.setCurrentSlice(this.currentSlice-1)
}.bind(this);
var c=new Ext.Toolbar.Button({cls:"x-btn-icon",icon:ORYX.BASE_FILE_PATH+"images/toolbar_"+e+".png",handler:(e==="next")?d:a});
this.insertSlicedHelperButton(c,f,b)
},setCurrentSlice:function(a){if(a>this.maxSlice||a<0){return
}this.currentSlice=a;
this.items.getRange().each(function(b){b.setVisible(a===this.sliceMap[b.id])
}.bind(this))
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.ProcessInfo=Clazz.extend({construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.View.showInfo,functionality:this.showInfo.bind(this),group:ORYX.I18N.View.infogroup,icon:ORYX.BASE_FILE_PATH+"images/information.png",description:ORYX.I18N.View.showInfoDesc,index:1,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)})
}},showInfo:function(){window.alert("jBPM Designer Version: "+ORYX.VERSION)
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.JPDLMigration=Clazz.extend({construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.View.migratejPDL,functionality:this.migrateJPDL.bind(this),group:"importgroup",icon:ORYX.BASE_FILE_PATH+"images/jpdl_import_icon.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/import.png",description:ORYX.I18N.View.migratejPDLDesc,index:3,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)})
}},migrateJPDL:function(){this._showImportDialog()
},_showImportDialog:function(a){var d=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",items:[{text:ORYX.I18N.jPDLSupport.selectFile,style:"font-size:12px;margin-bottom:10px;display:block;",xtype:"label"},{fieldLabel:ORYX.I18N.jPDLSupport.file,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;",itemCls:"ext_specific_window_overflow"},{xtype:"textarea",hideLabel:true,name:"msg",grow:false,width:450,height:200}]});
var b=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",items:[{text:ORYX.I18N.jPDLSupport.selectGpdFile,style:"font-size:12px;margin-bottom:10px;display:block;",xtype:"label"},{fieldLabel:ORYX.I18N.jPDLSupport.gpdfile,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;",itemCls:"ext_specific_window_overflow"},{xtype:"textarea",hideLabel:true,name:"msg",grow:false,width:450,height:200}]});
var c=new Ext.Window({autoCreate:true,autoScroll:true,plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.jPDLSupport.impJPDL,height:450,width:500,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[d,b],buttons:[{text:ORYX.I18N.jPDLSupport.impBtn,handler:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.jPDLSupport.impProgress,title:""});
window.setTimeout(function(){var e=d.items.items[2].getValue();
var f=b.items.items[2].getValue();
this._sendRequest(ORYX.CONFIG.TRANSFORMER_URL(),"POST",{jpdl:e,gpd:f,transformto:"jpdl2bpmn2",profile:ORYX.PROFILE,uuid:ORYX.UUID},function(g){this._loadJSON(g);
c.hide()
}.bind(this),function(){c.hide()
}.bind(this))
}.bind(this),100)
}.bind(this)},{text:ORYX.I18N.jPDLSupport.close,handler:function(){c.hide()
}.bind(this)}]});
c.on("hide",function(){c.destroy(true);
delete c
});
c.show();
d.items.items[1].getEl().dom.addEventListener("change",function(f){var e=new FileReader();
e.onload=function(g){d.items.items[2].setValue(g.target.result)
};
e.readAsText(f.target.files[0],"UTF-8")
},true);
b.items.items[1].getEl().dom.addEventListener("change",function(f){var e=new FileReader();
e.onload=function(g){b.items.items[2].setValue(g.target.result)
};
e.readAsText(f.target.files[0],"UTF-8")
},true)
},_loadJSON:function(a){if(a){var b=a.evalJSON();
this.facade.importJSON(a)
}else{this._showErrorMessageBox(ORYX.I18N.Oryx.title,ORYX.I18N.jPDLSupport.impFailedJson)
}},_sendRequest:function(b,f,d,e,a){var c=false;
new Ajax.Request(b,{method:f,asynchronous:false,parameters:d,onSuccess:function(g){c=true;
if(e){e(g.responseText)
}}.bind(this),onFailure:function(g){if(a){a()
}else{this._showErrorMessageBox(ORYX.I18N.Oryx.title,ORYX.I18N.jPDLSupport.impFailedReq);
ORYX.log.warn("jPDL migration failed: "+g.responseText)
}}.bind(this)});
return c
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.ServiceRepoIntegration=Clazz.extend({repoDialog:undefined,repoContent:undefined,construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.View.connectServiceRepo,functionality:this.jbpmServiceRepoConnect.bind(this),group:"servicerepogroup",icon:ORYX.BASE_FILE_PATH+"images/repository_rep.gif",description:ORYX.I18N.View.connectServiceRepoDesc,index:4,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)})
}},jbpmServiceRepoConnect:function(){this._showInitialRepoScreen()
},_showInitialRepoScreen:function(){this.repoContent=new Ext.Panel({layout:"table",html:"<br/><br/><br/><br/><center>No Service Repository specified.</center>"});
var a=new Ext.Button({text:"Connect",handler:function(){this._updateRepoDialog(Ext.getCmp("serviceurlfield").getValue())
}.bind(this)});
this.repoDialog=new Ext.Window({autoCreate:true,autoScroll:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.View.connectServiceRepoDataTitle,height:440,width:600,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[this.repoContent],tbar:[{id:"serviceurlfield",xtype:"textfield",fieldLabel:"URL",name:"repourl",width:"300",value:"Enter Service Repository URL",handleMouseEvents:true,listeners:{render:function(){this.getEl().on("mousedown",function(d,c,b){Ext.getCmp("serviceurlfield").setValue("")
})
}}},a],buttons:[{text:ORYX.I18N.jPDLSupport.close,handler:function(){this.repoDialog.hide()
}.bind(this)}]});
this.repoDialog.on("hide",function(){if(this.repoDialog){this.repoDialog.destroy(true);
delete this.repoDialog
}});
this.repoDialog.show()
},_updateRepoDialog:function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.View.connectServiceRepoConnecting,title:""});
Ext.Ajax.request({url:ORYX.PATH+"jbpmservicerepo",method:"POST",success:function(b){try{if(b.responseText=="false"){this.repoDialog.remove(this.repoContent,true);
this.repoContent=new Ext.Panel({layout:"table",html:"<br/><br/><br/><br/><center>No Service Repository specified.</center>"});
this.repoDialog.add(this.repoContent);
this.repoDialog.doLayout();
ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Failed to connect to the Service Repository.",title:""})
}else{this._showJbpmServiceInfo(b.responseText,a)
}}catch(c){this.repoDialog.remove(this.repoContent,true);
this.repoContent=new Ext.Panel({layout:"table",html:"<br/><br/><br/><br/><center>No Service Repository specified.</center>"});
this.repoDialog.add(this.repoContent);
this.repoDialog.doLayout();
ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Connecting the the Service Repository failed:"+c,title:""})
}}.createDelegate(this),failure:function(){this.repoDialog.remove(this.repoContent,true);
this.repoContent=new Ext.Panel({layout:"table",html:"<br/><br/><br/><br/><center>No Service Repository specified.</center>"});
this.repoDialog.add(this.repoContent);
this.repoDialog.doLayout();
ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Failed to connect to the Service Repository.",title:""})
},params:{action:"display",profile:ORYX.PROFILE,uuid:ORYX.UUID,repourl:a}})
},_showJbpmServiceInfo:function(f,c){var h=f.evalJSON();
var g=[];
var b=0;
for(var e in h){g[b]=h[e];
b++
}var a=new Ext.data.SimpleStore({fields:[{name:"name"},{name:"displayName"},{name:"icon"},{name:"category"},{name:"explanation"},{name:"documentation"},{name:"inputparams"},{name:"results"}],data:g});
var d=new Ext.grid.GridPanel({store:a,columns:[{header:"ICON",width:50,sortable:true,dataIndex:"icon",renderer:this._renderIcon},{header:"NAME",width:100,sortable:true,dataIndex:"displayName"},{header:"EXPLANATION",width:100,sortable:true,dataIndex:"explanation"},{header:"DOCUMENTATION",width:100,sortable:true,dataIndex:"documentation",renderer:this._renderDocs},{header:"INPUT PARAMETERS",width:200,sortable:true,dataIndex:"inputparams"},{header:"RESULTS",width:200,sortable:true,dataIndex:"results"},{header:"CATEGORY",width:100,sortable:true,dataIndex:"category"}],title:"Service Nodes. doud-click on a row to install.",autoScroll:true,viewConfig:{autoFit:true}});
d.on("rowdblclick",function(m,k,n){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.View.installingRepoItem,title:""});
var j=m.getStore().getAt(k).get("name");
var l=m.getStore().getAt(k).get("category");
Ext.Ajax.request({url:ORYX.PATH+"jbpmservicerepo",method:"POST",success:function(i){try{if(i.responseText=="false"){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Failed to install the repository assets.",title:""})
}else{ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:"Assets successfully installed. Save and re-open your process to start using them.",title:""})
}}catch(o){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Installing the repository assets failed: "+o,title:""})
}}.createDelegate(this),failure:function(){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Failed to install the repository assets.",title:""})
}.createDelegate(this),params:{action:"install",profile:ORYX.PROFILE,uuid:ORYX.UUID,asset:j,category:l,repourl:c}})
});
this.repoDialog.remove(this.repoContent,true);
this.repoContent=new Ext.TabPanel({activeTab:0,border:false,width:"100%",height:"100%",tabPosition:"top",layoutOnTabChange:true,deferredRender:false,items:[{title:"Service Nodes",autoScroll:true,items:[d],layout:"fit",margins:"10 10 10 10"}]});
this.repoDialog.add(this.repoContent);
this.repoDialog.doLayout()
},_renderIcon:function(a){return'<img src="'+a+'"/>'
},_renderDocs:function(a){return'<a href="'+a+'" target="_blank">link</a>'
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.SavePlugin=Clazz.extend({construct:function(a){this.facade=a;
this.vt;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.Save.save,functionality:this.saveWithMessage.bind(this),group:ORYX.I18N.Save.group,icon:ORYX.BASE_FILE_PATH+"images/disk.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/disk.png",description:ORYX.I18N.Save.saveDesc,index:1,minShape:0,maxShape:0,isEnabled:function(){return ORYX.REPOSITORY_ID!="guvnor"&&ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.Save.enableAutosave,functionality:this.enableautosave.bind(this),group:ORYX.I18N.Save.group,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/disk.png",description:ORYX.I18N.Save.enableAutosave_desc,index:2,minShape:0,maxShape:0,isEnabled:function(){return !ORYX.AUTOSAVE_ENABLED&&ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.Save.disableAutosave,functionality:this.disableautosave.bind(this),group:ORYX.I18N.Save.group,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/disk.png",description:ORYX.I18N.Save.disableAutosave_desc,index:3,minShape:0,maxShape:0,isEnabled:function(){return ORYX.AUTOSAVE_ENABLED&&ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.Save.copy,functionality:this.copyassetnotify.bind(this),group:ORYX.I18N.Save.group,icon:ORYX.BASE_FILE_PATH+"images/page_copy.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/disk.png",description:ORYX.I18N.Save.copy_desc,index:4,minShape:0,maxShape:0,isEnabled:function(){return ORYX.REPOSITORY_ID!="guvnor"&&ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.Save.rename,functionality:this.renameassetnotify.bind(this),group:ORYX.I18N.Save.group,icon:ORYX.BASE_FILE_PATH+"images/rename.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/disk.png",description:ORYX.I18N.Save.rename_desc,index:5,minShape:0,maxShape:0,isEnabled:function(){return ORYX.REPOSITORY_ID!="guvnor"&&ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.Save.delete_name,functionality:this.deleteassetnotify.bind(this),group:ORYX.I18N.Save.group,icon:ORYX.BASE_FILE_PATH+"images/delete2.gif",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/disk.png",description:ORYX.I18N.Save.delete_desc,index:6,minShape:0,maxShape:0,isEnabled:function(){return ORYX.REPOSITORY_ID!="guvnor"&&ORYX.READONLY!=true
}.bind(this)})
}this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,this.setUnsaved.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,this.setUnsaved.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_ROLLBACK,this.setUnsaved.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_UNDO_EXECUTE,this.setUnsaved.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DO_SAVE,this.handleEventDoSave.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_CANCEL_SAVE,this.handleEventCancelSave.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DO_RELOAD,this.handleEventDoRealod.bind(this));
window.onunload=this.unloadWindow.bind(this)
},setUnsaved:function(){ORYX.PROCESS_SAVED=false
},saveWithMessage:function(){var a=parent.designersignalassetupdate(ORYX.UUID);
if(a&&a==true){}else{this.save(true)
}},handleEventDoSave:function(){this.setUnsaved();
this.save(true)
},handleEventCancelSave:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.Save.saveCancelled,title:""})
},handleEventDoRealod:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.Save.processReloading,title:""});
new Ajax.Request(ORYX.CONFIG.UUID_URL(),{encoding:"UTF-8",method:"GET",onSuccess:function(b){response=b.responseText;
try{if(response.length!=0){if(response.startsWith("error:")){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.unableReloadContent,title:""})
}else{this.updateProcessOnReload(response.evalJSON())
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.invalidContent,title:""})
}}catch(a){ORYX.LOG.error(a)
}}.createDelegate(this),onFailure:function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.couldNotReload,title:""})
}});
ORYX.PROCESS_SAVED=false
},save:function(a){if(!ORYX.PROCESS_SAVED){var b="";
if(a&&a==true){b=prompt("Save this item","Check in comment");
if(b==null){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.Save.saveCancelled,title:""});
return
}}Ext.Ajax.request({url:ORYX.PATH+"assetservice",method:"POST",success:function(g){try{if(g.responseText&&g.responseText.length>0){var k=g.responseText.evalJSON();
if(k.errors&&k.errors.lengt>0){var l=k.errors;
for(var h=0;
h<l.length;
h++){var d=l[h];
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:d.message,title:""})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:ORYX.I18N.Save.saveSuccess,title:"",timeOut:1000,extendedTimeOut:1000});
ORYX.PROCESS_SAVED=true;
if(ORYX.CONFIG.STORESVGONSAVE&&ORYX.CONFIG.STORESVGONSAVE=="true"){var f=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
var m=DataManager.serialize(ORYX.EDITOR.getCanvas().getRootNode().cloneNode(true));
var n=ORYX.EDITOR.getSerializedJSON();
var c=jsonPath(n.evalJSON(),"$.properties.id");
Ext.Ajax.request({url:ORYX.PATH+"transformer",method:"POST",success:function(e){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:ORYX.I18N.Save.saveImageSuccess,title:""})
}.bind(this),failure:function(e,j){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.saveImageFailed,title:""})
}.bind(this),params:{fsvg:Base64.encode(f),rsvg:Base64.encode(m),uuid:ORYX.UUID,profile:ORYX.PROFILE,transformto:"svg",processid:c}})
}}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.unableToSave+": "+i,title:""})
}}catch(i){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.unableToSave+": "+i,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.unableToSave+".",title:""})
}.bind(this),params:{action:"updateasset",profile:ORYX.PROFILE,assetcontent:ORYX.EDITOR.getSerializedJSON(),pp:ORYX.PREPROCESSING,assetid:ORYX.UUID,assetcontenttransform:"jsontobpmn2",commitmessage:b}})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.Save.noChanges,title:""})
}},saveSync:function(){if(!ORYX.PROCESS_SAVED){var k=ORYX.EDITOR.getSerializedJSON();
var a=new XMLHttpRequest;
var b=ORYX.PATH+"assetservice";
var d="action=updateasset&profile="+ORYX.PROFILE+"&pp="+ORYX.PREPROCESSING+"&assetid="+ORYX.UUID+"&assetcontenttransform=jsontobpmn2&assetcontent="+encodeURIComponent(k);
a.open("POST",b,false);
a.setRequestHeader("Content-type","application/x-www-form-urlencoded");
a.send(d);
if(a.status==200){try{if(a.responseText&&a.responseText.length>0){var h=a.responseText.evalJSON();
if(h.errors&&h.errors.lengt>0){var i=h.errors;
for(var f=0;
f<i.length;
f++){var c=i[f];
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:c.message,title:""})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:ORYX.I18N.Save.saveSuccess,title:"",timeOut:1000,extendedTimeOut:1000});
ORYX.PROCESS_SAVED=true
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.unableToSave+": "+g,title:""})
}}catch(g){alert("error : "+g)
}}}},enableautosave:function(){ORYX.AUTOSAVE_ENABLED=true;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
this.vt=window.setInterval((function(){this.save(false)
}).bind(this),30000);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.Save.autosaveEnabled,title:""})
},disableautosave:function(){ORYX.AUTOSAVE_ENABLED=false;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
window.clearInterval(this.vt);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.Save.autosaveDisabled,title:""})
},deleteassetnotify:function(){Ext.MessageBox.confirm(ORYX.I18N.Save.deleteConfirm_title,ORYX.I18N.Save.deleteConfirm_msg,function(a){if(a=="yes"){parent.designersignalassetdelete(ORYX.UUID)
}}.bind(this))
},copyassetnotify:function(){Ext.MessageBox.confirm(ORYX.I18N.Save.copyConfirm_title,ORYX.I18N.Save.copyConfirm_msg,function(a){if(a=="yes"){this.save(true);
parent.designersignalassetcopy(ORYX.UUID)
}else{parent.designersignalassetcopy(ORYX.UUID)
}}.bind(this))
},renameassetnotify:function(){Ext.MessageBox.confirm(ORYX.I18N.Save.renameConfirm_title,ORYX.I18N.Save.renameConfirm_msg,function(a){if(a=="yes"){this.save(true);
parent.designersignalassetrename(ORYX.UUID)
}else{parent.designersignalassetrename(ORYX.UUID)
}}.bind(this))
},unloadWindow:function(){this.saveSync(false)
},clearCanvas:function(){ORYX.EDITOR.getCanvas().nodes.each(function(a){ORYX.EDITOR.deleteShape(a)
}.bind(this));
ORYX.EDITOR.getCanvas().edges.each(function(a){ORYX.EDITOR.deleteShape(a)
}.bind(this))
},updateProcessOnReload:function(a){if(a){try{this.clearCanvas();
this.facade.importJSON(a);
ORYX.PROCESS_SAVED=false;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:ORYX.I18N.Save.reloadSuccess,title:""})
}catch(b){this.facade.importJSON(currentJSON);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.reloadFail,title:""})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Save.processReloadedInvalid,title:""})
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeMenuPlugin={construct:function(c){this.facade=c;
this.alignGroups=new Hash();
var a=this.facade.getCanvas().getHTMLContainer();
this.shapeMenu=new ORYX.Plugins.ShapeMenu(a);
this.currentShapes=[];
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_START,this.hideShapeMenu.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DRAGDROP_END,this.showShapeMenu.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_RESIZE_START,(function(){this.hideShapeMenu();
this.hideMorphMenu()
}).bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_RESIZE_END,this.showShapeMenu.bind(this));
var b=new Ext.dd.DragZone(a.parentNode,{shadow:!Ext.isMac});
b.afterDragDrop=this.afterDragging.bind(this,b);
b.beforeDragOver=this.beforeDragOver.bind(this,b);
this.createdButtons={};
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,(function(){this.registryChanged()
}).bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.VOICE_COMMAND_ADD_TASK,this.addNode.bind(this,"Task"));
this.facade.registerOnEvent(ORYX.CONFIG.VOICE_COMMAND_ADD_GATEWAY,this.addNode.bind(this,"Exclusive_Databased_Gateway"));
this.facade.registerOnEvent(ORYX.CONFIG.VOICE_COMMAND_ADD_END_EVENT,this.addNode.bind(this,"EndNoneEvent"));
this.timer=null;
this.resetElements=true
},addNode:function(b){var a={type:"http://b3mn.org/stencilset/bpmn2.0#"+b,namespace:"http://b3mn.org/stencilset/bpmn2.0#",connectingType:true};
this.newShape(a,undefined)
},hideShapeMenu:function(a){window.clearTimeout(this.timer);
this.timer=null;
this.shapeMenu.hide()
},showShapeMenu:function(a){if(!a||this.resetElements){window.clearTimeout(this.timer);
this.timer=window.setTimeout(function(){this.shapeMenu.closeAllButtons();
this.showMorphButton(this.currentShapes);
this.showDictionaryButton();
this.showTaskFormButton();
this.showSourceViewButton();
this.showStencilButtons(this.currentShapes);
this.shapeMenu.show(this.currentShapes);
this.resetElements=false
}.bind(this),300)
}else{window.clearTimeout(this.timer);
this.timer=null;
this.shapeMenu.show(this.currentShapes)
}},registryChanged:function(a){if(a){a=a.each(function(d){d.group=d.group?d.group:"unknown"
});
this.pluginsData=a.sortBy(function(d){return(d.group+""+d.index)
})
}this.shapeMenu.removeAllButtons();
this.shapeMenu.setNumberOfButtonsPerLevel(ORYX.CONFIG.SHAPEMENU_RIGHT,2);
this.createdButtons={};
this.createMorphMenu();
if(!this.pluginsData){this.pluginsData=[]
}this.baseMorphStencils=this.facade.getRules().baseMorphs();
var b=this.facade.getRules().containsMorphingRules();
var c=this.facade.getStencilSets();
c.values().each((function(f){var e=f.nodes();
e.each((function(i){if(i.hidden()){return
}var h={type:i.id(),namespace:i.namespace(),connectingType:true};
var g=new ORYX.Plugins.ShapeMenuButton({callback:this.newShape.bind(this,h),icon:i.icon(),align:ORYX.CONFIG.SHAPEMENU_RIGHT,group:0,msg:i.title()+" - "+ORYX.I18N.ShapeMenuPlugin.clickDrag});
this.shapeMenu.addButton(g);
this.createdButtons[i.namespace()+i.type()+i.id()]=g;
Ext.dd.Registry.register(g.node.lastChild,h)
}).bind(this));
var d=f.edges();
d.each((function(i){var h={type:i.id(),namespace:i.namespace()};
var g=new ORYX.Plugins.ShapeMenuButton({callback:this.newShape.bind(this,h),icon:i.icon(),align:ORYX.CONFIG.SHAPEMENU_RIGHT,group:1,msg:(b?ORYX.I18N.Edge:i.title())+" - "+ORYX.I18N.ShapeMenuPlugin.drag});
this.shapeMenu.addButton(g);
this.createdButtons[i.namespace()+i.type()+i.id()]=g;
Ext.dd.Registry.register(g.node.lastChild,h)
}).bind(this))
}).bind(this))
},createMorphMenu:function(){this.morphMenu=new Ext.menu.Menu({id:"Oryx_morph_menu",items:[]});
this.morphMenu.on("mouseover",function(){this.morphMenuHovered=true
},this);
this.morphMenu.on("mouseout",function(){this.morphMenuHovered=false
},this);
var c=new ORYX.Plugins.ShapeMenuButton({hovercallback:(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER?this.showMorphMenu.bind(this):undefined),resetcallback:(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER?this.hideMorphMenu.bind(this):undefined),callback:(ORYX.CONFIG.ENABLE_MORPHMENU_BY_HOVER?undefined:this.toggleMorphMenu.bind(this)),icon:ORYX.BASE_FILE_PATH+"images/wrench_orange.png",align:ORYX.CONFIG.SHAPEMENU_BOTTOM,group:0,msg:ORYX.I18N.ShapeMenuPlugin.morphMsg});
var a=new ORYX.Plugins.ShapeMenuButton({callback:this.addDictionaryItem.bind(this),icon:ORYX.BASE_FILE_PATH+"images/dictionary.png",align:ORYX.CONFIG.SHAPEMENU_TOP,group:0,msg:"Add to Process Dictionary"});
var b=new ORYX.Plugins.ShapeMenuButton({callback:this.editTaskForm.bind(this),icon:ORYX.BASE_FILE_PATH+"images/processforms.png",align:ORYX.CONFIG.SHAPEMENU_TOP,group:1,msg:"Edit Task Form"});
var d=new ORYX.Plugins.ShapeMenuButton({callback:this.viewNodeSource.bind(this),icon:ORYX.BASE_FILE_PATH+"images/view.png",align:ORYX.CONFIG.SHAPEMENU_TOP,group:2,msg:"View Node Source"});
this.shapeMenu.setNumberOfButtonsPerLevel(ORYX.CONFIG.SHAPEMENU_BOTTOM,2);
this.shapeMenu.addButton(c);
this.shapeMenu.addButton(a);
this.shapeMenu.addButton(b);
this.shapeMenu.addButton(d);
this.morphMenu.getEl().appendTo(c.node);
this.morphButton=c;
this.dictionaryButton=a;
this.taskFormButton=b;
this.sourceViewButton=d
},showMorphMenu:function(){this.morphMenu.show(this.morphButton.node);
this._morphMenuShown=true
},hideMorphMenu:function(){this.morphMenu.hide();
this._morphMenuShown=false
},toggleMorphMenu:function(){if(this._morphMenuShown){this.hideMorphMenu()
}else{this.showMorphMenu()
}},addDictionaryItem:function(){var a="";
a=this.currentShapes[0].getLabels()[0].text();
if(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DICTIONARY_ADD,entry:a})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Name not specified.",title:""})
}},editTaskForm:function(){var a=this.currentShapes[0].properties["oryx-taskname"];
if(a&&a.length>0){a=a.replace(/\&/g,"");
a=a.replace(/\s/g,"");
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_TASKFORM_EDIT,tn:a})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Task Name not specified.",title:""})
}},viewNodeSource:function(){var a=ORYX.EDITOR.getSerializedJSON();
Ext.Ajax.request({url:ORYX.PATH+"uuidRepository",method:"POST",success:function(f){try{var i=new DOMParser();
var g=i.parseFromString(f.responseText,"text/xml");
var b=g.querySelector("[id="+this.currentShapes[0].resourceId+"]");
if(!b){b=g.querySelector("[id="+this.currentShapes[0].properties["oryx-name"]+"]")
}if(b){var d=new XMLSerializer();
var c=d.serializeToString(b);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NODEXML_SHOW,nodesource:c})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Unable to find node source.",title:""})
}}catch(h){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Converting to BPMN2 failed: "+h,title:""})
}Ext.Msg.hide()
}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Converting to BPMN2 failed.",title:""})
}.bind(this),params:{action:"toXML",pp:ORYX.PREPROCESSING,profile:ORYX.PROFILE,data:a}})
},onSelectionChanged:function(a){var b=a.elements;
this.hideShapeMenu();
this.hideMorphMenu();
if(this.currentShapes.inspect()!==b.inspect()){this.currentShapes=b;
this.resetElements=true;
this.showShapeMenu()
}else{this.showShapeMenu(true)
}},showDictionaryButton:function(){this.dictionaryButton.prepareToShow()
},showTaskFormButton:function(){if(this.currentShapes&&this.currentShapes[0]&&this.currentShapes[0].properties&&this.currentShapes[0].properties["oryx-tasktype"]&&this.currentShapes[0].properties["oryx-tasktype"]=="User"&&ORYX.PRESET_PERSPECTIVE!="ruleflow"){this.taskFormButton.prepareToShow()
}},showSourceViewButton:function(){this.sourceViewButton.group=2;
if(this.currentShapes&&this.currentShapes[0]&&this.currentShapes[0].properties&&this.currentShapes[0].properties["oryx-tasktype"]&&this.currentShapes[0].properties["oryx-tasktype"]=="User"){this.sourceViewButton.prepareToShow()
}else{this.sourceViewButton.group=this.sourceViewButton.group-1;
this.sourceViewButton.prepareToShow()
}},showMorphButton:function(d){if(d.length!=1){return
}var a=this.facade.getRules().morphStencils({stencil:d[0].getStencil()});
a=a.select(function(e){if(d[0].getStencil().type()==="node"){return this.facade.getRules().canContain({containingShape:d[0].parent,containedStencil:e})
}else{return this.facade.getRules().canConnect({sourceShape:d[0].dockers.first().getDockedShape(),edgeStencil:e,targetShape:d[0].dockers.last().getDockedShape()})
}}.bind(this));
if(a.size()<=1){return
}this.morphMenu.removeAll();
if(d[0].getStencil().id().endsWith("#Task")){var c=ORYX.CALCULATE_CURRENT_PERSPECTIVE()==ORYX.RULEFLOW_PERSPECTIVE;
if(d[0].properties["oryx-tasktype"]!="User"&&!c){var b=new Ext.menu.Item({text:"User Task",icon:ORYX.BASE_FILE_PATH+"stencilsets/bpmn2.0jbpm/icons/activity/list/type.user.png",disabled:false,disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.updateTaskType(d[0],"User")
}).bind(this)});
this.morphMenu.add(b)
}if(d[0].properties["oryx-tasktype"]!="Send"&&!c){var b=new Ext.menu.Item({text:"Send Task",icon:ORYX.BASE_FILE_PATH+"stencilsets/bpmn2.0jbpm/icons/activity/list/type.send.png",disabled:false,disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.updateTaskType(d[0],"Send")
}).bind(this)});
this.morphMenu.add(b)
}if(d[0].properties["oryx-tasktype"]!="Receive"&&!c){var b=new Ext.menu.Item({text:"Receive Task",icon:ORYX.BASE_FILE_PATH+"stencilsets/bpmn2.0jbpm/icons/activity/list/type.receive.png",disabled:false,disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.updateTaskType(d[0],"Receive")
}).bind(this)});
this.morphMenu.add(b)
}if(d[0].properties["oryx-tasktype"]!="Manual"&&!c){var b=new Ext.menu.Item({text:"Manual Task",icon:ORYX.BASE_FILE_PATH+"stencilsets/bpmn2.0jbpm/icons/activity/list/type.manual.png",disabled:false,disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.updateTaskType(d[0],"Manual")
}).bind(this)});
this.morphMenu.add(b)
}if(d[0].properties["oryx-tasktype"]!="Service"&&!c){var b=new Ext.menu.Item({text:"Service Task",icon:ORYX.BASE_FILE_PATH+"stencilsets/bpmn2.0jbpm/icons/activity/list/type.service.png",disabled:false,disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.updateTaskType(d[0],"Service")
}).bind(this)});
this.morphMenu.add(b)
}if(d[0].properties["oryx-tasktype"]!="Business Rule"){var b=new Ext.menu.Item({text:"Business Rule Task",icon:ORYX.BASE_FILE_PATH+"stencilsets/bpmn2.0jbpm/icons/activity/list/type.business.rule.png",disabled:false,disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.updateTaskType(d[0],"Business Rule")
}).bind(this)});
this.morphMenu.add(b)
}if(d[0].properties["oryx-tasktype"]!="Script"){var b=new Ext.menu.Item({text:"Script Task",icon:ORYX.BASE_FILE_PATH+"stencilsets/bpmn2.0jbpm/icons/activity/list/type.script.png",disabled:false,disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.updateTaskType(d[0],"Script")
}).bind(this)});
this.morphMenu.add(b)
}}a=a.sortBy(function(e){return e.position()
});
a.each((function(f){if(!(d[0].properties["oryx-nomorph"]&&d[0].properties["oryx-nomorph"]=="true")){var e=new Ext.menu.Item({text:f.title(),icon:f.icon(),disabled:f.id()==d[0].getStencil().id(),disabledClass:ORYX.CONFIG.MORPHITEM_DISABLED,handler:(function(){this.morphShape(d[0],f)
}).bind(this)});
this.morphMenu.add(e)
}}).bind(this));
this.morphButton.prepareToShow()
},showStencilButtons:function(g){if(g.length!=1){return
}var f=this.facade.getStencilSets()[g[0].getStencil().namespace()];
var c=this.facade.getRules().outgoingEdgeStencils({canvas:this.facade.getCanvas(),sourceShape:g[0]});
var a=new Array();
var d=new Array();
var e=this.facade.getRules().containsMorphingRules();
c.each((function(i){if(e){if(this.baseMorphStencils.include(i)){var j=true
}else{var h=this.facade.getRules().morphStencils({stencil:i});
var j=!h.any((function(k){if(this.baseMorphStencils.include(k)&&c.include(k)){return true
}return d.include(k)
}).bind(this))
}}if(j||!e){if(this.createdButtons[i.namespace()+i.type()+i.id()]){this.createdButtons[i.namespace()+i.type()+i.id()].prepareToShow()
}d.push(i)
}a=a.concat(this.facade.getRules().targetStencils({canvas:this.facade.getCanvas(),sourceShape:g[0],edgeStencil:i}))
}).bind(this));
a.uniq();
var b=new Array();
a.each((function(j){if(e){if(j.type()==="edge"){return
}if(!this.facade.getRules().showInShapeMenu(j)){return
}if(!this.baseMorphStencils.include(j)){var h=this.facade.getRules().morphStencils({stencil:j});
if(h.size()==0){return
}var i=h.any((function(k){if(this.baseMorphStencils.include(k)&&a.include(k)){return true
}return b.include(k)
}).bind(this));
if(i){return
}}}if(this.createdButtons[j.namespace()+j.type()+j.id()]){this.createdButtons[j.namespace()+j.type()+j.id()].prepareToShow()
}b.push(j)
}).bind(this))
},beforeDragOver:function(m,l,b){if(this.shapeMenu.isVisible){this.hideShapeMenu()
}var k=this.facade.eventCoordinates(b.browserEvent);
var r=this.facade.getCanvas().getAbstractShapesAtPosition(k);
if(r.length<=0){return false
}var d=r.last();
if(this._lastOverElement==d){return false
}else{var h=Ext.dd.Registry.getHandle(l.DDM.currentTarget);
if(h.backupOptions){for(key in h.backupOptions){h[key]=h.backupOptions[key]
}delete h.backupOptions
}var n=this.facade.getStencilSets()[h.namespace];
var p=n.stencil(h.type);
var q=r.last();
if(p.type()==="node"){var c=this.facade.getRules().canContain({containingShape:q,containedStencil:p});
if(!c){var o=this.facade.getRules().morphStencils({stencil:p});
for(var g=0;
g<o.size();
g++){c=this.facade.getRules().canContain({containingShape:q,containedStencil:o[g]});
if(c){h.backupOptions=Object.clone(h);
h.type=o[g].id();
h.namespace=o[g].namespace();
break
}}}this._currentReference=c?q:undefined
}else{var j=q,e=q;
var f=false;
while(!f&&j&&!(j instanceof ORYX.Core.Canvas)){q=j;
f=this.facade.getRules().canConnect({sourceShape:this.currentShapes.first(),edgeStencil:p,targetShape:j});
j=j.parent
}if(!f){q=e;
var o=this.facade.getRules().morphStencils({stencil:p});
for(var g=0;
g<o.size();
g++){var j=q;
var f=false;
while(!f&&j&&!(j instanceof ORYX.Core.Canvas)){q=j;
f=this.facade.getRules().canConnect({sourceShape:this.currentShapes.first(),edgeStencil:o[g],targetShape:j});
j=j.parent
}if(f){h.backupOptions=Object.clone(h);
h.type=o[g].id();
h.namespace=o[g].namespace();
break
}else{q=e
}}}this._currentReference=f?q:undefined
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeMenu",elements:[q],color:this._currentReference?ORYX.CONFIG.SELECTION_VALID_COLOR:ORYX.CONFIG.SELECTION_INVALID_COLOR});
var a=m.getProxy();
a.setStatus(this._currentReference?a.dropAllowed:a.dropNotAllowed);
a.sync()
}this._lastOverElement=d;
return false
},afterDragging:function(i,f,b){if(!(this.currentShapes instanceof Array)||this.currentShapes.length<=0){return
}var e=this.currentShapes;
this._lastOverElement=undefined;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeMenu"});
var h=i.getProxy();
if(h.dropStatus==h.dropNotAllowed){return this.facade.updateSelection()
}if(!this._currentReference){return
}var d=Ext.dd.Registry.getHandle(f.DDM.currentTarget);
d.parent=this._currentReference;
var p=b.getXY();
var j={x:p[0],y:p[1]};
var l=this.facade.getCanvas().node.getScreenCTM();
j.x-=l.e;
j.y-=l.f;
j.x/=l.a;
j.y/=l.d;
j.x-=document.documentElement.scrollLeft;
j.y-=document.documentElement.scrollTop;
var o=this._currentReference.absoluteXY();
j.x-=o.x;
j.y-=o.y;
if(!b.ctrlKey){var k=this.currentShapes[0].bounds.center();
if(20>Math.abs(k.x-j.x)){j.x=k.x
}if(20>Math.abs(k.y-j.y)){j.y=k.y
}}d.position=j;
d.connectedShape=this.currentShapes[0];
if(d.connectingType){var n=this.facade.getStencilSets()[d.namespace];
var m=n.stencil(d.type);
var g={sourceShape:this.currentShapes[0],targetStencil:m};
d.connectingType=this.facade.getRules().connectMorph(g).id()
}if(ORYX.CONFIG.SHAPEMENU_DISABLE_CONNECTED_EDGE===true){delete d.connectingType
}var c=new ORYX.Plugins.ShapeMenuPlugin.CreateCommand(Object.clone(d),this._currentReference,j,this);
this.facade.executeCommands([c]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SHAPE_MENU_CLOSE,source:e,destination:this.currentShapes});
if(d.backupOptions){for(key in d.backupOptions){d[key]=d.backupOptions[key]
}delete d.backupOptions
}this._currentReference=undefined
},newShape:function(e,f){var a=this.facade.getStencilSets()[e.namespace];
var d=a.stencil(e.type);
if(this.facade.getRules().canContain({containingShape:this.currentShapes.first().parent,containedStencil:d})){e.connectedShape=this.currentShapes[0];
e.parent=this.currentShapes.first().parent;
e.containedStencil=d;
var b={sourceShape:this.currentShapes[0],targetStencil:d};
var c=this.facade.getRules().connectMorph(b);
if(!c){return
}e.connectingType=c.id();
if(ORYX.CONFIG.SHAPEMENU_DISABLE_CONNECTED_EDGE===true){delete e.connectingType
}var g=new ORYX.Plugins.ShapeMenuPlugin.CreateCommand(e,undefined,undefined,this);
this.facade.executeCommands([g])
}},updateTaskType:function(a,b){if(a&&b){a.setProperty("oryx-tasktype",b);
a.setProperty("oryx-multipleinstance",false);
a.refresh();
this.facade.setSelection([]);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.facade.setSelection([a]);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_LOADED,elements:[a]})
}},morphShape:function(a,b){var d=ORYX.Core.Command.extend({construct:function(e,g,f){this.shape=e;
this.stencil=g;
this.facade=f
},execute:function(){var m=this.shape;
var q=this.stencil;
var l=m.resourceId;
var h=m.serialize();
q.properties().each((function(r){if(r.readonly()){h=h.reject(function(s){if(s.prefix==="oryx"&&(s.name==="type"||s.name==="tasktype")){return true
}return s.name==r.id()
})
}}).bind(this));
if(this.newShape){newShape=this.newShape;
this.facade.getCanvas().add(newShape)
}else{newShape=this.facade.createShape({type:q.id(),namespace:q.namespace(),resourceId:l})
}var k=h.find(function(r){return(r.prefix==="oryx"&&r.name==="bounds")
});
var n=null;
if(!this.facade.getRules().preserveBounds(m.getStencil())){var e=k.value.split(",");
if(parseInt(e[0],10)>parseInt(e[2],10)){var i=e[0];
e[0]=e[2];
e[2]=i;
i=e[1];
e[1]=e[3];
e[3]=i
}e[2]=parseInt(e[0],10)+newShape.bounds.width();
e[3]=parseInt(e[1],10)+newShape.bounds.height();
k.value=e.join(",")
}else{var p=m.bounds.height();
var f=m.bounds.width();
if(newShape.minimumSize){if(m.bounds.height()<newShape.minimumSize.height){p=newShape.minimumSize.height
}if(m.bounds.width()<newShape.minimumSize.width){f=newShape.minimumSize.width
}}if(newShape.maximumSize){if(m.bounds.height()>newShape.maximumSize.height){p=newShape.maximumSize.height
}if(m.bounds.width()>newShape.maximumSize.width){f=newShape.maximumSize.width
}}n={a:{x:m.bounds.a.x,y:m.bounds.a.y},b:{x:m.bounds.a.x+f,y:m.bounds.a.y+p}}
}var o=m.bounds.center();
if(n!==null){newShape.bounds.set(n)
}this.setRelatedDockers(m,newShape);
var j=m.node.parentNode;
var g=m.node.nextSibling;
this.facade.deleteShape(m);
newShape.deserialize(h);
if(m.getStencil().property("oryx-bgcolor")&&m.properties["oryx-bgcolor"]&&m.getStencil().property("oryx-bgcolor").value().toUpperCase()==m.properties["oryx-bgcolor"].toUpperCase()){if(newShape.getStencil().property("oryx-bgcolor")){newShape.setProperty("oryx-bgcolor",newShape.getStencil().property("oryx-bgcolor").value())
}}if(n!==null){newShape.bounds.set(n)
}if(newShape.getStencil().type()==="edge"||(newShape.dockers.length==0||!newShape.dockers[0].getDockedShape())){newShape.bounds.centerMoveTo(o)
}if(newShape.getStencil().type()==="node"&&(newShape.dockers.length==0||!newShape.dockers[0].getDockedShape())){this.setRelatedDockers(newShape,newShape)
}if(g){j.insertBefore(newShape.node,g)
}else{j.appendChild(newShape.node)
}this.facade.setSelection([newShape]);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.newShape=newShape
},rollback:function(){if(!this.shape||!this.newShape||!this.newShape.parent){return
}this.newShape.parent.add(this.shape);
this.setRelatedDockers(this.newShape,this.shape);
this.facade.deleteShape(this.newShape);
this.facade.setSelection([this.shape]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},setRelatedDockers:function(e,f){if(e.getStencil().type()==="node"){(e.incoming||[]).concat(e.outgoing||[]).each(function(g){g.dockers.each(function(j){if(j.getDockedShape()==e){var i=Object.clone(j.referencePoint);
var k={x:i.x*f.bounds.width()/e.bounds.width(),y:i.y*f.bounds.height()/e.bounds.height()};
j.setDockedShape(f);
j.setReferencePoint(k);
if(g instanceof ORYX.Core.Edge){j.bounds.centerMoveTo(k)
}else{var h=e.absoluteXY();
j.bounds.centerMoveTo({x:k.x+h.x,y:k.y+h.y})
}}})
});
if(e.dockers.length>0&&e.dockers.first().getDockedShape()){f.dockers.first().setDockedShape(e.dockers.first().getDockedShape());
f.dockers.first().setReferencePoint(Object.clone(e.dockers.first().referencePoint))
}}else{f.dockers.first().setDockedShape(e.dockers.first().getDockedShape());
f.dockers.first().setReferencePoint(e.dockers.first().referencePoint);
f.dockers.last().setDockedShape(e.dockers.last().getDockedShape());
f.dockers.last().setReferencePoint(e.dockers.last().referencePoint)
}}});
var c=new d(a,b,this.facade);
this.facade.executeCommands([c])
}};
ORYX.Plugins.ShapeMenuPlugin=ORYX.Plugins.AbstractPlugin.extend(ORYX.Plugins.ShapeMenuPlugin);
ORYX.Plugins.ShapeMenu={construct:function(a){this.bounds=undefined;
this.shapes=undefined;
this.buttons=[];
this.isVisible=false;
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",$(a),["div",{id:ORYX.Editor.provideId(),"class":"Oryx_ShapeMenu"}]);
this.alignContainers=new Hash();
this.numberOfButtonsPerLevel=new Hash()
},addButton:function(b){this.buttons.push(b);
if(!this.alignContainers[b.align]){this.alignContainers[b.align]=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.node,["div",{"class":b.align}]);
this.node.appendChild(this.alignContainers[b.align]);
var a=false;
this.alignContainers[b.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,this.hoverAlignContainer.bind(this,b.align),a);
this.alignContainers[b.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT,this.resetAlignContainer.bind(this,b.align),a);
this.alignContainers[b.align].addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.hoverAlignContainer.bind(this,b.align),a)
}this.alignContainers[b.align].appendChild(b.node)
},deleteButton:function(a){this.buttons=this.buttons.without(a);
this.node.removeChild(a.node)
},removeAllButtons:function(){var a=this;
this.buttons.each(function(b){if(b.node&&b.node.parentNode){b.node.parentNode.removeChild(b.node)
}});
this.buttons=[]
},closeAllButtons:function(){this.buttons.each(function(a){a.prepareToHide()
});
this.isVisible=false
},show:function(e){if(e.length<=0){return
}this.shapes=e;
var f=undefined;
var h=undefined;
this.shapes.each(function(p){var o=p.node.getScreenCTM();
var q=p.absoluteXY();
o.e=o.a*q.x;
o.f=o.d*q.y;
h=new ORYX.Core.Bounds(o.e,o.f,o.e+o.a*p.bounds.width(),o.f+o.d*p.bounds.height());
if(!f){f=h
}else{f.include(h)
}});
this.bounds=f;
var c=this.bounds;
var k=this.bounds.upperLeft();
var g=0,d=0;
var i=0,j=0;
var b=0,l;
var m=0;
rightButtonGroup=0;
var n=22;
this.getWillShowButtons().sortBy(function(a){return a.group
});
this.getWillShowButtons().each(function(o){var p=this.getNumberOfButtonsPerLevel(o.align);
if(o.align==ORYX.CONFIG.SHAPEMENU_LEFT){if(o.group!=d){g=0;
d=o.group
}var a=Math.floor(g/p);
var q=g%p;
o.setLevel(a);
o.setPosition(k.x-5-(a+1)*n,k.y+p*o.group*n+o.group*0.3*n+q*n);
g++
}else{if(o.align==ORYX.CONFIG.SHAPEMENU_TOP){if(o.group!=j){i=0;
j=o.group
}var a=i%p;
var q=Math.floor(i/p);
o.setLevel(q);
o.setPosition(k.x+p*o.group*n+o.group*0.3*n+a*n,k.y-5-(q+1)*n);
i++
}else{if(o.align==ORYX.CONFIG.SHAPEMENU_BOTTOM){if(o.group!=l){b=0;
l=o.group
}var a=b%p;
var q=Math.floor(b/p);
o.setLevel(q);
o.setPosition(k.x+p*o.group*n+o.group*0.3*n+a*n,k.y+c.height()+5+q*n);
b++
}else{if(o.group!=rightButtonGroup){m=0;
rightButtonGroup=o.group
}var a=Math.floor(m/p);
var q=m%p;
o.setLevel(a);
o.setPosition(k.x+c.width()+5+a*n,k.y+p*o.group*n+o.group*0.3*n+q*n-5);
m++
}}}o.show()
}.bind(this));
this.isVisible=true
},hide:function(){this.buttons.each(function(a){a.hide()
});
this.isVisible=false
},hoverAlignContainer:function(b,a){this.buttons.each(function(c){if(c.align==b){c.showOpaque()
}})
},resetAlignContainer:function(b,a){this.buttons.each(function(c){if(c.align==b){c.showTransparent()
}})
},isHover:function(){return this.buttons.any(function(a){return a.isHover()
})
},getWillShowButtons:function(){return this.buttons.findAll(function(a){return a.willShow
})
},getButtons:function(b,a){return this.getWillShowButtons().findAll(function(c){return c.align==b&&(a===undefined||c.group==a)
})
},setNumberOfButtonsPerLevel:function(b,a){this.numberOfButtonsPerLevel[b]=a
},getNumberOfButtonsPerLevel:function(a){if(this.numberOfButtonsPerLevel[a]){return Math.min(this.getButtons(a,0).length,this.numberOfButtonsPerLevel[a])
}else{return 1
}}};
ORYX.Plugins.ShapeMenu=Clazz.extend(ORYX.Plugins.ShapeMenu);
ORYX.Plugins.ShapeMenuButton={construct:function(b){if(b){this.option=b;
if(!this.option.arguments){this.option.arguments=[]
}}else{}this.parentId=this.option.id?this.option.id:null;
var e=this.option.caption?"Oryx_button_with_caption":"Oryx_button";
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",$(this.parentId),["div",{"class":e}]);
var c={src:this.option.icon};
if(this.option.msg){c.title=this.option.msg
}if(this.option.icon){ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.node,["img",c])
}if(this.option.caption){var d=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.node,["span"]);
ORYX.Editor.graft("http://www.w3.org/1999/xhtml",d,this.option.caption)
}var a=false;
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,this.hover.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT,this.reset.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN,this.activate.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.hover.bind(this),a);
this.node.addEventListener("click",this.trigger.bind(this),a);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.move.bind(this),a);
this.align=this.option.align?this.option.align:ORYX.CONFIG.SHAPEMENU_RIGHT;
this.group=this.option.group?this.option.group:0;
this.hide();
this.dragStart=false;
this.isVisible=false;
this.willShow=false;
this.resetTimer
},hide:function(){this.node.style.display="none";
this.isVisible=false
},show:function(){this.node.style.display="";
this.node.style.opacity=this.opacity;
this.isVisible=true
},showOpaque:function(){this.node.style.opacity=1
},showTransparent:function(){this.node.style.opacity=this.opacity
},prepareToShow:function(){this.willShow=true
},prepareToHide:function(){this.willShow=false;
this.hide()
},setPosition:function(a,b){this.node.style.left=a+"px";
this.node.style.top=b+"px"
},setLevel:function(a){if(a==0){this.opacity=0.5
}else{if(a==1){this.opacity=0.2
}else{this.opacity=0
}}},setChildWidth:function(a){this.childNode.style.width=a+"px"
},reset:function(a){window.clearTimeout(this.resetTimer);
this.resetTimer=window.setTimeout(this.doReset.bind(this),100);
if(this.option.resetcallback){this.option.arguments.push(a);
var b=this.option.resetcallback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}},doReset:function(){if(this.node.hasClassName("Oryx_down")){this.node.removeClassName("Oryx_down")
}if(this.node.hasClassName("Oryx_hover")){this.node.removeClassName("Oryx_hover")
}},activate:function(a){this.node.addClassName("Oryx_down");
this.dragStart=true
},isHover:function(){return this.node.hasClassName("Oryx_hover")?true:false
},hover:function(a){window.clearTimeout(this.resetTimer);
this.resetTimer=null;
this.node.addClassName("Oryx_hover");
this.dragStart=false;
if(this.option.hovercallback){this.option.arguments.push(a);
var b=this.option.hovercallback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}},move:function(a){if(this.dragStart&&this.option.dragcallback){this.option.arguments.push(a);
var b=this.option.dragcallback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}},trigger:function(a){if(this.option.callback){this.option.arguments.push(a);
var b=this.option.callback.apply(this,this.option.arguments);
this.option.arguments.remove(a)
}this.dragStart=false
},toString:function(){return"HTML-Button "+this.id
}};
ORYX.Plugins.ShapeMenuButton=Clazz.extend(ORYX.Plugins.ShapeMenuButton);
ORYX.Plugins.ShapeMenuPlugin.CreateCommand=ORYX.Core.Command.extend({construct:function(c,b,a,d){this.option=c;
this.currentReference=b;
this.position=a;
this.plugin=d;
this.shape;
this.edge;
this.targetRefPos;
this.sourceRefPos;
this.connectedShape=c.connectedShape;
this.connectingType=c.connectingType;
this.namespace=c.namespace;
this.type=c.type;
this.containedStencil=c.containedStencil;
this.parent=c.parent;
this.currentReference=b;
this.shapeOptions=c.shapeOptions
},execute:function(){var d=false;
if(this.shape){if(this.shape instanceof ORYX.Core.Node){this.parent.add(this.shape);
if(this.edge){this.plugin.facade.getCanvas().add(this.edge);
this.edge.dockers.first().setDockedShape(this.connectedShape);
this.edge.dockers.first().setReferencePoint(this.sourceRefPos);
this.edge.dockers.last().setDockedShape(this.shape);
this.edge.dockers.last().setReferencePoint(this.targetRefPos)
}this.plugin.facade.setSelection([this.shape])
}else{if(this.shape instanceof ORYX.Core.Edge){this.plugin.facade.getCanvas().add(this.shape);
this.shape.dockers.first().setDockedShape(this.connectedShape);
this.shape.dockers.first().setReferencePoint(this.sourceRefPos)
}}d=true
}else{this.shape=this.plugin.facade.createShape(this.option);
this.edge=(!(this.shape instanceof ORYX.Core.Edge))?this.shape.getIncomingShapes().first():undefined
}if(this.currentReference&&this.position){if(this.shape instanceof ORYX.Core.Edge){if(!(this.currentReference instanceof ORYX.Core.Canvas)){this.shape.dockers.last().setDockedShape(this.currentReference);
var g=this.currentReference.absoluteXY();
var e={x:this.position.x-g.x,y:this.position.y-g.y};
this.shape.dockers.last().setReferencePoint(this.currentReference.bounds.midPoint())
}else{this.shape.dockers.last().bounds.centerMoveTo(this.position)
}this.sourceRefPos=this.shape.dockers.first().referencePoint;
this.targetRefPos=this.shape.dockers.last().referencePoint
}else{if(this.edge){this.sourceRefPos=this.edge.dockers.first().referencePoint;
this.targetRefPos=this.edge.dockers.last().referencePoint
}}}else{var c=this.containedStencil;
var a=this.connectedShape;
var f=a.bounds;
var b=this.shape.bounds;
var h=f.center();
if(c.defaultAlign()==="north"){h.y-=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.height()/2)
}else{if(c.defaultAlign()==="northeast"){h.x+=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y-=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{if(c.defaultAlign()==="southeast"){h.x+=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y+=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{if(c.defaultAlign()==="south"){h.y+=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.height()/2)
}else{if(c.defaultAlign()==="southwest"){h.x-=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y+=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{if(c.defaultAlign()==="west"){h.x-=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.width()/2)
}else{if(c.defaultAlign()==="northwest"){h.x-=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.width()/2);
h.y-=(f.height()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET_CORNER+(b.height()/2)
}else{h.x+=(f.width()/2)+ORYX.CONFIG.SHAPEMENU_CREATE_OFFSET+(b.width()/2)
}}}}}}}this.shape.bounds.centerMoveTo(h);
if(this.shape instanceof ORYX.Core.Node){(this.shape.dockers||[]).each(function(i){i.bounds.centerMoveTo(h)
})
}this.position=h;
if(this.edge){this.sourceRefPos=this.edge.dockers.first().referencePoint;
this.targetRefPos=this.edge.dockers.last().referencePoint
}}this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection();
if(!d){if(this.edge){this.plugin.doLayout(this.edge)
}else{if(this.shape instanceof ORYX.Core.Edge){this.plugin.doLayout(this.shape)
}}}},rollback:function(){this.plugin.facade.deleteShape(this.shape);
if(this.edge){this.plugin.facade.deleteShape(this.edge)
}this.plugin.facade.setSelection(this.plugin.facade.getSelection().without(this.shape,this.edge))
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeRepository={facade:undefined,construct:function(c){this.facade=c;
this._currentParent;
this._canContain=undefined;
this._canAttach=undefined;
this._patternData;
this.shapeList=new Ext.tree.TreeNode({});
var a=new Ext.tree.TreePanel({cls:"shaperepository",loader:new Ext.tree.TreeLoader(),root:this.shapeList,autoScroll:true,rootVisible:false,lines:false,anchors:"0, -30"});
var d=this.facade.addToRegion("west",a,ORYX.I18N.ShapeRepository.title);
Ext.Ajax.request({url:ORYX.PATH+"stencilpatterns",method:"POST",success:function(f){try{this._patternData=Ext.decode(f.responseText)
}catch(g){ORYX.Log.error("Failed to retrieve Stencil Patterns Data :\n"+g)
}}.createDelegate(this),failure:function(){ORYX.Log.error("Failed to retrieve Stencil Patterns Data")
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID}});
var b=new Ext.dd.DragZone(this.shapeList.getUI().getEl(),{shadow:!Ext.isMac});
b.afterDragDrop=this.drop.bind(this,b);
b.beforeDragOver=this.beforeDragOver.bind(this,b);
b.beforeDragEnter=function(){this._lastOverElement=false;
return true
}.bind(this);
this.setStencilSets();
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_STENCIL_SET_LOADED,this.setStencilSets.bind(this))
},setStencilSets:function(){var a=this.shapeList.firstChild;
while(a){this.shapeList.removeChild(a);
a=this.shapeList.firstChild
}this.facade.getStencilSets().values().each((function(d){var b;
var f=d.title();
var c=d.extensions();
this.shapeList.appendChild(b=new Ext.tree.TreeNode({text:f,allowDrag:false,allowDrop:false,iconCls:"headerShapeRepImg",cls:"headerShapeRep",singleClickExpand:true}));
b.render();
b.expand();
var e=d.stencils(this.facade.getCanvas().getStencil(),this.facade.getRules());
var g=new Hash();
e=e.sortBy(function(h){return h.position()
});
e.each((function(j){if(j.hidden()){return
}var h=j.groups();
h.each((function(k){if(!g[k]){if(Ext.isIE){g[k]=new Ext.tree.TreeNode({text:k,allowDrag:false,allowDrop:false,iconCls:"headerShapeRepImg",cls:"headerShapeRepChild",singleClickExpand:true,expanded:true});
g[k].expand()
}else{g[k]=new Ext.tree.TreeNode({text:k,allowDrag:false,allowDrop:false,iconCls:"headerShapeRepImg",cls:"headerShapeRepChild",singleClickExpand:true})
}b.appendChild(g[k]);
g[k].render()
}this.createStencilTreeNode(g[k],j)
}).bind(this));
if(h.length==0){this.createStencilTreeNode(b,j)
}var i=ORYX.CONFIG.STENCIL_GROUP_ORDER();
b.sort(function(l,k){return i[d.namespace()][l.text]-i[d.namespace()][k.text]
})
}).bind(this))
}).bind(this))
},createStencilTreeNode:function(a,b){var d=new Ext.tree.TreeNode({text:b.title(),icon:decodeURIComponent(b.icon()),allowDrag:false,allowDrop:false,iconCls:"ShapeRepEntreeImg",cls:"ShapeRepEntree"});
a.appendChild(d);
d.render();
var c=d.getUI();
c.elNode.setAttributeNS(null,"title",b.description());
Ext.dd.Registry.register(c.elNode,{node:c.node,handles:[c.elNode,c.textNode].concat($A(c.elNode.childNodes)),isHandle:false,type:b.id(),title:b.title(),namespace:b.namespace()})
},drop:function(m,k,b){this._lastOverElement=undefined;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.added"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.attached"});
var l=m.getProxy();
if(l.dropStatus==l.dropNotAllowed){return
}if(!this._currentParent){return
}var h=Ext.dd.Registry.getHandle(k.DDM.currentTarget);
var s=b.getXY();
var o={x:s[0],y:s[1]};
var p=this.facade.getCanvas().node.getScreenCTM();
o.x-=p.e;
o.y-=p.f;
o.x/=p.a;
o.y/=p.d;
o.x-=document.documentElement.scrollLeft;
o.y-=document.documentElement.scrollTop;
var q=this._currentParent.absoluteXY();
o.x-=q.x;
o.y-=q.y;
h.position=o;
if(this._canAttach&&this._currentParent instanceof ORYX.Core.Node){h.parent=undefined
}else{h.parent=this._currentParent
}var f=ORYX.Core.Command.extend({construct:function(u,i,w,a,t,v){this.option=u;
this.currentParent=i;
this.canAttach=w;
this.position=a;
this.facade=t;
this.selection=this.facade.getSelection();
this.shape;
this.parent
},execute:function(){if(!this.shape){this.shape=this.facade.createShape(h);
this.parent=this.shape.parent
}else{this.parent.add(this.shape)
}if(this.canAttach&&this.currentParent instanceof ORYX.Core.Node&&this.shape.dockers.length>0){var a=this.shape.dockers[0];
if(this.currentParent.parent instanceof ORYX.Core.Node){this.currentParent.parent.add(a.parent)
}a.bounds.centerMoveTo(this.position);
a.setDockedShape(this.currentParent)
}if(j&&j.length>0&&this.shape instanceof ORYX.Core.Node){this.shape.setProperty("oryx-tasktype",j);
this.shape.refresh()
}this.facade.setSelection([this.shape]);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DROP_SHAPE,shape:this.shape})
},rollback:function(){this.facade.deleteShape(this.shape);
this.facade.setSelection(this.selection.without(this.shape));
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var g=this.facade.eventCoordinates(b.browserEvent);
var e=h.type.split("#");
var n=false;
if(ORYX.PREPROCESSING){var r=ORYX.PREPROCESSING.split(",");
for(var d=0;
d<r.length;
d++){if(r[d]==e[1]){n=true
}}}if(e[1].startsWith("wp-")&&!n){this.facade.raiseEvent({type:ORYX.CONFIG.CREATE_PATTERN,pid:e[1],pdata:this._patternData,pos:g})
}else{if(e[1].endsWith("Task")&&!n){var j=e[1];
j=j.substring(0,j.length-4);
h.type=e[0]+"#Task";
if(j.length<1){if(h.title=="User"||h.title=="Send"||h.title=="Receive"||h.title=="Manual"||h.title=="Service"||h.title=="Business Rule"||h.title=="Script"){j=h.title
}}var c=new f(h,this._currentParent,this._canAttach,g,this.facade,j);
this.facade.executeCommands([c])
}else{var c=new f(h,this._currentParent,this._canAttach,g,this.facade);
this.facade.executeCommands([c])
}}this._currentParent=undefined
},beforeDragOver:function(h,f,b){var e=this.facade.eventCoordinates(b.browserEvent);
var k=this.facade.getCanvas().getAbstractShapesAtPosition(e);
if(k.length<=0){var a=h.getProxy();
a.setStatus(a.dropNotAllowed);
a.sync();
return false
}var c=k.last();
if(k.lenght==1&&k[0] instanceof ORYX.Core.Canvas){return false
}else{var d=Ext.dd.Registry.getHandle(f.DDM.currentTarget);
var i=this.facade.getStencilSets()[d.namespace];
var j=i.stencil(d.type);
if(j.type()==="node"){var g=k.reverse().find(function(l){return(l instanceof ORYX.Core.Canvas||l instanceof ORYX.Core.Node||l instanceof ORYX.Core.Edge)
});
if(g!==this._lastOverElement){this._canAttach=undefined;
this._canContain=undefined
}if(g){if(!(g instanceof ORYX.Core.Canvas)&&g.isPointOverOffset(e.x,e.y)&&this._canAttach==undefined){this._canAttach=this.facade.getRules().canConnect({sourceShape:g,edgeStencil:j,targetStencil:j});
if(g&&g.properties["oryx-tasktype"]&&g.properties["oryx-tasktype"]=="Script"){this._canAttach=false
}if(this._canAttach){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeRepo.attached",elements:[g],style:ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,color:ORYX.CONFIG.SELECTION_VALID_COLOR});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.added"});
this._canContain=undefined
}}if(!(g instanceof ORYX.Core.Canvas)&&!g.isPointOverOffset(e.x,e.y)){this._canAttach=this._canAttach==false?this._canAttach:undefined
}if(this._canContain==undefined&&!this._canAttach){this._canContain=this.facade.getRules().canContain({containingShape:g,containedStencil:j});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"shapeRepo.added",elements:[g],color:this._canContain?ORYX.CONFIG.SELECTION_VALID_COLOR:ORYX.CONFIG.SELECTION_INVALID_COLOR});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"shapeRepo.attached"})
}this._currentParent=this._canContain||this._canAttach?g:undefined;
this._lastOverElement=g;
var a=h.getProxy();
a.setStatus(this._currentParent?a.dropAllowed:a.dropNotAllowed);
a.sync()
}}else{this._currentParent=this.facade.getCanvas();
var a=h.getProxy();
a.setStatus(a.dropAllowed);
a.sync()
}}return false
}};
ORYX.Plugins.ShapeRepository=Clazz.extend(ORYX.Plugins.ShapeRepository);
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}if(!ORYX.FieldEditors){ORYX.FieldEditors={}
}if(!ORYX.AssociationEditors){ORYX.AssociationEditors={}
}if(!ORYX.LabelProviders){ORYX.LabelProviders={}
}ORYX.Plugins.PropertyWindow={facade:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SHOW_PROPERTYWINDOW,this.init.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,this.onSelectionChanged.bind(this));
this.init()
},init:function(){this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",null,["div"]);
this.currentDateFormat;
this.popularProperties=[];
this.simulationProperties=[];
this.displayProperties=[];
this.properties=[];
this.shapeSelection=new Hash();
this.shapeSelection.shapes=new Array();
this.shapeSelection.commonProperties=new Array();
this.shapeSelection.commonPropertiesValues=new Hash();
this.updaterFlag=false;
this.columnModel=new Ext.grid.ColumnModel([{header:ORYX.I18N.PropertyWindow.name,dataIndex:"name",width:90,sortable:true,renderer:this.tooltipRenderer.bind(this),css:"font-weight: bold;"},{header:ORYX.I18N.PropertyWindow.value,dataIndex:"value",id:"propertywindow_column_value",width:110,editor:new Ext.form.TextField({allowBlank:true}),renderer:this.renderer.bind(this)},{header:ORYX.I18N.PropertyWindow.desk,dataIndex:"groupname",hidden:true,sortable:true}]);
this.dataSource=new Ext.data.GroupingStore({proxy:new Ext.data.MemoryProxy(this.properties),reader:new Ext.data.ArrayReader({},[{name:"groupname"},{name:"name"},{name:"value"},{name:"icons"},{name:"gridProperties"}]),sortInfo:{field:"name",direction:"ASC"},groupField:"groupname"});
this.dataSource.load();
this.grid=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,clicksToEdit:1,stripeRows:true,autoExpandColumn:"propertywindow_column_value",width:"auto",colModel:this.columnModel,enableHdMenu:false,view:new Ext.grid.GroupingView({forceFit:false,groupTextTpl:"{[values.rs.first().data.groupname]}"}),store:this.dataSource});
region=this.facade.addToRegion("east",new Ext.Panel({width:400,layout:"anchor",autoScroll:true,autoHeight:true,border:false,items:[this.grid],anchors:"0, -30"}),ORYX.I18N.PropertyWindow.title);
this.grid.on("beforeedit",this.beforeEdit,this,true);
this.grid.on("afteredit",this.afterEdit,this,true);
this.grid.view.on("refresh",this.hideMoreAttrs,this,true);
this.grid.enableColumnMove=false
},selectDiagram:function(){this.shapeSelection.shapes=[this.facade.getCanvas()];
this.setPropertyWindowTitle();
this.identifyCommonProperties();
this.createProperties()
},specialKeyDown:function(b,a){if(b instanceof Ext.form.TextArea&&a.button==ORYX.CONFIG.KEY_Code_enter){return false
}},tooltipRenderer:function(b,c,a){c.cellAttr='title="'+a.data.gridProperties.tooltip+'"';
return b
},renderer:function(b,c,a){this.tooltipRenderer(b,c,a);
if(a.data.gridProperties.labelProvider){return a.data.gridProperties.labelProvider(b)
}if(b instanceof Date){b=b.dateFormat(ORYX.I18N.PropertyWindow.dateFormat)
}else{if(String(b).search("<a href='")<0){b=String(b).gsub("<","&lt;");
b=String(b).gsub(">","&gt;");
b=String(b).gsub("%","&#37;");
b=String(b).gsub("&","&amp;");
if(a.data.gridProperties.type==ORYX.CONFIG.TYPE_COLOR){b="<div class='prop-background-color' style='background-color:"+b+"' />"
}a.data.icons.each(function(d){if(d.name==b){if(d.icon){b="<img src='"+d.icon+"' /> "+b
}}})
}}return b
},beforeEdit:function(c){var d=this.dataSource.getAt(c.row).data.gridProperties.editor;
var a=this.dataSource.getAt(c.row).data.gridProperties.renderer;
if(d){this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
c.grid.getColumnModel().setEditor(1,d);
d.field.row=c.row;
d.render(this.grid);
d.setSize(c.grid.getColumnModel().getColumnWidth(1),d.height)
}else{return false
}var b=this.dataSource.getAt(c.row).data.gridProperties.propId;
this.oldValues=new Hash();
this.shapeSelection.shapes.each(function(e){this.oldValues[e.getId()]=e.properties[b]
}.bind(this))
},afterEdit:function(e){e.grid.getStore().commitChanges();
var c=e.record.data.gridProperties.propId;
var h=this.shapeSelection.shapes;
var b=this.oldValues;
var f=e.value;
var d=this.facade;
var a=ORYX.Core.Command.extend({construct:function(){this.key=c;
this.selectedElements=h;
this.oldValues=b;
this.newValue=f;
this.facade=d
},execute:function(){this.selectedElements.each(function(i){if(!i.getStencil().property(this.key).readonly()){i.setProperty(this.key,this.newValue)
}}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.selectedElements.each(function(i){i.setProperty(this.key,this.oldValues[i.getId()])
}.bind(this));
this.facade.setSelection(this.selectedElements);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var g=new a();
this.facade.executeCommands([g]);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,elements:h,key:c,value:e.value})
},editDirectly:function(a,b){this.shapeSelection.shapes.each(function(d){if(!d.getStencil().property(a).readonly()){d.setProperty(a,b)
}}.bind(this));
var c=this.shapeSelection.shapes;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,elements:c,key:a,value:b});
this.facade.getCanvas().update()
},updateAfterInvalid:function(a){this.shapeSelection.shapes.each(function(b){if(!b.getStencil().property(a).readonly()){b.setProperty(a,this.oldValues[b.getId()]);
b.update()
}}.bind(this));
this.facade.getCanvas().update()
},dialogClosed:function(a){var b=this.field?this.field.row:this.row;
this.scope.afterEdit({grid:this.scope.grid,record:this.scope.grid.getStore().getAt(b),value:a});
this.scope.grid.startEditing(b,this.col)
},setPropertyWindowTitle:function(){if(this.shapeSelection.shapes.length==1){var a=this.shapeSelection.shapes.first().getStencil().title();
if(this.shapeSelection.shapes.first()&&this.shapeSelection.shapes.first().properties&&this.shapeSelection.shapes.first().properties["oryx-tasktype"]&&this.shapeSelection.shapes.first().properties["oryx-tasktype"].length>0){a=this.shapeSelection.shapes.first().properties["oryx-tasktype"]
}region.setTitle(ORYX.I18N.PropertyWindow.title+" ("+a+")")
}else{region.setTitle(ORYX.I18N.PropertyWindow.title+" ("+this.shapeSelection.shapes.length+" "+ORYX.I18N.PropertyWindow.selected+")")
}},setCommonPropertiesValues:function(){this.shapeSelection.commonPropertiesValues=new Hash();
this.shapeSelection.commonProperties.each(function(d){var c=d.prefix()+"-"+d.id();
var b=false;
var a=this.shapeSelection.shapes.first();
this.shapeSelection.shapes.each(function(e){if(a.properties[c]!=e.properties[c]){b=true
}}.bind(this));
if(!b){this.shapeSelection.commonPropertiesValues[c]=a.properties[c]
}}.bind(this))
},getStencilSetOfSelection:function(){var a=new Hash();
this.shapeSelection.shapes.each(function(b){a[b.getStencil().id()]=b.getStencil()
});
return a
},identifyCommonProperties:function(){this.shapeSelection.commonProperties.clear();
var d=this.getStencilSetOfSelection();
var c=d.values().first();
var b=d.values().without(c);
if(b.length==0){this.shapeSelection.commonProperties=c.properties()
}else{var a=new Hash();
c.properties().each(function(e){a[e.namespace()+"-"+e.id()+"-"+e.type()]=e
});
b.each(function(e){var f=new Hash();
e.properties().each(function(g){if(a[g.namespace()+"-"+g.id()+"-"+g.type()]){f[g.namespace()+"-"+g.id()+"-"+g.type()]=g
}});
a=f
});
this.shapeSelection.commonProperties=a.values()
}},onSelectionChanged:function(a){this.grid.stopEditing();
this.shapeSelection.shapes=a.elements;
if(a.elements){if(a.elements.length==0){this.shapeSelection.shapes=[this.facade.getCanvas()]
}}else{this.shapeSelection.shapes=[this.facade.getCanvas()]
}if(a.subSelection){this.shapeSelection.shapes=[a.subSelection]
}this.setPropertyWindowTitle();
this.identifyCommonProperties();
this.setCommonPropertiesValues();
this.createProperties()
},createProperties:function(){this.properties=[];
this.popularProperties=[];
this.simulationProperties=[];
this.displayProperties=[];
if(this.shapeSelection.commonProperties){this.shapeSelection.commonProperties.each((function(p,F){var t=p.prefix()+"-"+p.id();
var q=p.title();
var X=[];
var C=this.shapeSelection.commonPropertiesValues[t];
var N=undefined;
var K=null;
var G=false;
var O=ORYX.FieldEditors[p.type()];
if(O!==undefined){N=O.init.bind(this,t,p,X,F)();
if(N==null){return
}N.on("beforehide",this.facade.enableEvent.bind(this,ORYX.CONFIG.EVENT_KEYDOWN));
N.on("specialkey",this.specialKeyDown.bind(this))
}else{if(!p.readonly()){switch(p.type()){case ORYX.CONFIG.TYPE_STRING:if(p.wrapLines()){var f=new Ext.form.TextArea({alignment:"tl-tl",allowBlank:p.optional(),msgTarget:"title",maxLength:p.length()});
f.on("keyup",function(j,i){this.editDirectly(t,j.getValue())
}.bind(this));
N=new Ext.Editor(f)
}else{var D=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length()});
D.on("keyup",function(i,j){this.editDirectly(t,i.getValue())
}.bind(this));
D.on("blur",function(i){if(!i.isValid(false)){this.updateAfterInvalid(t)
}}.bind(this));
D.on("specialkey",function(i,j){if(!i.isValid(false)){this.updateAfterInvalid(t)
}}.bind(this));
N=new Ext.Editor(D)
}break;
case ORYX.CONFIG.TYPE_BOOLEAN:var n=new Ext.form.Checkbox();
n.on("check",function(j,i){this.editDirectly(t,i)
}.bind(this));
N=new Ext.Editor(n);
break;
case ORYX.CONFIG.TYPE_INTEGER:var z=new Ext.form.NumberField({allowBlank:p.optional(),allowDecimals:false,msgTarget:"title",minValue:p.min(),maxValue:p.max()});
z.on("keyup",function(i,j){this.editDirectly(t,i.getValue())
}.bind(this));
N=new Ext.Editor(z);
break;
case ORYX.CONFIG.TYPE_FLOAT:var z=new Ext.form.NumberField({allowBlank:p.optional(),allowDecimals:true,msgTarget:"title",minValue:p.min(),maxValue:p.max()});
z.on("keyup",function(i,j){this.editDirectly(t,i.getValue())
}.bind(this));
N=new Ext.Editor(z);
break;
case ORYX.CONFIG.TYPE_COLOR:var V=new Ext.ux.ColorField({allowBlank:p.optional(),msgTarget:"title",facade:this.facade});
N=new Ext.Editor(V);
break;
case ORYX.CONFIG.TYPE_CHOICE:var v=p.items();
var y=[];
if(p.id()=="tasktype"&&ORYX.CALCULATE_CURRENT_PERSPECTIVE()==ORYX.RULEFLOW_PERSPECTIVE){v.each(function(i){if(i.value()==C){C=i.title()
}if(i.refToView()[0]){G=true
}if(i.value()=="Business Rule"||i.value()=="Script"||i.value()=="None"){y.push([i.icon(),i.title(),i.value()]);
X.push({name:i.title(),icon:i.icon()})
}})
}else{v.each(function(i){if(i.value()==C){C=i.title()
}if(i.refToView()[0]){G=true
}y.push([i.icon(),i.title(),i.value()]);
X.push({name:i.title(),icon:i.icon()})
})
}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(k,i,j){this.editDirectly(t,k.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICCHOICE:var v=p.items();
var y=[];
v.each(function(ac){if(ac.value()==C){C=ac.title()
}if(ac.refToView()[0]){G=true
}y.push(["","",""]);
var aa=ORYX.EDITOR.getSerializedJSON();
var ab=jsonPath(aa.evalJSON(),ac.value());
if(ab){if(ab.toString().length>0){for(var Z=0;
Z<ab.length;
Z++){var ad=ab[Z].split(",");
for(var Y=0;
Y<ad.length;
Y++){if(ad[Y].indexOf(":")>0){var k=ad[Y].split(":");
y.push([ac.icon(),k[0],k[0]])
}else{y.push([ac.icon(),ad[Y],ad[Y]])
}}}}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.PropertyWindow.noDataAvailableForProp,title:""})
}X.push({name:ac.title(),icon:ac.icon()})
});
var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(k,i,j){this.editDirectly(t,k.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICDATAINPUT:var y=[];
var r=ORYX.EDITOR._pluginFacade.getSelection();
if(r&&r.length==1){var u=r.first();
var s=u.resourceId;
var W=ORYX.EDITOR.getSerializedJSON();
y.push(["","",""]);
var P=jsonPath(W.evalJSON(),"$.childShapes.*");
for(var U=0;
U<P.length;
U++){var h=P[U];
if(h.resourceId==s){var Q=h.properties.datainputset;
var B=Q.split(",");
for(var S=0;
S<B.length;
S++){var m=B[S];
if(m.indexOf(":")>0){var a=m.split(":");
y.push(["",a[0],a[0]])
}else{y.push(["",m,m])
}}}}}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(k,i,j){this.editDirectly(t,k.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICDATAOUTPUT:var y=[];
var r=ORYX.EDITOR._pluginFacade.getSelection();
if(r&&r.length==1){var u=r.first();
var s=u.resourceId;
var W=ORYX.EDITOR.getSerializedJSON();
y.push(["","",""]);
var P=jsonPath(W.evalJSON(),"$.childShapes.*");
for(var U=0;
U<P.length;
U++){var h=P[U];
if(h.resourceId==s){var e=h.properties.dataoutputset;
var g=e.split(",");
for(var R=0;
R<g.length;
R++){var m=g[R];
if(m.indexOf(":")>0){var a=m.split(":");
y.push(["",a[0],a[0]])
}else{y.push(["",m,m])
}}}}}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(k,i,j){this.editDirectly(t,k.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DYNAMICGATEWAYCONNECTIONS:var T=ORYX.Config.FACADE.getSelection();
var y=[];
if(T&&T.length==1){var u=T.first();
var s=u.resourceId;
var W=ORYX.EDITOR.getSerializedJSON();
var x=new XMLHttpRequest;
var d=ORYX.PATH+"processinfo";
var c="uuid="+ORYX.UUID+"&ppdata="+ORYX.PREPROCESSING+"&profile="+ORYX.PROFILE+"&gatewayid="+s+"&json="+encodeURIComponent(W);
x.open("POST",d,false);
x.setRequestHeader("Content-type","application/x-www-form-urlencoded");
x.send(c);
if(x.status==200){var J=x.responseText.evalJSON();
for(var U=0;
U<J.length;
U++){var h=J[U];
y.push(["",h.sequenceflowinfo,h.sequenceflowinfo])
}}else{ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorDetOutConnections,title:""})
}}var b=new Ext.data.SimpleStore({fields:[{name:"icon"},{name:"title"},{name:"value"}],data:y});
var o=new Ext.form.ComboBox({editable:false,tpl:'<tpl for="."><div class="x-combo-list-item">{[(values.icon) ? "<img src=\'" + values.icon + "\' />" : ""]} {title}</div></tpl>',store:b,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true});
o.on("select",function(k,i,j){this.editDirectly(t,k.getValue())
}.bind(this));
N=new Ext.Editor(o);
break;
case ORYX.CONFIG.TYPE_DATE:var I=ORYX.I18N.PropertyWindow.dateFormat;
if(!(C instanceof Date)){C=Date.parseDate(C,I)
}N=new Ext.Editor(new Ext.form.DateField({allowBlank:p.optional(),format:I,msgTarget:"title"}));
break;
case ORYX.CONFIG.TYPE_TEXT:var E=new Ext.form.ComplexTextField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_VARDEF:var E=new Ext.form.ComplexVardefField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_EXPRESSION:var E=new Ext.form.ConditionExpressionEditorField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_CALLEDELEMENT:var E=new Ext.form.ComplexCalledElementField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_CUSTOM:var E=new Ext.form.ComplexCustomField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade,title:p.title(),attr:C});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_ACTION:var E=new Ext.form.ComplexActionsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_GLOBAL:var E=new Ext.form.ComplexGlobalsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_IMPORT:var E=new Ext.form.ComplexImportsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_REASSIGNMENT:var E=new Ext.form.ComplexReassignmentField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_NOTIFICATIONS:var E=new Ext.form.ComplexNotificationsField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAINPUT:var E=new Ext.form.ComplexDataInputField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAINPUT_SINGLE:var E=new Ext.form.ComplexDataInputFieldSingle({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAOUTPUT:var E=new Ext.form.ComplexDataOutputField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAOUTPUT_SINGLE:var E=new Ext.form.ComplexDataOutputFieldSingle({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_DATAASSIGNMENT:var E=new Ext.form.ComplexDataAssignmenField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade,shapes:this.shapeSelection.shapes});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_VISUALDATAASSIGNMENTS:var E=new Ext.form.ComplexVisualDataAssignmentField({allowBlank:p.optional(),dataSource:this.dataSource,grid:this.grid,row:F,facade:this.facade,shapes:this.shapeSelection.shapes});
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case ORYX.CONFIG.TYPE_COMPLEX:var E=new Ext.form.ComplexListField({allowBlank:p.optional()},p.complexItems(),t,this.facade);
E.on("dialogClosed",this.dialogClosed,{scope:this,row:F,col:1,field:E});
N=new Ext.Editor(E);
break;
case"CPNString":var D=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length(),enableKeyEvents:true});
D.on("keyup",function(i,j){this.editDirectly(t,i.getValue())
}.bind(this));
N=new Ext.Editor(D);
break;
default:var D=new Ext.form.TextField({allowBlank:p.optional(),msgTarget:"title",maxLength:p.length(),enableKeyEvents:true});
D.on("keyup",function(i,j){this.editDirectly(t,i.getValue())
}.bind(this));
N=new Ext.Editor(D)
}N.on("beforehide",this.facade.enableEvent.bind(this,ORYX.CONFIG.EVENT_KEYDOWN));
N.on("specialkey",this.specialKeyDown.bind(this))
}else{if(p.type()===ORYX.CONFIG.TYPE_URL||p.type()===ORYX.CONFIG.TYPE_DIAGRAM_LINK){C=String(C).search("http")!==0?("http://"+C):C;
C="<a href='"+C+"' target='_blank'>"+C.split("://")[1]+"</a>"
}}}if((p.visible()&&p.visible()==true)&&p.hidden()!=true&&(p.id()!="origbordercolor"&&p.id()!="origbgcolor"&&p.id()!="isselectable")){var H=true;
if(this.shapeSelection.shapes.length==1){if(p.fortasktypes()&&p.fortasktypes().length>0){var l=false;
var A=p.fortasktypes().split("|");
for(var U=0;
U<A.size();
U++){if(A[U]==this.shapeSelection.shapes.first().properties["oryx-tasktype"]){l=true
}}if(!l){H=false
}}if(p.ifproptrue()&&p.ifproptrue().length>0){var w=false;
var M=p.ifproptrue();
if(this.shapeSelection.shapes.first().properties["oryx-"+M]&&this.shapeSelection.shapes.first().properties["oryx-"+M]=="true"){w=true
}if(!w){H=false
}}if(p.fordistribution()&&p.fordistribution().length>0){var L=false;
var A=p.fordistribution().split("|");
for(var S=0;
S<A.size();
S++){if(A[S]==this.shapeSelection.shapes.first().properties["oryx-distributiontype"]){L=true
}}if(!L){H=false
}}}if(H){if(p.popular()){p.setPopular()
}if(p.simulation()){p.setSimulation()
}if(p.display()){p.setDisplay()
}if(p.extra()){p.setExtra()
}if(p.extra()){this.properties.push([ORYX.I18N.PropertyWindow.moreProps,q,C,X,{editor:N,propId:t,type:p.type(),tooltip:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}else{if(p.simulation()){this.simulationProperties.push([ORYX.I18N.PropertyWindow.simulationProps,q,C,X,{editor:N,propId:t,type:p.type(),tooltip:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}else{if(p.display()){this.displayProperties.push([ORYX.I18N.PropertyWindow.displayProps,q,C,X,{editor:N,propId:t,type:p.type(),tooltip:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}else{this.popularProperties.push([ORYX.I18N.PropertyWindow.oftenUsed,q,C,X,{editor:N,propId:t,type:p.type(),tooltip:p.description(),renderer:K,labelProvider:this.getLabelProvider(p)}])
}}}}}}).bind(this))
}this.setProperties()
},getLabelProvider:function(a){lp=ORYX.LabelProviders[a.labelProvider()];
if(lp){return lp(a)
}return null
},hideMoreAttrs:function(a){if(this.properties.length<=0){return
}this.grid.view.un("refresh",this.hideMoreAttrs,this)
},setProperties:function(){var c=this.popularProperties.concat(this.properties);
var a=c.concat(this.simulationProperties);
var b=a.concat(this.displayProperties);
this.dataSource.loadData(b)
}};
ORYX.Plugins.PropertyWindow=Clazz.extend(ORYX.Plugins.PropertyWindow);
Ext.form.ComplexListField=function(b,a,c,d){Ext.form.ComplexListField.superclass.constructor.call(this,b);
this.items=a;
this.key=c;
this.facade=d
};
Ext.extend(Ext.form.ComplexListField,Ext.form.TriggerField,{triggerClass:"x-form-complex-trigger",readOnly:true,emptyText:ORYX.I18N.PropertyWindow.clickIcon,editable:false,readOnly:true,buildValue:function(){var f=this.grid.getStore();
f.commitChanges();
if(f.getCount()==0){return""
}var d="[";
for(var c=0;
c<f.getCount();
c++){var e=f.getAt(c);
d+="{";
for(var a=0;
a<this.items.length;
a++){var b=this.items[a].id();
d+=b+":"+(""+e.get(b)).toJSON();
if(a<(this.items.length-1)){d+=", "
}}d+="}";
if(c<(f.getCount()-1)){d+=", "
}}d+="]";
d="{'totalCount':"+f.getCount().toJSON()+", 'items':"+d+"}";
return Object.toJSON(d.evalJSON())
},getFieldKey:function(){return this.key
},getValue:function(){if(this.grid){return this.buildValue()
}else{if(this.data==undefined){return""
}else{return this.data
}}},setValue:function(a){if(a.length>0){if(this.data==undefined){this.data=a
}}},keydownHandler:function(a){return false
},dialogListeners:{show:function(){this.onFocus();
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_KEYDOWN,this.keydownHandler.bind(this));
this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
return
},hide:function(){var a=this.dialogListeners;
this.dialog.un("show",a.show,this);
this.dialog.un("hide",a.hide,this);
this.dialog.destroy(true);
this.grid.destroy(true);
delete this.grid;
delete this.dialog;
this.facade.unregisterOnEvent(ORYX.CONFIG.EVENT_KEYDOWN,this.keydownHandler.bind(this));
this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN);
this.fireEvent("dialogClosed",this.data);
Ext.form.ComplexListField.superclass.setValue.call(this,this.data)
}},buildInitial:function(f,a){var b=new Hash();
for(var c=0;
c<a.length;
c++){var e=a[c].id();
b[e]=a[c].value()
}var d=Ext.data.Record.create(f);
return new d(b)
},buildColumnModel:function(l){var h=[];
for(var c=0;
c<this.items.length;
c++){var a=this.items[c].id();
var d=this.items[c].name();
var b=this.items[c].width();
var g=this.items[c].type();
var e;
if(g==ORYX.CONFIG.TYPE_STRING){e=new Ext.form.TextField({allowBlank:this.items[c].optional(),width:b})
}else{if(g==ORYX.CONFIG.TYPE_CHOICE){var f=this.items[c].items();
var k=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",l,["select",{style:"display:none"}]);
var j=new Ext.Template('<option value="{value}">{value}</option>');
f.each(function(i){j.append(k,{value:i.value()})
});
e=new Ext.form.ComboBox({editable:false,typeAhead:true,triggerAction:"all",transform:k,lazyRender:true,msgTarget:"title",width:b})
}else{if(g==ORYX.CONFIG.TYPE_DYNAMICCHOICE){var f=this.items[c].items();
var k=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",l,["select",{style:"display:none"}]);
var j=new Ext.Template('<option value="{value}">{value}</option>');
f.each(function(r){var p=ORYX.EDITOR.getSerializedJSON();
var q=jsonPath(p.evalJSON(),r.value());
if(q){if(q.toString().length>0){for(var o=0;
o<q.length;
o++){var s=q[o].split(",");
for(var n=0;
n<s.length;
n++){if(s[n].indexOf(":")>0){var m=s[n].split(":");
j.append(k,{value:m[0]})
}else{j.append(k,{value:s[n]})
}}}}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.PropertyWindow.noDataAvailableForProp,title:""})
}});
e=new Ext.form.ComboBox({editable:false,typeAhead:true,triggerAction:"all",transform:k,lazyRender:true,msgTarget:"title",width:b})
}else{if(g==ORYX.CONFIG.TYPE_BOOLEAN){e=new Ext.form.Checkbox({width:b})
}else{if(g=="xpath"){e=new Ext.form.TextField({allowBlank:this.items[c].optional(),width:b})
}}}}}h.push({id:a,header:d,dataIndex:a,resizable:true,editor:e,width:b})
}return new Ext.grid.ColumnModel(h)
},afterEdit:function(a){a.grid.getStore().commitChanges()
},beforeEdit:function(h){var a=this.grid.getView().getScrollState();
var b=h.column;
var p=h.row;
var e=this.grid.getColumnModel().config[b].id;
for(var g=0;
g<this.items.length;
g++){var o=this.items[g];
var m=o.disable();
if(m!=undefined){var n=this.grid.getStore().getAt(p).get(o.id());
for(var d=0;
d<m.length;
d++){var f=m[d];
if(f.value==n){for(var c=0;
c<f.items.length;
c++){var l=f.items[c];
if(l==e){this.grid.getColumnModel().getCellEditor(b,p).disable();
return
}}}}}}this.grid.getColumnModel().getCellEditor(b,p).enable()
},onTriggerClick:function(){if(this.disabled){return
}var dialogWidth=0;
var recordType=[];
for(var i=0;
i<this.items.length;
i++){var id=this.items[i].id();
var width=this.items[i].width();
var type=this.items[i].type();
if((type==ORYX.CONFIG.TYPE_CHOICE)||(type==ORYX.CONFIG.TYPE_DYNAMICCHOICE)){type=ORYX.CONFIG.TYPE_STRING
}dialogWidth+=width;
recordType[i]={name:id,type:type}
}if(dialogWidth>800){dialogWidth=800
}dialogWidth+=22;
var data=this.data;
if(data==""){data="{}"
}var ds=new Ext.data.Store({proxy:new Ext.data.MemoryProxy(eval("("+data+")")),reader:new Ext.data.JsonReader({root:"items",totalProperty:"totalCount"},recordType)});
ds.load();
var cm=this.buildColumnModel();
this.grid=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:ds,cm:cm,stripeRows:true,clicksToEdit:1,selModel:new Ext.grid.CellSelectionModel()});
var toolbar=new Ext.Toolbar([{text:ORYX.I18N.PropertyWindow.add,handler:function(){var ds=this.grid.getStore();
var index=ds.getCount();
this.grid.stopEditing();
var p=this.buildInitial(recordType,this.items);
ds.insert(index,p);
ds.commitChanges();
this.grid.startEditing(index,0)
}.bind(this)},{text:ORYX.I18N.PropertyWindow.rem,handler:function(){var ds=this.grid.getStore();
var selection=this.grid.getSelectionModel().getSelectedCell();
if(selection==undefined){return
}this.grid.getSelectionModel().clearSelections();
this.grid.stopEditing();
var record=ds.getAt(selection[0]);
ds.remove(record);
ds.commitChanges()
}.bind(this)}]);
this.dialog=new Ext.Window({autoScroll:true,autoCreate:true,title:ORYX.I18N.PropertyWindow.complex,height:350,width:dialogWidth,modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,keys:[{key:27,fn:function(){this.dialog.hide
}.bind(this)}],items:[toolbar,this.grid],bodyStyle:"background-color:#FFFFFF",buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){this.grid.getView().refresh();
this.grid.stopEditing();
this.data=this.buildValue();
this.dialog.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.dialog.hide()
}.bind(this)}]});
this.dialog.on(Ext.apply({},this.dialogListeners,{scope:this}));
this.dialog.show();
this.grid.on("beforeedit",this.beforeEdit,this,true);
this.grid.on("afteredit",this.afterEdit,this,true);
this.grid.render()
}});
Ext.form.ComplexTextField=Ext.extend(Ext.form.TriggerField,{defaultAutoCreate:{tag:"textarea",rows:1,style:"height:16px;overflow:hidden;"},editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var b=new Ext.form.TextArea({anchor:"100% 100%",value:this.value,listeners:{focus:function(){this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
}.bind(this)}});
var a=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.text,height:500,width:500,modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,keys:[{key:27,fn:function(){a.hide()
}.bind(this)}],items:[b],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
a.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var c=b.getValue();
this.setValue(c);
this.dataSource.getAt(this.row).set("value",c);
this.dataSource.commitChanges();
a.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
a.hide()
}.bind(this)}]});
a.show();
b.render();
this.grid.stopEditing();
b.focus(false,100)
}});
Ext.form.ComplexCustomField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}Ext.Ajax.request({url:ORYX.PATH+"customeditors",method:"POST",success:function(a){try{if(a.responseText&&a.responseText.length>0){var d=a.responseText.evalJSON();
var c=d.editors;
if(c[this.title]){var b=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.customEditorFor+" "+this.title,height:300,width:450,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){b.hide()
}.bind(this)}],items:[{xtype:"component",id:"customeditorswindow",autoEl:{tag:"iframe",src:c[this.title],width:"100%",height:"100%"}}],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
b.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var e=document.getElementById("customeditorswindow").contentWindow.getEditorValue();
this.setValue(e);
this.dataSource.getAt(this.row).set("value",e);
this.dataSource.commitChanges();
b.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
b.hide()
}.bind(this)}]});
b.show();
this.grid.stopEditing()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.unableFindCustomEditor+" "+this.title,title:""})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.invalidCustomEditorData,title:""})
}}catch(f){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorApplyingCustomEditor+":\n"+f,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorApplyingCustomEditor+".",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID}})
}});
Ext.form.ComplexNotificationsField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var q=Ext.data.Record.create([{name:"type"},{name:"expires"},{name:"from"},{name:"tousers"},{name:"togroups"},{name:"replyto"},{name:"subject"},{name:"body"}]);
var b=new Ext.data.MemoryProxy({root:[]});
var A=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},q),proxy:b,sorters:[{property:"subject",direction:"ASC"},{property:"from",direction:"ASC"},{property:"tousers",direction:"ASC"},{property:"togroups",direction:"ASC"}]});
A.load();
if(this.value.length>0){this.value=this.value.replace(/\[/g,"");
this.value=this.value.replace(/\]/g,"");
var r=this.value.split("^");
for(var y=0;
y<r.length;
y++){var e=r[y];
if(e.indexOf("@")>0){var u=e.split("@");
var t=u[0];
var l=u[1];
var g=u[2];
var B="";
var m="";
var f="";
var n="";
var k="";
var d="";
if(t.indexOf("|")>0){var C=t.split("|");
for(var w=0;
w<C.length;
w++){var c=C[w].split(/:(.+)?/)[0];
var x=C[w].split(/:(.+)?/)[1];
if(c=="from"){B=x
}else{if(c=="tousers"){m=x
}else{if(c=="togroups"){f=x
}else{if(c=="replyTo"){n=x
}else{if(c=="subject"){k=x
}else{if(c=="body"){d=x.replace(/<br\s?\/?>/g,"\n")
}}}}}}}}else{var c=t.split(/:(.+)?/)[0];
var x=t.split(/:(.+)?/)[1];
if(c=="from"){B=x
}else{if(c=="tousers"){m=x
}else{if(c=="togroups"){f=x
}else{if(c=="replyTo"){n=x
}else{if(c=="subject"){k=x
}else{if(c=="body"){d=x.replace(/<br\s?\/?>/g,"\n")
}}}}}}}A.add(new q({type:g==undefined?"":g,expires:l==undefined?"":l,from:B==undefined?"":B,tousers:m==undefined?"":m,togroups:f==undefined?"":f,replyto:n==undefined?"":n,subject:k==undefined?"":k,body:d==undefined?"":d}))
}}}var o=new Array();
var D=new Array();
D.push("not-started");
D.push("not-started");
o.push(D);
var v=new Array();
v.push("not-completed");
v.push("not-completed");
o.push(v);
var s=Ext.id();
var p=new Extensive.grid.ItemDeleter();
var h=new Ext.form.TextArea({id:"notificationsbodyeditor",width:150,height:650,allowBlank:true,disableKeyFilter:true,grow:true});
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:A,id:s,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"type",header:ORYX.I18N.PropertyWindow.type,width:100,dataIndex:"type",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:o})})},{id:"expires",header:ORYX.I18N.PropertyWindow.expiresAt,width:100,dataIndex:"expires",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"from",header:ORYX.I18N.PropertyWindow.from,width:100,dataIndex:"from",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"tousers",header:ORYX.I18N.PropertyWindow.toUsers,width:100,dataIndex:"tousers",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"togroups",header:ORYX.I18N.PropertyWindow.toGroups,width:100,dataIndex:"togroups",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"replyto",header:ORYX.I18N.PropertyWindow.replyTo,width:100,dataIndex:"replyto",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"subject",header:ORYX.I18N.PropertyWindow.subject,width:100,dataIndex:"subject",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"body",header:ORYX.I18N.PropertyWindow.body,width:100,height:650,dataIndex:"body",editor:new Ext.form.TextArea({width:150,height:650,allowBlank:true,disableKeyFilter:true,grow:true}),renderer:Ext.util.Format.htmlEncode},p]),selModel:p,autoHeight:true,tbar:[{text:ORYX.I18N.PropertyWindow.addNotification,handler:function(){A.add(new q({expires:"",from:"",tousers:"",type:"not-started",togroups:"",replyto:"",subject:"",body:""}));
a.fireEvent("cellclick",a,A.getCount()-1,1,null)
}}],clicksToEdit:1,listeners:{beforeedit:function(i){if(i.column!=8){return true
}var j=Ext.get("notificationsBodyEditorWindow");
if(!j){var E=new Ext.Window({id:"notificationsBodyEditorWindow",modal:true,collapsible:false,fixedcenter:true,shadow:true,proxyDrag:true,autoScroll:true,autoWidth:true,autoHeight:true,bodyBorder:false,closable:true,resizable:true,items:[{xtype:"panel",html:"<p class='instructions'>"+ORYX.I18N.PropertyWindow.addNotificationInstructions+"</p>"},{xtype:"textarea",id:"notificationbodyinput",width:350,height:300,modal:true,value:i.value}],bbar:[{text:"OK",handler:function(){i.record.set("body",Ext.get("notificationbodyinput").getValue());
E.close()
}}]});
E.show();
return false
}else{return false
}}}});
var z=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForNotifications,height:350,width:900,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){z.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
z.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var i="";
a.stopEditing();
a.getView().refresh();
A.data.each(function(){if((this.data.tousers.length>0||this.data.togroups.length>0)&&this.data.subject.length>0&&this.data.body.length>0){i+="[from:"+this.data.from+"|tousers:"+this.data.tousers+"|togroups:"+this.data.togroups+"|replyTo:"+this.data.replyto+"|subject:"+this.data.subject+"|body:"+this.data.body.replace(/\r\n|\r|\n/g,"<br />")+"]";
i+="@["+this.data.expires+"]";
i+="@"+this.data.type;
i+="^"
}});
if(i.length>0){i=i.slice(0,-1)
}this.setValue(i);
this.dataSource.getAt(this.row).set("value",i);
this.dataSource.commitChanges();
z.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
z.hide()
}.bind(this)}]});
z.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexReassignmentField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var c=Ext.data.Record.create([{name:"users"},{name:"groups"},{name:"expires"},{name:"type"}]);
var l=new Ext.data.MemoryProxy({root:[]});
var d=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},c),proxy:l,sorters:[{property:"users",direction:"ASC"},{property:"groups",direction:"ASC"}]});
d.load();
if(this.value.length>0){this.value=this.value.replace(/\[/g,"");
this.value=this.value.replace(/\]/g,"");
var n=this.value.split("^");
for(var t=0;
t<n.length;
t++){var e=n[t];
if(e.indexOf("@")>0){var q=e.split("@");
var p=q[0];
var h=q[1];
var f=q[2];
var g="";
var s="";
if(p.indexOf("|")>0){var w=p.split("|");
var x=w[0];
var m=w[1];
var b=x.split(":");
if(b[0]=="users"){g=b[1]
}else{if(b[0]=="groups"){s=b[1]
}}var u=m.split(":");
if(u[0]=="users"){g=u[1]
}else{if(u[0]=="groups"){s=u[1]
}}}else{var z=p.split(":");
if(z[0]=="users"){g=z[1]
}else{if(z[0]=="groups"){s=z[1]
}}}d.add(new c({users:g,groups:s,expires:h,type:f}))
}}}var j=new Array();
var y=new Array();
y.push("not-started");
y.push("not-started");
j.push(y);
var r=new Array();
r.push("not-completed");
r.push("not-completed");
j.push(r);
var o=Ext.id();
var k=new Extensive.grid.ItemDeleter();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:d,id:o,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"users",header:ORYX.I18N.PropertyWindow.users,width:150,dataIndex:"users",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"groups",header:ORYX.I18N.PropertyWindow.groups,width:150,dataIndex:"groups",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_\,]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"expires",header:ORYX.I18N.PropertyWindow.expiresAt,width:150,dataIndex:"expires",editor:new Ext.form.TextField({allowBlank:true,regex:/^[a-z0-9 \#\{\}\-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"type",header:ORYX.I18N.PropertyWindow.type,width:150,dataIndex:"type",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:j})})},k]),selModel:k,autoHeight:true,tbar:[{text:ORYX.I18N.PropertyWindow.addReassignment,handler:function(){d.add(new c({users:"",groups:"",expires:"",type:"not-started"}));
a.fireEvent("cellclick",a,d.getCount()-1,1,null)
}}],clicksToEdit:1});
var v=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForReassignment,height:350,width:700,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){v.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
v.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var i="";
a.stopEditing();
a.getView().refresh();
d.data.each(function(){if((this.data.users.length>0||this.data.groups.length>0)&&this.data.expires.length>0&&this.data.type.length>0){i+="[users:"+this.data.users+"|groups:"+this.data.groups+"]";
i+="@["+this.data.expires+"]";
i+="@"+this.data.type;
i+="^"
}});
if(i.length>0){i=i.slice(0,-1)
}this.setValue(i);
this.dataSource.getAt(this.row).set("value",i);
this.dataSource.commitChanges();
v.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
v.hide()
}.bind(this)}]});
v.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexImportsField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var r=Ext.data.Record.create([{name:"type"},{name:"classname"},{name:"wsdllocation"},{name:"wsdlnamespace"}]);
var e=new Ext.data.MemoryProxy({root:[]});
var q=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},r),proxy:e,sorters:[{property:"type",direction:"ASC"}]});
q.load();
if(this.value.length>0){var j=this.value.split(",");
for(var n=0;
n<j.length;
n++){var d="";
var s,b,h;
var c=j[n];
var m=c.split("|");
if(m[1]=="default"){d="default";
s=m[0];
b="";
h=""
}else{d="wsdl";
s="";
b=m[0];
h=m[1]
}q.add(new r({type:d,classname:s,wsdllocation:b,wsdlnamespace:h}))
}}var g=new Extensive.grid.ItemDeleter();
var l=new Array();
var f=new Array();
f.push("default");
f.push("default");
l.push(f);
var p=new Array();
p.push("wsdl");
p.push("wsdl");
l.push(p);
var k=Ext.id();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:q,id:k,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"imptype",header:ORYX.I18N.PropertyWindow.importType,width:100,dataIndex:"type",editor:new Ext.form.ComboBox({id:"importTypeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:l})})},{id:"classname",header:ORYX.I18N.PropertyWindow.className,width:200,dataIndex:"classname",editor:new Ext.form.TextField({allowBlank:true})},{id:"wsdllocation",header:ORYX.I18N.PropertyWindow.wsdlLocation,width:200,dataIndex:"wsdllocation",editor:new Ext.form.TextField({allowBlank:true})},{id:"wsdlnamespace",header:ORYX.I18N.PropertyWindow.wsdlNamespace,width:200,dataIndex:"wsdlnamespace",editor:new Ext.form.TextField({allowBlank:true})},g]),selModel:g,autoHeight:true,tbar:[{text:ORYX.I18N.PropertyWindow.addImport,handler:function(){q.add(new r({type:"default",classname:"",wsdllocation:"",wsdlnamespace:""}));
a.fireEvent("cellclick",a,q.getCount()-1,1,null)
}}],clicksToEdit:1});
var o=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForImports,height:400,width:800,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){o.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
o.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var i="";
a.getView().refresh();
a.stopEditing();
q.data.each(function(){if(this.data.type=="default"){i+=this.data.classname+"|"+this.data.type+","
}if(this.data.type=="wsdl"){i+=this.data.wsdllocation+"|"+this.data.wsdlnamespace+"|"+this.data.type+","
}});
if(i.length>0){i=i.slice(0,-1)
}this.setValue(i);
this.dataSource.getAt(this.row).set("value",i);
this.dataSource.commitChanges();
o.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
o.hide()
}.bind(this)}]});
o.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexActionsField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var f=Ext.data.Record.create([{name:"action"}]);
var j=new Ext.data.MemoryProxy({root:[]});
var d=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},f),proxy:j,sorters:[{property:"action",direction:"ASC"}]});
d.load();
if(this.value.length>0){var h=this.value.split("|");
for(var e=0;
e<h.length;
e++){var b=h[e];
d.add(new f({action:b}))
}}var g=new Extensive.grid.ItemDeleter();
var c=Ext.id();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:d,id:c,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"action",header:ORYX.I18N.PropertyWindow.action,width:360,dataIndex:"action",editor:new Ext.form.TextField({allowBlank:true})},g]),selModel:g,autoHeight:true,tbar:[{text:ORYX.I18N.PropertyWindow.addAction,handler:function(){d.add(new f({action:""}));
a.fireEvent("cellclick",a,d.getCount()-1,1,null)
}}],clicksToEdit:1});
var k=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForActions,height:300,width:450,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){k.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
k.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var i="";
a.getView().refresh();
a.stopEditing();
d.data.each(function(){if(this.data.action.length>0){i+=this.data.action+"|"
}});
if(i.length>0){i=i.slice(0,-1)
}this.setValue(i);
this.dataSource.getAt(this.row).set("value",i);
this.dataSource.commitChanges();
k.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
k.hide()
}.bind(this)}]});
k.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexDataAssignmenField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return undefined
}var d=ORYX.EDITOR.getSerializedJSON();
var u=jsonPath(d.evalJSON(),"$.properties.vardefs");
var g=new Array();
var h=new Array();
var b=new Hash();
h.push("");
h.push("** Variable Definitions **");
g.push(h);
if(u){u.forEach(function(A){if(A.length>0){var x=A.split(",");
for(var z=0;
z<x.length;
z++){var y=new Array();
var B=x[z];
if(B.indexOf(":")>0){var w=B.split(":");
y.push(w[0]);
y.push(w[0]);
b[w[0]]=w[1]
}else{y.push(B);
y.push(B);
b[B]="java.lang.String"
}g.push(y)
}}})
}var j=new Array();
j.push("");
j.push("** Data Inputs **");
g.push(j);
Ext.each(this.dataSource.data.items,function(z){if((z.data.gridProperties.propId=="oryx-datainputset")||(z.data.gridProperties.propId=="oryx-datainput")){var w=z.data.value.split(",");
for(var y=0;
y<w.length;
y++){var A=w[y];
var x=new Array();
if(A.indexOf(":")>0){var i=A.split(":");
x.push(i[0]);
x.push(i[0]);
b[i[0]]=i[1]
}else{x.push(A);
x.push(A);
b[A]="java.lang.String"
}g.push(x)
}}});
var l=new Array();
l.push("");
l.push("** Data Outputs **");
g.push(l);
Ext.each(this.dataSource.data.items,function(z){if((z.data.gridProperties.propId=="oryx-dataoutputset")||(z.data.gridProperties.propId=="oryx-dataoutput")){var x=z.data.value.split(",");
for(var i=0;
i<x.length;
i++){var A=x[i];
var y=new Array();
if(A.indexOf(":")>0){var w=A.split(":");
y.push(w[0]);
y.push(w[0]);
b[w[0]]=w[1]
}else{y.push(A);
y.push(A);
b[A]="java.lang.String"
}g.push(y)
}}});
var c=Ext.data.Record.create([{name:"from"},{name:"type"},{name:"to"},{name:"tostr"},{name:"dataType"}]);
var r=new Ext.data.MemoryProxy({root:[]});
var v=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},c),proxy:r,sorters:[{property:"from",direction:"ASC"},{property:"to",direction:"ASC"},{property:"tostr",direction:"ASC"}]});
v.load();
if(this.value.length>0){var n=this.value.split(",");
for(var s=0;
s<n.length;
s++){var e=n[s];
if(e.indexOf("=")>0){var p=e.split("=");
var q=b[p[0]];
if(!q){q="java.lang.String"
}var k=p[0];
p.shift();
var f=p.join("=").replace(/\#\#/g,",");
f=f.replace(/\|\|/g,"=");
v.add(new c({from:k,type:"is equal to",to:"",tostr:f,dataType:q}))
}else{if(e.indexOf("->")>0){var p=e.split("->");
var q=b[p[0]];
if(!q){q="java.lang.String"
}v.add(new c({from:p[0],type:"is mapped to",to:p[1],tostr:"",dataType:q}))
}else{var q=b[e];
if(!q){q="java.lang.String"
}v.add(new c({from:e,type:"is equal to",to:"",tostr:"",dataType:q}))
}}}}v.on("update",function(x,i,w){if(w=="edit"){var y=b[i.get("from")];
if(!y){y="java.lang.String"
}i.set("dataType",y)
}});
var m=new Extensive.grid.ItemDeleter();
var o=Ext.id();
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:v,id:o,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"valueType",header:ORYX.I18N.PropertyWindow.dataType,width:180,dataIndex:"dataType",hidden:"true"},{id:"from",header:ORYX.I18N.PropertyWindow.fromObject,width:180,dataIndex:"from",editor:new Ext.form.ComboBox({id:"fromCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:g})})},{id:"type",header:ORYX.I18N.PropertyWindow.assignmentType,width:100,dataIndex:"type",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:[["is mapped to","is mapped to"],["is equal to","is equal to"]]})})},{id:"to",header:ORYX.I18N.PropertyWindow.toObject,width:180,dataIndex:"to",editor:new Ext.form.ComboBox({id:"toCombo",valueField:"name",displayField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,store:new Ext.data.SimpleStore({fields:["name","value"],data:g})})},{id:"tostr",header:ORYX.I18N.PropertyWindow.toValue,width:180,dataIndex:"tostr",editor:new Ext.form.TextField({allowBlank:true}),renderer:Ext.util.Format.htmlEncode},m]),selModel:m,autoHeight:true,tbar:[{text:ORYX.I18N.PropertyWindow.addAssignment,handler:function(){v.add(new c({from:"",type:"",to:"",tostr:""}));
a.fireEvent("cellclick",a,v.getCount()-1,1,null)
}}],clicksToEdit:1});
var t=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForDataAssignments,height:350,width:730,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){t.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
t.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var i="";
a.getView().refresh();
a.stopEditing();
v.data.each(function(){if(this.data.from.length>0&&this.data.type.length>0){if(this.data.type=="is mapped to"){i+=this.data.from+"->"+this.data.to+","
}else{if(this.data.type=="is equal to"){var w=this.data.tostr.replace(/,/g,"##");
w=w.replace(/=/g,"||");
i+=this.data.from+"="+w+","
}}}});
if(i.length>0){i=i.slice(0,-1)
}this.setValue(i);
this.dataSource.getAt(this.row).set("value",i);
this.dataSource.commitChanges();
t.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
t.hide()
}.bind(this)}]});
t.show();
a.render();
this.grid.stopEditing();
a.focus(false,100);
return a
}});
Ext.form.NameTypeEditor=Ext.extend(Ext.form.TriggerField,{windowTitle:"",addButtonLabel:"",single:false,editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var j=Ext.data.Record.create([{name:"name"},{name:"stype"},{name:"ctype"}]);
var d=new Ext.data.MemoryProxy({root:[]});
var g=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},j),proxy:d,sorters:[{property:"name",direction:"ASC"}]});
g.load();
if(this.value.length>0){var l=this.value.split(",");
for(var h=0;
h<l.length;
h++){var e=l[h];
if(e.indexOf(":")>0){var r=e.split(":");
if(r[1]=="String"||r[1]=="Integer"||r[1]=="Boolean"||r[1]=="Float"){g.add(new j({name:r[0],stype:r[1],ctype:""}))
}else{if(r[1]!="Object"){g.add(new j({name:r[0],stype:"Object",ctype:r[1]}))
}else{g.add(new j({name:r[0],stype:r[1],ctype:""}))
}}}else{g.add(new j({name:e,stype:"",ctype:""}))
}}}var k=new Extensive.grid.ItemDeleter();
var c=new Array();
var q=new Array();
q.push("String");
q.push("String");
c.push(q);
var p=new Array();
p.push("Integer");
p.push("Integer");
c.push(p);
var n=new Array();
n.push("Boolean");
n.push("Boolean");
c.push(n);
var o=new Array();
o.push("Float");
o.push("Float");
c.push(o);
var b=new Array();
b.push("Object");
b.push("Object");
c.push(b);
var f=Ext.id();
Ext.form.VTypes.inputNameVal=/^[a-z0-9\-\.\_]*$/i;
Ext.form.VTypes.inputNameText="Invalid name";
Ext.form.VTypes.inputName=function(i){return Ext.form.VTypes.inputNameVal.test(i)
};
var a=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:g,id:f,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"name",header:ORYX.I18N.PropertyWindow.name,width:100,dataIndex:"name",editor:new Ext.form.TextField({allowBlank:true,vtype:"inputName",regex:/^[a-z0-9\-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"stype",header:ORYX.I18N.PropertyWindow.standardType,width:100,dataIndex:"stype",editor:new Ext.form.ComboBox({id:"typeCombo",valueField:"name",displayField:"value",labelStyle:"display:none",submitValue:true,typeAhead:false,queryMode:"local",mode:"local",triggerAction:"all",selectOnFocus:true,hideTrigger:false,forceSelection:false,selectOnFocus:true,autoSelect:false,store:new Ext.data.SimpleStore({fields:["name","value"],data:c})})},{id:"ctype",header:ORYX.I18N.PropertyWindow.customType,width:200,dataIndex:"ctype",editor:new Ext.form.TextField({allowBlank:true}),renderer:Ext.util.Format.htmlEncode},k]),selModel:k,autoHeight:true,tbar:[{text:this.addButtonLabel,handler:function(){if(this.single&&g.getCount()>0){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.OnlySingleEntry,title:""})
}else{g.add(new j({name:"",stype:"",ctype:""}));
a.fireEvent("cellclick",a,g.getCount()-1,1,null)
}}.bind(this)}],clicksToEdit:1});
var m=new Ext.Window({layout:"anchor",autoCreate:true,title:this.windowTitle,height:300,width:500,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){m.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
m.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var i="";
a.stopEditing();
a.getView().refresh();
g.data.each(function(){if(this.data.name.length>0){if(this.data.stype.length>0){if(this.data.stype=="Object"&&this.data.ctype.length>0){i+=this.data.name+":"+this.data.ctype+","
}else{i+=this.data.name+":"+this.data.stype+","
}}else{if(this.data.ctype.length>0){i+=this.data.name+":"+this.data.ctype+","
}else{i+=this.data.name+","
}}}});
if(i.length>0){i=i.slice(0,-1)
}this.setValue(i);
this.dataSource.getAt(this.row).set("value",i);
this.dataSource.commitChanges();
m.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
m.hide()
}.bind(this)}]});
m.show();
a.render();
this.grid.stopEditing();
a.focus(false,100)
}});
Ext.form.ComplexVardefField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForVariableDefinitions,addButtonLabel:ORYX.I18N.PropertyWindow.addVariable});
Ext.form.ComplexDataInputField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForDataInput,addButtonLabel:ORYX.I18N.PropertyWindow.addDataInput});
Ext.form.ComplexDataOutputField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForDataOutput,addButtonLabel:ORYX.I18N.PropertyWindow.addDataOutput});
Ext.form.ComplexDataInputFieldSingle=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForDataInput,addButtonLabel:ORYX.I18N.PropertyWindow.addDataInput,single:true});
Ext.form.ComplexDataOutputFieldSingle=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForDataOutput,addButtonLabel:ORYX.I18N.PropertyWindow.addDataOutput,single:true});
Ext.form.ComplexGlobalsField=Ext.extend(Ext.form.NameTypeEditor,{windowTitle:ORYX.I18N.PropertyWindow.editorForGlobals,addButtonLabel:ORYX.I18N.PropertyWindow.addGlobal});
Ext.form.ConditionExpressionEditorField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}function a(Y){c.setValue(Y);
c.dataSource.getAt(c.row).set("value",Y);
c.dataSource.commitChanges();
P.hide()
}var y=false;
Ext.each(this.dataSource.data.items,function(Y){if(Y.data.gridProperties.propId=="oryx-conditionexpressionlanguage"&&Y.data.value=="java"){y=true
}});
var c=this;
var u=true;
var R=true;
var n;
var k=new Ext.form.TextArea({id:Ext.id(),fieldLabel:ORYX.I18N.PropertyWindow.expressionEditor,value:this.value.replace(/\\n/g,"\n"),autoScroll:true});
var M;
var l;
if(!y){n=new Ext.Panel({border:false,items:[k]})
}else{var p;
var G=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.TextField({name:"stringValue"})]});
var e=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.NumberField({name:"floatValue",allowDecimals:true})]});
var C=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.NumberField({name:"floatFrom",allowDecimals:true}),new Ext.form.NumberField({name:"floatTo",allowDecimals:true,style:"margin-left:10px;display:block;"})]});
var T=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.NumberField({name:"intValue",allowDecimals:false})]});
var X=new Ext.Panel({layout:"column",border:false,style:"margin-left:10px;display:block;",items:[new Ext.form.NumberField({name:"intForm",allowDecimals:false}),new Ext.form.NumberField({name:"intTo",allowDecimals:false,style:"margin-left:10px;display:block;"})]});
var s=[];
s.push(["contains",ORYX.I18N.ConditionExpressionEditorField.contains,G,[0]]);
s.push(["endsWith",ORYX.I18N.ConditionExpressionEditorField.endsWith,G,[0]]);
s.push(["equalsTo",ORYX.I18N.ConditionExpressionEditorField.equalsTo,G,[0]]);
s.push(["isEmpty",ORYX.I18N.ConditionExpressionEditorField.isEmpty,null,null]);
s.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
s.push(["startsWith",ORYX.I18N.ConditionExpressionEditorField.startsWith,G,[0]]);
var z=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:s});
var q=[];
q.push(["between",ORYX.I18N.ConditionExpressionEditorField.between,C,[0,1]]);
q.push(["equalsTo",ORYX.I18N.ConditionExpressionEditorField.equalsTo,e,[0]]);
q.push(["greaterThan",ORYX.I18N.ConditionExpressionEditorField.greaterThan,e,[0]]);
q.push(["greaterOrEqualThan",ORYX.I18N.ConditionExpressionEditorField.greaterThanOrEqual,e,[0]]);
q.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
q.push(["lessThan",ORYX.I18N.ConditionExpressionEditorField.lessThan,e,[0]]);
q.push(["lessOrEqualThan",ORYX.I18N.ConditionExpressionEditorField.lessThanOrEqual,e,[0]]);
var x=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:q});
var v=[];
v.push(["between",ORYX.I18N.ConditionExpressionEditorField.between,X,[0,1]]);
v.push(["equalsTo",ORYX.I18N.ConditionExpressionEditorField.equalsTo,T,[0]]);
v.push(["greaterThan",ORYX.I18N.ConditionExpressionEditorField.greaterThan,T,[0]]);
v.push(["greaterOrEqualThan",ORYX.I18N.ConditionExpressionEditorField.greaterThanOrEqual,T,[0]]);
v.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
v.push(["lessThan",ORYX.I18N.ConditionExpressionEditorField.lessThan,T,[0]]);
v.push(["lessOrEqualThan",ORYX.I18N.ConditionExpressionEditorField.lessThanOrEqual,T,[0]]);
var W=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:v});
var N=[];
N.push(["isFalse",ORYX.I18N.ConditionExpressionEditorField.isFalse,null,null]);
N.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
N.push(["isTrue",ORYX.I18N.ConditionExpressionEditorField.isTrue,null,null]);
var m=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:N});
var L=[];
L.push(["isNull",ORYX.I18N.ConditionExpressionEditorField.isNull,null,null]);
var o=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"title"},{name:"panel"},{name:"inputs"}],data:L});
G.hide();
e.hide();
C.hide();
T.hide();
X.hide();
var S=ORYX.EDITOR.getSerializedJSON();
var b=jsonPath(S.evalJSON(),"$.properties.vardefs");
var D=[];
if(b){b.forEach(function(ac){if(ac.length>0){var aa=ac.split(",");
for(var ab=0;
ab<aa.length;
ab++){var ad=aa[ab];
if(ad.indexOf(":")>0){var Z=ad.split(":");
var ae=Z[0].trim();
var Y=Z[1].trim();
switch(Y){case"String":case"java.lang.String":D.push([ae,Y,z]);
break;
case"Integer":case"java.lang.Integer":case"java.math.BigInteger":case"java.lang.Short":case"java.lang.Long":D.push([ae,Y,W]);
break;
case"Float":case"java.math.BigDecimal":case"java.lang.Float":case"java.lang.Double":D.push([ae,Y,x]);
break;
case"Boolean":case"java.lang.Boolean":D.push([ae,Y,m]);
break;
default:D.push([ae,Y,o])
}}}}})
}var t=new Ext.data.SimpleStore({fields:[{name:"value"},{name:"type"},{name:"store"}],data:D});
var g=new Ext.form.ComboBox({editable:false,displayField:"title",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,listeners:{select:function(ab,Z,aa){J();
p=Z;
var Y=p.get("panel");
if(Y!=null){Y.show()
}}}});
var V=new Ext.form.ComboBox({editable:false,store:t,displayField:"value",valueField:"value",typeAhead:true,mode:"local",triggerAction:"all",selectOnFocus:true,listeners:{select:function(aa,Y,Z){g.clearValue();
J();
g.bindStore(Y.get("store"))
}}});
var K=new Ext.form.FormPanel({layout:"table",title:ORYX.I18N.ConditionExpressionEditorField.editorTab,layoutConfig:{columns:3},defaults:{border:false},items:[{colspan:3,items:[{style:"font-size:12px;margin:10px;display:block;",anchor:"100%",xtype:"label",html:ORYX.I18N.ConditionExpressionEditorField.editorDescription}]},{style:"font-size:12px;margin:10px;display:block;",anchor:"100%",xtype:"label",html:ORYX.I18N.ConditionExpressionEditorField.processVariable},{colspan:2,items:[V]},{style:"font-size:12px;margin:10px;display:block;",anchor:"100%",xtype:"label",html:ORYX.I18N.ConditionExpressionEditorField.condition},g,{items:[G,e,C,T,X]}]});
var w=new Ext.Panel({title:ORYX.I18N.ConditionExpressionEditorField.scriptTab,layout:"anchor",defaults:{border:false},items:[k]});
function i(Y){var Z=ORYX.I18N.ConditionExpressionEditorField.scriptParseError;
Z=Z.replace("{0}",Y);
Ext.MessageBox.show({msg:Z,icon:Ext.MessageBox.WARNING,buttons:{ok:ORYX.I18N.PropertyWindow.ok,cancel:ORYX.I18N.PropertyWindow.cancel},fn:function(aa){if(aa=="ok"){F(true,true)
}else{B(false,false)
}}})
}function U(Y){var Z=ORYX.I18N.ConditionExpressionEditorField.scriptGenerationError;
Z=Z.replace("{0}",Y);
Ext.MessageBox.show({msg:Z,icon:Ext.MessageBox.WARNING,buttons:{ok:ORYX.I18N.PropertyWindow.ok}})
}var j=function(ae){if(ae.responseText.length>0){var ak=Ext.decode(ae.responseText);
if(ak.errorMessage){if(!R){i(ak.errorMessage);
return
}else{u=false
}}else{var ac;
var ad;
var ab=[];
ak.conditions.forEach(function(am){ac=am.condition;
am.parameters.forEach(function(an){if(ad==null){ad=an
}else{ab.push(an)
}})
});
var ai=t.find("value",ad);
if(ai==-1){var aj=ORYX.I18N.ConditionExpressionEditorField.nonExistingVariable;
aj=aj.replace("{0}",ad);
i(aj);
return
}else{V.setValue(ad);
var Z=t.getAt(ai);
V.fireEvent("select",V,Z);
g.setValue(ac);
var aa=Z.get("store");
ai=aa.find("value",ac);
var af=aa.getAt(ai);
g.fireEvent("select",g,af);
var Y=af.get("panel");
if(Y!=null){var ah=af.get("inputs");
if(ah!=null&&ah.length==ab.length){var ag;
for(ag=0;
ag<ah.length;
ag++){var al=Y.getComponent(ah[ag]).setValue(ab[ag])
}}}u=true
}}}R=false;
if(u){F(true,false)
}else{B(false,false)
}};
var A=function(){B(false,false)
};
function B(Z,Y,aa){if(M){M.toTextArea();
M=null
}if(Y){k.setValue(aa)
}u=Z;
n.setActiveTab(w);
P.setTitle(ORYX.I18N.ConditionExpressionEditorField.sequenceFlowFullTitle);
H()
}function F(Y,Z){if(Z){h()
}u=Y;
n.setActiveTab(K);
P.setTitle(ORYX.I18N.ConditionExpressionEditorField.sequenceFlowTitle)
}n=new Ext.TabPanel({renderTo:Ext.getBody(),activeTab:0,defaults:{border:false},items:[K,w],listeners:{tabchange:function(aa,ab){if(ab.title==ORYX.I18N.ConditionExpressionEditorField.scriptTab){if(u){if(V.getValue()==""||(V.getValue()!=""&&g.getValue()=="")){B(false,true,"")
}else{var Z=function(ae){u=true;
if(ae.responseText.length>0){var ad=Ext.decode(ae.responseText);
if(ad.errorMessage){U(ad.errorMessage);
F(true,false)
}else{B(false,true,ad.script)
}}};
var ac=function(){F(true,false)
};
var Y=r(Z,ac);
if(Y==false){F(true,false)
}}}}else{if(!u){if(M.getValue()==null||M.getValue().trim()==""){F(true,true)
}else{k.setValue(M.getValue());
E({script:M.getValue()})
}}}}}});
function h(){V.clearValue();
g.clearValue();
J()
}function J(){if(p!=null){var Y=p.get("panel");
if(Y){var Z=p.get("inputs");
if(Z!=null){Z.forEach(function(aa){Y.getComponent(aa).setValue(null)
})
}Y.hide()
}p=null
}}function d(){if(!p){return false
}var Y=p.get("panel");
if(Y==null){return true
}var aa=p.get("inputs");
if(aa!=null){var Z=[];
aa.forEach(function(ab){var ac=Y.getComponent(ab).getValue();
if(ac==null||ac==""){return false
}Z.push(ac)
});
if(Z.length!=aa.length){return false
}if(Z.length==2){return Z[1]>Z[0]
}}return true
}function O(){var ac=V.getValue();
if(!ac||!d()){return null
}var Z=[];
Z.push(ac);
var Y=p.get("panel");
if(Y!=null){var ab=p.get("inputs");
if(ab!=null){ab.forEach(function(ad){Z.push(Y.getComponent(ad).getValue())
})
}}var aa={operator:"AND",conditions:[{condition:g.getValue(),parameters:Z}]};
return aa
}function f(ab,Z,Y,aa){Ext.Ajax.request({url:ORYX.PATH+"customeditors",method:"POST",params:{expression_editor_command:ab,expression_editor_message:Ext.util.JSON.encode(Z)},success:function(ac){Y(ac)
}.bind(this),failure:function(){aa()
}})
}function E(Y){f("parseScript",Y,j,A)
}function r(Y,Z){var aa=O();
if(!aa){U(ORYX.I18N.ConditionExpressionEditorField.paramsError);
return false
}f("generateScript",aa,Y,Z);
return true
}var Q=function(Z){if(Z.responseText.length>0){var Y=Ext.decode(Z.responseText);
if(Y.errorMessage){U(Y.errorMessage)
}else{a(Y.script)
}}};
var I=function(){U(ORYX.I18N.ConditionExpressionEditorField.saveError)
}
}var P=new Ext.Window({layout:"anchor",autoCreate:true,height:430,width:680,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){P.hide()
}.bind(this)}],items:[n],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
P.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){if(y){if(u){r(Q,I)
}else{a(M.getValue().replace(/\r\n|\r|\n/g,"\\n"))
}}else{a(M.getValue().replace(/\r\n|\r|\n/g,"\\n"))
}}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
P.hide()
}.bind(this)}]});
function H(){this.foldFunc=CodeMirror.newFoldFunction(CodeMirror.braceRangeFinder);
M=CodeMirror.fromTextArea(document.getElementById(k.getId()),{mode:"text/x-java",lineNumbers:true,lineWrapping:true,matchBrackets:true,onGutterClick:this.foldFunc,extraKeys:{"Ctrl-Z":function(Y){CodeMirror.hint(Y,CodeMirror.jbpmHint,P)
}},onCursorActivity:function(){M.setLineClass(l,null,null);
l=M.setLineClass(M.getCursor().line,null,"activeline")
}.bind(this)});
l=M.setLineClass(0,"activeline")
}if(y){if(this.getValue()!=null&&this.getValue()!=""){E({script:this.getValue()})
}else{F(true,false);
R=false
}}else{P.setTitle(ORYX.I18N.ConditionExpressionEditorField.simpleTitle)
}P.show();
n.setHeight(P.getInnerHeight());
if(!y){H()
}this.grid.stopEditing()
}});
Ext.form.ComplexCalledElementField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}var a=Ext.data.Record.create([{name:"name"},{name:"pkgname"},{name:"imgsrc"}]);
var e=new Ext.data.MemoryProxy({root:[]});
var d=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},a),proxy:e,sorters:[{property:"name",direction:"ASC"}]});
d.load();
var b=ORYX.EDITOR.getSerializedJSON();
var c=jsonPath(b.evalJSON(),"$.properties.package");
var f=jsonPath(b.evalJSON(),"$.properties.id");
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.PropertyWindow.loadingProcessInf,title:""});
Ext.Ajax.request({url:ORYX.PATH+"calledelement",method:"POST",success:function(i){try{if(i.responseText.length>0&&i.responseText!="false"){var l=Ext.decode(i.responseText);
for(var n in l){var o=n.split("|");
d.add(new a({name:o[0],pkgname:o[1],imgsrc:l[n]}))
}d.commitChanges();
var h=Ext.id();
var g=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:d,id:h,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"pid",header:ORYX.I18N.PropertyWindow.processId,width:200,dataIndex:"name",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pkgn",header:ORYX.I18N.PropertyWindow.packageName,width:200,dataIndex:"pkgname",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pim",header:ORYX.I18N.LocalHistory.headertxt.ProcessImage,width:250,dataIndex:"imgsrc",renderer:function(p){if(p&&p.length>0){return'<center><img src="'+ORYX.PATH+"images/page_white_picture.png\" onclick=\"new ImageViewer({title: 'Process Image', width: '650', height: '450', autoScroll: true, fixedcenter: true, src: '"+p+"',hideAction: 'close'}).show();\" alt=\"Click to view Process Image\"/></center>"
}else{return ORYX.I18N.LocalHistory.headertxt.ProcessImage.NoAvailable
}}}]),autoHeight:true});
g.on("afterrender",function(r){if(this.value.length>0){var p=0;
var s=this.value;
var q=g;
d.data.each(function(){if(this.data.name==s){q.getSelectionModel().select(p,1)
}p++
})
}}.bind(this));
var m=new Ext.Panel({id:"calledElementsPanel",title:"<center>"+ORYX.I18N.PropertyWindow.selectProcessId+"</center>",layout:"column",items:[g],layoutConfig:{columns:1},defaults:{columnWidth:1}});
var k=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorForCalledEvents,height:350,width:680,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){k.hide()
}.bind(this)}],items:[m],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
k.destroy()
}.bind(this)},buttons:[{text:"Save",handler:function(){if(g.getSelectionModel().getSelectedCell()!=null){var p=g.getSelectionModel().getSelectedCell()[0];
var q=d.getAt(p).data.name;
g.stopEditing();
g.getView().refresh();
this.setValue(q);
this.dataSource.getAt(this.row).set("value",q);
this.dataSource.commitChanges();
k.hide()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.LocalHistory.LocalHistoryView.msg,title:""})
}}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
k.hide()
}.bind(this)}]});
k.show();
g.render();
g.fireEvent("afterrender");
this.grid.stopEditing();
g.focus(false,100)
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.unableToFindOtherProcess,title:""})
}}catch(j){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorResolvingOtherProcessInfo+" :\n"+j,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.PropertyWindow.errorResolvingOtherProcessInfo+".",title:""})
},params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,ppackage:c,pid:f}})
}});
Ext.form.ComplexVisualDataAssignmentField=Ext.extend(Ext.form.TriggerField,{editable:false,readOnly:true,onTriggerClick:function(){if(this.disabled){return
}Ext.each(this.dataSource.data.items,function(h){if((h.data.gridProperties.propId=="oryx-assignments")){}});
var f=ORYX.EDITOR.getSerializedJSON();
var a=jsonPath(f.evalJSON(),"$.properties.vardefs");
if(!a){a=""
}var c=jsonPath(f.evalJSON(),"$.properties.globals");
if(!c){c=""
}var g="";
var b=jsonPath(f.evalJSON(),"$.childShapes.*");
for(var e=0;
e<b.length;
e++){if(b[e].stencil.id=="DataObject"){g+=b[e].properties.name;
g+=","
}}if(g.endsWith(",")){g=g.substr(0,g.length-1)
}var d=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.PropertyWindow.editorVisualDataAssociations,height:550,width:850,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){d.hide()
}.bind(this)}],items:[{xtype:"component",id:"visualdataassignmentswindow",autoEl:{tag:"iframe",src:ORYX.BASE_FILE_PATH+"customeditors/visualassignmentseditor.jsp?vars="+a+"&globals="+c+"&dobj="+g,width:"100%",height:"100%"}}],listeners:{hide:function(){this.fireEvent("dialogClosed",this.value);
d.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){var h=document.getElementById("visualdataassignmentswindow").contentWindow.getEditorValue();
this.setValue(h);
this.dataSource.getAt(this.row).set("value",h);
this.dataSource.commitChanges();
d.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){this.setValue(this.value);
d.hide()
}.bind(this)}]});
d.show();
this.grid.stopEditing()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.CanvasResize=Clazz.extend({construct:function(a){this.facade=a;
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"N",this.resize.bind(this));
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"W",this.resize.bind(this));
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"E",this.resize.bind(this));
new ORYX.Plugins.CanvasResizeButton(this.facade.getCanvas(),"S",this.resize.bind(this))
},resize:function(a,c){resizeCanvas=function(j,k,m){var f=m.getCanvas();
var l=f.bounds;
var h=m.getCanvas().getHTMLContainer().parentNode.parentNode;
if(j=="E"||j=="W"){f.setSize({width:(l.width()+k)*f.zoomLevel,height:(l.height())*f.zoomLevel})
}else{if(j=="S"||j=="N"){f.setSize({width:(l.width())*f.zoomLevel,height:(l.height()+k)*f.zoomLevel})
}}if(j=="N"||j=="W"){var g=j=="N"?{x:0,y:k}:{x:k,y:0};
f.getChildNodes(false,function(o){o.bounds.moveBy(g)
});
var i=f.getChildEdges().findAll(function(o){return o.getAllDockedShapes().length>0
});
var n=i.collect(function(o){return o.dockers.findAll(function(p){return !p.getDockedShape()
})
}).flatten();
n.each(function(o){o.bounds.moveBy(g)
})
}else{if(j=="S"){h.scrollTop+=k
}else{if(j=="E"){h.scrollLeft+=k
}}}f.update();
m.updateSelection()
};
var b=ORYX.Core.Command.extend({construct:function(f,h,g){this.position=f;
this.extentionSize=h;
this.facade=g
},execute:function(){resizeCanvas(this.position,this.extentionSize,this.facade)
},rollback:function(){resizeCanvas(this.position,-this.extentionSize,this.facade)
},update:function(){}});
var d=ORYX.CONFIG.CANVAS_RESIZE_INTERVAL;
if(c){d=-d
}var e=new b(a,d,this.facade);
this.facade.executeCommands([e])
}});
ORYX.Plugins.CanvasResizeButton=Clazz.extend({construct:function(c,h,l){this.canvas=c;
var i=c.getHTMLContainer().parentNode.parentNode.parentNode;
window.myParent=i;
var d=i.firstChild;
var b=d.firstChild.firstChild;
var a=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",i,["div",{"class":"canvas_resize_indicator canvas_resize_indicator_grow "+h,title:ORYX.I18N.RESIZE.tipGrow+ORYX.I18N.RESIZE[h]}]);
var e=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",i,["div",{"class":"canvas_resize_indicator canvas_resize_indicator_shrink "+h,title:ORYX.I18N.RESIZE.tipShrink+ORYX.I18N.RESIZE[h]}]);
var f=60;
var k=function(n){if(n.target!=i&&n.target!=d&&n.target!=d.firstChild&&n.target!=b&&n.target!=d){return false
}var q=n.layerX;
var p=n.layerY;
if((q-d.scrollLeft)<0||Ext.isSafari){q+=d.scrollLeft
}if((p-d.scrollTop)<0||Ext.isSafari){p+=d.scrollTop
}if(h=="N"){return p<f+d.firstChild.offsetTop
}else{if(h=="W"){return q<f+d.firstChild.offsetLeft
}else{if(h=="E"){var m=(d.offsetWidth-(d.firstChild.offsetLeft+d.firstChild.offsetWidth));
if(m<0){m=0
}return q>d.scrollWidth-m-f
}else{if(h=="S"){var o=(d.offsetHeight-(d.firstChild.offsetTop+d.firstChild.offsetHeight));
if(o<0){o=0
}return p>d.scrollHeight-o-f
}}}}return false
};
var j=(function(){a.show();
var n,t,m,s;
try{var r=this.canvas.getRootNode().childNodes[1].getBBox();
n=r.x;
t=r.y;
m=r.x+r.width;
s=r.y+r.height
}catch(q){this.canvas.getChildShapes(true).each(function(w){var y=w.absoluteBounds();
var x=y.upperLeft();
var v=y.lowerRight();
if(n==undefined){n=x.x;
t=x.y;
m=v.x;
s=v.y
}else{n=Math.min(n,x.x);
t=Math.min(t,x.y);
m=Math.max(m,v.x);
s=Math.max(s,v.y)
}})
}var u=c.bounds.width();
var p=c.bounds.height();
var o=c.getChildNodes().size()==0;
if(h=="N"&&(t>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL||(o&&p>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))){e.show()
}else{if(h=="E"&&(u-m)>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL){e.show()
}else{if(h=="S"&&(p-s)>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL){e.show()
}else{if(h=="W"&&(n>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL||(o&&u>ORYX.CONFIG.CANVAS_RESIZE_INTERVAL))){e.show()
}else{e.hide()
}}}}}).bind(this);
var g=function(){a.hide();
e.hide()
};
d.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,function(m){if(k(m)){j()
}else{g()
}},false);
a.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,function(m){j()
},true);
e.addEventListener(ORYX.CONFIG.EVENT_MOUSEOVER,function(m){j()
},true);
i.addEventListener(ORYX.CONFIG.EVENT_MOUSEOUT,function(m){g()
},true);
g();
a.addEventListener("click",function(){l(h);
j()
},true);
e.addEventListener("click",function(){l(h,true);
j()
},true)
}});
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
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DragDropResize=ORYX.Plugins.AbstractPlugin.extend({construct:function(b){this.facade=b;
this.currentShapes=[];
this.toMoveShapes=[];
this.distPoints=[];
this.isResizing=false;
this.dragEnable=false;
this.dragIntialized=false;
this.edgesMovable=true;
this.offSetPosition={x:0,y:0};
this.faktorXY={x:1,y:1};
this.containmentParentNode;
this.isAddingAllowed=false;
this.isAttachingAllowed=false;
this.callbackMouseMove=this.handleMouseMove.bind(this);
this.callbackMouseUp=this.handleMouseUp.bind(this);
var a=this.facade.getCanvas().getSvgContainer();
this.selectedRect=new ORYX.Plugins.SelectedRect(a);
if(ORYX.CONFIG.SHOW_GRIDLINE){this.vLine=new ORYX.Plugins.GridLine(a,ORYX.Plugins.GridLine.DIR_VERTICAL);
this.hLine=new ORYX.Plugins.GridLine(a,ORYX.Plugins.GridLine.DIR_HORIZONTAL)
}a=this.facade.getCanvas().getHTMLContainer();
this.scrollNode=this.facade.getCanvas().rootNode.parentNode.parentNode;
this.resizerSE=new ORYX.Plugins.Resizer(a,"southeast",this.facade);
this.resizerSE.registerOnResize(this.onResize.bind(this));
this.resizerSE.registerOnResizeEnd(this.onResizeEnd.bind(this));
this.resizerSE.registerOnResizeStart(this.onResizeStart.bind(this));
this.resizerNW=new ORYX.Plugins.Resizer(a,"northwest",this.facade);
this.resizerNW.registerOnResize(this.onResize.bind(this));
this.resizerNW.registerOnResizeEnd(this.onResizeEnd.bind(this));
this.resizerNW.registerOnResizeStart(this.onResizeStart.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this))
},handleMouseDown:function(d,c){if(!this.dragBounds||!this.currentShapes.member(c)||!this.toMoveShapes.length){return
}this.dragEnable=true;
this.dragIntialized=true;
this.edgesMovable=true;
var b=this.facade.getCanvas().node.getScreenCTM();
this.faktorXY.x=b.a;
this.faktorXY.y=b.d;
var e=this.dragBounds.upperLeft();
this.offSetPosition={x:Event.pointerX(d)-(e.x*this.faktorXY.x),y:Event.pointerY(d)-(e.y*this.faktorXY.y)};
this.offsetScroll={x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.callbackMouseMove,false);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.callbackMouseUp,true);
return
},handleMouseUp:function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.contain"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.attached"});
if(this.dragEnable){if(!this.dragIntialized){this.afterDrag();
if(this.isAttachingAllowed&&this.toMoveShapes.length==1&&this.toMoveShapes[0] instanceof ORYX.Core.Node&&this.toMoveShapes[0].dockers.length>0){var b=this.facade.eventCoordinates(d);
var e=this.toMoveShapes[0].dockers[0];
var c=ORYX.Core.Command.extend({construct:function(i,f,h,g){this.docker=i;
this.newPosition=f;
this.newDockedShape=h;
this.newParent=h.parent||g.getCanvas();
this.oldPosition=i.parent.bounds.center();
this.oldDockedShape=i.getDockedShape();
this.oldParent=i.parent.parent||g.getCanvas();
this.facade=g;
if(this.oldDockedShape){this.oldPosition=i.parent.absoluteBounds().center()
}},execute:function(){this.dock(this.newDockedShape,this.newParent,this.newPosition);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_ARRANGEMENT_TOP,excludeCommand:true})
},rollback:function(){this.dock(this.oldDockedShape,this.oldParent,this.oldPosition)
},dock:function(f,g,h){g.add(this.docker.parent);
this.docker.setDockedShape(undefined);
this.docker.bounds.centerMoveTo(h);
this.docker.setDockedShape(f);
this.facade.setSelection([this.docker.parent]);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var a=[new c(e,b,this.containmentParentNode,this.facade)];
this.facade.executeCommands(a)
}else{if(this.isAddingAllowed){this.refreshSelectedShapes()
}}this.facade.updateSelection();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_END})
}if(this.vLine){this.vLine.hide()
}if(this.hLine){this.hLine.hide()
}}this.dragEnable=false;
document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.callbackMouseUp,true);
document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.callbackMouseMove,false);
return
},handleMouseMove:function(g){if(!this.dragEnable){return
}if(this.dragIntialized){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDROP_START});
this.dragIntialized=false;
this.resizerSE.hide();
this.resizerNW.hide();
this._onlyEdges=this.currentShapes.all(function(c){return(c instanceof ORYX.Core.Edge)
});
this.beforeDrag();
this._currentUnderlyingNodes=[]
}var a={x:Event.pointerX(g)-this.offSetPosition.x,y:Event.pointerY(g)-this.offSetPosition.y};
a.x-=this.offsetScroll.x-this.scrollNode.scrollLeft;
a.y-=this.offsetScroll.y-this.scrollNode.scrollTop;
var b=g.shiftKey||g.ctrlKey;
if(ORYX.CONFIG.GRID_ENABLED&&!b){a=this.snapToGrid(a)
}else{if(this.vLine){this.vLine.hide()
}if(this.hLine){this.hLine.hide()
}}a.x/=this.faktorXY.x;
a.y/=this.faktorXY.y;
a.x=Math.max(0,a.x);
a.y=Math.max(0,a.y);
var h=this.facade.getCanvas();
a.x=Math.min(h.bounds.width()-this.dragBounds.width(),a.x);
a.y=Math.min(h.bounds.height()-this.dragBounds.height(),a.y);
offset={x:a.x-this.dragBounds.upperLeft().x,y:a.y-this.dragBounds.upperLeft().y};
this.dragBounds.moveBy(offset);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAG_TRACKER_DRAG,shapes:this.currentShapes,bounds:this.dragBounds});
this.resizeRectangle(this.dragBounds);
this.isAttachingAllowed=false;
var d=$A(this.facade.getCanvas().getAbstractShapesAtPosition(this.facade.eventCoordinates(g)));
var f=this.toMoveShapes.length==1&&this.toMoveShapes[0] instanceof ORYX.Core.Node&&this.toMoveShapes[0].dockers.length>0;
f=f&&d.length!=1;
if(!f&&d.length===this._currentUnderlyingNodes.length&&d.all(function(i,c){return this._currentUnderlyingNodes[c]===i
}.bind(this))){return
}else{if(this._onlyEdges){this.isAddingAllowed=true;
this.containmentParentNode=this.facade.getCanvas()
}else{var e={event:g,underlyingNodes:d,checkIfAttachable:f};
this.checkRules(e)
}}this._currentUnderlyingNodes=d.reverse();
if(this.isAttachingAllowed){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"dragdropresize.attached",elements:[this.containmentParentNode],style:ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE,color:ORYX.CONFIG.SELECTION_VALID_COLOR})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.attached"})
}if(!this.isAttachingAllowed){if(this.isAddingAllowed){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"dragdropresize.contain",elements:[this.containmentParentNode],color:ORYX.CONFIG.SELECTION_VALID_COLOR})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"dragdropresize.contain",elements:[this.containmentParentNode],color:ORYX.CONFIG.SELECTION_INVALID_COLOR})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"dragdropresize.contain"})
}return
},checkRules:function(d){var f=d.event;
var c=d.underlyingNodes;
var e=d.checkIfAttachable;
var b=d.noEdges;
this.containmentParentNode=c.reverse().find((function(g){return(g instanceof ORYX.Core.Canvas)||(((g instanceof ORYX.Core.Node)||((g instanceof ORYX.Core.Edge)&&!b))&&(!(this.currentShapes.member(g)||this.currentShapes.any(function(h){return(h.children.length>0&&h.getChildNodes(true).member(g))
}))))
}).bind(this));
if(e&&this.containmentParentNode){this.isAttachingAllowed=this.facade.getRules().canConnect({sourceShape:this.containmentParentNode,edgeShape:this.toMoveShapes[0],targetShape:this.toMoveShapes[0]});
if(this.containmentParentNode&&this.containmentParentNode.properties["oryx-tasktype"]&&this.containmentParentNode.properties["oryx-tasktype"]=="Script"){this.isAttachingAllowed=false
}if(this.isAttachingAllowed){var a=this.facade.eventCoordinates(f);
this.isAttachingAllowed=this.containmentParentNode.isPointOverOffset(a.x,a.y)
}}if(!this.isAttachingAllowed){this.isAddingAllowed=this.toMoveShapes.all((function(g){if(g instanceof ORYX.Core.Edge||g instanceof ORYX.Core.Controls.Docker||this.containmentParentNode===g.parent){return true
}else{if(this.containmentParentNode!==g){if(!(this.containmentParentNode instanceof ORYX.Core.Edge)||!b){if(this.facade.getRules().canContain({containingShape:this.containmentParentNode,containedShape:g})){return true
}}}}return false
}).bind(this))
}if(!this.isAttachingAllowed&&!this.isAddingAllowed&&(this.containmentParentNode instanceof ORYX.Core.Edge)){d.noEdges=true;
d.underlyingNodes.reverse();
this.checkRules(d)
}},refreshSelectedShapes:function(){if(!this.dragBounds){return
}var d=this.dragBounds.upperLeft();
var b=this.oldDragBounds.upperLeft();
var c={x:d.x-b.x,y:d.y-b.y};
var a=[new ORYX.Core.Command.Move(this.toMoveShapes,c,null,this.containmentParentNode,this.currentShapes,this,true)];
if(this._undockedEdgesCommand instanceof ORYX.Core.Command){a.unshift(this._undockedEdgesCommand)
}this.facade.executeCommands(a);
if(this.dragBounds){this.oldDragBounds=this.dragBounds.clone()
}},onResize:function(a){if(!this.dragBounds){return
}this.dragBounds=a;
this.isResizing=true;
this.resizeRectangle(this.dragBounds)
},onResizeStart:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_START})
},onResizeEnd:function(){if(!(this.currentShapes instanceof Array)||this.currentShapes.length<=0){return
}if(this.isResizing){var a=ORYX.Core.Command.extend({construct:function(f,h,g){this.shape=f;
this.oldBounds=f.bounds.clone();
this.newBounds=h;
this.plugin=g
},execute:function(){this.shape.bounds.set(this.newBounds.a,this.newBounds.b);
this.update(this.getOffset(this.oldBounds,this.newBounds))
},rollback:function(){this.shape.bounds.set(this.oldBounds.a,this.oldBounds.b);
this.update(this.getOffset(this.newBounds,this.oldBounds))
},getOffset:function(g,f){return{x:f.a.x-g.a.x,y:f.a.y-g.a.y,xs:f.width()/g.width(),ys:f.height()/g.height()}
},update:function(g){this.shape.getLabels().each(function(h){h.changed()
});
var f=[].concat(this.shape.getIncomingShapes()).concat(this.shape.getOutgoingShapes()).findAll(function(h){return h instanceof ORYX.Core.Edge
}.bind(this));
this.plugin.layoutEdges(this.shape,f,g);
this.plugin.doLayout([this.shape]);
this.plugin.facade.setSelection([this.shape]);
this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection()
}});
var c=this.dragBounds.clone();
var b=this.currentShapes[0];
if(b.parent){var e=b.parent.absoluteXY();
c.moveBy(-e.x,-e.y)
}var d=new a(b,c,this);
this.facade.executeCommands([d]);
this.isResizing=false;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_RESIZE_END,shapes:[b]})
}},beforeDrag:function(){var a=ORYX.Core.Command.extend({construct:function(b){this.dockers=b.collect(function(c){return c instanceof ORYX.Core.Controls.Docker?{docker:c,dockedShape:c.getDockedShape(),refPoint:c.referencePoint}:undefined
}).compact()
},execute:function(){this.dockers.each(function(b){b.docker.setDockedShape(undefined)
})
},rollback:function(){this.dockers.each(function(b){b.docker.setDockedShape(b.dockedShape);
b.docker.setReferencePoint(b.refPoint)
})
}});
this._undockedEdgesCommand=new a(this.toMoveShapes);
this._undockedEdgesCommand.execute()
},hideAllLabels:function(a){a.getLabels().each(function(b){b.hide()
});
a.getAllDockedShapes().each(function(b){var c=b.getLabels();
if(c.length>0){c.each(function(d){d.hide()
})
}});
a.getChildren().each((function(b){if(b instanceof ORYX.Core.Shape){this.hideAllLabels(b)
}}).bind(this))
},afterDrag:function(){},showAllLabels:function(a){for(var d=0;
d<a.length;
d++){var b=a[d];
b.show()
}var f=a.getAllDockedShapes();
for(var d=0;
d<f.length;
d++){var c=f[d];
var g=c.getLabels();
if(g.length>0){g.each(function(h){h.show()
})
}}for(var d=0;
d<a.children.length;
d++){var e=a.children[d];
if(e instanceof ORYX.Core.Shape){this.showAllLabels(e)
}}},onSelectionChanged:function(b){this.resizerSE.onSelectionChanged(b);
this.resizerNW.onSelectionChanged(b);
var d=b.elements;
this.dragEnable=false;
this.dragIntialized=false;
this.resizerSE.hide();
this.resizerNW.hide();
if(!d||d.length==0){this.selectedRect.hide();
this.currentShapes=[];
this.toMoveShapes=[];
this.dragBounds=undefined;
this.oldDragBounds=undefined
}else{this.currentShapes=d;
var e=this.facade.getCanvas().getShapesWithSharedParent(d);
this.toMoveShapes=e;
this.toMoveShapes=this.toMoveShapes.findAll(function(f){return f instanceof ORYX.Core.Node&&(f.dockers.length===0||!d.member(f.dockers.first().getDockedShape()))
});
d.each((function(f){if(!(f instanceof ORYX.Core.Edge)){return
}var h=f.getDockers();
var i=d.member(h.first().getDockedShape());
var g=d.member(h.last().getDockedShape());
if(!i&&!g){var j=!h.first().getDockedShape()&&!h.last().getDockedShape();
if(j){this.toMoveShapes=this.toMoveShapes.concat(h)
}}if(f.dockers.length>2&&i&&g){this.toMoveShapes=this.toMoveShapes.concat(h.findAll(function(l,k){return k>0&&k<h.length-1
}))
}}).bind(this));
var c=undefined;
this.toMoveShapes.each(function(g){var f=g;
if(g instanceof ORYX.Core.Controls.Docker){f=g.parent
}if(!c){c=f.absoluteBounds()
}else{c.include(f.absoluteBounds())
}}.bind(this));
if(!c){d.each(function(f){if(!c){c=f.absoluteBounds()
}else{c.include(f.absoluteBounds())
}})
}this.dragBounds=c;
this.oldDragBounds=c.clone();
this.resizeRectangle(c);
this.selectedRect.show();
if(d.length==1&&d[0].isResizable){var a=d[0].getStencil().fixedAspectRatio()?d[0].bounds.width()/d[0].bounds.height():undefined;
this.resizerSE.setBounds(this.dragBounds,d[0].minimumSize,d[0].maximumSize,a);
this.resizerSE.show();
this.resizerNW.setBounds(this.dragBounds,d[0].minimumSize,d[0].maximumSize,a);
this.resizerNW.show()
}else{this.resizerSE.setBounds(undefined);
this.resizerNW.setBounds(undefined)
}if(ORYX.CONFIG.GRID_ENABLED){this.distPoints=[];
if(this.distPointTimeout){window.clearTimeout(this.distPointTimeout)
}this.distPointTimeout=window.setTimeout(function(){var f=this.facade.getCanvas().getChildShapes(true).findAll(function(h){var g=h.parent;
while(g){if(d.member(g)){return false
}g=g.parent
}return true
});
f.each((function(j){if(!(j instanceof ORYX.Core.Edge)){var h=j.absoluteXY();
var i=j.bounds.width();
var g=j.bounds.height();
this.distPoints.push({ul:{x:h.x,y:h.y},c:{x:h.x+(i/2),y:h.y+(g/2)},lr:{x:h.x+i,y:h.y+g}})
}}).bind(this))
}.bind(this),10)
}}},snapToGrid:function(h){var a=this.dragBounds;
var n={};
var m=6;
var k=10;
var o=6;
var b=this.vLine?this.vLine.getScale():1;
var j={x:(h.x/b),y:(h.y/b)};
var l={x:(h.x/b)+(a.width()/2),y:(h.y/b)+(a.height()/2)};
var g={x:(h.x/b)+(a.width()),y:(h.y/b)+(a.height())};
var f,d;
var i,e;
this.distPoints.each(function(q){var c,s,r,p;
if(Math.abs(q.c.x-l.x)<k){c=q.c.x-l.x;
r=q.c.x
}if(Math.abs(q.c.y-l.y)<k){s=q.c.y-l.y;
p=q.c.y
}if(c!==undefined){f=f===undefined?c:(Math.abs(c)<Math.abs(f)?c:f);
if(f===c){i=r
}}if(s!==undefined){d=d===undefined?s:(Math.abs(s)<Math.abs(d)?s:d);
if(d===s){e=p
}}});
if(f!==undefined){j.x+=f;
j.x*=b;
if(this.vLine&&i){this.vLine.update(i)
}}else{j.x=(h.x-(h.x%(ORYX.CONFIG.GRID_DISTANCE/2)));
if(this.vLine){this.vLine.hide()
}}if(d!==undefined){j.y+=d;
j.y*=b;
if(this.hLine&&e){this.hLine.update(e)
}}else{j.y=(h.y-(h.y%(ORYX.CONFIG.GRID_DISTANCE/2)));
if(this.hLine){this.hLine.hide()
}}return j
},showGridLine:function(){},resizeRectangle:function(a){this.selectedRect.resize(a)
}});
ORYX.Plugins.SelectedRect=Clazz.extend({construct:function(a){this.parentId=a;
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",$(a),["g"]);
this.dashedArea=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["rect",{x:0,y:0,"stroke-width":1,stroke:"#777777",fill:"none","stroke-dasharray":"2,2","pointer-events":"none"}]);
this.hide()
},hide:function(){this.node.setAttributeNS(null,"display","none")
},show:function(){this.node.setAttributeNS(null,"display","inherit")
},resize:function(a){var c=a.upperLeft();
var b=ORYX.CONFIG.SELECTED_AREA_PADDING;
this.dashedArea.setAttributeNS(null,"width",a.width()+2*b);
this.dashedArea.setAttributeNS(null,"height",a.height()+2*b);
this.node.setAttributeNS(null,"transform","translate("+(c.x-b)+", "+(c.y-b)+")")
}});
ORYX.Plugins.GridLine=Clazz.extend({construct:function(b,a){if(ORYX.Plugins.GridLine.DIR_HORIZONTAL!==a&&ORYX.Plugins.GridLine.DIR_VERTICAL!==a){a=ORYX.Plugins.GridLine.DIR_HORIZONTAL
}this.parent=$(b);
this.direction=a;
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.parent,["g"]);
this.line=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["path",{"stroke-width":1,stroke:"silver",fill:"none","stroke-dasharray":"5,5","pointer-events":"none"}]);
this.hide()
},hide:function(){this.node.setAttributeNS(null,"display","none")
},show:function(){this.node.setAttributeNS(null,"display","inherit")
},getScale:function(){try{return this.parent.parentNode.transform.baseVal.getItem(0).matrix.a
}catch(a){return 1
}},update:function(e){if(this.direction===ORYX.Plugins.GridLine.DIR_HORIZONTAL){var d=e instanceof Object?e.y:e;
var c=this.parent.parentNode.parentNode.width.baseVal.value/this.getScale();
this.line.setAttributeNS(null,"d","M 0 "+d+" L "+c+" "+d)
}else{var a=e instanceof Object?e.x:e;
var b=this.parent.parentNode.parentNode.height.baseVal.value/this.getScale();
this.line.setAttributeNS(null,"d","M"+a+" 0 L "+a+" "+b)
}this.show()
}});
ORYX.Plugins.GridLine.DIR_HORIZONTAL="hor";
ORYX.Plugins.GridLine.DIR_VERTICAL="ver";
ORYX.Plugins.Resizer=Clazz.extend({construct:function(c,a,b){this.parentId=c;
this.orientation=a;
this.facade=b;
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",$(this.parentId),["div",{"class":"resizer_"+this.orientation,style:"left:0px; top:0px;"}]);
this.node.addEventListener(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this),true);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.handleMouseUp.bind(this),true);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.handleMouseMove.bind(this),false);
this.dragEnable=false;
this.offSetPosition={x:0,y:0};
this.bounds=undefined;
this.canvasNode=this.facade.getCanvas().node;
this.minSize=undefined;
this.maxSize=undefined;
this.aspectRatio=undefined;
this.resizeCallbacks=[];
this.resizeStartCallbacks=[];
this.resizeEndCallbacks=[];
this.hide();
this.scrollNode=this.node.parentNode.parentNode.parentNode
},onSelectionChanged:function(a){var b=a.elements;
if(!b||b.length==0){this.currentShapes=[]
}else{this.currentShapes=b
}},handleMouseDown:function(a){this.dragEnable=true;
this.offsetScroll={x:this.scrollNode.scrollLeft,y:this.scrollNode.scrollTop};
this.offSetPosition={x:Event.pointerX(a)-this.position.x,y:Event.pointerY(a)-this.position.y};
this.resizeStartCallbacks.each((function(b){b(this.bounds)
}).bind(this))
},handleMouseUp:function(a){this.dragEnable=false;
this.containmentParentNode=null;
this.resizeEndCallbacks.each((function(b){b(this.bounds)
}).bind(this))
},handleMouseMove:function(c){if(!this.dragEnable){return
}if(c.shiftKey||c.ctrlKey){this.aspectRatio=this.bounds.width()/this.bounds.height()
}else{this.aspectRatio=undefined
}var b={x:Event.pointerX(c)-this.offSetPosition.x,y:Event.pointerY(c)-this.offSetPosition.y};
b.x-=this.offsetScroll.x-this.scrollNode.scrollLeft;
b.y-=this.offsetScroll.y-this.scrollNode.scrollTop;
b.x=Math.min(b.x,this.facade.getCanvas().bounds.width());
b.y=Math.min(b.y,this.facade.getCanvas().bounds.height());
var d={x:b.x-this.position.x,y:b.y-this.position.y};
if(this.aspectRatio){newAspectRatio=(this.bounds.width()+d.x)/(this.bounds.height()+d.y);
if(newAspectRatio>this.aspectRatio){d.x=this.aspectRatio*(this.bounds.height()+d.y)-this.bounds.width()
}else{if(newAspectRatio<this.aspectRatio){d.y=(this.bounds.width()+d.x)/this.aspectRatio-this.bounds.height()
}}}if(this.orientation==="northwest"){if(this.bounds.width()-d.x>this.maxSize.width){d.x=-(this.maxSize.width-this.bounds.width());
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.width()-d.x<this.minSize.width){d.x=-(this.minSize.width-this.bounds.width());
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.height()-d.y>this.maxSize.height){d.y=-(this.maxSize.height-this.bounds.height());
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}if(this.bounds.height()-d.y<this.minSize.height){d.y=-(this.minSize.height-this.bounds.height());
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}}else{if(this.bounds.width()+d.x>this.maxSize.width){d.x=this.maxSize.width-this.bounds.width();
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.width()+d.x<this.minSize.width){d.x=this.minSize.width-this.bounds.width();
if(this.aspectRatio){d.y=this.aspectRatio*d.x
}}if(this.bounds.height()+d.y>this.maxSize.height){d.y=this.maxSize.height-this.bounds.height();
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}if(this.bounds.height()+d.y<this.minSize.height){d.y=this.minSize.height-this.bounds.height();
if(this.aspectRatio){d.x=d.y/this.aspectRatio
}}}if(this.orientation==="northwest"){var a={x:this.bounds.lowerRight().x,y:this.bounds.lowerRight().y};
this.bounds.extend({x:-d.x,y:-d.y});
this.bounds.moveBy(d)
}else{this.bounds.extend(d)
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAG_TRACKER_RESIZE,shapes:this.currentShapes,bounds:this.bounds});
this.update();
this.resizeCallbacks.each((function(e){e(this.bounds)
}).bind(this));
Event.stop(c)
},registerOnResizeStart:function(a){if(!this.resizeStartCallbacks.member(a)){this.resizeStartCallbacks.push(a)
}},unregisterOnResizeStart:function(a){if(this.resizeStartCallbacks.member(a)){this.resizeStartCallbacks=this.resizeStartCallbacks.without(a)
}},registerOnResizeEnd:function(a){if(!this.resizeEndCallbacks.member(a)){this.resizeEndCallbacks.push(a)
}},unregisterOnResizeEnd:function(a){if(this.resizeEndCallbacks.member(a)){this.resizeEndCallbacks=this.resizeEndCallbacks.without(a)
}},registerOnResize:function(a){if(!this.resizeCallbacks.member(a)){this.resizeCallbacks.push(a)
}},unregisterOnResize:function(a){if(this.resizeCallbacks.member(a)){this.resizeCallbacks=this.resizeCallbacks.without(a)
}},hide:function(){this.node.style.display="none"
},show:function(){if(this.bounds){this.node.style.display=""
}},setBounds:function(d,b,a,c){this.bounds=d;
if(!b){b={width:ORYX.CONFIG.MINIMUM_SIZE,height:ORYX.CONFIG.MINIMUM_SIZE}
}if(!a){a={width:ORYX.CONFIG.MAXIMUM_SIZE,height:ORYX.CONFIG.MAXIMUM_SIZE}
}this.minSize=b;
this.maxSize=a;
this.aspectRatio=c;
this.update()
},update:function(){if(!this.bounds){return
}var c=this.bounds.upperLeft();
if(this.bounds.width()<this.minSize.width){this.bounds.set(c.x,c.y,c.x+this.minSize.width,c.y+this.bounds.height())
}if(this.bounds.height()<this.minSize.height){this.bounds.set(c.x,c.y,c.x+this.bounds.width(),c.y+this.minSize.height)
}if(this.bounds.width()>this.maxSize.width){this.bounds.set(c.x,c.y,c.x+this.maxSize.width,c.y+this.bounds.height())
}if(this.bounds.height()>this.maxSize.height){this.bounds.set(c.x,c.y,c.x+this.bounds.width(),c.y+this.maxSize.height)
}var b=this.canvasNode.getScreenCTM();
c.x*=b.a;
c.y*=b.d;
if(this.orientation==="northwest"){c.x-=19;
c.y-=45
}else{c.x+=(b.a*this.bounds.width())+8;
c.y+=(b.d*this.bounds.height())-9
}this.position=c;
this.node.style.left=this.position.x+"px";
this.node.style.top=this.position.y+"px"
}});
ORYX.Core.Command.Move=ORYX.Core.Command.extend({construct:function(b,g,f,c,a,e,d){this.moveShapes=b;
this.selectedShapes=a;
this.offset=g;
this.newLocation=f;
this.plugin=e;
this.doLayout=d;
this.newParents=b.collect(function(h){return c||h.parent
});
this.oldParents=b.collect(function(h){return h.parent
});
this.dockedNodes=b.findAll(function(h){return h instanceof ORYX.Core.Node&&h.dockers.length==1
}).collect(function(h){return{docker:h.dockers[0],dockedShape:h.dockers[0].getDockedShape(),refPoint:h.dockers[0].referencePoint}
})
},execute:function(){this.dockAllShapes();
this.move(this.offset,this.newLocation,this.doLayout);
this.addShapeToParent(this.newParents);
this.selectCurrentShapes();
if(this.plugin){this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection()
}},rollback:function(){var a={x:-this.offset.x,y:-this.offset.y};
this.move(a);
this.addShapeToParent(this.oldParents);
this.dockAllShapes(true);
this.selectCurrentShapes();
if(this.plugin){this.plugin.facade.getCanvas().update();
this.plugin.facade.updateSelection()
}},move:function(d,m,a){if(!this.plugin){return
}for(var g=0;
g<this.moveShapes.length;
g++){var l=this.moveShapes[g];
if(d){l.bounds.moveBy(d)
}else{l.bounds.moveTo(m)
}if(l instanceof ORYX.Core.Node){(l.dockers||[]).each(function(i){if(d){i.bounds.moveBy(d)
}});
var e=[].concat(l.getIncomingShapes()).concat(l.getOutgoingShapes()).findAll(function(i){return i instanceof ORYX.Core.Edge&&!this.moveShapes.any(function(j){return j==i||(j instanceof ORYX.Core.Controls.Docker&&j.parent==i)
})
}.bind(this)).findAll(function(i){return(i.dockers.first().getDockedShape()==l||!this.moveShapes.include(i.dockers.first().getDockedShape()))&&(i.dockers.last().getDockedShape()==l||!this.moveShapes.include(i.dockers.last().getDockedShape()))
}.bind(this));
this.plugin.layoutEdges(l,e,d);
var h=[].concat(l.getIncomingShapes()).concat(l.getOutgoingShapes()).findAll(function(i){return i instanceof ORYX.Core.Edge&&i.dockers.first().isDocked()&&i.dockers.last().isDocked()&&!this.moveShapes.include(i)&&!this.moveShapes.any(function(j){return j==i||(j instanceof ORYX.Core.Controls.Docker&&j.parent==i)
})
}.bind(this)).findAll(function(i){return this.moveShapes.indexOf(i.dockers.first().getDockedShape())>g||this.moveShapes.indexOf(i.dockers.last().getDockedShape())>g
}.bind(this));
for(var f=0;
f<h.length;
f++){for(var b=1;
b<h[f].dockers.length-1;
b++){var c=h[f].dockers[b];
if(!c.getDockedShape()&&!this.moveShapes.include(c)){c.bounds.moveBy(d)
}}}}}if(a){this.plugin.doLayout(this.moveShapes)
}},dockAllShapes:function(a){for(var b=0;
b<this.dockedNodes.length;
b++){var c=this.dockedNodes[b].docker;
c.setDockedShape(a?this.dockedNodes[b].dockedShape:undefined);
if(c.getDockedShape()){c.setReferencePoint(this.dockedNodes[b].refPoint)
}}},addShapeToParent:function(j){for(var a=0;
a<this.moveShapes.length;
a++){var d=this.moveShapes[a];
if(d instanceof ORYX.Core.Node&&d.parent!==j[a]){try{var l=j[a].absoluteXY();
var h=d.absoluteXY();
var k=h.x-l.x;
var f=h.y-l.y;
j[a].add(d);
d.getOutgoingShapes((function(b){if(b instanceof ORYX.Core.Node&&!this.moveShapes.member(b)){j[a].add(b)
}}).bind(this));
if(d instanceof ORYX.Core.Node&&d.dockers.length==1){var g=d.bounds;
k+=g.width()/2;
f+=g.height()/2;
d.dockers.first().bounds.centerMoveTo(k,f)
}else{d.bounds.moveTo(k,f)
}}catch(c){}}}},selectCurrentShapes:function(){if(this.plugin){this.plugin.facade.setSelection(this.selectedShapes)
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.RenameShapes=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK,this.actOnDBLClick.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_CLICK,this.actOnClick.bind(this));
this.facade.offer({keyCodes:[{keyCode:113,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.renamePerF2.bind(this)})
},renamePerF2:function renamePerF2(){var a=this.facade.getSelection();
this.actOnDBLClick(undefined,a.first())
},getEditableProperties:function getEditableProperties(a){var b=a.getStencil().properties().findAll(function(c){return(c.refToView()&&c.refToView().length>0&&c.directlyEditable())
});
return b.findAll(function(c){return !c.readonly()&&c.type()==ORYX.CONFIG.TYPE_STRING
})
},getPropertyForLabel:function getPropertyForLabel(c,a,b){return c.find(function(d){return d.refToView().any(function(e){return b.id==a.id+e
})
})
},actOnClick:function actOnClick(a,b){if(!(b instanceof ORYX.Core.Shape)){if(this.shownComboBox){this.hide();
this.destroy()
}}},actOnDBLClick:function actOnDBLClick(h,d){if(!(d instanceof ORYX.Core.Shape)){return
}if((d instanceof ORYX.Core.Node||d instanceof ORYX.Core.Edge)&&d.properties["oryx-isselectable"]=="false"){return
}this.hide();
this.destroy();
var e=this.getEditableProperties(d);
var f=e.collect(function(k){return k.refToView()
}).flatten().compact();
var b=d.getLabels().findAll(function(k){return f.any(function(l){return k.id.endsWith(l)
})
});
if(b.length==0){return
}var c=b.length==1?b[0]:null;
if(!c){c=b.find(function(k){return k.node==h.target||k.node==h.target.parentNode
});
if(!c){var i=this.facade.eventCoordinates(h);
var j=this.facade.getCanvas().rootNode.lastChild.getScreenCTM();
i.x*=j.a;
i.y*=j.d;
if(!d instanceof ORYX.Core.Node){var g=b.collect(function(m){var l=this.getCenterPosition(m.node);
var k=Math.sqrt(Math.pow(l.x-i.x,2)+Math.pow(l.y-i.y,2));
return{diff:k,label:m}
}.bind(this));
g.sort(function(l,k){return l.diff>k.diff
});
c=g[0].label
}else{var g=b.collect(function(m){var l=this.getDifferenceCenterForNode(m.node);
var k=Math.sqrt(Math.pow(l.x-i.x,2)+Math.pow(l.y-i.y,2));
return{diff:k,label:m}
}.bind(this));
g.sort(function(l,k){return l.diff>k.diff
});
c=g[0].label
}}}var a=this.getPropertyForLabel(e,d,c);
this.showTextField(d,a,c)
},showTextField:function showTextField(i,d,j){var h=this.facade.getCanvas().getHTMLContainer().id;
var f;
if(!(i instanceof ORYX.Core.Node)){var a=j.node.getBoundingClientRect();
f=Math.max(150,a.width)
}else{f=i.bounds.width()
}if(!i instanceof ORYX.Core.Node){var b=this.getCenterPosition(j.node);
b.x-=(f/2)
}else{var b=i.absoluteBounds().center();
b.x-=(f/2)
}var e=d.prefix()+"-"+d.id();
this.comboId=Ext.id();
var g={id:this.comboId,renderTo:h,value:i.properties[e],maxLength:d.length(),emptyText:d.title(),listeners:{specialkey:this._specialKeyPressed.bind(this),blur:function(){}.bind(this),change:function(p,o,l){if(this.shownComboBox){var n=i;
var l=n.properties[e];
var o=this.shownComboBox.getRawValue();
var m=this.facade;
if(l!=o){var k=ORYX.Core.Command.extend({construct:function(){this.el=n;
this.propId=e;
this.oldValue=l;
this.newValue=o;
this.facade=m
},execute:function(){this.el.setProperty(this.propId,this.newValue);
this.facade.setSelection([this.el]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.el.setProperty(this.propId,this.oldValue);
this.facade.setSelection([this.el]);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var q=new k();
this.facade.executeCommands([q])
}}}.bind(this)},hideTrigger:true,typeAhead:true,queryMode:"local",minChars:1,labelStyle:"display:none",store:ORYX.Dictionary.Dictionaryitems,displayField:"name",valueField:"name",mode:"local",triggerAction:"all",forceSelection:false,caseSensitive:false,autoSelect:false};
this.shownComboBox=new Ext.form.ComboBox(g);
this.shownComboBox.setPosition((b.x<10)?10:b.x,b.y-16);
this.shownComboBox.setSize(Math.max(100,f),40);
if(("webkitSpeech" in document.createElement("input"))){var c={"x-webkit-speech":"true"};
Ext.get(this.comboId).set(c)
}this.shownComboBox.show();
this.shownComboBox.focus("",40);
this.facade.disableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
},_specialKeyPressed:function _specialKeyPressed(c,b){var a=b.getKey();
if(a==13&&(b.shiftKey||!c.initialConfig.grow)){c.fireEvent("change",null,c.getValue());
this.destroy()
}else{if(a==b.ESC){this.destroy()
}}},getCenterPosition:function(f){var a={x:0,y:0};
var c=f.getTransformToElement(this.facade.getCanvas().rootNode.lastChild);
var h=this.facade.getCanvas().rootNode.lastChild.getScreenCTM();
var b=f.getTransformToElement(f.parentNode);
var d=undefined;
a.x=c.e-b.e;
a.y=c.f-b.f;
try{d=f.getBBox()
}catch(g){}if(d===null||typeof d==="undefined"||d.width==0||d.height==0){d={x:Number(f.getAttribute("x")),y:Number(f.getAttribute("y")),width:0,height:0}
}a.x+=d.x;
a.y+=d.y;
a.x+=d.width/2;
a.y+=d.height/2;
a.x*=h.a;
a.y*=h.d;
return a
},getDifferenceCenterForNode:function getDifferenceCenterForNode(b){var a=this.getCenterPosition(b);
a.x=0;
a.y=a.y+10;
return a
},hide:function(a){if(this.shownComboBox){this.shownComboBox.fireEvent("change");
this.shownComboBox.fireEvent("blur")
}},destroy:function(a){if(this.shownComboBox){this.shownComboBox.hide();
delete this.shownComboBox;
this.facade.enableEvent(ORYX.CONFIG.EVENT_KEYDOWN)
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Undo=Clazz.extend({facade:undefined,undoStack:[],redoStack:[],construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.Undo.undo,description:ORYX.I18N.Undo.undoDesc,icon:ORYX.BASE_FILE_PATH+"images/arrow_undo.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:90,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.doUndo.bind(this),group:ORYX.I18N.Undo.group,isEnabled:function(){return this.undoStack.length>0
}.bind(this),index:0});
this.facade.offer({name:ORYX.I18N.Undo.redo,description:ORYX.I18N.Undo.redoDesc,icon:ORYX.BASE_FILE_PATH+"images/arrow_redo.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:89,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.doRedo.bind(this),group:ORYX.I18N.Undo.group,isEnabled:function(){return this.redoStack.length>0
}.bind(this),index:1})
}this.facade.registerOnEvent(ORYX.CONFIG.EVENT_EXECUTE_COMMANDS,this.handleExecuteCommands.bind(this))
},handleExecuteCommands:function(a){if(!a.commands){return
}this.undoStack.push(a.commands);
this.redoStack=[]
},doUndo:function(){var a=this.undoStack.pop();
if(a){this.redoStack.push(a);
a.each(function(b){b.rollback()
})
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_UNDO_ROLLBACK,commands:a})
},doRedo:function(){var a=this.redoStack.pop();
if(a){this.undoStack.push(a);
a.each(function(b){b.execute()
})
}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_UNDO_EXECUTE,commands:a})
}});
Array.prototype.insertFrom=function(e,d){d=Math.max(0,d);
e=Math.min(Math.max(0,e),this.length-1);
var b=this[e];
var a=this.without(b);
var c=a.slice(0,d);
c.push(b);
if(a.length>d){c=c.concat(a.slice(d))
}return c
};
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Arrangement=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.Arrangement.btf,functionality:this.setZLevel.bind(this,this.setToTop),group:ORYX.I18N.Arrangement.groupZ,icon:ORYX.BASE_FILE_PATH+"images/shape_move_front.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_move_backwards.png",description:ORYX.I18N.Arrangement.btfDesc,index:1,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.btb,functionality:this.setZLevel.bind(this,this.setToBack),group:ORYX.I18N.Arrangement.groupZ,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_move_backwards.png",icon:ORYX.BASE_FILE_PATH+"images/shape_move_back.png",description:ORYX.I18N.Arrangement.btbDesc,index:2,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.bf,functionality:this.setZLevel.bind(this,this.setForward),group:ORYX.I18N.Arrangement.groupZ,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_move_backwards.png",icon:ORYX.BASE_FILE_PATH+"images/shape_move_forwards.png",description:ORYX.I18N.Arrangement.bfDesc,index:3,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.bb,functionality:this.setZLevel.bind(this,this.setBackward),group:ORYX.I18N.Arrangement.groupZ,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_move_backwards.png",icon:ORYX.BASE_FILE_PATH+"images/shape_move_backwards.png",description:ORYX.I18N.Arrangement.bbDesc,index:4,minShape:1});
this.facade.offer({name:ORYX.I18N.Arrangement.ab,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_BOTTOM]),group:ORYX.I18N.Arrangement.groupA,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_align_center.png",icon:ORYX.BASE_FILE_PATH+"images/shape_align_bottom.png",description:ORYX.I18N.Arrangement.abDesc,index:1,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.am,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_MIDDLE]),group:ORYX.I18N.Arrangement.groupA,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_align_center.png",icon:ORYX.BASE_FILE_PATH+"images/shape_align_middle.png",description:ORYX.I18N.Arrangement.amDesc,index:2,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.at,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_TOP]),group:ORYX.I18N.Arrangement.groupA,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_align_center.png",icon:ORYX.BASE_FILE_PATH+"images/shape_align_top.png",description:ORYX.I18N.Arrangement.atDesc,index:3,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.al,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_LEFT]),group:ORYX.I18N.Arrangement.groupA,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_align_center.png",icon:ORYX.BASE_FILE_PATH+"images/shape_align_left.png",description:ORYX.I18N.Arrangement.alDesc,index:4,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.ac,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_CENTER]),group:ORYX.I18N.Arrangement.groupA,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_align_center.png",icon:ORYX.BASE_FILE_PATH+"images/shape_align_center.png",description:ORYX.I18N.Arrangement.acDesc,index:5,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.ar,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_RIGHT]),group:ORYX.I18N.Arrangement.groupA,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_align_center.png",icon:ORYX.BASE_FILE_PATH+"images/shape_align_right.png",description:ORYX.I18N.Arrangement.arDesc,index:6,minShape:2});
this.facade.offer({name:ORYX.I18N.Arrangement.as,functionality:this.alignShapes.bind(this,[ORYX.CONFIG.EDITOR_ALIGN_SIZE]),group:ORYX.I18N.Arrangement.groupA,dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/shape_align_center.png",icon:ORYX.BASE_FILE_PATH+"images/shape_align_size.png",description:ORYX.I18N.Arrangement.asDesc,index:7,minShape:2})
}this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_TOP,this.setZLevel.bind(this,this.setToTop));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACK,this.setZLevel.bind(this,this.setToBack));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_FORWARD,this.setZLevel.bind(this,this.setForward));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_ARRANGEMENT_BACKWARD,this.setZLevel.bind(this,this.setBackward))
},setZLevel:function(d,b){var a=ORYX.Core.Command.extend({construct:function(g,f,e){this.callback=g;
this.elements=f;
this.elAndIndex=f.map(function(h){return{el:h,previous:h.parent.children[h.parent.children.indexOf(h)-1]}
});
this.facade=e
},execute:function(){this.callback(this.elements);
this.facade.setSelection(this.elements)
},rollback:function(){var g=this.elAndIndex.sortBy(function(l){var m=l.el;
var i=$A(m.node.parentNode.childNodes);
return i.indexOf(m.node)
});
for(var f=0;
f<g.length;
f++){var h=g[f].el;
var j=h.parent;
var k=j.children.indexOf(h);
var e=j.children.indexOf(g[f].previous);
e=e||0;
j.children=j.children.insertFrom(k,e);
h.node.parentNode.insertBefore(h.node,h.node.parentNode.childNodes[e+1])
}this.facade.setSelection(this.elements)
}});
var c=new a(d,this.facade.getSelection(),this.facade);
if(b.excludeCommand){c.execute()
}else{this.facade.executeCommands([c])
}},setToTop:function(b){var a=b.sortBy(function(e,c){var d=$A(e.node.parentNode.childNodes);
return d.indexOf(e.node)
});
a.each(function(c){var d=c.parent;
d.children=d.children.without(c);
d.children.push(c);
c.node.parentNode.appendChild(c.node)
})
},setToBack:function(b){var a=b.sortBy(function(e,c){var d=$A(e.node.parentNode.childNodes);
return d.indexOf(e.node)
});
a=a.reverse();
a.each(function(c){var d=c.parent;
d.children=d.children.without(c);
d.children.unshift(c);
c.node.parentNode.insertBefore(c.node,c.node.parentNode.firstChild)
})
},setBackward:function(c){var b=c.sortBy(function(f,d){var e=$A(f.node.parentNode.childNodes);
return e.indexOf(f.node)
});
b=b.reverse();
var a=b.findAll(function(d){return !b.some(function(e){return e.node==d.node.previousSibling
})
});
a.each(function(e){if(e.node.previousSibling===null){return
}var f=e.parent;
var d=f.children.indexOf(e);
f.children=f.children.insertFrom(d,d-1);
e.node.parentNode.insertBefore(e.node,e.node.previousSibling)
})
},setForward:function(c){var b=c.sortBy(function(f,d){var e=$A(f.node.parentNode.childNodes);
return e.indexOf(f.node)
});
var a=b.findAll(function(d){return !b.some(function(e){return e.node==d.node.nextSibling
})
});
a.each(function(f){var d=f.node.nextSibling;
if(d===null){return
}var e=f.parent.children.indexOf(f);
var g=f.parent;
g.children=g.children.insertFrom(e,e+1);
f.node.parentNode.insertBefore(d,f.node)
})
},alignShapes:function(b){var f=this.facade.getSelection();
f=this.facade.getCanvas().getShapesWithSharedParent(f);
f=f.findAll(function(h){return(h instanceof ORYX.Core.Node)
});
f=f.findAll(function(h){var i=h.getIncomingShapes();
return i.length==0||!f.include(i[0])
});
if(f.length<2){return
}var e=f[0].absoluteBounds().clone();
f.each(function(h){e.include(h.absoluteBounds().clone())
});
var d=0;
var c=0;
f.each(function(h){d=Math.max(h.bounds.width(),d);
c=Math.max(h.bounds.height(),c)
});
var a=ORYX.Core.Command.extend({construct:function(m,l,k,j,h,i){this.elements=m;
this.bounds=l;
this.maxHeight=k;
this.maxWidth=j;
this.way=h;
this.facade=i;
this.orgPos=[]
},setBounds:function(h,j){if(!j){j={width:ORYX.CONFIG.MAXIMUM_SIZE,height:ORYX.CONFIG.MAXIMUM_SIZE}
}if(!h.bounds){throw"Bounds not definined."
}var i={a:{x:h.bounds.upperLeft().x-(this.maxWidth-h.bounds.width())/2,y:h.bounds.upperLeft().y-(this.maxHeight-h.bounds.height())/2},b:{x:h.bounds.lowerRight().x+(this.maxWidth-h.bounds.width())/2,y:h.bounds.lowerRight().y+(this.maxHeight-h.bounds.height())/2}};
if(this.maxWidth>j.width){i.a.x=h.bounds.upperLeft().x-(j.width-h.bounds.width())/2;
i.b.x=h.bounds.lowerRight().x+(j.width-h.bounds.width())/2
}if(this.maxHeight>j.height){i.a.y=h.bounds.upperLeft().y-(j.height-h.bounds.height())/2;
i.b.y=h.bounds.lowerRight().y+(j.height-h.bounds.height())/2
}h.bounds.set(i)
},execute:function(){this.elements.each(function(h,i){this.orgPos[i]=h.bounds.upperLeft();
var j=this.bounds.clone();
if(h.parent&&!(h.parent instanceof ORYX.Core.Canvas)){var k=h.parent.absoluteBounds().upperLeft();
j.moveBy(-k.x,-k.y)
}switch(this.way){case ORYX.CONFIG.EDITOR_ALIGN_BOTTOM:h.bounds.moveTo({x:h.bounds.upperLeft().x,y:j.b.y-h.bounds.height()});
break;
case ORYX.CONFIG.EDITOR_ALIGN_MIDDLE:h.bounds.moveTo({x:h.bounds.upperLeft().x,y:(j.a.y+j.b.y-h.bounds.height())/2});
break;
case ORYX.CONFIG.EDITOR_ALIGN_TOP:h.bounds.moveTo({x:h.bounds.upperLeft().x,y:j.a.y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_LEFT:h.bounds.moveTo({x:j.a.x,y:h.bounds.upperLeft().y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_CENTER:h.bounds.moveTo({x:(j.a.x+j.b.x-h.bounds.width())/2,y:h.bounds.upperLeft().y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_RIGHT:h.bounds.moveTo({x:j.b.x-h.bounds.width(),y:h.bounds.upperLeft().y});
break;
case ORYX.CONFIG.EDITOR_ALIGN_SIZE:if(h.isResizable){this.orgPos[i]={a:h.bounds.upperLeft(),b:h.bounds.lowerRight()};
this.setBounds(h,h.maximumSize)
}break
}}.bind(this));
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.elements.each(function(h,i){if(this.way==ORYX.CONFIG.EDITOR_ALIGN_SIZE){if(h.isResizable){h.bounds.set(this.orgPos[i])
}}else{h.bounds.moveTo(this.orgPos[i])
}}.bind(this));
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var g=new a(f,e,c,d,parseInt(b),this.facade);
this.facade.executeCommands([g])
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Grouping=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.Grouping.group,functionality:this.createGroup.bind(this),group:ORYX.I18N.Grouping.grouping,icon:ORYX.BASE_FILE_PATH+"images/shape_group.png",description:ORYX.I18N.Grouping.groupDesc,index:1,minShape:2,isEnabled:this.isEnabled.bind(this,false)});
this.facade.offer({name:ORYX.I18N.Grouping.ungroup,functionality:this.deleteGroup.bind(this),group:ORYX.I18N.Grouping.grouping,icon:ORYX.BASE_FILE_PATH+"images/shape_ungroup.png",description:ORYX.I18N.Grouping.ungroupDesc,index:2,minShape:2,isEnabled:this.isEnabled.bind(this,true)})
}this.selectedElements=[];
this.groups=[]
},isEnabled:function(a){var b=this.selectedElements;
return a===this.groups.any(function(c){return c.length===b.length&&c.all(function(d){return b.member(d)
})
})
},onSelectionChanged:function(b){var a=b.elements;
this.selectedElements=this.groups.findAll(function(c){return c.any(function(d){return a.member(d)
})
});
this.selectedElements.push(a);
this.selectedElements=this.selectedElements.flatten().uniq();
if(this.selectedElements.length!==a.length){this.facade.setSelection(this.selectedElements)
}},createGroup:function(){var c=this.facade.getSelection();
var a=ORYX.Core.Command.extend({construct:function(g,d,f,e){this.selectedElements=g;
this.groups=d;
this.callback=f;
this.facade=e
},execute:function(){var d=this.groups.findAll(function(e){return !e.any(function(f){return c.member(f)
})
});
d.push(c);
this.callback(d.clone());
this.facade.setSelection(this.selectedElements)
},rollback:function(){this.callback(this.groups.clone());
this.facade.setSelection(this.selectedElements)
}});
var b=new a(c,this.groups.clone(),this.setGroups.bind(this),this.facade);
this.facade.executeCommands([b])
},deleteGroup:function(){var c=this.facade.getSelection();
var a=ORYX.Core.Command.extend({construct:function(g,d,f,e){this.selectedElements=g;
this.groups=d;
this.callback=f;
this.facade=e
},execute:function(){var d=this.groups.partition(function(e){return e.length!==c.length||!e.all(function(f){return c.member(f)
})
});
this.callback(d[0]);
this.facade.setSelection(this.selectedElements)
},rollback:function(){this.callback(this.groups.clone());
this.facade.setSelection(this.selectedElements)
}});
var b=new a(c,this.groups.clone(),this.setGroups.bind(this),this.facade);
this.facade.executeCommands([b])
},setGroups:function(a){this.groups=a
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DragDocker=Clazz.extend({construct:function(a){this.facade=a;
this.VALIDCOLOR=ORYX.CONFIG.SELECTION_VALID_COLOR;
this.INVALIDCOLOR=ORYX.CONFIG.SELECTION_INVALID_COLOR;
this.shapeSelection=undefined;
this.docker=undefined;
this.dockerParent=undefined;
this.dockerSource=undefined;
this.dockerTarget=undefined;
this.lastUIObj=undefined;
this.isStartDocker=undefined;
this.isEndDocker=undefined;
this.undockTreshold=10;
this.initialDockerPosition=undefined;
this.outerDockerNotMoved=undefined;
this.isValid=false;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DOCKERDRAG,this.handleDockerDrag.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER,this.handleMouseOver.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT,this.handleMouseOut.bind(this))
},handleMouseOut:function(b,a){if(!this.docker&&a instanceof ORYX.Core.Controls.Docker){a.hide()
}else{if(!this.docker&&a instanceof ORYX.Core.Edge){a.dockers.each(function(c){c.hide()
})
}}},handleMouseOver:function(b,a){if(!this.docker&&a instanceof ORYX.Core.Controls.Docker){a.show()
}else{if(!this.docker&&a instanceof ORYX.Core.Edge){a.dockers.each(function(c){c.show()
})
}}},handleDockerDrag:function(b,a){this.handleMouseDown(b.uiEvent,a)
},handleMouseDown:function(d,c){if(c instanceof ORYX.Core.Controls.Docker&&c.isMovable){this.shapeSelection=this.facade.getSelection();
this.facade.setSelection();
this.docker=c;
this.initialDockerPosition=this.docker.bounds.center();
this.outerDockerNotMoved=false;
this.dockerParent=c.parent;
this._commandArg={docker:c,dockedShape:c.getDockedShape(),refPoint:c.referencePoint||c.bounds.center()};
this.docker.show();
if(c.parent instanceof ORYX.Core.Edge&&(c.parent.dockers.first()==c||c.parent.dockers.last()==c)){if(c.parent.dockers.first()==c&&c.parent.dockers.last().getDockedShape()){this.dockerTarget=c.parent.dockers.last().getDockedShape()
}else{if(c.parent.dockers.last()==c&&c.parent.dockers.first().getDockedShape()){this.dockerSource=c.parent.dockers.first().getDockedShape()
}}}else{this.dockerSource=undefined;
this.dockerTarget=undefined
}this.isStartDocker=this.docker.parent.dockers.first()===this.docker;
this.isEndDocker=this.docker.parent.dockers.last()===this.docker;
this.facade.getCanvas().add(this.docker.parent);
this.docker.parent.getLabels().each(function(e){e.hide()
});
if((!this.isStartDocker&&!this.isEndDocker)||!this.docker.isDocked()){this.docker.setDockedShape(undefined);
var b=this.facade.eventCoordinates(d);
this.docker.bounds.centerMoveTo(b);
this.dockerParent._update()
}else{this.outerDockerNotMoved=true
}var a={movedCallback:this.dockerMoved.bind(this),upCallback:this.dockerMovedFinished.bind(this)};
ORYX.Core.UIEnableDrag(d,c,a)
}},dockerMoved:function(s){this.outerDockerNotMoved=false;
var j=undefined;
if(this.docker.parent){if(this.isStartDocker||this.isEndDocker){var m=this.facade.eventCoordinates(s);
if(this.docker.isDocked()){var b=ORYX.Core.Math.getDistancePointToPoint(m,this.initialDockerPosition);
if(b<this.undockTreshold){this.outerDockerNotMoved=true;
return
}this.docker.setDockedShape(undefined);
this.dockerParent._update()
}var q=this.facade.getCanvas().getAbstractShapesAtPosition(m);
var o=q.pop();
if(this.docker.parent===o){o=q.pop()
}if(this.lastUIObj==o){}else{if(o instanceof ORYX.Core.Shape){var r=this.docker.parent.getStencil().stencilSet();
if(this.docker.parent instanceof ORYX.Core.Edge){var t=this.getHighestParentBeforeCanvas(o);
if(t instanceof ORYX.Core.Edge&&this.docker.parent===t){this.isValid=false;
this.dockerParent._update();
return
}this.isValid=false;
var a=o,c=o;
while(!this.isValid&&a&&!(a instanceof ORYX.Core.Canvas)){o=a;
this.isValid=this.facade.getRules().canConnect({sourceShape:this.dockerSource?this.dockerSource:(this.isStartDocker?o:undefined),edgeShape:this.docker.parent,targetShape:this.dockerTarget?this.dockerTarget:(this.isEndDocker?o:undefined)});
a=a.parent
}if(!this.isValid){o=c
}}else{this.isValid=this.facade.getRules().canConnect({sourceShape:o,edgeShape:this.docker.parent,targetShape:this.docker.parent})
}if(this.lastUIObj){this.hideMagnets(this.lastUIObj)
}if(this.isValid){this.showMagnets(o)
}this.showHighlight(o,this.isValid?this.VALIDCOLOR:this.INVALIDCOLOR);
this.lastUIObj=o
}else{this.hideHighlight();
this.lastUIObj?this.hideMagnets(this.lastUIObj):null;
this.lastUIObj=undefined;
this.isValid=false
}}if(this.lastUIObj&&this.isValid&&!(s.shiftKey||s.ctrlKey)){j=this.lastUIObj.magnets.find(function(w){return w.absoluteBounds().isIncluded(m)
});
if(j){this.docker.bounds.centerMoveTo(j.absoluteCenterXY())
}}}}if(!(s.shiftKey||s.ctrlKey)&&!j){var l=ORYX.CONFIG.DOCKER_SNAP_OFFSET;
var h=l+1;
var f=l+1;
var v=this.docker.bounds.center();
if(this.docker.parent){this.docker.parent.dockers.each((function(x){if(this.docker==x){return
}var w=x.referencePoint?x.getAbsoluteReferencePoint():x.bounds.center();
h=Math.abs(h)>Math.abs(w.x-v.x)?w.x-v.x:h;
f=Math.abs(f)>Math.abs(w.y-v.y)?w.y-v.y:f
}).bind(this));
if(Math.abs(h)<l||Math.abs(f)<l){h=Math.abs(h)<l?h:0;
f=Math.abs(f)<l?f:0;
this.docker.bounds.centerMoveTo(v.x+h,v.y+f)
}else{var d=this.docker.parent.dockers[Math.max(this.docker.parent.dockers.indexOf(this.docker)-1,0)];
var p=this.docker.parent.dockers[Math.min(this.docker.parent.dockers.indexOf(this.docker)+1,this.docker.parent.dockers.length-1)];
if(d&&p&&d!==this.docker&&p!==this.docker){var e=d.bounds.center();
var g=p.bounds.center();
var n=this.docker.bounds.center();
if(ORYX.Core.Math.isPointInLine(n.x,n.y,e.x,e.y,g.x,g.y,10)){var u=(Number(g.y)-Number(e.y))/(Number(g.x)-Number(e.x));
var k=((e.y-(e.x*u))-(n.y-(n.x*(-Math.pow(u,-1)))))/((-Math.pow(u,-1))-u);
var i=(e.y-(e.x*u))+(u*k);
if(isNaN(k)||isNaN(i)){return
}this.docker.bounds.centerMoveTo(k,i)
}}}}}this.dockerParent._update()
},dockerMovedFinished:function(e){this.facade.setSelection(this.shapeSelection);
this.hideHighlight();
this.dockerParent.getLabels().each(function(g){g.show()
});
if(this.lastUIObj&&(this.isStartDocker||this.isEndDocker)){if(this.isValid){this.docker.setDockedShape(this.lastUIObj);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_DRAGDOCKER_DOCKED,docker:this.docker,parent:this.docker.parent,target:this.lastUIObj})
}this.hideMagnets(this.lastUIObj)
}this.docker.hide();
if(this.outerDockerNotMoved){var d=this.facade.eventCoordinates(e);
var a=this.facade.getCanvas().getAbstractShapesAtPosition(d);
var b=a.findAll(function(g){return g instanceof ORYX.Core.Node
});
a=b.length?b:a;
this.facade.setSelection(a)
}else{var c=ORYX.Core.Command.extend({construct:function(l,h,g,k,j,i){this.docker=l;
this.index=l.parent.dockers.indexOf(l);
this.newPosition=h;
this.newDockedShape=k;
this.oldPosition=g;
this.oldDockedShape=j;
this.facade=i;
this.index=l.parent.dockers.indexOf(l);
this.shape=l.parent
},execute:function(){if(!this.docker.parent){this.docker=this.shape.dockers[this.index]
}this.dock(this.newDockedShape,this.newPosition);
this.removedDockers=this.shape.removeUnusedDockers();
this.facade.updateSelection()
},rollback:function(){this.dock(this.oldDockedShape,this.oldPosition);
(this.removedDockers||$H({})).each(function(g){this.shape.add(g.value,Number(g.key));
this.shape._update(true)
}.bind(this));
this.facade.updateSelection()
},dock:function(g,h){this.docker.setDockedShape(undefined);
if(g){this.docker.setDockedShape(g);
this.docker.setReferencePoint(h)
}else{this.docker.bounds.centerMoveTo(h)
}this.facade.getCanvas().update()
}});
if(this.docker.parent){var f=new c(this.docker,this.docker.getDockedShape()?this.docker.referencePoint:this.docker.bounds.center(),this._commandArg.refPoint,this.docker.getDockedShape(),this._commandArg.dockedShape,this.facade);
this.facade.executeCommands([f])
}}this.docker=undefined;
this.dockerParent=undefined;
this.dockerSource=undefined;
this.dockerTarget=undefined;
this.lastUIObj=undefined
},hideHighlight:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"validDockedShape"})
},showHighlight:function(b,a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"validDockedShape",elements:[b],color:a})
},showMagnets:function(a){a.magnets.each(function(b){b.show()
})
},hideMagnets:function(a){a.magnets.each(function(b){b.hide()
})
},getHighestParentBeforeCanvas:function(a){if(!(a instanceof ORYX.Core.Shape)){return undefined
}var b=a.parent;
while(b&&!(b.parent instanceof ORYX.Core.Canvas)){b=b.parent
}return b
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.AddDocker=Clazz.extend({construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.AddDocker.add,functionality:this.enableAddDocker.bind(this),group:ORYX.I18N.AddDocker.group,icon:ORYX.BASE_FILE_PATH+"images/vector_add.png",description:ORYX.I18N.AddDocker.addDesc,index:1,toggle:true,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.AddDocker.del,functionality:this.enableDeleteDocker.bind(this),group:ORYX.I18N.AddDocker.group,icon:ORYX.BASE_FILE_PATH+"images/vector_delete.png",description:ORYX.I18N.AddDocker.delDesc,index:2,toggle:true,minShape:0,maxShape:0})
}this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this))
},enableAddDocker:function(a,b){this.addDockerButton=a;
if(b&&this.deleteDockerButton){this.deleteDockerButton.toggle(false)
}},enableDeleteDocker:function(a,b){this.deleteDockerButton=a;
if(b&&this.addDockerButton){this.addDockerButton.toggle(false)
}},enabledAdd:function(){return this.addDockerButton?this.addDockerButton.pressed:false
},enabledDelete:function(){return this.deleteDockerButton?this.deleteDockerButton.pressed:false
},handleMouseDown:function(b,a){if(this.enabledAdd()&&a instanceof ORYX.Core.Edge){this.newDockerCommand({edge:a,position:this.facade.eventCoordinates(b)})
}else{if(this.enabledDelete()&&a instanceof ORYX.Core.Controls.Docker&&a.parent instanceof ORYX.Core.Edge){this.newDockerCommand({edge:a.parent,docker:a})
}else{if(this.enabledAdd()){this.addDockerButton.toggle(false)
}else{if(this.enabledDelete()){this.deleteDockerButton.toggle(false)
}}}}},newDockerCommand:function(b){if(!b.edge){return
}var a=ORYX.Core.Command.extend({construct:function(h,f,e,g,i,d){this.addEnabled=h;
this.deleteEnabled=f;
this.edge=e;
this.docker=g;
this.pos=i;
this.facade=d
},execute:function(){if(this.addEnabled){this.docker=this.edge.addDocker(this.pos,this.docker);
this.index=this.edge.dockers.indexOf(this.docker)
}else{if(this.deleteEnabled){this.index=this.edge.dockers.indexOf(this.docker);
this.pos=this.docker.bounds.center();
this.edge.removeDocker(this.docker)
}}this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){if(this.addEnabled){if(this.docker instanceof ORYX.Core.Controls.Docker){this.edge.removeDocker(this.docker)
}}else{if(this.deleteEnabled){this.edge.add(this.docker,this.index)
}}this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var c=new a(this.enabledAdd(),this.enabledDelete(),b.edge,b.docker,b.position,this.facade);
this.facade.executeCommands([c])
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.SelectionFrame=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this));
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEUP,this.handleMouseUp.bind(this),true);
this.position={x:0,y:0};
this.size={width:0,height:0};
this.offsetPosition={x:0,y:0};
this.moveCallback=undefined;
this.offsetScroll={x:0,y:0};
this.node=ORYX.Editor.graft("http://www.w3.org/1999/xhtml",this.facade.getCanvas().getHTMLContainer(),["div",{"class":"Oryx_SelectionFrame"}]);
this.hide()
},handleMouseDown:function(d,c){if(c instanceof ORYX.Core.Canvas){var e=c.rootNode.parentNode.parentNode;
var b=this.facade.getCanvas().node.getScreenCTM();
this.offsetPosition={x:b.e,y:b.f};
this.setPos({x:Event.pointerX(d)-this.offsetPosition.x,y:Event.pointerY(d)-this.offsetPosition.y});
this.resize({width:0,height:0});
this.moveCallback=this.handleMouseMove.bind(this);
document.documentElement.addEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.moveCallback,false);
this.offsetScroll={x:e.scrollLeft,y:e.scrollTop};
this.show()
}Event.stop(d)
},handleMouseUp:function(f){if(this.moveCallback){this.hide();
document.documentElement.removeEventListener(ORYX.CONFIG.EVENT_MOUSEMOVE,this.moveCallback,false);
this.moveCallback=undefined;
var e=this.facade.getCanvas().node.getScreenCTM();
var d={x:this.size.width>0?this.position.x:this.position.x+this.size.width,y:this.size.height>0?this.position.y:this.position.y+this.size.height};
var c={x:d.x+Math.abs(this.size.width),y:d.y+Math.abs(this.size.height)};
d.x/=e.a;
d.y/=e.d;
c.x/=e.a;
c.y/=e.d;
var g=this.facade.getCanvas().getChildShapes(true).findAll(function(b){var a=b.absoluteBounds();
var i=a.upperLeft();
var h=a.lowerRight();
if(i.x>d.x&&i.y>d.y&&h.x<c.x&&h.y<c.y){return true
}return false
});
this.facade.setSelection(g)
}},handleMouseMove:function(b){var a={width:Event.pointerX(b)-this.position.x-this.offsetPosition.x,height:Event.pointerY(b)-this.position.y-this.offsetPosition.y};
var c=this.facade.getCanvas().rootNode.parentNode.parentNode;
a.width-=this.offsetScroll.x-c.scrollLeft;
a.height-=this.offsetScroll.y-c.scrollTop;
this.resize(a);
Event.stop(b)
},hide:function(){this.node.style.display="none"
},show:function(){this.node.style.display=""
},setPos:function(a){this.node.style.top=a.y+"px";
this.node.style.left=a.x+"px";
this.position=a
},resize:function(a){this.setPos(this.position);
this.size=Object.clone(a);
if(a.width<0){this.node.style.left=(this.position.x+a.width)+"px";
a.width=-a.width
}if(a.height<0){this.node.style.top=(this.position.y+a.height)+"px";
a.height=-a.height
}this.node.style.width=a.width+"px";
this.node.style.height=a.height+"px"
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ShapeHighlighting=Clazz.extend({construct:function(a){this.parentNode=a.getCanvas().getSvgContainer();
this.node=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.parentNode,["g"]);
this.highlightNodes={};
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,this.setHighlight.bind(this));
a.registerOnEvent(ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,this.hideHighlight.bind(this))
},setHighlight:function(a){if(a&&a.highlightId){var b=this.highlightNodes[a.highlightId];
if(!b){b=ORYX.Editor.graft("http://www.w3.org/2000/svg",this.node,["path",{"stroke-width":2,fill:"none"}]);
this.highlightNodes[a.highlightId]=b
}if(a.elements&&a.elements.length>0){this.setAttributesByStyle(b,a);
this.show(b)
}else{this.hide(b)
}}},hideHighlight:function(a){if(a&&a.highlightId&&this.highlightNodes[a.highlightId]){this.hide(this.highlightNodes[a.highlightId])
}},hide:function(a){a.setAttributeNS(null,"display","none")
},show:function(a){a.setAttributeNS(null,"display","inherit")
},setAttributesByStyle:function(b,a){if(a.style&&a.style==ORYX.CONFIG.SELECTION_HIGHLIGHT_STYLE_RECTANGLE){var d=a.elements[0].absoluteBounds();
var c=a.strokewidth?a.strokewidth:ORYX.CONFIG.BORDER_OFFSET;
b.setAttributeNS(null,"d",this.getPathRectangle(d.a,d.b,c));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",c)
}else{if(a.elements.length==1&&a.elements[0] instanceof ORYX.Core.Edge&&a.highlightId!="selection"){b.setAttributeNS(null,"d",this.getPathEdge(a.elements[0].dockers));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:0.2);
b.setAttributeNS(null,"stroke-width",ORYX.CONFIG.OFFSET_EDGE_BOUNDS)
}else{b.setAttributeNS(null,"d",this.getPathByElements(a.elements));
b.setAttributeNS(null,"stroke",a.color?a.color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR);
b.setAttributeNS(null,"stroke-opacity",a.opacity?a.opacity:1);
b.setAttributeNS(null,"stroke-width",a.strokewidth?a.strokewidth:2)
}}},getPathByElements:function(a){if(!a||a.length<=0){return undefined
}var c=ORYX.CONFIG.SELECTED_AREA_PADDING;
var b="";
a.each((function(f){if(!f){return
}var g=f.absoluteBounds();
g.widen(c);
var e=g.upperLeft();
var d=g.lowerRight();
b=b+this.getPath(e,d)
}).bind(this));
return b
},getPath:function(d,c){return this.getPathCorners(d,c)
},getPathCorners:function(d,c){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
f=f+"M"+d.x+" "+(d.y+e)+" l0 -"+e+" l"+e+" 0 ";
f=f+"M"+d.x+" "+(c.y-e)+" l0 "+e+" l"+e+" 0 ";
f=f+"M"+c.x+" "+(c.y-e)+" l0 "+e+" l-"+e+" 0 ";
f=f+"M"+c.x+" "+(d.y+e)+" l0 -"+e+" l-"+e+" 0 ";
return f
},getPathRectangle:function(d,c,h){var e=ORYX.CONFIG.SELECTION_HIGHLIGHT_SIZE;
var f="";
var g=h/2;
f=f+"M"+(d.x+g)+" "+(d.y);
f=f+" L"+(d.x+g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(c.y-g);
f=f+" L"+(c.x-g)+" "+(d.y+g);
f=f+" L"+(d.x+g)+" "+(d.y+g);
return f
},getPathEdge:function(a){var b=a.length;
var c="M"+a[0].bounds.center().x+" "+a[0].bounds.center().y;
for(i=1;
i<b;
i++){var d=a[i].bounds.center();
c=c+" L"+d.x+" "+d.y
}return c
}});
ORYX.Plugins.HighlightingSelectedShapes=Clazz.extend({construct:function(a){this.facade=a;
this.opacityFull=0.9;
this.opacityLow=0.4
},onSelectionChanged:function(a){if(a.elements&&a.elements.length>1){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"selection",elements:a.elements.without(a.subSelection),color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:!a.subSelection?this.opacityFull:this.opacityLow});
if(a.subSelection){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_SHOW,highlightId:"subselection",elements:[a.subSelection],color:ORYX.CONFIG.SELECTION_HIGHLIGHT_COLOR,opacity:this.opacityFull})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"selection"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_HIGHLIGHT_HIDE,highlightId:"subselection"})
}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Edit=Clazz.extend({construct:function(a){this.facade=a;
this.clipboard=new ORYX.Plugins.Edit.ClipBoard();
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.Edit.cut,description:ORYX.I18N.Edit.cutDesc,icon:ORYX.BASE_FILE_PATH+"images/cut.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:88,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editCut),group:ORYX.I18N.Edit.group,index:1,minShape:1});
this.facade.offer({name:ORYX.I18N.Edit.copy,description:ORYX.I18N.Edit.copyDesc,icon:ORYX.BASE_FILE_PATH+"images/page_copy.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:67,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editCopy,[true,false]),group:ORYX.I18N.Edit.group,index:2,minShape:1});
this.facade.offer({name:ORYX.I18N.Edit.paste,description:ORYX.I18N.Edit.pasteDesc,icon:ORYX.BASE_FILE_PATH+"images/page_paste.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:86,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editPaste),isEnabled:this.clipboard.isOccupied.bind(this.clipboard),group:ORYX.I18N.Edit.group,index:3,minShape:0,maxShape:0});
this.facade.offer({name:ORYX.I18N.Edit.del,description:ORYX.I18N.Edit.delDesc,icon:ORYX.BASE_FILE_PATH+"images/cross.png",keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:8,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN},{keyCode:46,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.callEdit.bind(this,this.editDelete),group:ORYX.I18N.Edit.group,index:4,minShape:1})
}this.facade.registerOnEvent(ORYX.CONFIG.EVENT_FACADE_SELECTION_DELETION_REQUEST,this.editDelete.bind(this))
},callEdit:function(b,a){window.setTimeout(function(){b.apply(this,(a instanceof Array?a:[]))
}.bind(this),1)
},handleMouseDown:function(a){if(this._controlPressed){this._controlPressed=false;
this.editCopy();
this.editPaste();
a.forceExecution=true;
this.facade.raiseEvent(a,this.clipboard.shapesAsJson)
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
}if(f instanceof ORYX.Core.Node&&i instanceof ORYX.Core.Node){return
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
},editCut:function(){this.editCopy(false,true);
this.editDelete(true);
return false
},editCopy:function(c,a){var b=this.facade.getSelection();
if(b.length==0){return
}this.clipboard.refresh(b,this.getAllShapesToConsider(b),this.facade.getCanvas().getStencil().stencilSet().namespace(),a);
if(c){this.facade.updateSelection()
}},editPaste:function(){var b={childShapes:this.clipboard.shapesAsJson,stencilset:{namespace:this.clipboard.SSnamespace}};
Ext.apply(b,ORYX.Core.AbstractShape.JSONHelper);
var a=b.getChildShapes(true).pluck("resourceId");
var c={};
b.eachChild(function(d,e){d.outgoing=d.outgoing.select(function(f){return a.include(f.resourceId)
});
d.outgoing.each(function(f){if(!c[f.resourceId]){c[f.resourceId]=[]
}c[f.resourceId].push(d)
});
return d
}.bind(this),true,true);
b.eachChild(function(d,e){if(d.target&&!(a.include(d.target.resourceId))){d.target=undefined;
d.targetRemoved=true
}if(d.dockers&&d.dockers.length>=1&&d.dockers[0].getDocker&&((d.dockers[0].getDocker().getDockedShape()&&!a.include(d.dockers[0].getDocker().getDockedShape().resourceId))||!d.getShape().dockers[0].getDockedShape()&&!c[d.resourceId])){d.sourceRemoved=true
}return d
}.bind(this),true,true);
b.eachChild(function(d,e){if(this.clipboard.useOffset){d.bounds={lowerRight:{x:d.bounds.lowerRight.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:d.bounds.lowerRight.y+ORYX.CONFIG.COPY_MOVE_OFFSET},upperLeft:{x:d.bounds.upperLeft.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:d.bounds.upperLeft.y+ORYX.CONFIG.COPY_MOVE_OFFSET}}
}if(d.dockers){d.dockers=d.dockers.map(function(g,f){if((d.targetRemoved===true&&f==d.dockers.length-1&&g.getDocker)||(d.sourceRemoved===true&&f==0&&g.getDocker)){g=g.getDocker().bounds.center()
}if((f==0&&g.getDocker instanceof Function&&d.sourceRemoved!==true&&(g.getDocker().getDockedShape()||((c[d.resourceId]||[]).length>0&&(!(d.getShape() instanceof ORYX.Core.Node)||c[d.resourceId][0].getShape() instanceof ORYX.Core.Node))))||(f==d.dockers.length-1&&g.getDocker instanceof Function&&d.targetRemoved!==true&&(g.getDocker().getDockedShape()||d.target))){return{x:g.x,y:g.y,getDocker:g.getDocker}
}else{if(this.clipboard.useOffset){return{x:g.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:g.y+ORYX.CONFIG.COPY_MOVE_OFFSET,getDocker:g.getDocker}
}else{return{x:g.x,y:g.y,getDocker:g.getDocker}
}}}.bind(this))
}else{if(d.getShape() instanceof ORYX.Core.Node&&d.dockers&&d.dockers.length>0&&(!d.dockers.first().getDocker||d.sourceRemoved===true||!(d.dockers.first().getDocker().getDockedShape()||c[d.resourceId]))){d.dockers=d.dockers.map(function(g,f){if((d.sourceRemoved===true&&f==0&&g.getDocker)){g=g.getDocker().bounds.center()
}if(this.clipboard.useOffset){return{x:g.x+ORYX.CONFIG.COPY_MOVE_OFFSET,y:g.y+ORYX.CONFIG.COPY_MOVE_OFFSET,getDocker:g.getDocker}
}else{return{x:g.x,y:g.y,getDocker:g.getDocker}
}}.bind(this))
}}return d
}.bind(this),false,true);
this.clipboard.useOffset=true;
this.facade.importJSON(b)
},editDelete:function(){var a=this.facade.getSelection();
var b=new ORYX.Plugins.Edit.ClipBoard();
b.refresh(a,this.getAllShapesToConsider(a,true));
var c=new ORYX.Plugins.Edit.DeleteCommand(b,this.facade);
this.facade.executeCommands([c])
}});
ORYX.Plugins.Edit.ClipBoard=Clazz.extend({construct:function(){this.shapesAsJson=[];
this.selection=[];
this.SSnamespace="";
this.useOffset=true
},isOccupied:function(){return this.shapesAsJson.length>0
},refresh:function(d,b,c,a){this.selection=d;
this.SSnamespace=c;
this.outgoings={};
this.parents={};
this.targets={};
this.useOffset=a!==true;
this.shapesAsJson=b.map(function(e){var f=e.toJSON();
f.parent={resourceId:e.getParentShape().resourceId};
f.parentIndex=e.getParentShape().getChildShapes().indexOf(e);
return f
})
}});
ORYX.Plugins.Edit.DeleteCommand=ORYX.Core.Command.extend({construct:function(b,a){this.clipboard=b;
this.shapesAsJson=b.shapesAsJson;
this.facade=a;
this.dockers=this.shapesAsJson.map(function(g){var e=g.getShape();
var f=e.getIncomingShapes().map(function(h){return h.getDockers().last()
});
var d=e.getOutgoingShapes().map(function(h){return h.getDockers().first()
});
var c=e.getDockers().concat(f,d).compact().map(function(h){return{object:h,referencePoint:h.referencePoint,dockedShape:h.getDockedShape()}
});
return c
}).flatten()
},execute:function(){this.shapesAsJson.each(function(a){var b=this.facade.deleteShape(a.getShape())
}.bind(this));
this.facade.setSelection([]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.shapesAsJson.each(function(c){var a=c.getShape();
var b=this.facade.getCanvas().getChildShapeByResourceId(c.parent.resourceId)||this.facade.getCanvas();
b.add(a,a.parentIndex)
}.bind(this));
this.dockers.each(function(a){a.object.setDockedShape(a.dockedShape);
a.object.setReferencePoint(a.referencePoint)
}.bind(this));
this.facade.setSelection(this.selectedShapes);
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.KeysMove=ORYX.Plugins.AbstractPlugin.extend({facade:undefined,construct:function(a){this.facade=a;
this.copyElements=[];
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:65,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.selectAll.bind(this)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_LEFT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_LEFT,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_LEFT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_LEFT,true)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_RIGHT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_RIGHT,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_RIGHT,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_RIGHT,true)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_UP,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_UP,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_UP,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_UP,true)});
this.facade.offer({keyCodes:[{metaKeys:[ORYX.CONFIG.META_KEY_META_CTRL],keyCode:ORYX.CONFIG.KEY_CODE_DOWN,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_DOWN,false)});
this.facade.offer({keyCodes:[{keyCode:ORYX.CONFIG.KEY_CODE_DOWN,keyAction:ORYX.CONFIG.KEY_ACTION_DOWN}],functionality:this.move.bind(this,ORYX.CONFIG.KEY_CODE_DOWN,true)})
},selectAll:function(a){Event.stop(a.event);
this.facade.setSelection(this.facade.getCanvas().getChildShapes(true))
},move:function(l,i,j){Event.stop(j.event);
var b=i?20:5;
var k=this.facade.getSelection();
var g=this.facade.getSelection();
var c={x:0,y:0};
switch(l){case ORYX.CONFIG.KEY_CODE_LEFT:c.x=-1*b;
break;
case ORYX.CONFIG.KEY_CODE_RIGHT:c.x=b;
break;
case ORYX.CONFIG.KEY_CODE_UP:c.y=-1*b;
break;
case ORYX.CONFIG.KEY_CODE_DOWN:c.y=b;
break
}k=k.findAll(function(e){if(e instanceof ORYX.Core.Node&&e.dockers.length==1&&k.include(e.dockers.first().getDockedShape())){return false
}var m=e.parent;
do{if(k.include(m)){return false
}}while(m=m.parent);
return true
});
var f=true;
var h=k.all(function(e){if(e instanceof ORYX.Core.Edge){if(e.isDocked()){f=false
}return true
}return false
});
if(h&&!f){return
}k=k.map(function(m){if(m instanceof ORYX.Core.Node){return m
}else{if(m instanceof ORYX.Core.Edge){var e=m.dockers;
if(k.include(m.dockers.first().getDockedShape())){e=e.without(m.dockers.first())
}if(k.include(m.dockers.last().getDockedShape())){e=e.without(m.dockers.last())
}return e
}else{return null
}}}).flatten().compact();
if(k.size()>0){var a=[this.facade.getCanvas().bounds.lowerRight().x,this.facade.getCanvas().bounds.lowerRight().y,0,0];
k.each(function(e){a[0]=Math.min(a[0],e.bounds.upperLeft().x);
a[1]=Math.min(a[1],e.bounds.upperLeft().y);
a[2]=Math.max(a[2],e.bounds.lowerRight().x);
a[3]=Math.max(a[3],e.bounds.lowerRight().y)
});
if(a[0]+c.x<0){c.x=-a[0]
}if(a[1]+c.y<0){c.y=-a[1]
}if(a[2]+c.x>this.facade.getCanvas().bounds.lowerRight().x){c.x=this.facade.getCanvas().bounds.lowerRight().x-a[2]
}if(a[3]+c.y>this.facade.getCanvas().bounds.lowerRight().y){c.y=this.facade.getCanvas().bounds.lowerRight().y-a[3]
}if(c.x!=0||c.y!=0){var d=[new ORYX.Core.Command.Move(k,c,null,g,this)];
this.facade.executeCommands(d)
}}},getUndockedCommant:function(b){var a=ORYX.Core.Command.extend({construct:function(c){this.dockers=c.collect(function(d){return d instanceof ORYX.Core.Controls.Docker?{docker:d,dockedShape:d.getDockedShape(),refPoint:d.referencePoint}:undefined
}).compact()
},execute:function(){this.dockers.each(function(c){c.docker.setDockedShape(undefined)
})
},rollback:function(){this.dockers.each(function(c){c.docker.setDockedShape(c.dockedShape);
c.docker.setReferencePoint(c.refPoint)
})
}});
command=new a(b);
command.execute();
return command
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Plugins.Layouter){ORYX.Plugins.Layouter={}
}new function(){ORYX.Plugins.Layouter.EdgeLayouter=ORYX.Plugins.AbstractLayouter.extend({layouted:[],findRelatedEdges:function(a,b){edges=new Array();
if(this.isIncludedInEdgeIds(a)){edges.push(a)
}else{this.getChildShapesWithout(a,b).each(function(c){edges=edges.concat(c.outgoing).concat(c.incoming).concat(this.findRelatedEdges(c,b))
}.bind(this))
}return edges
},isIncludedInEdgeIds:function(a){if(typeof a.getStencil=="function"){return a.getStencil().type()=="edge"
}else{return false
}},layout:function(a){a.each(function(b){this.findRelatedEdges(b,[]).each(function(c){this.doLayout(c)
}.bind(this))
}.bind(this))
},doLayout:function(b){var d=b.getIncomingNodes()[0];
var c=b.getOutgoingNodes()[0];
if(!d||!c){return
}var a=this.getPositions(d,c,b);
if(a.length>0){this.setDockers(b,a[0].a,a[0].b)
}},getPositions:function(p,q,e){var s=p.absoluteBounds();
var k=q.absoluteBounds();
var o=s.center();
var l=k.center();
var j=s.midPoint();
var d=k.midPoint();
var i=Object.clone(e.dockers.first().referencePoint);
var r=Object.clone(e.dockers.last().referencePoint);
var c=e.dockers.first().getAbsoluteReferencePoint();
var n=e.dockers.last().getAbsoluteReferencePoint();
if(Math.abs(c.x-n.x)<1||Math.abs(c.y-n.y)<1){return[]
}var g={};
g.x=o.x<l.x?(((l.x-k.width()/2)-(o.x+s.width()/2))/2)+(o.x+s.width()/2):(((o.x-s.width()/2)-(l.x+k.width()/2))/2)+(l.x+k.width()/2);
g.y=o.y<l.y?(((l.y-k.height()/2)-(o.y+s.height()/2))/2)+(o.y+s.height()/2):(((o.y-s.height()/2)-(l.y+k.height()/2))/2)+(l.y+k.height()/2);
s.widen(5);
k.widen(20);
var h=[];
var f=this.getOffset.bind(this);
if(!s.isIncluded(l.x,o.y)&&!k.isIncluded(l.x,o.y)){h.push({a:{x:l.x+f(r,d,"x"),y:o.y+f(i,j,"y")},z:this.getWeight(p,o.x<l.x?"r":"l",q,o.y<l.y?"t":"b",e)})
}if(!s.isIncluded(o.x,l.y)&&!k.isIncluded(o.x,l.y)){h.push({a:{x:o.x+f(i,j,"x"),y:l.y+f(r,d,"y")},z:this.getWeight(p,o.y<l.y?"b":"t",q,o.x<l.x?"l":"r",e)})
}if(!s.isIncluded(g.x,o.y)&&!k.isIncluded(g.x,l.y)){h.push({a:{x:g.x,y:o.y+f(i,j,"y")},b:{x:g.x,y:l.y+f(r,d,"y")},z:this.getWeight(p,"r",q,"l",e,o.x>l.x)})
}if(!s.isIncluded(o.x,g.y)&&!k.isIncluded(l.x,g.y)){h.push({a:{x:o.x+f(i,j,"x"),y:g.y},b:{x:l.x+f(r,d,"x"),y:g.y},z:this.getWeight(p,"b",q,"t",e,o.y>l.y)})
}return h.sort(function(t,m){return t.z<m.z?1:(t.z==m.z?-1:-1)
})
},getOffset:function(c,b,a){return c[a]-b[a]
},getWeight:function(k,b,l,a,d,g){b=(b||"").toLowerCase();
a=(a||"").toLowerCase();
if(!["t","r","b","l"].include(b)){b="r"
}if(!["t","r","b","l"].include(a)){b="l"
}if(g){b=b=="t"?"b":(b=="r"?"l":(b=="b"?"t":(b=="l"?"r":"r")));
a=a=="t"?"b":(a=="r"?"l":(a=="b"?"t":(a=="l"?"r":"r")))
}var f=0;
var n=this.facade.getRules().getLayoutingRules(k,d)["out"];
var m=this.facade.getRules().getLayoutingRules(l,d)["in"];
var e=n[b];
var c=m[a];
var j=function(q,p,o){switch(q){case"t":return Math.abs(p.x-o.x)<2&&p.y<o.y;
case"r":return p.x>o.x&&Math.abs(p.y-o.y)<2;
case"b":return Math.abs(p.x-o.x)<2&&p.y>o.y;
case"l":return p.x<o.x&&Math.abs(p.y-o.y)<2;
default:return false
}};
var i=k.getIncomingShapes().findAll(function(o){return o instanceof ORYX.Core.Edge
}).any(function(o){return j(b,o.dockers[o.dockers.length-2].bounds.center(),o.dockers.last().bounds.center())
});
var h=l.getOutgoingShapes().findAll(function(o){return o instanceof ORYX.Core.Edge
}).any(function(o){return j(a,o.dockers[1].bounds.center(),o.dockers.first().bounds.center())
});
return(i||h?0:e+c)
},setDockers:function(e,d,c){if(!e){return
}e.dockers.each(function(a){e.removeDocker(a)
});
[d,c].compact().each(function(b){var a=e.createDocker(undefined,b);
a.bounds.centerMoveTo(b)
});
e.dockers.each(function(a){a.update()
});
e._update(true)
}})
}();
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.VisualValidation=ORYX.Plugins.AbstractPlugin.extend({construct:function(a){this.facade=a;
this.vt;
this.allErrors={};
this.errorDisplayView;
ORYX.IS_VALIDATING_PROCESS=false;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.SyntaxChecker.startValidating,functionality:this.enableValidation.bind(this),group:"validationandsimulation",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/visualvalidation.png",description:ORYX.I18N.SyntaxChecker.startValidating_desc,index:1,minShape:0,maxShape:0,isEnabled:function(){return !ORYX.IS_VALIDATING_PROCESS&&ORYX.READONLY!=true
}});
this.facade.offer({name:ORYX.I18N.SyntaxChecker.stopValidating,functionality:this.disableValidation.bind(this),group:"validationandsimulation",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/visualvalidation.png",description:ORYX.I18N.SyntaxChecker.stopValidating_desc,index:2,minShape:0,maxShape:0,isEnabled:function(){return ORYX.IS_VALIDATING_PROCESS&&ORYX.READONLY!=true
}});
this.facade.offer({name:ORYX.I18N.SyntaxChecker.viewAllIssues,functionality:this.viewAllValidation.bind(this),group:"validationandsimulation",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/visualvalidation.png",description:ORYX.I18N.SyntaxChecker.viewAllIssues_desc,index:3,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}})
}this.facade.registerOnEvent(ORYX.CONFIG.EVENT_CLICK,this.displayErrorsOnNode.bind(this))
},enableValidation:function(){ORYX.IS_VALIDATING_PROCESS=true;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.SyntaxChecker.startingContinousVal,title:""});
this.vt=window.setInterval((function(){this.startValidate(true)
}).bind(this),3000)
},disableValidation:function(){ORYX.IS_VALIDATING_PROCESS=false;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.SyntaxChecker.stoppingContinousVal,title:""});
window.clearInterval(this.vt);
this.stopValidate()
},viewAllValidation:function(){this.startValidate(false);
this.displayErrorsOnNode();
this.disableValidation()
},startValidate:function(a){var b=ORYX.EDITOR.getSerializedJSON();
new Ajax.Request(ORYX.PATH+"syntaxcheck",{method:"POST",asynchronous:false,parameters:{data:b,profile:ORYX.PROFILE,pp:ORYX.PREPROCESSING,uuid:ORYX.UUID},onSuccess:function(c){this.allErrors=new Hash();
this.resetBorderColors();
var d=c.responseText.evalJSON();
if(!(d instanceof Hash)){d=new Hash(d)
}this.allErrors=d;
if(a){d.keys().each(function(f){var e=this.facade.getCanvas().getChildShapeByResourceId(f);
if(e){if(e instanceof ORYX.Core.Node||e instanceof ORYX.Core.Edge){e.setProperty("oryx-bordercolor","#FF6600");
e.refresh()
}}}.bind(this))
}}.bind(this),onFailure:function(){this.allErrors=new Hash()
}})
},stopValidate:function(){this.allErrors=new Hash();
this.resetBorderColors()
},resetBorderColors:function(){ORYX.EDITOR.getCanvas().children.each(function(a){this.resetShape(a)
}.bind(this))
},resetShape:function(a){if(a){if(a instanceof ORYX.Core.Node||a instanceof ORYX.Core.Edge){a.setProperty("oryx-bordercolor",a.properties["oryx-origbordercolor"]);
a.refresh()
}if(a.getChildren().size()>0){for(var b=0;
b<a.getChildren().size();
b++){if(a.getChildren()[b] instanceof ORYX.Core.Node||a.getChildren()[b] instanceof ORYX.Core.Edge){this.resetShape(a.getChildren()[b])
}}}}},displayErrorsOnNode:function(b,c){if(this.allErrors instanceof Hash){var h=Ext.data.Record.create([{name:"name",shapeid:"shapeid",type:"type"}]);
var f=new Ext.data.MemoryProxy({root:[]});
var a=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},h),proxy:f,sorters:[{property:"name",direction:"ASC"}]});
a.load();
var g=false;
if(c){this.allErrors.keys().each(function(l){if(l==c.resourceId){g=true;
var k=this.allErrors[l];
for(var j=0;
j<k.length;
j++){a.add(new h({name:k[j].error,shapeid:k[j].id,type:k[j].type}))
}}}.bind(this))
}else{this.allErrors.keys().each(function(l){var k=this.allErrors[l];
for(var j=0;
j<k.length;
j++){a.add(new h({name:k[j].error,shapeid:k[j].id,type:k[j].type}))
}}.bind(this));
g=true
}if(g){var e=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:a,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"type",header:ORYX.I18N.SyntaxChecker.header_IssueType,width:100,dataIndex:"type",sortable:true,editor:new Ext.form.TextField({allowBlank:true,vtype:"inputName",regex:/^[a-z0-9 \-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"name",header:ORYX.I18N.SyntaxChecker.header_Description,width:500,dataIndex:"name",sortable:true,editor:new Ext.form.TextField({allowBlank:true,vtype:"inputName",regex:/^[a-z0-9 \-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode},{id:"shapeid",header:ORYX.I18N.SyntaxChecker.header_ShapeId,width:100,dataIndex:"shapeid",sortable:true,editor:new Ext.form.TextField({allowBlank:true,vtype:"inputName",regex:/^[a-z0-9 \-\.\_]*$/i}),renderer:Ext.util.Format.htmlEncode}]),autoHeight:true,clicksToEdit:1});
var d=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.SyntaxChecker.suggestions,height:300,width:700,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){d.hide()
}.bind(this)}],items:[e],listeners:{hide:function(){d.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.Save.close,handler:function(){d.hide()
}.bind(this)}]});
d.show()
}}}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.RegexTextEditor=Clazz.extend({construct:function(a){this.facade=a;
ORYX.FieldEditors.regex=new ORYX.Plugins.RegexTextEditor.EditorFactory()
}});
ORYX.Plugins.RegexTextEditor.EditorFactory=Clazz.extend({construct:function(){},init:function(){var b=arguments[0];
var c=arguments[1];
var a=new Ext.form.TextArea({alignment:"tl-tl",allowBlank:c.optional(),msgTarget:"title",maxLength:c.length(),regex:c._jsonProp.regex,regexText:c._jsonProp.invalidText});
a.on("keyup",function(e,d){if(a.validate()){this.editDirectly(b,e.getValue())
}}.bind(this));
return new Ext.Editor(a)
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}var guvnorPopupEditor;
ORYX.Plugins.ConstraintExpressionEditor=Clazz.extend({construct:function(b,a){this.facade=b;
ORYX.CONFIG.GUVNOR_USE_FIXED_PACKAGE=false;
ORYX.CONFIG.GUVNOR_FIXED_PACKAGE="mortgages";
ORYX.CONFIG.GUVNOR_CATEGORY="Home Mortgage";
ORYX.CONFIG.GUVNOR_HIDE_RHS=true;
ORYX.CONFIG.GUVNOR_HIDE_ATTRIBUTES=true;
console.log(a);
if(a.properties){a.properties.each(function(c){if(c.useFixedPackage){ORYX.CONFIG.GUVNOR_USE_FIXED_PACKAGE=(c.useFixedPackage=="true")
}if(c.fixedPackage){ORYX.CONFIG.GUVNOR_FIXED_PACKAGE=c.fixedPackage
}if(c.category){ORYX.CONFIG.GUVNOR_CATEGORY=c.category
}if(c.hideRHS){ORYX.CONFIG.GUVNOR_HIDE_RHS=(c.hideRHS=="true")
}if(c.hideAttributes){ORYX.CONFIG.GUVNOR_HIDE_ATTRIBUTES=(c.hideAttributes=="true")
}}.bind(this))
}ORYX.FieldEditors.simpleconstraintexpressioneditor=new ORYX.Plugins.ConstraintExpressionEditor.SimpleConstraintExpressionEditorFactory();
ORYX.FieldEditors.contextawareconstraintexpressioneditor=new ORYX.Plugins.ConstraintExpressionEditor.ContextAwareConstraintExpressionEditorFactory()
}});
ORYX.Plugins.ConstraintExpressionEditor.SimpleConstraintExpressionEditorFactory=Clazz.extend({construct:function(){},init:function(){var b=arguments[0];
var c=arguments[1];
var a=arguments[3];
return new ORYX.Plugins.ConstraintExpressionEditor.BaseConstraintExpressionEditorFactory().createEditor.bind(this)(false,b,c,a)
}});
ORYX.Plugins.ConstraintExpressionEditor.ContextAwareConstraintExpressionEditorFactory=Clazz.extend({construct:function(){},init:function(){var b=arguments[0];
var c=arguments[1];
var a=arguments[3];
return new ORYX.Plugins.ConstraintExpressionEditor.BaseConstraintExpressionEditorFactory().createEditor.bind(this)(true,b,c,a)
}});
ORYX.Plugins.ConstraintExpressionEditor.BaseConstraintExpressionEditorFactory=Clazz.extend({construct:function(){},createEditor:function(h,i,b,d){var f=true;
if(b._jsonProp.showConstraintEditorWhen){var a=b._jsonProp.showConstraintEditorWhen.property;
if(!a){alert("Error reading definition of showConstraintEditorWhen: 'property' is missing!");
return null
}var g=b._jsonProp.showConstraintEditorWhen.value;
if(!g){alert("Error reading definition of showConstraintEditorWhen: 'value' is missing!");
return null
}f=this.shapeSelection.shapes[0].properties[b.prefix()+"-"+a]==g
}var c;
if(f){var e=h?this.shapeSelection.shapes[0]:undefined;
c=new Ext.form.GuvnorPopupEditor(e,function(j){this.editDirectly(i,j)
}.bind(this));
guvnorPopupEditor=c
}else{c=new Ext.form.ComplexTextField({allowBlank:b.optional(),dataSource:this.dataSource,grid:this.grid,row:d,facade:this.facade});
c.on("dialogClosed",this.dialogClosed,{scope:this,row:d,col:1,field:c})
}return new Ext.Editor(c)
}});
Ext.form.GuvnorPopupEditor=function(b,g){var f="#-#";
var e="";
var d="";
var c=g;
var a=b;
Ext.form.GuvnorPopupEditor.superclass.constructor.call(this,{defaultAutoCreate:{tag:"textarea",rows:1,style:"height:16px;overflow:hidden;"},onTriggerClick:function(){if(this.disabled){return
}var k=document.body.clientWidth-20;
var l=document.body.clientHeight-20;
var o=ORYX.EXTERNAL_PROTOCOL+"://"+ORYX.EXTERNAL_HOST+"/"+ORYX.EXTERNAL_SUBDOMAIN+"/org.drools.guvnor.Guvnor/standaloneEditorServlet";
var j=[];
j.push({name:"client",value:""});
var v=ORYX.CONFIG.GUVNOR_FIXED_PACKAGE;
if(!ORYX.CONFIG.GUVNOR_USE_FIXED_PACKAGE){var r=ORYX.EDITOR.getJSON();
if(r.properties["package"]&&r.properties["package"]!=""){}else{alert("Please configure Process' 'package' attribute first");
return
}v=r.properties["package"]
}j.push({name:"packageName",value:v});
j.push({name:"categoryName",value:ORYX.CONFIG.GUVNOR_CATEGORY});
j.push({name:"hideRuleRHS",value:""+ORYX.CONFIG.GUVNOR_HIDE_RHS});
j.push({name:"hideRuleAttributes",value:""+ORYX.CONFIG.GUVNOR_HIDE_ATTRIBUTES});
if(e==""){j.push({name:"brlSource",value:"<rule><name>Condition Constraint</name><modelVersion>1.0</modelVersion><attributes></attributes><metadataList/><lhs></lhs><rhs></rhs></rule>"})
}else{j.push({name:"brlSource",value:e})
}if(a){var x=collectNodesInPath(a,new RegExp("ModelEntity"));
x=x.concat(collectNodesInPath(a,new RegExp("Model_")));
if(!x||x.length==0){alert("You must define at least 1 Model Entity in your process!");
return
}var u=[];
var q=[];
x.each(function(z){var p=z.properties["oryx-modelentity"];
var w=z.properties["oryx-fieldconstraint"];
var i=z.properties["oryx-constraintvalue"];
if(!p){u.push("Fact Name is mandatory!");
return
}if(!w){u.push("You must specify a field for '"+p+"' Model Entity");
return
}if(!i){u.push("You must specify a value for '"+p+"."+w+"' Model Entity");
return
}q.push("{"+p+"--@--"+w+"--@--"+i+"}")
});
if(u.length>0){this.showErrors(u);
return
}var y="";
new Ajax.Request("/workingSet",{asynchronous:false,method:"POST",parameters:{action:"createWorkingSetWithMandatoryConstraint",config:q},onSuccess:function(i){y=i.responseText
}.bind(this),onFailure:(function(i){u.push("Error getting Working Set Definition: "+i.responseText)
}).bind(this)});
if(u.length>0){this.showErrors(u);
return
}alert(y);
j.push({name:"workingSetXMLDefinitions",value:y})
}if(j.length>0){var m=0;
var n="";
o+="?";
for(m=0;
m<j.length;
m++){var h=j[m];
var s=n+h.name+"="+encodeURIComponent(h.value);
if(n==""){n="&amp;"
}o+=s
}}var t=new Ext.Window({id:"guvnorWindow",layout:"fit",width:k,height:l,closeAction:"close",plain:true,modal:true,title:"Title",autoScroll:true,resizable:true,html:'<iframe id="guvnorFrame" name="guvnorFrame" width="'+k+'" height="'+l+'"  onload="attachCallbacksToGuvnor();" src="'+o+'"></iframe>'});
t.show()
},showErrors:function(i){var h="Errors:";
i.each(function(j){h+="\n\t"+j
});
alert(h)
},encodeBRL:function(){var j="";
if(e){var h=e.split("\n");
for(var k=0;
k<h.length;
k++){var l=h[k];
l=encodeURIComponent(l);
l=f+l;
j+=l+"\n"
}}return j
},trimDRL:function(){var k="";
if(d){var h=false;
var m=d.split("\n");
for(var l=0;
l<m.length;
l++){var j=m[l];
j=j.replace(/^\s+/,"").replace(/\s+$/,"");
if(j=="then"){break
}if(h){k+=j+"\n"
}if(j=="when"){h=true
}}}return k
},getValue:function(){var h="";
h+=this.encodeBRL();
h+="\n";
h+=this.trimDRL();
return h
},closeGuvnorWindow:function(){Ext.getCmp("guvnorWindow").close()
},guvnorSaveAndCloseButtonCallback:function(){getGuvnorFrame(top).guvnorEditorObject.getBRL(function(h){this.setBRLValue(h);
getGuvnorFrame(top).guvnorEditorObject.getDRL(function(i){this.setDRLValue(i);
this.closeGuvnorWindow();
if(c){c(this.getValue())
}}.bind(this))
}.bind(this))
},guvnorCancelButtonCallback:function(){this.closeGuvnorWindow()
},setValue:function(l){d="";
e="";
var m=new RegExp("^"+f+".*");
var j=l.split("\n");
for(var k=0;
k<j.length;
k++){var h=j[k];
if(h.match(m)){e+=decodeURIComponent(h.substring(f.length))+"\n"
}else{d+=h+"\n"
}}},getDRLValue:function(){return d
},setDRLValue:function(h){d=h
},getBRLValue:function(){return e
},setBRLValue:function(h){e=h
}})
};
Ext.extend(Ext.form.GuvnorPopupEditor,Ext.form.TriggerField,{});
function attachCallbacksToGuvnor(){if(!getGuvnorFrame(top).guvnorEditorObject){setTimeout("this.attachCallbacksToGuvnor()",1000);
return
}getGuvnorFrame(top).guvnorEditorObject.registerAfterSaveAndCloseButtonCallbackFunction(guvnorPopupEditor.guvnorSaveAndCloseButtonCallback.bind(guvnorPopupEditor));
getGuvnorFrame(top).guvnorEditorObject.registerAfterCancelButtonCallbackFunction(guvnorPopupEditor.guvnorCancelButtonCallback.bind(guvnorPopupEditor))
}function getGuvnorFrame(b){if(b.frames.guvnorFrame){return b.frames.guvnorFrame
}for(var a=0;
a<b.frames.length;
a++){var c=getGuvnorFrame(b.frames[a]);
if(c){return c
}}return null
}function collectNodesInPath(a,c){if(!a.incoming||a.incoming.length==0){return[]
}var b=[];
a.incoming.each(function(d){if(d._stencil._jsonStencil.id.match(c)){b.push(d)
}b=b.concat(collectNodesInPath(d,c))
});
return b
};
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.Overlay=Clazz.extend({facade:undefined,styleNode:undefined,construct:function(a){this.facade=a;
this.changes=[];
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_SHOW,this.show.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_OVERLAY_HIDE,this.hide.bind(this));
this.styleNode=document.createElement("style");
this.styleNode.setAttributeNS(null,"type","text/css");
document.getElementsByTagName("head")[0].appendChild(this.styleNode)
},show:function(a){if(!a||!a.shapes||!a.shapes instanceof Array||!a.id||!a.id instanceof String||a.id.length==0){return
}if(a.attributes){a.shapes.each(function(d){if(!d instanceof ORYX.Core.Shape){return
}this.setAttributes(d.node,a.attributes)
}.bind(this))
}var c=true;
try{c=a.node&&a.node instanceof SVGElement
}catch(b){}if(a.node&&c){a._temps=[];
a.shapes.each(function(h,g){if(!h instanceof ORYX.Core.Shape){return
}var f={};
f.svg=a.dontCloneNode?a.node:a.node.cloneNode(true);
h.node.firstChild.appendChild(f.svg);
if(h instanceof ORYX.Core.Edge&&!a.nodePosition){a.nodePosition="START"
}if(a.nodePosition){var e=h.bounds;
var i=a.nodePosition.toUpperCase();
if(h instanceof ORYX.Core.Node&&i=="START"){i="NW"
}else{if(h instanceof ORYX.Core.Node&&i=="END"){i="SE"
}else{if(h instanceof ORYX.Core.Edge&&i=="START"){e=h.getDockers().first().bounds
}else{if(h instanceof ORYX.Core.Edge&&i=="END"){e=h.getDockers().last().bounds
}}}}f.callback=function(){var j=0;
var k=0;
if(i=="NW"){}else{if(i=="N"){j=e.width()/2
}else{if(i=="NE"){j=e.width()
}else{if(i=="E"){j=e.width();
k=e.height()/2
}else{if(i=="SE"){j=e.width();
k=e.height()
}else{if(i=="S"){j=e.width()/2;
k=e.height()
}else{if(i=="SW"){k=e.height()
}else{if(i=="W"){k=e.height()/2
}else{if(i=="START"||i=="END"){j=e.width()/2;
k=e.height()/2
}else{if(i=="CANVAS_TITLE_FORM"){j=10;
k=20
}else{if(i=="CANVAS_TITLE"){j=10;
k=20
}else{if(i=="SYNTAX_CHECKS"){j=-25;
k=(e.height()+15/2)-15
}else{if(i=="SIMMODELMAX"){j=(e.width()/2)-10;
k=e.height()
}else{if(i=="SIMMODELMIN"){j=(e.width()/2)-10;
k=e.height()-10
}else{if(i=="SIMMODELAVG"){j=(e.width()/2)-10;
k=e.height()-20
}else{return
}}}}}}}}}}}}}}}if(h instanceof ORYX.Core.Edge){j+=e.upperLeft().x;
k+=e.upperLeft().y
}f.svg.setAttributeNS(null,"transform","translate("+j+", "+k+")")
}.bind(this);
f.element=h;
f.callback();
e.registerCallback(f.callback)
}if(a.ghostPoint){var d={x:0,y:0};
d=a.ghostPoint;
f.callback=function(){var j=0;
var k=0;
j=d.x-7;
k=d.y-7;
f.svg.setAttributeNS(null,"transform","translate("+j+", "+k+")")
}.bind(this);
f.element=h;
f.callback();
e.registerCallback(f.callback)
}if(a.labelPoint){var d={x:0,y:0};
d=a.labelPoint;
f.callback=function(){var j=0;
var k=0;
j=d.x;
k=d.y;
f.svg.setAttributeNS(null,"transform","translate("+j+", "+k+")")
}.bind(this);
f.element=h;
f.callback();
e.registerCallback(f.callback)
}a._temps.push(f)
}.bind(this))
}if(!this.changes[a.id]){this.changes[a.id]=[]
}this.changes[a.id].push(a)
},hide:function(a){if(!a||!a.id||!a.id instanceof String||a.id.length==0||!this.changes[a.id]){return
}this.changes[a.id].each(function(b){b.shapes.each(function(d,c){if(!d instanceof ORYX.Core.Shape){return
}this.deleteAttributes(d.node)
}.bind(this));
if(b._temps){b._temps.each(function(c){if(c.svg&&c.svg.parentNode){c.svg.parentNode.removeChild(c.svg)
}if(c.callback&&c.element){c.element.bounds.unregisterCallback(c.callback)
}}.bind(this))
}}.bind(this));
this.changes[a.id]=null
},setAttributes:function(c,d){var h=this.getAllChilds(c.firstChild.firstChild);
var a=[];
h.each(function(k){a.push($A(k.attributes).findAll(function(l){return l.nodeValue.startsWith("url(#")
}))
});
a=a.flatten().compact();
a=a.collect(function(k){return k.nodeValue
}).uniq();
a=a.collect(function(k){return k.slice(5,k.length-1)
});
a.unshift(c.id+" .me");
var g=$H(d);
var e=g.toJSON().gsub(",",";").gsub('"',"");
var i=d.stroke?e.slice(0,e.length-1)+"; fill:"+d.stroke+";}":e;
var f;
if(d.fill){var b=Object.clone(d);
b.fill="black";
f=$H(b).toJSON().gsub(",",";").gsub('"',"")
}csstags=a.collect(function(l,k){return"#"+l+" * "+(!k?e:i)+""+(f?" #"+l+" text * "+f:"")
});
var j=csstags.join(" ")+"\n";
this.styleNode.appendChild(document.createTextNode(j))
},deleteAttributes:function(b){var a=$A(this.styleNode.childNodes).findAll(function(c){return c.textContent.include("#"+b.id)
});
a.each(function(c){c.parentNode.removeChild(c)
})
},getAllChilds:function(a){var b=$A(a.childNodes);
$A(a.childNodes).each(function(c){b.push(this.getAllChilds(c))
}.bind(this));
return b.flatten()
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Config.Dictionary={};
if(!ORYX.Dictionary){ORYX.Dictionary={}
}ORYX.Dictionary.DictionaryDef=Ext.data.Record.create([{name:"name"},{name:"aliases"},{name:"description"}]);
ORYX.Dictionary.DictionaryProxy=new Ext.data.MemoryProxy({root:[]});
ORYX.Dictionary.Dictionaryitems=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},ORYX.Dictionary.DictionaryDef),proxy:ORYX.Dictionary.DictionaryProxy,sorters:[{property:"name",direction:"ASC"}]});
ORYX.Dictionary.Dictionaryitems.load();
ORYX.Plugins.Dictionary=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DICTIONARY_ADD,this.initAndShowDictionary.bind(this));
this.initDictionary();
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.Dictionary.dictionary,functionality:this.initAndShowDictionary.bind(this),group:ORYX.I18N.View.jbpmgroup,icon:ORYX.BASE_FILE_PATH+"images/dictionary.png",description:ORYX.I18N.Dictionary.processDictionary,index:8,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)})
}},initAndShowDictionary:function(a){this.initDictionary(this.showDictionary,a)
},initDictionary:function(b,a){Ext.Ajax.request({url:ORYX.PATH+"dictionary",method:"POST",success:function(d){try{ORYX.Dictionary.Dictionaryitems.removeAll();
var m=Ext.decode(d.responseText);
if(m.length>0&&m!="false"){for(var g=0;
g<m.length;
g++){var f=m[g];
var l="";
var n="";
var c="";
for(var o in f){var k=o;
var h=f[o];
if(k=="name"){if(h){l=h
}}else{if(k=="aliases"){if(h){n=h
}}else{if(k=="description"){if(h){c=h
}}else{ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Dictionary.errorReadingProcDic+": "+k,title:""})
}}}}ORYX.Dictionary.Dictionaryitems.add(new ORYX.Dictionary.DictionaryDef({name:l,aliases:n,description:c}))
}}if(a&&a.entry){if(a.entry.length>0){ORYX.Dictionary.Dictionaryitems.add(new ORYX.Dictionary.DictionaryDef({name:a.entry,aliases:"",description:""}))
}}ORYX.Dictionary.Dictionaryitems.commitChanges();
if(b){b()
}}catch(j){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Dictionary.errorLoadingProcDic+": "+j,title:""})
}}.bind(this),failure:function(){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Dictionary.errorLoadingProcDic+".",title:""})
},params:{action:"load",profile:ORYX.PROFILE,uuid:ORYX.UUID}})
},showDictionary:function(){var k=new Extensive.grid.ItemDeleter();
var g=Ext.id();
var a=new Ext.grid.EditorGridPanel({store:ORYX.Dictionary.Dictionaryitems,id:g,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"name",header:ORYX.I18N.Dictionary.header_name,width:100,dataIndex:"name",editor:new Ext.form.TextField({allowBlank:false})},{id:"aliases",header:ORYX.I18N.Dictionary.headerAliases,width:100,dataIndex:"aliases",editor:new Ext.form.TextField({allowBlank:true})},{id:"description",header:ORYX.I18N.Dictionary.headerDesc,width:100,dataIndex:"description",editor:new Ext.form.TextField({allowBlank:true})},k]),selModel:k,autoHeight:true,tbar:[{text:ORYX.I18N.Dictionary.addNewEntry,handler:function(){ORYX.Dictionary.Dictionaryitems.add(new ORYX.Dictionary.DictionaryDef({name:"",aliases:"",description:""}));
a.fireEvent("cellclick",a,ORYX.Dictionary.Dictionaryitems.getCount()-1,1,null)
}}],clicksToEdit:1});
var n=ORYX.EDITOR.getSerializedJSON();
var b=jsonPath(n.evalJSON(),"$.properties.documentation");
var o="";
if(b&&b[0].length>0){o=b[0]
}else{o=ORYX.I18N.Dictionary.noProcDoc
}var l=new Ext.Button({text:ORYX.I18N.Dictionary.procDoc,handler:function(){Ext.getCmp("processdocs").setValue(o)
}});
var j=new Ext.Panel({title:ORYX.I18N.Dictionary.fromDoc,bodyStyle:"padding:5px",autoScroll:false,height:60,items:[l],layoutConfig:{padding:"5",align:"middle"}});
var e=new Ext.Panel({baseCls:"x-plain",labelWidth:50,defaultType:"textfield",autoScroll:false,items:[{fieldLabel:ORYX.I18N.Dictionary.select,name:"subject",inputType:"file",style:"margin-bottom:10px;display:block;width:100px",itemCls:"ext_specific_window_overflow"}]});
var d=new Ext.Panel({title:ORYX.I18N.Dictionary.fromFile,bodyStyle:"padding:5px",autoScroll:false,height:60,items:[e],layoutConfig:{padding:"5",align:"middle"}});
var i=new Ext.Panel({header:false,width:"100%",layout:"column",border:false,layoutConfig:{columns:2,pack:"center",align:"middle"},items:[{columnWidth:0.3,items:j},{columnWidth:0.7,items:d}]});
var c=new Ext.Panel({title:ORYX.I18N.Dictionary.highlightText,width:"100%",height:350,layout:"column",autoScroll:false,bodyStyle:"padding:5px",items:[{id:"processdocs",xtype:"textarea",hideLabel:true,name:"processtextbox",grow:false,width:"100%",height:280,preventScrollbars:false,style:{overflow:"auto"}}],tbar:[{text:ORYX.I18N.Dictionary.add,handler:function(){var q=document.getElementById("processdocs");
var p=q.value.substring(q.selectionStart,q.selectionEnd);
if(p&&p.length>0){ORYX.Dictionary.Dictionaryitems.add(new ORYX.Dictionary.DictionaryDef({name:p,aliases:"",description:""}))
}}}]});
var f=new Ext.Panel({id:"processdocspanel",title:ORYX.I18N.Dictionary.extractDicEntries,layout:"column",items:[i,c],layoutConfig:{columns:1},defaults:{columnWidth:1}});
var h=new Ext.Panel({header:false,layout:"column",items:[{columnWidth:0.4,items:a},{columnWidth:0.6,items:f}]});
var m=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.Dictionary.procDicEditor,height:530,width:960,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{fn:function(){m.hide()
}.bind(this)}],items:[h],listeners:{hide:function(){m.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.Dictionary.Save,handler:function(){ORYX.Dictionary.Dictionaryitems.commitChanges();
var q=new Array();
var p="";
var r=ORYX.Dictionary.Dictionaryitems.getRange();
for(var s=0;
s<r.length;
s++){q.push(r[s].data)
}p=Ext.util.JSON.encode(q);
ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.Dictionary.storingDic,title:""});
Ext.Ajax.request({url:ORYX.PATH+"dictionary",method:"POST",success:function(t){try{m.hide()
}catch(u){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Dictionary.errorSavingDic+" :\n"+u,title:""})
}}.createDelegate(this),failure:function(){ORYX.EDITOR._pluginFacade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.Dictionary.errorSavingDic+".",title:""})
},params:{action:"save",profile:ORYX.PROFILE,uuid:ORYX.UUID,dvalue:p}})
}.bind(this)},{text:ORYX.I18N.Dictionary.cancel,handler:function(){m.hide()
}.bind(this)}]});
m.show();
e.items.items[0].getEl().dom.addEventListener("change",function(q){var p=new FileReader();
p.onload=function(r){Ext.getCmp("processdocs").setValue(r.target.result)
};
p.readAsText(q.target.files[0],"UTF-8")
},true)
},_tobr:function(a){return a.replace(/(\r\n|[\r\n])/g,"<br />")
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Config.CanvasTitle={};
ORYX.Config.FACADE={};
ORYX.Plugins.CanvasTitle={facade:undefined,titleNode:undefined,facade:undefined,titleID:undefined,textID:undefined,formID:undefined,construct:function(a){this.facade=a;
ORYX.Config.FACADE=a;
this.titleID="canvasTitleId";
this.titleFormID=" canvasTitleFormId";
this.textID=ORYX.Editor.provideId();
this.formID=ORYX.Editor.provideId();
this.titleNode=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["text",{id:this.textID,style:"stroke-width:1;fill:rgb(177,194,214);font-family:arial;font-weight:bold","font-size":12,onclick:"ORYX.Plugins.CanvasTitle.openTextualAnalysis()",onmouseover:"ORYX.Plugins.CanvasTitle.addToolTip('"+this.textID+"')"}]);
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,this.showTitle.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,this.updateTitle.bind(this))
},showTitle:function(){this.titleNode.textContent=this._getTitleFromJSON();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:this.titleID,shapes:[this.facade.getCanvas()],node:this.titleNode,nodePosition:"CANVAS_TITLE"})
},updateTitle:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:this.titleID});
this.showTitle()
},_getTitleFromJSON:function(){var a=ORYX.EDITOR.getSerializedJSON();
var b=jsonPath(a.evalJSON(),"$.properties.processn");
var d=jsonPath(a.evalJSON(),"$.properties.package");
var f=jsonPath(a.evalJSON(),"$.properties.id");
var c=jsonPath(a.evalJSON(),"$.properties.version");
var e="";
if(b&&b!=""){e+=b[0];
if(c&&c!=""){e+=" v."+c[0]
}if(f&&f!=""&&d&&d!=""){e+=" ("+f[0]+")"
}return e
}else{return""
}}};
ORYX.Plugins.CanvasTitle=Clazz.extend(ORYX.Plugins.CanvasTitle);
ORYX.Plugins.CanvasTitle.openTextualAnalysis=function(){};
ORYX.Plugins.CanvasTitle.editProcessForm=function(){var a=ORYX.EDITOR.getSerializedJSON();
var b=jsonPath(a.evalJSON(),"$.properties.id");
if(b&&b!=""){ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_TASKFORM_EDIT,tn:b})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Process Id not specified.",title:""})
}};
ORYX.Plugins.CanvasTitle.addToolTip=function(a){};
ORYX.Plugins.CanvasTitle.addFormToolTip=function(b){var a=new Ext.ToolTip({target:b,title:"Click to edit Process Form",plain:true,showDelay:50,width:200})
};
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.InlineTaskFormEditor=Clazz.extend({sourceMode:undefined,taskformeditor:undefined,taskformsourceeditor:undefined,taskformcolorsourceeditor:undefined,hlLine:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_TASKFORM_EDIT,this.chooseFormEditor.bind(this))
},chooseFormEditor:function(a){Ext.Msg.show({title:ORYX.I18N.inlineTaskFormEditor.formEditor,msg:ORYX.I18N.inlineTaskFormEditor.selectForm,buttons:{yes:ORYX.I18N.inlineTaskFormEditor.graphicalModeler,no:ORYX.I18N.inlineTaskFormEditor.markupEditor,cancel:ORYX.I18N.Dictionary.cancel},icon:Ext.MessageBox.QUESTION,fn:function(b){if(b=="yes"){this.showTaskFormEditor("form",a)
}else{if(b=="no"){this.showTaskFormEditor("ftl",a)
}}}.bind(this)})
},showTaskFormEditor:function(b,a){if(a&&a.tn){Ext.Ajax.request({url:ORYX.PATH+"formwidget",method:"POST",success:function(c){try{var d=c.responseText.evalJSON();
Ext.Ajax.request({url:ORYX.PATH+"taskformseditor",method:"POST",success:function(g){try{if(b=="form"){var i=g.responseText.split("|");
parent.designeropenintab(i[0],i[1])
}else{this._buildandshow(b,a.tn,g.responseText,d)
}}catch(h){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.errorInitiatingEditor+": "+h,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.errorInitiatingEditor+".",title:""})
},params:{formtype:b,action:"load",taskname:a.tn,profile:ORYX.PROFILE,uuid:ORYX.UUID}})
}catch(f){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.errorInitiatingWidgets+": "+f,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.errorInitiatingWidgets+".",title:""})
},params:{action:"getwidgets",profile:ORYX.PROFILE,uuid:ORYX.UUID}})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.taskNameNotSpecified,title:""})
}},_buildandshow:function(k,o,h,e){var c="";
if(h&&h!="false"){c=h
}var d=[];
for(var n in e){if(e.hasOwnProperty(n)){d.push(n)
}}d.sort();
var l=[];
for(var g=0;
g<d.length;
g++){l[g]=[d[g]+""]
}var m=new Ext.data.SimpleStore({fields:["name"],data:l});
var b=new Ext.form.ComboBox({fieldLabel:"Insert form widget",labelStyle:"width:240px",hiddenName:"widget_name",emptyText:ORYX.I18N.inlineTaskFormEditor.insertFormWidget+"...",store:m,displayField:"name",valueField:"name",mode:"local",typeAhead:true,triggerAction:"all",listeners:{select:{fn:function(q,i){if(this.taskformcolorsourceeditor){Ext.Ajax.request({url:ORYX.PATH+"formwidget",method:"POST",success:function(r){try{this.taskformcolorsourceeditor.replaceSelection(r.responseText,"end")
}catch(s){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.errorInsertingFormWidget+": "+s,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.errorInsertingFormWidget+".",title:""})
},params:{action:"getwidgetsource",profile:ORYX.PROFILE,widgetname:q.getValue(),uuid:ORYX.UUID}})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.widgetInsertionSourceMode,title:""})
}}.bind(this)}}});
var j=Ext.id();
this.taskformsourceeditor=new Ext.form.TextArea({id:j,anchor:"100%",autoScroll:true,value:c});
var a=new Ext.Panel({header:false,anchor:"100%",layout:"column",autoScroll:true,border:false,layoutConfig:{columns:2,pack:"center",align:"middle"},items:[{columnWidth:0.5,items:this.taskformsourceeditor},{columnWidth:0.5,items:[{xtype:"component",id:"livepreviewpanel",anchor:"100%",autoScroll:true,autoEl:{tag:"iframe",width:"100%",height:"570",frameborder:"0",scrolling:"auto"}}]}]});
var p=new Ext.Window({id:"maineditorwindow",layout:"fit",autoCreate:true,title:ORYX.I18N.inlineTaskFormEditor.editingForm+o+" - "+ORYX.I18N.inlineTaskFormEditor.completionInst,height:570,width:930,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,keys:[{fn:function(){p.close();
p=null
}.bind(this)}],items:[a],listeners:{hide:function(){p=null
}.bind(this)},buttons:[{text:ORYX.I18N.Dictionary.Save,handler:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.inlineTaskFormEditor.storingForm,title:""});
var i="";
i=this.taskformcolorsourceeditor.getValue();
Ext.Ajax.request({url:ORYX.PATH+"taskformseditor",method:"POST",success:function(q){try{p.close();
p=null
}catch(r){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.errorSavingForm+": "+r,title:""})
}}.createDelegate(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.inlineTaskFormEditor.errorSavingForm+".",title:""})
},params:{formtype:k,action:"save",taskname:o,profile:ORYX.PROFILE,uuid:ORYX.UUID,tfvalue:i}})
}.bind(this)},{text:ORYX.I18N.Dictionary.cancel,handler:function(){p.close();
p=null
}.bind(this)}],tbar:[b]});
p.show();
this.foldFunc=CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
var f;
this.taskformcolorsourceeditor=CodeMirror.fromTextArea(document.getElementById(j),{mode:"text/html",lineNumbers:true,lineWrapping:true,onGutterClick:this.foldFunc,extraKeys:{"'>'":function(i){i.closeTag(i,">")
},"'/'":function(i){i.closeTag(i,"/")
},"Ctrl-Z":function(i){CodeMirror.hint(i,CodeMirror.formsHint,a)
}},onCursorActivity:function(){this.taskformcolorsourceeditor.setLineClass(this.hlLine,null,null);
this.hlLine=this.taskformcolorsourceeditor.setLineClass(this.taskformcolorsourceeditor.getCursor().line,null,"activeline")
}.bind(this),onChange:function(){clearTimeout(f);
f=setTimeout(this.updatePreview.bind(this),300)
}.bind(this)});
this.hlLine=this.taskformcolorsourceeditor.setLineClass(0,"activeline");
setTimeout(this.updatePreview.bind(this),300)
},updatePreview:function(){var b=document.getElementById("livepreviewpanel");
var a=b.contentDocument||b.contentWindow.document;
a.open();
a.write(this.taskformcolorsourceeditor.getValue());
a.close()
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.ExtendedDataAssignmentEditor=Clazz.extend({facade:undefined,construct:function(a){this.facade=a;
ORYX.FieldEditors.extendeddataassignment=new ORYX.Plugins.ExtendedDataAssignmentEditor.EditorFactory()
}});
ORYX.Plugins.ExtendedDataAssignmentEditor.EditorFactory=Clazz.extend({construct:function(){},init:function(){var c=arguments[0];
var e=arguments[1];
var b=arguments[3];
var a=e._jsonProp.lookupType;
var d=new Ext.form.ExtendedDataAssignmentEditor({allowBlank:e.optional(),dataSource:this.dataSource,grid:this.grid,row:b,facade:this.facade,shapes:this.shapeSelection.shapes});
d.on("dialogClosed",this.dialogClosed,{scope:this,row:b,col:1,field:d});
return new Ext.Editor(d)
}});
Ext.form.ExtendedDataAssignmentEditor=function(b){var a={onTriggerClick:function(){var d=Ext.form.ExtendedDataAssignmentEditor.superclass.onTriggerClick.call(this);
if(!d){return null
}var c=d.getColumnModel().getCellEditor;
d.getColumnModel().getCellEditor=function(g,h){if(g==5){var f=d.getStore().getAt(h);
var e=ORYX.AssociationEditors[f.get("dataType")];
if(e!==undefined){return e.init.bind(this,d,f)()
}}return c.call(d.getColumnModel(),g,h)
}
}};
if(b){Ext.applyIf(b,a)
}else{b=a
}Ext.form.ExtendedDataAssignmentEditor.superclass.constructor.call(this,b)
};
Ext.extend(Ext.form.ExtendedDataAssignmentEditor,Ext.form.ComplexDataAssignmenField,{});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.FieldDataAssignmentEditors=Clazz.extend({facade:undefined,construct:function(e){this.facade=e;
var c=new ORYX.Plugins.FieldDataAssignmentEditors.DateFieldEditorFactory();
ORYX.AssociationEditors["java.util.Date"]=c;
ORYX.AssociationEditors.Date=c;
var b=new ORYX.Plugins.FieldDataAssignmentEditors.IntegerFieldEditorFactory();
ORYX.AssociationEditors["java.lang.Integer"]=b;
ORYX.AssociationEditors.Integer=b;
ORYX.AssociationEditors["int"]=b;
var d=new ORYX.Plugins.FieldDataAssignmentEditors.FloatFieldEditorFactory();
ORYX.AssociationEditors["java.lang.Double"]=d;
ORYX.AssociationEditors["java.lang.Float"]=d;
ORYX.AssociationEditors.Float=d;
ORYX.AssociationEditors.Double=d;
ORYX.AssociationEditors["float"]=d;
ORYX.AssociationEditors["double"]=d;
var a=new ORYX.Plugins.FieldDataAssignmentEditors.BooleanFieldEditorFactory();
ORYX.AssociationEditors["java.lang.Boolean"]=a;
ORYX.AssociationEditors.Boolean=a;
ORYX.AssociationEditors["boolean"]=a
}});
ORYX.Plugins.FieldDataAssignmentEditors.BooleanFieldEditorFactory=Clazz.extend({construct:function(){},init:function(){var b=arguments[0];
var a=arguments[1];
return new Ext.Editor(new Ext.form.Checkbox())
}});
ORYX.Plugins.FieldDataAssignmentEditors.FloatFieldEditorFactory=Clazz.extend({construct:function(){},init:function(){var b=arguments[0];
var a=arguments[1];
return new Ext.Editor(new Ext.form.NumberField({allowDecimals:true}))
}});
ORYX.Plugins.FieldDataAssignmentEditors.IntegerFieldEditorFactory=Clazz.extend({construct:function(){},init:function(){var b=arguments[0];
var a=arguments[1];
return new Ext.Editor(new Ext.form.NumberField({allowDecimals:false}))
}});
ORYX.Plugins.FieldDataAssignmentEditors.DateFieldEditorFactory=Clazz.extend({construct:function(){},init:function(){var b=arguments[0];
var a=arguments[1];
return new Ext.Editor(new Ext.form.DateField())
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.NodeXMLViewer=Clazz.extend({sourceEditor:undefined,construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_NODEXML_SHOW,this.showNodeXML.bind(this));
this.sourceMode=false
},showNodeXML:function(b){if(b&&b.nodesource){this.sourceEditor=undefined;
var a=Ext.id();
var d=new Ext.form.TextArea({id:a,fieldLabel:"Node Source",value:b.nodesource,autoScroll:true});
var c=Ext.id();
this.win=new Ext.Window({width:600,id:c,height:550,layout:"fit",title:"Node Source",items:[d],buttons:[{text:"Close",handler:function(){this.win.hide();
this.sourceEditor=undefined
}.bind(this)}]});
this.win.show();
this.foldFunc=CodeMirror.newFoldFunction(CodeMirror.tagRangeFinder);
this.sourceEditor=CodeMirror.fromTextArea(document.getElementById(a),{mode:"application/xml",lineNumbers:true,lineWrapping:true,onGutterClick:this.foldFunc})
}else{Ext.Msg.alert("Node source was not specified.")
}}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.Theme=Clazz.extend({construct:function(e){this.facade=e;
var b=new XMLHttpRequest;
var c=ORYX.PATH+"themes";
var f="action=getThemeNames&profile="+ORYX.PROFILE+"&uuid="+ORYX.UUID;
b.open("POST",c,false);
b.setRequestHeader("Content-type","application/x-www-form-urlencoded");
b.send(f);
if(b.status==200){var a=b.responseText.split(",");
for(var d=0;
d<a.length;
d++){if(ORYX.READONLY!=true){this.facade.offer({name:a[d],functionality:this.applyTheme.bind(this,a[d]),group:"colorpickergroup",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/colorpicker.gif",icon:ORYX.BASE_FILE_PATH+"images/colorize.png",description:ORYX.I18N.theme.Apply+" "+a[d]+" "+ORYX.I18N.theme.ColorTheme,index:10,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)})
}}}},applyTheme:function(a){this._createCookie("designercolortheme",a,365);
Ext.Ajax.request({url:ORYX.PATH+"themes",method:"POST",success:function(c){try{if(c.responseText&&c.responseText.length>0){var b=c.responseText.evalJSON();
var d=b.themes;
var g=d[a];
ORYX.EDITOR._canvas.getChildNodes().each((function(e){this.applyThemeToNodes(e,g)
}).bind(this))
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.theme.invalidColorTheme,title:""})
}}catch(f){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.theme.errorApplying+": "+f,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.theme.errorApplying+". ",title:""})
},params:{action:"getThemeJSON",profile:ORYX.PROFILE,uuid:ORYX.UUID}})
},applyThemeToNodes:function(f,a){var e=f.getStencil().groups()[0];
var c=a[e];
if(c&&f.properties["oryx-isselectable"]!="false"){var d=c.split("|");
if(f.properties["oryx-bgcolor"]!=undefined){f.setProperty("oryx-bgcolor",d[0])
}if(f.properties["oryx-bordercolor"]!=undefined){f.setProperty("oryx-bordercolor",d[1])
}if(f.properties["oryx-fontcolor"]!=undefined){f.setProperty("oryx-fontcolor",d[2])
}f.refresh()
}if(f.getChildNodes().size()>0){for(var b=0;
b<f.getChildNodes().size();
b++){this.applyThemeToNodes(f.getChildNodes()[b],a)
}}},_createCookie:function(c,d,e){if(e){var b=new Date();
b.setTime(b.getTime()+(e*24*60*60*1000));
var a="; expires="+b.toGMTString()
}else{var a=""
}document.cookie=c+"="+d+a+"; path=/"
},_readCookie:function(b){var e=b+"=";
var a=document.cookie.split(";");
for(var d=0;
d<a.length;
d++){var f=a[d];
while(f.charAt(0)==" "){f=f.substring(1,f.length)
}if(f.indexOf(e)==0){return f.substring(e.length,f.length)
}}return null
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.LockNode=Clazz.extend({construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,this.checkLocksOnLoad.bind(this));
this.facade.offer({name:"Lock",functionality:this.locknodes.bind(this),group:"lockunlockgroup",icon:ORYX.BASE_FILE_PATH+"images/lock.png",description:"Lock Elements",index:1,minShape:1,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:"Unlock",functionality:this.unlocknodes.bind(this),group:"lockunlockgroup",icon:ORYX.BASE_FILE_PATH+"images/unlock.png",description:"Unlock Elements",index:2,minShape:1,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)})
}},checkLocksOnLoad:function(){ORYX.EDITOR._canvas.getChildren().each((function(a){this.applyLockingToChild(a)
}).bind(this))
},applyLockingToChild:function(b){if(b&&(b instanceof ORYX.Core.Node||b instanceof ORYX.Core.Edge)&&b.properties["oryx-isselectable"]=="false"){b.setSelectable(false);
b.setMovable(false);
if(b instanceof ORYX.Core.Edge){b.dockers.each((function(c){c.setMovable(false);
c.update()
}))
}b.refresh()
}if(b&&b.getChildren().size()>0){for(var a=0;
a<b.getChildren().size();
a++){this.applyLockingToChild(b.getChildren()[a])
}}},locknodes:function(){var a=this.facade.getSelection();
a.each(function(b){this.lockShape(b)
}.bind(this));
this.facade.setSelection([])
},unlocknodes:function(){var a=this.facade.getSelection();
a.each(function(b){this.unlockShape(b)
}.bind(this));
this.facade.setSelection([])
},unlockShape:function(a){if(a){a.setSelectable(true);
a.setMovable(true);
if(a instanceof ORYX.Core.Node||a instanceof ORYX.Core.Edge){a.setProperty("oryx-bordercolor",a.properties["oryx-origbordercolor"]);
a.setProperty("oryx-bgcolor",a.properties["oryx-origbgcolor"])
}a.setProperty("oryx-isselectable","true");
if(a instanceof ORYX.Core.Edge){a.dockers.each((function(c){c.setMovable(true);
c.update()
}))
}a.refresh();
if(a.getChildren().size()>0){for(var b=0;
b<a.getChildren().size();
b++){if(a.getChildren()[b] instanceof ORYX.Core.Node||a.getChildren()[b] instanceof ORYX.Core.Edge){this.unlockShape(a.getChildren()[b])
}}}}},lockShape:function(a){if(a){a.setSelectable(false);
a.setMovable(false);
if(a instanceof ORYX.Core.Node||a instanceof ORYX.Core.Edge){a.setProperty("oryx-bordercolor","#888888");
a.setProperty("oryx-bgcolor","#CCEEFF")
}a.setProperty("oryx-isselectable","false");
if(a instanceof ORYX.Core.Edge){a.dockers.each((function(c){c.setMovable(false);
c.update()
}))
}a.refresh();
if(a.getChildren().size()>0){for(var b=0;
b<a.getChildren().size();
b++){if(a.getChildren()[b] instanceof ORYX.Core.Node||a.getChildren()[b] instanceof ORYX.Core.Edge){this.lockShape(a.getChildren()[b])
}}}}}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.Simulation=Clazz.extend({construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.View.sim.processPathsTitle,functionality:this.findPaths.bind(this),group:"validationandsimulation",icon:ORYX.BASE_FILE_PATH+"images/path.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/simulation.png",description:ORYX.I18N.View.sim.processPaths,index:1,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.sim.runSim,functionality:this.runSimulation.bind(this),group:"validationandsimulation",icon:ORYX.BASE_FILE_PATH+"images/control_play.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/simulation.png",description:ORYX.I18N.View.sim.runSim,index:2,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)})
}this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SIMULATION_BUILD_PATH_SVG,this.autoDisplayPath.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SIMULATION_CLEAR_PATH_SVG,this.resetNodeColors.bind(this))
},autoDisplayPath:function(a){if(a&&a.pid){var b=a.pid;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.View.sim.creatingPathImage,title:""});
Ext.Ajax.request({url:ORYX.PATH+"simulation",method:"POST",success:function(d){try{if(d.responseText&&d.responseText.length>0){var j=d.responseText.evalJSON();
var h=j.paths;
for(var f in h){if(f==b){var c=this.getDisplayColor(0);
var i=h[f];
this.setNodeColors(f,c,i)
}}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SIMULATION_PATH_SVG_GENERATED})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.errorInvalidData,title:""})
}}catch(g){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.errorFindingPath+":\n"+g,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.errorFindingPath+".",title:""})
},params:{action:"getpathinfo",profile:ORYX.PROFILE,json:ORYX.EDITOR.getSerializedJSON(),ppdata:ORYX.PREPROCESSING,sel:""}})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.errorUnknownPathId,title:""})
}},findPaths:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.View.sim.calculatingPaths,title:""});
var b=this.facade.getSelection();
var a="";
var c=ORYX.I18N.View.sim.processPathsTitle;
if(b.length==1){b.each(function(d){if(d.getStencil().title()=="Embedded Subprocess"){a=d.resourceId;
c=ORYX.I18N.View.sim.subProcessPathsTitle
}})
}Ext.Ajax.request({url:ORYX.PATH+"simulation",method:"POST",success:function(k){try{if(k.responseText&&k.responseText.length>0){var r=k.responseText.evalJSON();
var n=r.paths;
var f=Ext.data.Record.create([{name:"display"},{name:"numele"},{name:"pid"}]);
var s=new Ext.data.MemoryProxy({root:[]});
var g=new Ext.data.Store({autoDestroy:true,reader:new Ext.data.JsonReader({root:"root"},f),proxy:s,sorters:[{property:"display",direction:"ASC"}]});
g.load();
var q=0;
for(var p in n){var h=n[p];
var o=h.split("|");
g.add(new f({display:this.getDisplayColor(q),numele:o.length,pid:p}));
q++
}g.commitChanges();
var j=Ext.id();
var d=new Ext.grid.EditorGridPanel({store:g,id:j,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"display",header:ORYX.I18N.View.sim.dispColor,width:90,dataIndex:"display",renderer:function(e){if(e){return'<center><div width="20px" height="8px" style="width:20px;height:8px;background-color:'+e+'"></div></center>'
}else{return"<center>None</center>"
}}},{id:"numele",header:ORYX.I18N.View.sim.numElements,width:130,dataIndex:"numele",renderer:function(e){if(e){return"<center>"+e+"</center>"
}else{return"<center>0</center>"
}}}]),autoHeight:true});
var i=new Ext.Panel({id:"processPathsPanel",title:"<center>"+ORYX.I18N.View.sim.select+c+ORYX.I18N.View.sim.display+"</center>",layout:"column",items:[d],layoutConfig:{columns:1},defaults:{columnWidth:1}});
var m=new Ext.Window({layout:"anchor",autoCreate:true,title:c,height:200,width:300,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){m.hide()
}.bind(this)}],items:[i],listeners:{hide:function(){this.resetNodeColors();
m.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.View.sim.showPath,handler:function(){if(d.getSelectionModel().getSelectedCell()!=null){var e=d.getSelectionModel().getSelectedCell()[0];
var t=g.getAt(e).data.pid;
this.setNodeColors(t,this.getDisplayColor(e),n[t])
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.View.sim.selectPath,title:""})
}}.bind(this)},{text:ORYX.I18N.Save.close,handler:function(){this.resetNodeColors();
m.hide()
}.bind(this)}]});
m.show()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.errorInvalidData,title:""})
}}catch(l){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.errorFindingPath+":\n"+l,title:""})
}}.bind(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.errorFindingPath+".",title:""})
},params:{action:"getpathinfo",profile:ORYX.PROFILE,json:ORYX.EDITOR.getSerializedJSON(),ppdata:ORYX.PREPROCESSING,sel:a}})
},getDisplayColor:function(b){var a=["#3399FF","#FFCC33","#FF99FF","#6666CC","#CCCCCC","#66FF00","#FFCCFF","#0099CC","#CC66FF","#FFFF00","#993300","#0000CC","#3300FF","#990000","#33CC00"];
return a[b]
},resetNodeColors:function(){ORYX.EDITOR._canvas.getChildren().each((function(a){this.setOriginalValues(a)
}).bind(this))
},setOriginalValues:function(a){if(a instanceof ORYX.Core.Node||a instanceof ORYX.Core.Edge){a.setProperty("oryx-bordercolor",a.properties["oryx-origbordercolor"]);
a.setProperty("oryx-bgcolor",a.properties["oryx-origbgcolor"])
}a.refresh();
if(a.getChildren().size()>0){for(var b=0;
b<a.getChildren().size();
b++){if(a.getChildren()[b] instanceof ORYX.Core.Node||a.getChildren()[b] instanceof ORYX.Core.Edge){this.setOriginalValues(a.getChildren()[b])
}}}},setNodeColors:function(c,b,a){this.resetNodeColors();
ORYX.EDITOR._canvas.getChildren().each((function(d){this.applyPathColors(d,b,a)
}).bind(this))
},applyPathColors:function(b,a,e){var d=e.split("|");
if(b instanceof ORYX.Core.Node||b instanceof ORYX.Core.Edge){for(var c=0;
c<d.length;
c++){var f=d[c];
if(b.resourceId==f){b.setProperty("oryx-bordercolor",a);
b.setProperty("oryx-bgcolor",a)
}}}b.refresh();
if(b.getChildren().size()>0){for(var c=0;
c<b.getChildren().size();
c++){if(b.getChildren()[c] instanceof ORYX.Core.Node||b.getChildren()[c] instanceof ORYX.Core.Edge){this.applyPathColors(b.getChildren()[c],a,e)
}}}},runSimulation:function(){var a=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:150,defaultType:"numberfield",items:[{fieldLabel:ORYX.I18N.View.sim.numInstances,name:"instances",allowBlank:false,allowDecimals:false,minValue:1,width:120},{fieldLabel:ORYX.I18N.View.sim.interval,name:"interval",allowBlank:false,allowDecimals:false,minValue:1,width:120},{xtype:"combo",name:"intervalunits",store:new Ext.data.SimpleStore({fields:["units"],data:[["millisecond"],["seconds"],["minutes"],["hours"],["days"]]}),allowBlank:false,displayField:"units",valueField:"units",mode:"local",typeAhead:true,value:"minutes",triggerAction:"all",fieldLabel:ORYX.I18N.View.sim.intervalUnits,width:120}]});
var b=new Ext.Window({autoCreate:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.View.sim.runSim,height:300,width:350,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[a],buttons:[{text:ORYX.I18N.View.sim.runSim,handler:function(){b.hide();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.View.sim.runningSim,title:""});
var c=a.items.items[0].getValue();
var e=a.items.items[1].getValue();
var d=a.items.items[2].getValue();
Ext.Ajax.request({url:ORYX.PATH+"simulation",method:"POST",success:function(f){try{if(f.responseText&&f.responseText.length>0&&f.status==200){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SIMULATION_SHOW_RESULTS,results:f.responseText})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.simNoResults+f.statusText,title:""})
}}catch(g){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.unableToPerform+g,title:""})
}}.bind(this),failure:function(f){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.View.sim.unableToPerform+f.responseText,title:""})
}.bind(this),params:{action:"runsimulation",profile:ORYX.PROFILE,json:ORYX.EDITOR.getSerializedJSON(),ppdata:ORYX.PREPROCESSING,numinstances:c,interval:e,intervalunit:d}})
}.bind(this)},{text:ORYX.I18N.Save.close,handler:function(){b.hide()
}.bind(this)}]});
b.on("hide",function(){b.destroy(true);
delete b
});
b.show()
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.SimulationResults=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SIMULATION_SHOW_RESULTS,this.showSimulationResults.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SIMULATION_DISPLAY_GRAPH,this.showGraph.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SIMULATION_PATH_SVG_GENERATED,this.pathSvgGenerated.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_SIMULATION_ANNOTATE_PROCESS,this.annotateProcess.bind(this));
this.resultsjson=""
},showSimulationResults:function(a){Ext.getCmp("maintabs").setActiveTab(1);
this.updateSimView(a)
},showGraph:function(b){if(b&&b.value){var e=b.value;
if(e.id.startsWith("pgraph:")){var a=e.id.split(":");
var d=a[1];
if(d=="processaverages"){this.showProcessAveragesGraph(d,this.resultsjson)
}}else{if(e.id.startsWith("htgraph:")){var a=e.id.split(":");
var d=a[1];
this.showHumanTaskAveragesGraph(d,this.resultsjson)
}else{if(e.id.startsWith("tgraph:")){var a=e.id.split(":");
var d=a[1];
this.showTaskAveragesGraph(d,this.resultsjson)
}else{if(e.id.startsWith("pathgraph:")){var a=e.id.split(":");
var c=a[1];
this.showPathGraph(c,this.resultsjson)
}}}}}},_showProcessGraphs:function(a){this.showProcessAveragesGraph(a,this.resultsjson)
},updateSimView:function(a){this.createProcessInfo(a);
this.createGraphsTree(a)
},createProcessInfo:function(c){var a=jsonPath(c.results.evalJSON(),"$.siminfo.*");
var b='<table border="0" width="100%">                           <tr>                          <td><span style="font-size: 10px"><b>'+ORYX.I18N.View.sim.resultsProcessId+'</b></span></td>                           <td><span style="font-size: 10px">'+a[0].id+'</span></td>                           </tr>                           <tr>                           <td><span style="font-size: 10px"><b>'+ORYX.I18N.View.sim.resultsProcessName+'</b></span></td>                           <td><span style="font-size: 10px">'+a[0].name+'</span></td>                           </tr>                           <tr>                           <td><span style="font-size: 10px"><b>'+ORYX.I18N.View.sim.resultsProcessVersion+'</b></span></td>                           <td><span style="font-size: 10px">'+a[0].version+'</span></td>                           </tr>                           <tr>                           <td><span style="font-size: 10px"><b>'+ORYX.I18N.View.sim.resultsSimStartTime+'</b></span></td>                           <td><span style="font-size: 10px">'+a[0].starttime+'</span></td>                           </tr>                           <tr>                           <td><span style="font-size: 10px"><b>'+ORYX.I18N.View.sim.resultsSimEndTime+'</b></span></td>                           <td><span style="font-size: 10px">'+a[0].endtime+'</span></td>                           </tr>                           <tr>                           <td><span style="font-size: 10px"><b>'+ORYX.I18N.View.sim.resultsNumOfExecutions+'</b></span></td>                           <td><span style="font-size: 10px">'+a[0].executions+'</span></td>                           </tr>                           <tr>                           <td><span style="font-size: 10px"><b>'+ORYX.I18N.View.sim.resultsInterval+'</b></span></td>                           <td><span style="font-size: 10px">'+a[0].interval+"</span></td>                           </tr>                           </table>";
if(a){Ext.getCmp("siminfopanel").body.update(b)
}},createGraphsTree:function(q){var p=new Ext.tree.TreeNode({listeners:{beforecollapse:function(j,i,r){return false
}}});
var b;
var c;
this.resultsjson=q.results;
var k=jsonPath(q.results.evalJSON(),"$.processsim.*");
if(k){b=new Ext.tree.TreeNode({text:ORYX.I18N.View.sim.resultsGroupProcess,allowDrag:false,allowDrop:false,expanded:true,isLeaf:false,singleClickExpand:false,listeners:{beforecollapse:function(j,i,r){return false
}}});
c=new Ext.tree.TreeNode({id:"pgraph:processaverages",text:k[0].name+" ("+k[0].id+")",allowDrag:false,allowDrop:false,expanded:true,isLeaf:true,iconCls:"xnd-icon",icon:ORYX.BASE_FILE_PATH+"images/simulation/diagram.png",singleClickExpand:false,listeners:{beforecollapse:function(j,i,r){return false
}}});
b.appendChild(c);
p.appendChild(b)
}var m=jsonPath(q.results.evalJSON(),"$.htsim.*");
var g=jsonPath(q.results.evalJSON(),"$.tasksim.*");
if(m||g){b=new Ext.tree.TreeNode({text:ORYX.I18N.View.sim.resultsGroupProcessElements,allowDrag:false,allowDrop:false,expanded:true,isLeaf:false,singleClickExpand:true,listeners:{beforecollapse:function(j,i,r){return false
}}});
for(var l=0;
l<m.length;
l++){var o=m[l];
c=new Ext.tree.TreeNode({id:"htgraph:"+o.id,text:o.name+" ("+o.id+")",allowDrag:false,allowDrop:false,expanded:true,isLeaf:true,iconCls:"xnd-icon",icon:ORYX.BASE_FILE_PATH+"images/simulation/activities/User.png",singleClickExpand:true});
b.appendChild(c)
}for(var h=0;
h<g.length;
h++){var f=g[h];
this.taskType="None";
this.findTaskType(f.id);
this.taskType=this.taskType.replace(/\s/g,"");
c=new Ext.tree.TreeNode({id:"tgraph:"+f.id,text:f.name+" ("+f.id+")",allowDrag:false,allowDrop:false,expanded:true,isLeaf:true,iconCls:"xnd-icon",icon:ORYX.BASE_FILE_PATH+"images/simulation/activities/"+this.taskType+".png",singleClickExpand:true});
b.appendChild(c)
}p.appendChild(b)
}var e=jsonPath(q.results.evalJSON(),"$.pathsim.*");
if(e){b=new Ext.tree.TreeNode({text:ORYX.I18N.View.sim.resultsGroupProcessPaths,allowDrag:false,allowDrop:false,expanded:true,isLeaf:false,singleClickExpand:true,listeners:{beforecollapse:function(j,i,r){return false
}}});
for(var l=0;
l<e.length;
l++){var a=e[l];
c=new Ext.tree.TreeNode({id:"pathgraph:"+a.id,text:"Path "+(l+1)+" ("+a.id+")",allowDrag:false,allowDrop:false,expanded:true,isLeaf:true,iconCls:"xnd-icon",icon:ORYX.BASE_FILE_PATH+"images/simulation/pathicon.png",singleClickExpand:true});
b.appendChild(c)
}p.appendChild(b)
}Ext.getCmp("simresultscharts").setRootNode(p);
Ext.getCmp("simresultscharts").getRootNode().render();
Ext.getCmp("simresultscharts").el.dom.style.height="100%";
Ext.getCmp("simresultscharts").el.dom.style.overflow="scroll";
Ext.getCmp("simresultscharts").render();
var n=Ext.getCmp("simresultscharts");
var d=n.getNodeById("pgraph:processaverages");
d.select();
this._showProcessGraphs("processaverages")
},findTaskType:function(a){ORYX.EDITOR._canvas.getChildren().each((function(b){this.isTaskType(b,a)
}).bind(this))
},isTaskType:function(b,a){if(b instanceof ORYX.Core.Node){if(b.resourceId==a&&b.properties["oryx-tasktype"]){this.taskType=b.properties["oryx-tasktype"]
}if(b.getChildren().size()>0){for(var c=0;
c<b.getChildren().size();
c++){if(b.getChildren()[c] instanceof ORYX.Core.Node){this.isTaskType(b.getChildren()[c],a)
}}}}},showProcessAveragesGraph:function(a,c){var m=jsonPath(c.evalJSON(),"$.processsim.*");
var f=jsonPath(c.evalJSON(),"$.timeline");
var h=jsonPath(c.evalJSON(),"$.activityinstances.*");
var k=jsonPath(c.evalJSON(),"$.eventaggregations.*");
var d=[];
var b=jsonPath(c.evalJSON(),"$.htsim.*");
for(var e=0;
e<b.length;
e++){var n=b[e];
d.push(n.costvalues)
}var g={timeline:f[0]};
var j=ORYX.EDITOR.getSerializedJSON();
var l=jsonPath(j.evalJSON(),"$.properties.timeunit");
ORYX.EDITOR.simulationChartTimeUnit=l;
ORYX.EDITOR.simulationChartData=m;
ORYX.EDITOR.simulationEventData=g;
ORYX.EDITOR.simulationEventAggregationData=k;
ORYX.EDITOR.simulationInstancesData=h;
ORYX.EDITOR.simulationHTCostData=d;
ORYX.EDITOR.simulationChartTitle=ORYX.I18N.View.sim.resultsTitlesProcessSimResults;
ORYX.EDITOR.simulationChartId=m[0].id;
ORYX.EDITOR.simulationChartNodeName=m[0].name;
Ext.getDom("simchartframe").src=ORYX.BASE_FILE_PATH+"simulation/processchart.jsp"
},showTaskAveragesGraph:function(h,e){var f=jsonPath(e.evalJSON(),"$.tasksim.*");
for(var b=0;
b<f.length;
b++){var a=f[b];
if(a.id==h){var d=[];
d[0]=a;
var c=ORYX.EDITOR.getSerializedJSON();
var g=jsonPath(c.evalJSON(),"$.properties.timeunit");
ORYX.EDITOR.simulationChartTimeUnit=g;
ORYX.EDITOR.simulationChartData=d;
ORYX.EDITOR.simulationEventData=d[0].timeline;
ORYX.EDITOR.simulationChartTitle=ORYX.I18N.View.sim.resultsTitlesTaskSimResults;
ORYX.EDITOR.simulationChartId=d[0].id;
ORYX.EDITOR.simulationChartNodeName=d[0].name;
Ext.getDom("simchartframe").src=ORYX.BASE_FILE_PATH+"simulation/taskchart.jsp"
}}},showHumanTaskAveragesGraph:function(f,d){var g=jsonPath(d.evalJSON(),"$.htsim.*");
for(var c=0;
c<g.length;
c++){var a=g[c];
if(a.id==f){var b=ORYX.EDITOR.getSerializedJSON();
var e=jsonPath(b.evalJSON(),"$.properties.timeunit");
ORYX.EDITOR.simulationChartTimeUnit=e;
ORYX.EDITOR.simulationChartData=a;
ORYX.EDITOR.simulationEventData=a.timeline;
ORYX.EDITOR.simulationChartTitle=ORYX.I18N.View.sim.resultsTitlesHumanTaskSimResults;
ORYX.EDITOR.simulationChartId=a.id;
ORYX.EDITOR.simulationChartNodeName=a.name;
Ext.getDom("simchartframe").src=ORYX.BASE_FILE_PATH+"simulation/humantaskchart.jsp"
}}},showPathGraph:function(c,b){var e=jsonPath(b.evalJSON(),"$.pathsim.*");
var a=ORYX.EDITOR.getSerializedJSON();
var d=jsonPath(a.evalJSON(),"$.properties.timeunit");
ORYX.EDITOR.simulationChartTimeUnit=d;
ORYX.EDITOR.simulationChartTitle=ORYX.I18N.View.sim.resultsTitlesPathExecutionInfo+" ("+c+")";
ORYX.EDITOR.simulationPathData=e;
ORYX.EDITOR.simulationPathId=c;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SIMULATION_BUILD_PATH_SVG,pid:c})
},pathSvgGenerated:function(){ORYX.EDITOR.simulationPathSVG=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
Ext.getDom("simchartframe").src=ORYX.BASE_FILE_PATH+"simulation/pathschart.jsp";
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SIMULATION_CLEAR_PATH_SVG})
},annotateProcess:function(a){this.resetNodeColors();
this.resetNodeOverlays();
this.annotateNode(a.nodeid,a.eventnum,a.data);
setTimeout(function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_SIMULATION_SHOW_ANNOTATED_PROCESS,data:DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false)),wind:window,docu:document});
this.resetNodeColors();
this.resetNodeOverlays()
}.bind(this),500)
},resetNodeOverlays:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:"simmodelmax"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:"simmodelmin"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:"simmodelavg"})
},resetNodeColors:function(){ORYX.EDITOR._canvas.getChildren().each((function(a){this.setOriginalValues(a)
}).bind(this))
},setOriginalValues:function(a){if(a instanceof ORYX.Core.Node||a instanceof ORYX.Core.Edge){a.setProperty("oryx-bordercolor",a.properties["oryx-origbordercolor"]);
a.setProperty("oryx-bgcolor",a.properties["oryx-origbgcolor"])
}a.refresh();
if(a.getChildren().size()>0){for(var b=0;
b<a.getChildren().size();
b++){if(a.getChildren()[b] instanceof ORYX.Core.Node||a.getChildren()[b] instanceof ORYX.Core.Edge){this.setOriginalValues(a.getChildren()[b])
}}}},annotateNode:function(c,a,b){ORYX.EDITOR._canvas.getChildren().each((function(d){this.setNodeAnnotation(d,c,a,b)
}).bind(this))
},setNodeAnnotation:function(h,a,g,f){if(h instanceof ORYX.Core.Node||h instanceof ORYX.Core.Edge){if(h.resourceId==a){var d=this.getDisplayColor(1);
h.setProperty("oryx-bordercolor",d);
h.setProperty("oryx-bgcolor",d);
h.refresh();
var c=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["text",{id:"modelmax",style:"stroke-width:1;fill:red;font-family:arial;font-weight:bold","font-size":10}]);
c.textContent="Max: "+f.values[0].value;
var j=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["text",{id:"modelmin",style:"stroke-width:1;fill:blue;font-family:arial;font-weight:bold","font-size":10}]);
j.textContent="Min: "+f.values[1].value;
var b=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["text",{id:"modelavg",style:"stroke-width:1;fill:green;font-family:arial;font-weight:bold","font-size":10}]);
b.textContent="Avg: "+f.values[2].value;
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:"simmodelmax",shapes:[h],node:c,nodePosition:"SIMMODELMAX"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:"simmodelmin",shapes:[h],node:j,nodePosition:"SIMMODELMIN"});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:"simmodelavg",shapes:[h],node:b,nodePosition:"SIMMODELAVG"})
}}if(h.getChildren().size()>0){for(var e=0;
e<h.getChildren().size();
e++){if(h.getChildren()[e] instanceof ORYX.Core.Node||h.getChildren()[e] instanceof ORYX.Core.Edge){this.setNodeAnnotation(h.getChildren()[e],a,g,f)
}}}},getDisplayColor:function(b){var a=["#3399FF","#FFCC33","#FF99FF","#6666CC","#CCCCCC","#66FF00","#FFCCFF","#0099CC","#CC66FF","#FFFF00","#993300","#0000CC","#3300FF","#990000","#33CC00"];
return a[b]
}});
if(!ORYX.Plugins){ORYX.Plugins=new Object()
}ORYX.Plugins.DockerCreation=Clazz.extend({construct:function(a){this.facade=a;
this.active=false;
this.circle=ORYX.Editor.graft("http://www.w3.org/2000/svg",null,["g",{"pointer-events":"none"},["circle",{cx:"8",cy:"8",r:"3",fill:"yellow"}]]);
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEDOWN,this.handleMouseDown.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOVER,this.handleMouseOver.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEOUT,this.handleMouseOut.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEMOVE,this.handleMouseMove.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_DBLCLICK,function(){window.clearTimeout(this.timer)
}.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_MOUSEUP,function(){window.clearTimeout(this.timer)
}.bind(this))
},handleMouseOut:function(b,a){if(this.active){this.hideOverlay();
this.active=false
}},handleMouseOver:function(b,a){if(a instanceof ORYX.Core.Edge&&this.isEdgeDocked(a)){this.showOverlay(a,this.facade.eventCoordinates(b))
}this.active=true
},handleMouseDown:function(b,a){if(b.which==1&&a instanceof ORYX.Core.Edge&&this.isEdgeDocked(a)){if(a.getIsSelectable()){window.clearTimeout(this.timer);
this.timer=window.setTimeout(function(){this.addDockerCommand({edge:a,event:b,position:this.facade.eventCoordinates(b)})
}.bind(this),200)
}this.hideOverlay()
}},handleMouseMove:function(b,a){if(a instanceof ORYX.Core.Edge&&this.isEdgeDocked(a)){if(this.active){this.hideOverlay();
this.showOverlay(a,this.facade.eventCoordinates(b))
}else{this.showOverlay(a,this.facade.eventCoordinates(b))
}}},isEdgeDocked:function(a){return !!(a.incoming.length||a.outgoing.length)
},addDockerCommand:function(b){if(!b.edge){return
}var a=ORYX.Core.Command.extend({construct:function(f,g,h,e,d){this.edge=f;
this.docker=g;
this.pos=h;
this.facade=e;
this.options=d
},execute:function(){this.docker=this.edge.addDocker(this.pos,this.docker);
this.index=this.edge.dockers.indexOf(this.docker);
this.facade.getCanvas().update();
this.facade.updateSelection();
this.options.docker=this.docker
},rollback:function(){if(this.docker instanceof ORYX.Core.Controls.Docker){this.edge.removeDocker(this.docker)
}this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var c=new a(b.edge,b.docker,b.position,this.facade,b);
this.facade.executeCommands([c]);
this.facade.raiseEvent({uiEvent:b.event,type:ORYX.CONFIG.EVENT_DOCKERDRAG},b.docker)
},showOverlay:function(a,j){var e=j;
var f=[0,1];
var b=Infinity;
for(var g=0,d=a.dockers.length;
g<d-1;
g++){var c=ORYX.Core.Math.getPointOfIntersectionPointLine(a.dockers[g].bounds.center(),a.dockers[g+1].bounds.center(),j,true);
if(!c){continue
}var h=ORYX.Core.Math.getDistancePointToPoint(j,c);
if(b>h){b=h;
e=c
}}this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_SHOW,id:"ghostpoint",shapes:[a],node:this.circle,ghostPoint:e,dontCloneNode:true})
},hideOverlay:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_OVERLAY_HIDE,id:"ghostpoint"})
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.TaskPropertiesUpdater=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_PROPWINDOW_PROP_CHANGED,this.handlePropertyChanged.bind(this))
},handlePropertyChanged:function(b){if(b.key=="oryx-tasktype"){var a=b.elements[0];
if(a){this.facade.getCanvas().update()
}}}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.VoiceCommand=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_VOICE_COMMAND,this.handleVoiceCommand.bind(this));
this.facade.registerOnEvent(ORYX.CONFIG.VOICE_COMMAND_ADD_START_EVENT,this.addNode.bind(this,"StartNoneEvent"));
this.facade.registerOnEvent(ORYX.CONFIG.VOICE_COMMAND_TASK_TYPE_USER,this.updateTask.bind(this,"User"));
this.facade.registerOnEvent(ORYX.CONFIG.VOICE_COMMAND_TASK_TYPE_SCRIPT,this.updateTask.bind(this,"Script"));
this.commands=this._initCommands();
String.prototype.soundex=function(g){var e,d,c,f,g=isNaN(g)?4:g>10?10:g<4?4:g,b={BFPV:1,CGJKQSXZ:2,DT:3,L:4,MN:5,R:6},f=(s=this.toUpperCase().replace(/[^A-Z]/g,"").split("")).splice(0,1);
for(e=-1,c=s.length;
++e<c;
){for(d in b){if(d.indexOf(s[e])+1&&f[f.length-1]!=b[d]&&f.push(b[d])){break
}}}return f.length>g&&(f.length=g),f.join("")+(new Array(g-f.length+1)).join("0")
}
},handleVoiceCommand:function(a){if(a&&a.entry){if(a.entry.length>0){var d=false;
for(var g in this.commands){if(this.commands.hasOwnProperty(g)){var f=g.split(",");
for(var b=0;
b<f.length;
b++){var e=f[b];
if(a.entry.soundex()==e.soundex()){d=true;
this.facade.raiseEvent({type:this.commands[g]});
break
}}if(d){break
}}}if(!d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Cannot find voice command: "+a.entry,title:""})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Invalid voice command.",title:""})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Invalid voice command.",title:""})
}},_initCommands:function(){var a={};
a[ORYX.CONFIG.VOICE_ENTRY_GENERATE_FORMS]=ORYX.CONFIG.VOICE_COMMAND_GENERATE_FORMS;
a[ORYX.CONFIG.VOICE_ENTRY_GENERATE_IMAGE]=ORYX.CONFIG.VOICE_COMMAND_GENERATE_IMAGE;
a[ORYX.CONFIG.VOICE_ENTRY_VIEW_SOURCE]=ORYX.CONFIG.VOICE_COMMAND_VIEW_SOURCE;
a[ORYX.CONFIG.VOICE_ENTRY_ADD_TASK]=ORYX.CONFIG.VOICE_COMMAND_ADD_TASK;
a[ORYX.CONFIG.VOICE_ENTRY_ADD_GATEWAY]=ORYX.CONFIG.VOICE_COMMAND_ADD_GATEWAY;
a[ORYX.CONFIG.VOICE_ENTRY_ADD_END_EVENT]=ORYX.CONFIG.VOICE_COMMAND_ADD_END_EVENT;
a[ORYX.CONFIG.VOICE_ENTRY_ADD_START_EVENT]=ORYX.CONFIG.VOICE_COMMAND_ADD_START_EVENT;
a[ORYX.CONFIG.VOICE_ENTRY_TASK_TYPE_USER]=ORYX.CONFIG.VOICE_COMMAND_TASK_TYPE_USER;
a[ORYX.CONFIG.VOICE_ENTRY_TASK_TYPE_SCRIPT]=ORYX.CONFIG.VOICE_COMMAND_TASK_TYPE_SCRIPT;
a[ORYX.CONFIG.VOICE_ENTRY_GATEWAY_TYPE_PARALLEL]=ORYX.CONFIG.VOICE_COMMAND_GATEWAY_TYPE_PARALLEL;
return a
},updateTask:function(b){var c=this.facade.getSelection();
if(c.length==1){var a=c.first();
a.setProperty("oryx-tasktype",b);
a.refresh()
}},addNode:function(e){var b=ORYX.Core.Command.extend({construct:function(i,g,j,f,h){this.option=i;
this.currentParent=g;
this.canAttach=j;
this.position=f;
this.facade=h;
this.selection=this.facade.getSelection();
this.shape;
this.parent
},execute:function(){if(!this.shape){this.shape=this.facade.createShape(c);
this.parent=this.shape.parent
}else{this.parent.add(this.shape)
}if(this.canAttach&&this.currentParent instanceof ORYX.Core.Node&&this.shape.dockers.length>0){var f=this.shape.dockers[0];
if(this.currentParent.parent instanceof ORYX.Core.Node){this.currentParent.parent.add(f.parent)
}f.bounds.centerMoveTo(this.position);
f.setDockedShape(this.currentParent)
}this.facade.setSelection([this.shape]);
this.facade.getCanvas().update();
this.facade.updateSelection()
},rollback:function(){this.facade.deleteShape(this.shape);
this.facade.setSelection(this.selection.without(this.shape));
this.facade.getCanvas().update();
this.facade.updateSelection()
}});
var a={x:178,y:209};
var c={type:"http://b3mn.org/stencilset/bpmn2.0#"+e,namespace:"http://b3mn.org/stencilset/bpmn2.0#",connectingType:true,isHandle:false,position:a,parent:ORYX.EDITOR._canvas};
var d=new b(c,ORYX.EDITOR._canvas,undefined,a,this.facade);
this.facade.executeCommands([d])
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.PatternCreator=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.CREATE_PATTERN,this.handleCreatePattern.bind(this));
this.patternShapes={};
this.patternPositions={};
this.selectedRoots=[];
this.selectedRootsCount;
this.createdElementCount
},handleCreatePattern:function(c){if(c&&c.pid&&c.pdata&&c.pos){this.patternShapes={};
this.patternPositions={};
this.selectedRoots=[];
this.selectedRootsCount=0;
this.createdElementCount=0;
for(var e=0;
e<c.pdata.length;
e++){var g=c.pdata[e];
if(g.id==c.pid){var f=g.elements;
var h=this.facade.getSelection();
h.each(function(i){if(i instanceof ORYX.Core.Node){this.selectedRoots[this.selectedRootsCount]=i;
this.selectedRootsCount++
}}.bind(this));
var b=this.getPatternRoots(f);
if(this.selectedRoots.length>0&&(this.selectedRoots.length!=b.length)){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Cannot attach Pattern to selected node(s).",title:""});
return
}for(var a=0;
a<f.length;
a++){var d=f[a];
if(this.patternShapes[d.id]===undefined){this.createElement(d,c);
this.createElementChildren(d,f)
}else{this.createElementChildren(d,f)
}}}}this.facade.setSelection([]);
this.facade.getCanvas().update();
this.facade.updateSelection()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Invalid pattern data.",title:""})
}},getPatternRoots:function(e){var a=[];
var d=0;
for(var b=0;
b<e.length;
b++){var c=e[b];
if(c.parent.length==0){a[d]=c;
d++
}}return a
},findChildObject:function(a,d){for(var b=0;
b<d.length;
b++){var c=d[b];
if(c.id==a){return c
}}return undefined
},createElement:function(c,b){if(c.parent.length==0&&this.selectedRoots.length>0){this.patternShapes[c.id]=this.selectedRoots[this.createdElementCount];
this.patternPositions[c.id]=this.selectedRoots[this.createdElementCount].absoluteCenterXY();
this.createdElementCount++;
return
}var d={x:0,y:0};
if(this.patternPositions[c.id]===undefined){d.x=b.pos.x;
d.y=b.pos.y
}else{d.x=this.patternPositions[c.id].x;
d.y=this.patternPositions[c.id].y
}d.x+=c.xyOffset[0];
d.y+=c.xyOffset[1];
var a={type:c.nodetype,namespace:c.namespace,connectingType:c.connectingType,position:d,parent:ORYX.EDITOR._canvas};
this.patternShapes[c.id]=this.facade.createShape(a);
this.patternPositions[c.id]=d;
this.patternShapes[c.id].refresh();
this.facade.getCanvas().update()
},createElementChildren:function(e,j){var m=e.children;
for(var d=0;
d<m.length;
d++){var g=m[d];
if(this.patternShapes[g]===undefined){var f=this.findChildObject(g,j);
if(f){var c={x:0,y:0};
c.x=this.patternPositions[e.id].x;
c.y=this.patternPositions[e.id].y;
c.x+=f.xyOffset[0];
c.y+=f.xyOffset[1];
var b={type:f.nodetype,namespace:f.namespace,connectingType:f.connectingType,connectedShape:this.patternShapes[e.id],position:c,parent:ORYX.EDITOR._canvas};
this.patternShapes[f.id]=this.facade.createShape(b);
this.patternPositions[f.id]=c;
this.patternShapes[f.id].refresh();
this.facade.getCanvas().update()
}}else{var a;
var f=this.findChildObject(g,j);
var i=ORYX.Core.StencilSet.stencil(f.connectingType);
a=new ORYX.Core.Edge({eventHandlerCallback:this.facade.raiseEvent},i);
a.dockers.first().setDockedShape(this.patternShapes[e.id]);
var h=this.patternShapes[e.id].getDefaultMagnet();
var l=h?h.bounds.center():this.patternShapes[e.id].bounds.midPoint();
a.dockers.first().setReferencePoint(l);
a.dockers.last().setDockedShape(this.patternShapes[g]);
a.dockers.last().setReferencePoint(this.patternShapes[g].getDefaultMagnet().bounds.center());
this.facade.getCanvas().add(a);
this.facade.getCanvas().update()
}}},createPatternFromSelection:function(){var d=this.facade.getSelection();
if(d&&d.size()>0){var c=this.findParentShapes(d);
if(c&&c.size()>0){var e=new Ext.form.TextField({fieldLabel:"Pattern Name",allowBlank:false,id:"patternName",regex:/^[a-z0-9 \-\.\_]*$/i});
var a=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:150,labelAlign:"right",bodyStyle:"padding:15x 15px 15px 15px",defaultType:"textfield",items:[e]});
var b=new Ext.Window({layout:"anchor",autoCreate:true,title:"Create a new Workflow Pattern",height:150,width:400,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){b.hide()
}.bind(this)}],items:[a],listeners:{hide:function(){b.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.PropertyWindow.ok,handler:function(){b.hide()
}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){b.hide()
}.bind(this)}]});
b.show()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"Invalid selection.",title:""})
}}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:"No nodes selected.",title:""})
}},findParentShapes:function(c){var a=[];
var b=0;
c.each(function(d){if(d.getIncomingShapes()&&d.getIncomingShapes().size()>0){if(!this.isInSelection(c,d.getIncomingShapes())){if(d instanceof ORYX.Core.Node){a[b]=d;
b++
}}}else{a[b]=d;
b++
}}.bind(this));
return a
},isInSelection:function(d,a){var b=false;
if(!a||a.size()==0){return false
}for(var c=0;
c<a.length;
c++){d.each(function(e){if(e.resourceId==a[c].resourceId){b=true
}}.bind(this))
}return b
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.LocalHistory=Clazz.extend({construct:function(a){this.facade=a;
this.historyEntry;
this.historyProxy;
this.historyStore;
this.storage;
this.fail;
this.uid;
this.historyInterval;
this.mygrid;
if(this.haveSupportForLocalHistory()){this.setupAndLoadHistoryData();
this.enableLocalHistory()
}if(ORYX.READONLY!=true){this.facade.offer({name:ORYX.I18N.LocalHistory.display,functionality:this.displayLocalHistory.bind(this),group:"localstorage",icon:ORYX.BASE_FILE_PATH+"images/view.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/localhistory.png",description:ORYX.I18N.LocalHistory.display_desc,index:1,minShape:0,maxShape:0,isEnabled:function(){return ORYX.LOCAL_HISTORY_ENABLED&&ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.LocalHistory.clear,functionality:this.clearLocalHistory.bind(this),group:"localstorage",icon:ORYX.BASE_FILE_PATH+"images/clear.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/localhistory.png",description:ORYX.I18N.LocalHistory.clear_desc,index:2,minShape:0,maxShape:0,isEnabled:function(){return ORYX.LOCAL_HISTORY_ENABLED&&ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.LocalHistory.config,functionality:this.configureSnapshotInterval.bind(this),group:"localstorage",icon:ORYX.BASE_FILE_PATH+"images/clock.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/localhistory.png",description:ORYX.I18N.LocalHistory.config_desc,index:3,minShape:0,maxShape:0,isEnabled:function(){return ORYX.LOCAL_HISTORY_ENABLED&&ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.LocalHistory.enable,functionality:this.enableLocalHistory.bind(this),group:"localstorage",icon:ORYX.BASE_FILE_PATH+"images/enable.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/localhistory.png",description:ORYX.I18N.LocalHistory.enable_desc,index:3,minShape:0,maxShape:0,isEnabled:function(){return !ORYX.LOCAL_HISTORY_ENABLED&&ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.LocalHistory.disable,functionality:this.disableLocalHistory.bind(this),group:"localstorage",icon:ORYX.BASE_FILE_PATH+"images/disable.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/localhistory.png",description:ORYX.I18N.LocalHistory.disable_desc,index:4,minShape:0,maxShape:0,isEnabled:function(){return ORYX.LOCAL_HISTORY_ENABLED&&ORYX.READONLY!=true
}.bind(this)})
}window.onbeforeunload=function(){this.stopStoring()
}.bind(this)
},displayLocalHistory:function(){var a=Ext.id();
this.mygrid=new Ext.grid.EditorGridPanel({autoScroll:true,autoHeight:true,store:this.historyStore,id:a,stripeRows:true,cm:new Ext.grid.ColumnModel([new Ext.grid.RowNumberer(),{id:"pid",header:ORYX.I18N.LocalHistory.headertxt.id,width:100,dataIndex:"processid",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pname",header:ORYX.I18N.LocalHistory.headertxt.name,width:100,dataIndex:"processname",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"ppkg",header:ORYX.I18N.LocalHistory.headertxt.Package,width:100,dataIndex:"processpkg",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pver",header:ORYX.I18N.LocalHistory.headertxt.Version,width:100,dataIndex:"processversion",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"tms",header:ORYX.I18N.LocalHistory.headertxt.TimeStamp,width:200,dataIndex:"timestamp",editor:new Ext.form.TextField({allowBlank:true,disabled:true})},{id:"pim",header:ORYX.I18N.LocalHistory.headertxt.ProcessImage,width:150,dataIndex:"svg",renderer:function(d){if(d&&d.length>0){return'<center><img src="'+ORYX.BASE_FILE_PATH+'images/page_white_picture.png" onclick="resetSVGView(\''+d+"');new SVGViewer({title: 'Local History Process Image', width: '650', height: '450', autoScroll: true, fixedcenter: true, src: '',hideAction: 'close'}).show();\" alt=\"Click to view Process Image\"/></center>"
}else{return ORYX.I18N.LocalHistory.headertxt.ProcessImage_NoAvailable
}return""
}}])});
var c=new Ext.Panel({id:"localHistoryPanel",title:ORYX.I18N.LocalHistory.localHistoryPanel.title,layout:"column",items:[this.mygrid],layoutConfig:{columns:1},defaults:{columnWidth:1}});
var b=new Ext.Window({layout:"anchor",autoCreate:true,title:ORYX.I18N.LocalHistory.LocalHistoryView.title,height:350,width:780,modal:true,collapsible:false,fixedcenter:true,shadow:true,resizable:true,proxyDrag:true,autoScroll:true,keys:[{key:27,fn:function(){b.hide()
}.bind(this)}],items:[c],listeners:{hide:function(){b.destroy()
}.bind(this)},buttons:[{text:ORYX.I18N.LocalHistory.LocalHistoryView.restore,handler:function(){if(this.mygrid.getSelectionModel().getSelectedCell()!=null){var d=this.mygrid.getSelectionModel().getSelectedCell()[0];
var e=this.historyStore.getAt(d).data.json;
if(e&&e.length>0){e=Base64.decode(e);
this.clearCanvas();
var f=e.evalJSON();
this.facade.importJSON(f)
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.LocalHistory.LocalHistoryView.invalidProcessInfo,title:""})
}b.hide()
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.LocalHistory.LocalHistoryView.msg,title:""})
}}.bind(this)},{text:ORYX.I18N.PropertyWindow.cancel,handler:function(){b.hide()
}.bind(this)}]});
b.show();
this.mygrid.render();
this.mygrid.focus(false,100)
},setupAndLoadHistoryData:function(){this.historyEntry=Ext.data.Record.create([{name:"processid"},{name:"processname"},{name:"processpkg"},{name:"processversion"},{name:"timestamp"},{name:"json"},{name:"svg"}]);
this.historyProxy=new Ext.data.MemoryProxy({root:[]});
this.historyStore=new Ext.data.Store({autoDestroy:false,reader:new Ext.data.JsonReader({root:"root"},this.historyEntry),proxy:this.historyProxy});
this.historyStore.load();
if(this.storage){var c=ORYX.EDITOR.getSerializedJSON();
var g=jsonPath(c.evalJSON(),"$.properties.id");
var f=jsonPath(c.evalJSON(),"$.properties.package");
var b=this.storage.getItem(f+"_"+g);
if(b){var e=b.evalJSON();
for(var a=0;
a<e.length;
a++){var d=e[a];
this.addToStore(d)
}}}},addToStore:function(a){if(this.historyStore.data.length>0){if(this.historyStore.getAt(0).data.json!=a.json){this.historyStore.insert(0,new this.historyEntry({processid:a.processid,processname:a.processname,processpkg:a.processpkg,processversion:a.processversion,timestamp:new Date(a.timestamp).format("d.m.Y H:i:s"),json:a.json,svg:a.svg}));
this.historyStore.commitChanges();
if(this.mygrid){this.mygrid.getView().refresh(false)
}}}else{this.historyStore.insert(0,new this.historyEntry({processid:a.processid,processname:a.processname,processpkg:a.processpkg,processversion:a.processversion,timestamp:new Date(a.timestamp).format("d.m.Y H:i:s"),json:a.json,svg:a.svg}));
this.historyStore.commitChanges()
}},clearLocalHistory:function(){this.historyStore.removeAll();
this.historyStore.commitChanges();
var a=ORYX.EDITOR.getSerializedJSON();
var c=jsonPath(a.evalJSON(),"$.properties.id");
var b=jsonPath(a.evalJSON(),"$.properties.package");
this.storage.removeItem(b+"_"+c);
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.LocalHistory.clearLocalHistory.msg,title:""})
},enableLocalHistory:function(){this.setupAndLoadHistoryData()
},haveSupportForLocalHistory:function(){try{this.uid=new Date;
(this.storage=window.localStorage).setItem(this.uid,this.uid);
this.fail=this.storage.getItem(this.uid)!=this.uid;
this.storage.removeItem(this.uid);
this.fail&&(this.storage=false)
}catch(b){}var a=this._readCookie("designerlocalhistory");
var c=false;
if(a!=null&&a=="true"){c=true;
return this.storage&&c
}return this.storage&&ORYX.LOCAL_HISTORY_ENABLED
},addToHistory:function(){var processJSON=ORYX.EDITOR.getSerializedJSON();
var formattedSvgDOM=DataManager.serialize(ORYX.EDITOR.getCanvas().getSVGRepresentation(false));
var processName=jsonPath(processJSON.evalJSON(),"$.properties.processn");
var processPackage=jsonPath(processJSON.evalJSON(),"$.properties.package");
var processId=jsonPath(processJSON.evalJSON(),"$.properties.id");
var processVersion=jsonPath(processJSON.evalJSON(),"$.properties.version");
var item={processid:processId,processname:processName,processpkg:processPackage,processversion:processVersion,timestamp:new Date().getTime(),json:Base64.encode(processJSON),svg:Base64.encode(formattedSvgDOM)};
try{var processHistory=this.storage.getItem(processPackage+"_"+processId);
if(processHistory){var pobject=processHistory.evalJSON();
pobject.push(item);
this.storage.setItem(processPackage+"_"+processId,eval(JSON.stringify(pobject)))
}else{var addArray=new Array();
addArray.push(item);
this.storage.setItem(processPackage+"_"+processId,eval(JSON.stringify(addArray)))
}this.addToStore(item)
}catch(e){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.LocalHistory.addQuotaexceed,title:""});
this.clearLocalHistory()
}},clearCanvas:function(){ORYX.EDITOR.getCanvas().nodes.each(function(a){ORYX.EDITOR.deleteShape(a)
}.bind(this));
ORYX.EDITOR.getCanvas().edges.each(function(a){ORYX.EDITOR.deleteShape(a)
}.bind(this))
},disableLocalHistory:function(){ORYX.LOCAL_HISTORY_ENABLED=false;
this._createCookie("designerlocalhistory","false",365);
this.stopStoring();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.LocalHistory.historyDisabled,title:""})
},enableLocalHistory:function(){ORYX.LOCAL_HISTORY_ENABLED=true;
this._createCookie("designerlocalhistory","true",365);
this.setupAndLoadHistoryData();
this.startStoring();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_STENCIL_SET_LOADED});
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.LocalHistory.historyEnabled,title:""})
},startStoring:function(){this.historyInterval=setInterval(this.addToHistory.bind(this),ORYX.LOCAL_HISTORY_TIMEOUT)
},stopStoring:function(){clearInterval(this.historyInterval)
},_createCookie:function(c,d,e){if(e){var b=new Date();
b.setTime(b.getTime()+(e*24*60*60*1000));
var a="; expires="+b.toGMTString()
}else{var a=""
}document.cookie=c+"="+d+a+"; path=/"
},_readCookie:function(b){var e=b+"=";
var a=document.cookie.split(";");
for(var d=0;
d<a.length;
d++){var f=a[d];
while(f.charAt(0)==" "){f=f.substring(1,f.length)
}if(f.indexOf(e)==0){return f.substring(e.length,f.length)
}}return null
},configureSnapshotInterval:function(){var b=new Ext.form.FormPanel({baseCls:"x-plain",labelWidth:150,defaultType:"numberfield",items:[{fieldLabel:"Interval",name:"interval",allowBlank:false,allowDecimals:false,minValue:1,width:120},{xtype:"combo",name:"intervalunits",store:new Ext.data.SimpleStore({fields:["units"],data:[["millisecond"],["seconds"],["minutes"],["hours"],["days"]]}),allowBlank:false,displayField:"units",valueField:"units",mode:"local",typeAhead:true,value:"minutes",triggerAction:"all",fieldLabel:ORYX.I18N.LocalHistory.intervalUnits,width:120}]});
var a=new Ext.Window({autoCreate:true,layout:"fit",plain:true,bodyStyle:"padding:5px;",title:ORYX.I18N.LocalHistory.ConfigureSnapshotInterval,height:300,width:350,modal:true,fixedcenter:true,shadow:true,proxyDrag:true,resizable:true,items:[b],buttons:[{text:ORYX.I18N.LocalHistory.set,handler:function(){a.hide();
var d=b.items.items[0].getValue();
var c=b.items.items[1].getValue();
if(d&&c&&d>0){if(c=="seconds"){d=d*1000
}else{if(c=="minutes"){d=d*1000*60
}else{if(c=="hours"){d=d*1000*60*60
}else{if(c=="days"){d=d*1000*60*60*24
}else{}}}}this.stopStoring();
ORYX.LOCAL_HISTORY_TIMEOUT=d;
this.startStoring();
this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"info",msg:ORYX.I18N.LocalHistory.UpdatedSnapshotInterval,title:""})
}else{this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.LocalHistory.InvalidInput,title:""})
}}.bind(this)},{text:ORYX.I18N.Save.close,handler:function(){a.hide()
}.bind(this)}]});
a.on("hide",function(){a.destroy(true);
delete a
});
a.show()
}});
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(c){var a="";
var k,h,f,j,g,e,d;
var b=0;
c=Base64._utf8_encode(c);
while(b<c.length){k=c.charCodeAt(b++);
h=c.charCodeAt(b++);
f=c.charCodeAt(b++);
j=k>>2;
g=((k&3)<<4)|(h>>4);
e=((h&15)<<2)|(f>>6);
d=f&63;
if(isNaN(h)){e=d=64
}else{if(isNaN(f)){d=64
}}a=a+this._keyStr.charAt(j)+this._keyStr.charAt(g)+this._keyStr.charAt(e)+this._keyStr.charAt(d)
}return a
},decode:function(c){var a="";
var k,h,f;
var j,g,e,d;
var b=0;
c=c.replace(/[^A-Za-z0-9\+\/\=]/g,"");
while(b<c.length){j=this._keyStr.indexOf(c.charAt(b++));
g=this._keyStr.indexOf(c.charAt(b++));
e=this._keyStr.indexOf(c.charAt(b++));
d=this._keyStr.indexOf(c.charAt(b++));
k=(j<<2)|(g>>4);
h=((g&15)<<4)|(e>>2);
f=((e&3)<<6)|d;
a=a+String.fromCharCode(k);
if(e!=64){a=a+String.fromCharCode(h)
}if(d!=64){a=a+String.fromCharCode(f)
}}a=Base64._utf8_decode(a);
return a
},_utf8_encode:function(b){b=b.replace(/\r\n/g,"\n");
var a="";
for(var e=0;
e<b.length;
e++){var d=b.charCodeAt(e);
if(d<128){a+=String.fromCharCode(d)
}else{if((d>127)&&(d<2048)){a+=String.fromCharCode((d>>6)|192);
a+=String.fromCharCode((d&63)|128)
}else{a+=String.fromCharCode((d>>12)|224);
a+=String.fromCharCode(((d>>6)&63)|128);
a+=String.fromCharCode((d&63)|128)
}}}return a
},_utf8_decode:function(a){var b="";
var d=0;
var e=c1=c2=0;
while(d<a.length){e=a.charCodeAt(d);
if(e<128){b+=String.fromCharCode(e);
d++
}else{if((e>191)&&(e<224)){c2=a.charCodeAt(d+1);
b+=String.fromCharCode(((e&31)<<6)|(c2&63));
d+=2
}else{c2=a.charCodeAt(d+1);
c3=a.charCodeAt(d+2);
b+=String.fromCharCode(((e&15)<<12)|((c2&63)<<6)|(c3&63));
d+=3
}}}return b
}};
function resetSVGView(a){ORYX.EDITOR.localStorageSVG=Base64.decode(a)
};
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.NotificationsPlugin=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,this.showNotification.bind(this))
},showNotification:function(a){notifications.options={positionClass:a.position||"notification-top-right",onclick:a.onclick||null,timeOut:a.timeOut||1000,extendedTimeOut:a.extendedTimeOut||4000};
var b=notifications[a.ntype](a.msg,a.title)
}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.ActiveNodesHighlighter=Clazz.extend({construct:function(a){this.facade=a;
this.facade.registerOnEvent(ORYX.CONFIG.EVENT_LOADED,this.highlightnodes.bind(this))
},highlightnodes:function(a){ORYX.EDITOR._canvas.getChildren().each((function(b){this.applyHighlightingToChild(b)
}).bind(this))
},applyHighlightingToChild:function(b){if(ORYX.ACTIVENODES){for(var a=0;
a<ORYX.ACTIVENODES.length;
a++){if(b instanceof ORYX.Core.Node||b instanceof ORYX.Core.Edge){if(ORYX.ACTIVENODES[a]==b.resourceId){b.setProperty("oryx-bordercolor","#FF0000")
}}}}if(ORYX.COMPLETEDNODES){for(var a=0;
a<ORYX.COMPLETEDNODES.length;
a++){if(b instanceof ORYX.Core.Node||b instanceof ORYX.Core.Edge){if(ORYX.COMPLETEDNODES[a]==b.resourceId){b.setProperty("oryx-bordercolor","#A8A8A8");
b.setProperty("oryx-bgcolor","#CDCDCD")
}}}}if(b instanceof ORYX.Core.Node||b instanceof ORYX.Core.Edge){if(ORYX.READONLY==true){b.setSelectable(false);
b.setMovable(false);
b.setProperty("oryx-isselectable","false");
if(b instanceof ORYX.Core.Edge){b.dockers.each((function(c){c.setMovable(false);
c.update()
}))
}}b.refresh()
}if(b&&b.getChildren().size()>0){for(var a=0;
a<b.getChildren().size();
a++){this.applyHighlightingToChild(b.getChildren()[a])
}}}});
if(!ORYX.Plugins){ORYX.Plugins={}
}if(!ORYX.Config){ORYX.Config={}
}ORYX.Plugins.FormEditing=Clazz.extend({construct:function(a){this.facade=a;
if(ORYX.READONLY!=true){if(ORYX.PRESET_PERSPECTIVE!="ruleflow"){this.facade.offer({name:ORYX.I18N.View.editProcessForm,functionality:this.editProcessForm.bind(this),group:"editprocessforms",icon:ORYX.BASE_FILE_PATH+"images/processforms.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/processforms.png",description:ORYX.I18N.View.editProcessFormDesc,index:1,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.View.editTaskForm,functionality:this.editTaskForm.bind(this),group:"editprocessforms",icon:ORYX.BASE_FILE_PATH+"images/processforms.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/processforms.png",description:ORYX.I18N.View.editTaskFormDesc,index:2,minShape:1,maxShape:1,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.forms.generateTaskForm,functionality:this.generateTaskForm.bind(this),group:"editprocessforms",icon:ORYX.BASE_FILE_PATH+"images/processforms.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/processforms.png",description:ORYX.I18N.forms.generateTaskForm_desc,index:3,minShape:1,maxShape:1,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)});
this.facade.offer({name:ORYX.I18N.forms.generateAllForms,functionality:this.generateTaskForms.bind(this),group:"editprocessforms",icon:ORYX.BASE_FILE_PATH+"images/processforms.png",dropDownGroupIcon:ORYX.BASE_FILE_PATH+"images/processforms.png",description:ORYX.I18N.forms.generateAllForms_desc,index:4,minShape:0,maxShape:0,isEnabled:function(){return ORYX.READONLY!=true
}.bind(this)})
}}},generateTaskForm:function(){var a=ORYX.Config.FACADE.getSelection();
if(a){if(a.length!=1){ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.invalidNumberNodes,title:""})
}else{var c=a[0].properties["oryx-tasktype"];
if(c&&c=="User"){var b=a[0].properties["oryx-taskname"];
if(b&&b.length>0){b=b.replace(/\&/g,"");
b=b.replace(/\s/g,"");
Ext.Ajax.request({url:ORYX.PATH+"taskforms",method:"POST",success:function(d){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:ORYX.I18N.forms.successGenTask,title:""})
}.createDelegate(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.failGenTask,title:""})
}.createDelegate(this),params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,json:ORYX.EDITOR.getSerializedJSON(),ppdata:ORYX.PREPROCESSING,taskid:a[0].resourceId}})
}else{ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.failNoTaskName,title:""})
}}else{ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.failNoUserTask,title:""})
}}}else{ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.failNoTaskSelected,title:""})
}},editTaskForm:function(){var a=ORYX.Config.FACADE.getSelection();
if(a){if(a.length!=1){ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.invalidNumberNodes,title:""})
}else{var c=a[0].properties["oryx-tasktype"];
if(c&&c=="User"){var b=a[0].properties["oryx-taskname"];
if(b&&b.length>0){b=b.replace(/\&/g,"");
b=b.replace(/\s/g,"");
ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_TASKFORM_EDIT,tn:b})
}else{ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.failNoTaskName,title:""})
}}else{ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.failNoUserTask,title:""})
}}}else{ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.failNoTaskSelected,title:""})
}},editProcessForm:function(){var a=ORYX.EDITOR.getSerializedJSON();
var b=jsonPath(a.evalJSON(),"$.properties.id");
if(b&&b!=""){ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_TASKFORM_EDIT,tn:b})
}else{ORYX.Config.FACADE.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.failProcIdUndef,title:""})
}},generateTaskForms:function(){Ext.Ajax.request({url:ORYX.PATH+"taskforms",method:"POST",success:function(a){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"success",msg:ORYX.I18N.forms.successGenProcAndTask,title:""})
}.createDelegate(this),failure:function(){this.facade.raiseEvent({type:ORYX.CONFIG.EVENT_NOTIFICATION_SHOW,ntype:"error",msg:ORYX.I18N.forms.failGenProcAndTask,title:""})
}.createDelegate(this),params:{profile:ORYX.PROFILE,uuid:ORYX.UUID,json:ORYX.EDITOR.getSerializedJSON(),ppdata:ORYX.PREPROCESSING}});
ORYX.CONFIG.TASKFORMS_URL=function(b,a){if(b===undefined){b=ORYX.UUID
}if(a===undefined){a=ORYX.PROFILE
}return ORYX.PATH+"taskforms?uuid="+b+"&profile="+a
}
}});
