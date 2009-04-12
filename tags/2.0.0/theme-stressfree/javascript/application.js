var webminpath = '';
var searchVisible = false;
var gearsVisible = false;

function initialize(path) {
    webminpath = path;
	
    var prev_onload = window.onload;
    window.onload = function() {
        if(prev_onload!=null){
            prev_onload();
        }
        $('gearslink').className = webminGears.status_class();
        if(NiftyCheck()) {
            Rounded("div#container","tr tl","#476DAB","#FFF","smooth");
            Rounded("div#contentcontainer","tr tl","#000","#FFF","smooth");
        }
        loadSidebar();

        new Ajax.Autocompleter("searchfield", "searchfield_choices", webminpath + "/search.cgi",
            {paramName: "Search", minChars: 2, afterUpdateElement: openUrl});
    }
}

function loadSidebar() {
    if(Cookie.get('sidebar') == 'true') {
        // Display the sidebar
        displaySidebar();
    }
}

function switchSidebar() {
    var sidebarClass = $('contenttable').className;
    var visible = true;
	
    if(sidebarClass == 'sidebar-hidden') {
        visible = false;
    }
    if(!visible) {
        // Display the sidebar
        displaySidebar();
    } else {
        // Hide the sidebar
        hideSidebar();
    }
}

function displaySidebar() {
    // Display the systats sidebar div
    refreshSidebar();
    Cookie.set('sidebar','true', 365);
    $('contenttable').className = 'sidebar-visible';
    $('sidebar').className = 'sidebar-visible';
    $('sysstats-open').style.display = 'none';
}

function hideSidebar() {
    // Hide the systats sidebar div
    Cookie.set('sidebar','false', 365);
    $('contenttable').className = 'sidebar-hidden';
    $('sidebar').className = 'sidebar-hidden';
    $('sysstats-open').style.display = 'block';
}

function refreshSidebar() {
    // Load the systats into the sidebar div
    var sidebarUrl = webminpath + '/sysstats.cgi';
    new Ajax.Updater('sidebar-info', sidebarUrl, {
        asynchronous:true
    });
}

function viewSearch() {
    if(!searchVisible) {
        if (gearsVisible) {
            webminGears.message_view();
        }
        $('searchbutton').className = 'search-selected';
        $('searchform').style.display = 'block';
        $('searchfield').focus();
        searchVisible = true;
    } else {
        $('searchbutton').className = 'search-notselected';
        $('searchform').style.display = 'none';
        searchVisible = false;
    }
    return false;
}

function openUrl() {
    // Open the url specified by the selected search result
    var url = webminpath + '/' + $('searchfield').value;
    document.location.href = url;
}

function donateHide() {
    // Load the donate page into the donation div
    var donateUrl = webminpath + '/donate.cgi';
    new Ajax.Updater('donation', donateUrl, {
        asynchronous:true
    });
}


// Prototype/Cookie code from http://gorondowtl.sourceforge.net/wiki/Cookie
var Cookie = {
    set: function(name, value, daysToExpire) {
        var expire = '';
        if (daysToExpire != undefined) {
            var d = new Date();
            d.setTime(d.getTime() + (86400000 * parseFloat(daysToExpire)));
            expire = '; expires=' + d.toGMTString();
        }
        return (document.cookie = escape(name) + '=' + escape(value || '') + expire);
    },
    get: function(name) {
        var cookie = document.cookie.match(new RegExp('(^|;)\\s*' + escape(name) + '=([^;\\s]*)'));
        return (cookie ? unescape(cookie[2]) : null);
    },
    erase: function(name) {
        var cookie = Cookie.get(name) || true;
        Cookie.set(name, '', -1);
        return cookie;
    },
    accept: function() {
        if (typeof navigator.cookieEnabled == 'boolean') {
            return navigator.cookieEnabled;
        }
        Cookie.set('_test', '1');
        return (Cookie.erase('_test') === '1');
    }
};

