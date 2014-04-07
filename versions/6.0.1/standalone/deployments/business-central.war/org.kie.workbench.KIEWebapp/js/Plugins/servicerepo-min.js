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