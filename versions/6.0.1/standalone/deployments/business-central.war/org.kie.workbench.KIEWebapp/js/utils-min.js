ORYX.Utils={getParamFromUrl:function(b){b=b.replace(/[\[]/,"\\[").replace(/[\]]/,"\\]");
var a="[\\?&]"+b+"=([^&#]*)";
var d=new RegExp(a);
var c=d.exec(window.location.href);
if(c==null){return null
}else{return c[1]
}},adjustGradient:function(c,a){if(ORYX.CONFIG.DISABLE_GRADIENT&&c){var b=a.getAttributeNS(null,"stop-color")||"#ffffff";
$A(c.getElementsByTagName("stop")).each(function(d){if(d==a){return
}d.setAttributeNS(null,"stop-color",b)
})
}}};