(function(){function g(h,k){for(var j=0,l=h.length;
j<l;
++j){k(h[j])
}}function f(h,k){if(!Array.prototype.indexOf){var j=h.length;
while(j--){if(h[j]===k){return true
}}return false
}return h.indexOf(k)!=-1
}function d(m,l,h,n){var o=m.getCursor(),k=n(m,o),p=k;
if(!/^[\w$_]*$/.test(k.string)){k=p={start:o.ch,end:o.ch,string:"",state:k.state,className:k.string=="."?"property":null}
}while(p.className=="property"){p=n(m,{line:o.line,ch:p.start});
if(p.string!="."){return
}p=n(m,{line:o.line,ch:p.start});
if(p.string==")"){var i=1;
do{p=n(m,{line:o.line,ch:p.start});
switch(p.string){case")":i++;
break;
case"(":i--;
break;
default:break
}}while(i>0);
p=n(m,{line:o.line,ch:p.start});
if(p.className=="variable"){p.className="function"
}else{return
}}if(!j){var j=[]
}j.push(p)
}if(h&&h=="form"){return{list:e(k,j,l),from:{line:o.line,ch:k.start},to:{line:o.line,ch:k.end}}
}else{return{list:b(k,j,l),from:{line:o.line,ch:k.start},to:{line:o.line,ch:k.end}}
}}CodeMirror.jbpmHint=function(h){return d(h,a,"script",function(i,j){return i.getTokenAt(j)
})
};
CodeMirror.formsHint=function(h){return d(h,[],"form",function(i,j){return i.getTokenAt(j)
})
};
var a=("getProcessInstance() getNodeInstance() getVariable(variableName) setVariable(variableName,value) getKnowledgeRuntime()").split(" ");
var c=("return kcontext").split(" ");
function b(l,j,p){var u=[],h=l.string;
function m(v){if(v.indexOf(h)==0&&!f(u,v)){if(v.indexOf(":")>0){var i=v.split(":");
u.push(i[0])
}else{u.push(v)
}}}if(j){var q=j.pop().string;
if(q=="kcontext"){g(a,m)
}}else{g(c,m);
var s=ORYX.EDITOR.getSerializedJSON();
var t=jsonPath(s.evalJSON(),"$.properties.vardefs");
if(t){if(t.toString().length>0){g(t.toString().split(","),m)
}}var k=jsonPath(s.evalJSON(),"$.properties.globals");
if(k){if(k.toString().length>0){g(k.toString().split(","),m)
}}var r="";
var o=jsonPath(s.evalJSON(),"$.childShapes.*");
for(var n=0;
n<o.length;
n++){if(o[n].stencil.id=="DataObject"){r+=o[n].properties.name;
r+=","
}}if(r.endsWith(",")){r=r.substr(0,r.length-1)
}g(r.toString().split(","),m)
}return u
}function e(s,l,u){var y=[],p=s.string;
function w(j){if(j.indexOf(p)==0&&!f(y,j)){if(j.indexOf(":")>0){var i=j.split(":");
y.push(i[0])
}else{y.push(j)
}}}var I=ORYX.EDITOR._pluginFacade.getSelection();
if(I&&I.length==1){var h=I.first();
var H=h.resourceId;
var m=ORYX.EDITOR.getSerializedJSON();
var q=jsonPath(m.evalJSON(),"$.childShapes.*");
for(var E=0;
E<q.length;
E++){var C=q[E];
if(C.resourceId==H){var x=C.properties.datainputset;
var v=C.properties.dataoutputset;
var r=x.split(",");
for(var D=0;
D<r.length;
D++){var n=r[D];
if(n.indexOf(":")>0){var A=n.split(":");
w("${"+A[0]+"}")
}else{w("${"+n+"}")
}}var z=v.split(",");
for(var B=0;
B<z.length;
B++){var n=z[B];
if(n.indexOf(":")>0){var A=n.split(":");
w(A[0])
}else{w(n)
}}}}}else{var m=ORYX.EDITOR.getSerializedJSON();
var F=jsonPath(m.evalJSON(),"$.properties.vardefs");
if(F){if(F.toString().length>0){g(F.toString().split(","),w)
}}var G=jsonPath(m.evalJSON(),"$.properties.globals");
if(G){if(G.toString().length>0){g(G.toString().split(","),w)
}}var t="";
var o=jsonPath(m.evalJSON(),"$.childShapes.*");
for(var E=0;
E<o.length;
E++){if(o[E].stencil.id=="DataObject"){t+=o[E].properties.name;
t+=","
}}if(t.endsWith(",")){t=t.substr(0,t.length-1)
}g(t.toString().split(","),w)
}return y
}})();