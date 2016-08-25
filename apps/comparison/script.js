if (!String.prototype.format) {
    String.prototype.format = function () {
        'use strict';
        var args = arguments;
        return this.replace(/{(\d+)}/g, function (match, number) {
            return typeof args[number] !== undefined ? args[number] : match;
        });
    };
}


function getOption() {
    'use strict';
    var selection = $("input#two_sample.access-hide");
    if (selection[0].checked) {
        return 2;
    }
    return 3;
}

function comparisonGenerate(stream, sortArray) {
    'use strict';
    var compareCount = getOption() + 1;
    var urls = stream.replace('\r', '').split('\n');
    var inpng = [];
    var indexs = [];
    urls.find((item, index) => {
        if (item.indexOf('png') < 0) {
            inpng.push(item);
            indexs.push(index);
        }
    });
    for (var i = indexs.length - 1; i >= 0; --i) {
        urls.splice(indexs[i], 1);
    }
    if (inpng.length > 0) {
        console.log('nonPNG',inpng);
    }
    if (urls.length % compareCount != 0) {
        //document.getElementById('error-text').innerHTML = "Picture number dosen't match";
        document.getElementById("a-warning").click();
        return;
    }
    if ($('input#sort_urls_switch.access-hide')[0].checked) {
        var pat = /\d+.?\.png/;
        urls.sort((lhs, rhs) => {
            var l = parseInt(lhs.match(pat));
            var r = parseInt(rhs.match(pat));
            if (l === r) return lhs > rhs;
            return l > r;
        });
    }

    var groupNumber = urls.length / compareCount;
    var ret = '';
    for (var i = 0; i < groupNumber; i++) {
        var small = '', src = '', ripv = '', ripu = '';
        for (var j = i*compareCount; j < (i+1)*compareCount; ++j) {
            var url = urls[j];
            if (url.indexOf('s.png') > 0) {
                small = url;
            } else if (url.indexOf('v.png') > 0) {
                ripv = url;
            } else if (url.indexOf('u.png') > 0) {
                ripu = url;
            } else {
                src = url;
            }
        }
        if (ripv === '' && compareCount === 3) {
            ripv = ripu;
        }
        switch (compareCount) {
        case 3:
            ret += "[URL={1}][IMG]{0}[/IMG][/URL] [URL={2}][IMG]{0}[/IMG][/URL]\n".format(small, src, ripv);
            break;
        case 4:
            ret += "[URL={1}][IMG]{0}[/IMG][/URL] [URL={2}][IMG]{0}[/IMG][/URL] [URL={3}][IMG]{0}[/IMG][/URL]\n".format(small, src, ripv);
            break;
        }
    }
    document.getElementById('bbcode-context').innerHTML = ret;
    document.getElementById('out').style.display = "block";
}

var TITLE = {
    'eng' : ["Comparison (right click on the image and open it in a new tab to see the full-size one)\nSource________________________________________________Encode",
             "Comparison (right click on the image and open it in a new tab to see the full-size one)\nSource____________________________10bit ver___________________________8bit ver"],
    "chs": ["截图对比 (右键小图，选择在新标签卡中打开，以查看大图)\n原盘________________________________________________成品",
            "截图对比 (右键小图，选择在新标签卡中打开，以查看大图)\n原盘________________________________________________10bit ver___________________________8bit ver"]
}

function copyToClipboard(type) {
    'use strict';
    var title = document.getElementById('title');
    if (type === 'eng') {
        title.innerHTML = TITLE.eng[getOption()-2];
    } else if (type === 'chs') {
        title.innerHTML = TITLE.chs[getOption()-2];
    }
    var node = document.getElementById('bbcode-context');
    node.contentEditable = 'true';
    node.focus();
    document.execCommand('selectAll');
    document.execCommand('copy');
    document.execCommand('unselect');
    node.contentEditable = 'false';
    title.innerHTML = "";
}
