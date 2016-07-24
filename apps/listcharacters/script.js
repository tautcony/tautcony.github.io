function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function chars2cps(chars) {
    // this is needed because of javascript's handling of supplementary characters
    // char: a string of unicode characters
    // returns an array of decimal code point values
    var haut = 0;
    var out = [];
    for (var i = 0; i < chars.length; i++) {
        var b = chars.charCodeAt(i);
        if (b < 0 || b > 0xFFFF) {
            alert('Error in chars2cps: byte out of range ' + b.toString(16) + '!');
        }
        if (haut !== 0) {
            if (0xDC00 <= b && b <= 0xDFFF) {
                out.push(0x10000 + ((haut - 0xD800) << 10) + (b - 0xDC00));
                haut = 0;
                continue;
            } else {
                alert('Error in chars2cps: surrogate out of range ' + haut.toString(16) + '!');
                haut = 0;
            }
        }
        if (0xD800 <= b && b <= 0xDBFF) {
            haut = b;
        } else {
            out.push(b);
        }
    }
    return out;
}

function makeList(stream) {
    stream = stream.replace(/ /g, '');
    var cps = chars2cps(stream);

    // make an object with char counts per script group
    var scriptGroups = {};
    for (var i = 0; i < cps.length; i++) {
        var scriptGroup = findScriptGroup(cps[i]);
        if (scriptGroups[scriptGroup] === undefined) {
            scriptGroups[scriptGroup] = {};
            scriptGroups[scriptGroup].allCnt = 1;
            scriptGroups[scriptGroup].unique = new Set(String.fromCodePoint(cps[i]));
        } else {
            scriptGroups[scriptGroup].allCnt += 1;
            scriptGroups[scriptGroup].unique.add(String.fromCodePoint(cps[i]));
        }
    }

    // output the list
    var out = '<table><tbody>\n';
    var keys = Object.keys(scriptGroups);
    keys.sort();
    // check whether a unique column is needed
    var uniqueNeeded = false;
    for(var key of keys) {
        if(scriptGroups[key].allCnt !== scriptGroups[key].unique.size) {
            uniqueNeeded = true;
            break;
        }
    }

    if (uniqueNeeded) out += '<tr><th></th><th>Unique</th><th>Total</th><th></th></tr>';
    // construct a table
    for (var key of keys) {
        out += '<tr>';
        out += '<th class="sg">' + key + '</th>';
        var count = scriptGroups[key].unique.size
        out += '<td class="count">' + count + '</td>';
        if (uniqueNeeded && scriptGroups[key].unique.size !== scriptGroups[key].allCnt) {
            count = scriptGroups[key].allCnt;
            out += '<td class="count">' + count + '</td>';
        }
        else if (uniqueNeeded) out += '<td class="count"></td>';
        var uniqueString = "";
        for (var item of scriptGroups[key].unique) uniqueString += item;
        out += '<td class="chars">' + uniqueString + '</td>';
        out += '<td class="select" title="Copy to clipboard" onclick="copyToClipboard(this.previousSibling)"><span class="icon icon-lg">content_copy</span></td>';
        out += '</tr>\n';
    }
    out += '</tbody></table>';

    out += '<p class="total">Total characters: ' + cps.length + "</p>";
    out += '<p class="total">Total blocks: ' + keys.length + "</p>";

    document.getElementById('out').innerHTML = out;
}

function copyToClipboard(node) {
    node.contentEditable = true;
    node.focus();
    document.execCommand('selectAll');
    document.execCommand('copy');
    document.execCommand('unselect');
    node.contentEditable = false;
}
