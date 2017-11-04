var url1 = "'http://'+site+'/bin/'+name+'.v'+info.version+'.exe'";
var url2 = "'http://'+site+'/'+url+'/'+name+'.v'+info.version+'.7z'";

if (typeof(Vue) !== 'undefined') {
    Vue.component('download-link', {
        props: ['name', 'info', 'site', 'width'],
        template: '<a :class="width" :href="'+url1+'" target="_blank" rel="noopener"><icon class="icon-cloud-download"></icon>{{name}}<br>version {{(info.version)}}<span>Updated {{info.date}}.</span></a>'
    });
    Vue.component('history-download-link', {
        props: ['name', 'url', 'info', 'site'],
        template: '<li><icon class="icon-cloud-download"></icon><a class="link" :href="'+url2+'" target="_blank" rel="noopener"> {{name}} {{info.version}} </a>({{info.date}})</il>'
    });
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/json/tcupdate.json", true);
    xhr.onload = function() {
        if (xhr.readyState === 4 && xhr.getResponseHeader("content-type") === "application/json") {
           var releases_data = JSON.parse(xhr.responseText);
            var tcupdate = new Vue({
                el: '#tool-downloads',
                data: {
                    site: '7xsjmh.com2.z0.glb.clouddn.com',
                    data: releases_data
                }
            });
        } else {
            console.error(xhr);
        }
    };
    xhr.onerror = function() {
        console.error(xhr.statusText);
    };
    xhr.send();
}
