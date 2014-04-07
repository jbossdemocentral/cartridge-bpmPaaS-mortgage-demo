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