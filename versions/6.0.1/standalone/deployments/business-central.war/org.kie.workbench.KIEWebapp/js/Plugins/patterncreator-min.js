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