webminGears = {

    createStore : function() {
        if ( 'undefined' == typeof google || ! google.gears ) return;

        if ( 'undefined' == typeof localServer ) {
            localServer = google.gears.factory.create("beta.localserver");
        }
        var manifestUrl = webminpath + '/manifest.cgi';
        store = localServer.createManagedStore('webminGears');
        store.manifestUrl = manifestUrl;
        store.checkForUpdate();
        this.message();
    },

    getPermission : function() {
        if ( 'undefined' != typeof google && google.gears ) {
            if ( ! google.gears.factory.hasPermission ) {
                google.gears.factory.getPermission( 'webminGears', '/theme-stressfree/images/webminlogo.gif' );
            }
            try {
                this.createStore();
            } catch(e) {} // silence if canceled
        }
    },

    message_version : function(){
        var t = this, msg4= $('gears-msg4'), mfver= $('mfver');
        msg4.style.display = store.currentVersion? 'block':'none';
        if (mfver) mfver.innerHTML=	store.currentVersion;
    },

    message : function(show) {
        var t = this, msg1 = $('gears-msg1'), msg2 = $('gears-msg2'), msg3 = $('gears-msg3'), num = $('gears-upd-number'), wait = $('gears-wait');
        var msg4= $('gears-msg4'), mfver= $('mfver');

        if ( ! msg1 ) return;

        if ( 'undefined' != typeof google && google.gears ) {
            if ( google.gears.factory.hasPermission ) {
                msg1.style.display = msg2.style.display = 'none';
                msg3.style.display = 'block';

                if ( 'undefined' == typeof store )
                    t.createStore();

                store.oncomplete = function(){
                    wait.innerHTML = ' <strong>update completed..</strong>';
                    t.message_version();
                };
                store.onerror = function(){
                    wait.innerHTML = ' <br /><strong>error:</strong>'
                        + store.lastErrorMessage + '<br />';
                    t.message_version();
                };
                store.onprogress = function(e){
                    if (msg4.style.display != 'block') t.message_version();
                    if(num) num.innerHTML = (' ' + e.filesComplete + ' / ' + e.filesTotal);
                };

            } else {
                msg1.style.display = msg3.style.display = msg4.style.display = 'none';
                msg2.style.display = 'block';
            }
        }
    },

    message_view : function() {
        if(searchVisible) {
            viewSearch();
        }
        if (!gearsVisible) {
            var t = this;
            t.message();
            gearsVisible = true;
            $('gearsstatus').className = 'gearsstatus-selected';
            $('gears-info-box').style.display = 'block';
        } else {
            gearsVisible = false;
            $('gearsstatus').className = 'gearsstatus-notselected';
            $('gears-info-box').style.display='none';
        }
    },

    status_class : function() {

        var status = 'gears-disabled';

        if ( 'undefined' != typeof google && google.gears ) {
            if ( google.gears.factory.hasPermission ) {
                status = 'gears-enabled';
            }
        }
        return status;
    }
};


// Copyright 2007, Google Inc.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//  1. Redistributions of source code must retain the above copyright notice,
//     this list of conditions and the following disclaimer.
//  2. Redistributions in binary form must reproduce the above copyright notice,
//     this list of conditions and the following disclaimer in the documentation
//     and/or other materials provided with the distribution.
//  3. Neither the name of Google Inc. nor the names of its contributors may be
//     used to endorse or promote products derived from this software without
//     specific prior written permission.
//
// THIS SOFTWARE IS PROVIDED BY THE AUTHOR ``AS IS'' AND ANY EXPRESS OR IMPLIED
// WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
// MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO
// EVENT SHALL THE AUTHOR BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
// SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
// PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS;
// OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
// WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR
// OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF
// ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
//
// Sets up google.gears.*, which is *the only* supported way to access Gears.
//
// Circumvent this file at your own risk!
//
// In the future, Gears may automatically define google.gears.* without this
// file. Gears may use these objects to transparently fix bugs and compatibility
// issues. Applications that use the code below will continue to work seamlessly
// when that happens.

(function() {
    // We are already defined. Hooray!
    if (window.google && google.gears) {
        return;
    }

    var factory = null;

    // Firefox
    if (typeof GearsFactory != 'undefined') {
        factory = new GearsFactory();
    } else {
        // IE
        try {
            factory = new ActiveXObject('Gears.Factory');
            // privateSetGlobalObject is only required and supported on IE Mobile on
            // WinCE.
            if (factory.getBuildInfo().indexOf('ie_mobile') != -1) {
                factory.privateSetGlobalObject(this);
            }
        } catch (e) {
            // Safari
            if ((typeof navigator.mimeTypes != 'undefined')
                && navigator.mimeTypes["application/x-googlegears"]) {
                factory = document.createElement("object");
                factory.style.display = "none";
                factory.width = 0;
                factory.height = 0;
                factory.type = "application/x-googlegears";
                document.documentElement.appendChild(factory);
            }
        }
    }

    // *Do not* define any objects if Gears is not installed. This mimics the
    // behavior of Gears defining the objects in the future.
    if (!factory) {
        return;
    }

    // Now set up the objects, being careful not to overwrite anything.
    //
    // Note: In Internet Explorer for Windows Mobile, you can't add properties to
    // the window object. However, global objects are automatically added as
    // properties of the window object in all browsers.
    if (!window.google || 'undefined' == typeof google) {
        google = {};
    }

    if (!google.gears) {
        google.gears = {
            factory: factory
        };
    }
})();

// Nifty Corners Javascript
function NiftyCheck(){
if(!document.getElementById || !document.createElement)
    return(false);
isXHTML=/html\:/.test(document.getElementsByTagName('body')[0].nodeName);
if(Array.prototype.push==null){Array.prototype.push=function(){
      this[this.length]=arguments[0]; return(this.length);}}
return(true);
}

