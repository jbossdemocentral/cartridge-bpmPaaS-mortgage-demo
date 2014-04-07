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