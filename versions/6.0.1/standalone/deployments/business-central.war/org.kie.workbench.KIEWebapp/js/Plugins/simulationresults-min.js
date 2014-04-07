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