function Rounded(selector,wich,bk,color,opt){
var i,prefixt,prefixb,cn="r",ecolor="",edges=false,eclass="",b=false,t=false;

if(color=="transparent"){
    cn=cn+"x";
    ecolor=bk;
    bk="transparent";
    }
else if(opt && opt.indexOf("border")>=0){
    var optar=opt.split(" ");
    for(i=0;i<optar.length;i++)
        if(optar[i].indexOf("#")>=0) ecolor=optar[i];
    if(ecolor=="") ecolor="#666";
    cn+="e";
    edges=true;
    }
else if(opt && opt.indexOf("smooth")>=0){
    cn+="a";
    ecolor=Mix(bk,color);
    }
if(opt && opt.indexOf("small")>=0) cn+="s";
prefixt=cn;
prefixb=cn;
if(wich.indexOf("all")>=0){t=true;b=true}
else if(wich.indexOf("top")>=0) t="true";
else if(wich.indexOf("tl")>=0){
    t="true";
    if(wich.indexOf("tr")<0) prefixt+="l";
    }
else if(wich.indexOf("tr")>=0){
    t="true";
    prefixt+="r";
    }
if(wich.indexOf("bottom")>=0) b=true;
else if(wich.indexOf("bl")>=0){
    b="true";
    if(wich.indexOf("br")<0) prefixb+="l";
    }
else if(wich.indexOf("br")>=0){
    b="true";
    prefixb+="r";
    }
var v=getElementsBySelector(selector);
var l=v.length;
for(i=0;i<l;i++){
    if(edges) AddBorder(v[i],ecolor);
    if(t) AddTop(v[i],bk,color,ecolor,prefixt);
    if(b) AddBottom(v[i],bk,color,ecolor,prefixb);
    }
}

function AddBorder(el,bc){
var i;
if(!el.passed){
    if(el.childNodes.length==1 && el.childNodes[0].nodeType==3){
        var t=el.firstChild.nodeValue;
        el.removeChild(el.lastChild);
        var d=CreateEl("span");
        d.style.display="block";
        d.appendChild(document.createTextNode(t));
        el.appendChild(d);
        }
    for(i=0;i<el.childNodes.length;i++){
        if(el.childNodes[i].nodeType==1){
            el.childNodes[i].style.borderLeft="1px solid "+bc;
            el.childNodes[i].style.borderRight="1px solid "+bc;
            }
        }
    }
el.passed=true;
}

function AddTop(el,bk,color,bc,cn){
var i,lim=4,d=CreateEl("b");

if(cn.indexOf("s")>=0) lim=2;
if(bc) d.className="artop";
else d.className="rtop";
d.style.backgroundColor=bk;
for(i=1;i<=lim;i++){
    var x=CreateEl("b");
    x.className=cn + i;
    x.style.backgroundColor=color;
    if(bc) x.style.borderColor=bc;
    d.appendChild(x);
    }
el.style.paddingTop=0;
el.insertBefore(d,el.firstChild);
}

function AddBottom(el,bk,color,bc,cn){
var i,lim=4,d=CreateEl("b");

if(cn.indexOf("s")>=0) lim=2;
if(bc) d.className="artop";
else d.className="rtop";
d.style.backgroundColor=bk;
for(i=lim;i>0;i--){
    var x=CreateEl("b");
    x.className=cn + i;
    x.style.backgroundColor=color;
    if(bc) x.style.borderColor=bc;
    d.appendChild(x);
    }
el.style.paddingBottom=0;
el.appendChild(d);
}

function CreateEl(x){
if(isXHTML) return(document.createElementNS('http://www.w3.org/1999/xhtml',x));
else return(document.createElement(x));
}

function getElementsBySelector(selector){
var i,selid="",selclass="",tag=selector,f,s=[],objlist=[];

if(selector.indexOf(" ")>0){  //descendant selector like "tag#id tag"
    s=selector.split(" ");
    var fs=s[0].split("#");
    if(fs.length==1) return(objlist);
    f=document.getElementById(fs[1]);
    if(f) return(f.getElementsByTagName(s[1]));
    return(objlist);
    }
if(selector.indexOf("#")>0){ //id selector like "tag#id"
    s=selector.split("#");
    tag=s[0];
    selid=s[1];
    }
if(selid!=""){
    f=document.getElementById(selid);
    if(f) objlist.push(f);
    return(objlist);
    }
if(selector.indexOf(".")>0){  //class selector like "tag.class"
    s=selector.split(".");
    tag=s[0];
    selclass=s[1];
    }
var v=document.getElementsByTagName(tag);  // tag selector like "tag"
if(selclass=="")
    return(v);
for(i=0;i<v.length;i++){
    if(v[i].className.indexOf(selclass)>=0){
        objlist.push(v[i]);
        }
    }
return(objlist);
}

function Mix(c1,c2){
var i,step1,step2,x,y,r=new Array(3);
if(c1.length==4)step1=1;
else step1=2;
if(c2.length==4) step2=1;
else step2=2;
for(i=0;i<3;i++){
    x=parseInt(c1.substr(1+step1*i,step1),16);
    if(step1==1) x=16*x+x;
    y=parseInt(c2.substr(1+step2*i,step2),16);
    if(step2==1) y=16*y+y;
    r[i]=Math.floor((x*50+y*50)/100);
    }
return("#"+r[0].toString(16)+r[1].toString(16)+r[2].toString(16));
}