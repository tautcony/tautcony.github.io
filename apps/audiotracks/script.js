var track_id = 0;
var data = {
    '':      {name: '',          n: 'nil',  c: 'nil' },
    PCM:     {name: 'PCM',       n: 'flac', c: 'aac' },
    TrueHD:  {name: 'True-HD',   n: 'flac', c: 'aac' },
    DTSHDMA: {name: 'DTS-HD MA', n: 'flac', c: 'aac' },
    DTS:     {name: 'DTS',       n: 'DTS',  c: 'DTS' },
    AC3:     {name: 'AC-3',      n: 'AC-3', c: 'AC-3'},
    FLAC:    {name: 'flac',      n: 'flac', c: 'flac'},
    MP3:     {name: 'mp3',       n: 'mp3',  c: 'mp3' }
}

function get_option(id) {
    var selector_id = 'ui_track_' + id + '_select';
    var option_id = 'ui_checkbox_' + id + '_';
    var option = '<div class="form-group form-group-label margin-left">'+
    '    <label class="floating-label" for="' + selector_id + '">Type</label>'+
    '    <select class="form-control form-control-inline" id="' + selector_id + '">';
    for(var item in data) {
        option += '<option value="'+item+'">'+data[item].name+'</option>';
    }
    option += '   </select>'+
    '   <div class="checkbox checkbox-inline checkbox-adv margin-left">'+
    '   	<label for="' + option_id +'">'+
    '   		<input class="access-hide" id="' + option_id +'" name="' + option_id +'" type="checkbox">'+
    '           Commentary'+
    '   		<span class="checkbox-circle"></span>'+
    '           <span class="checkbox-circle-check"></span>'+
    '           <span class="checkbox-circle-icon icon">done</span>'+
    '   	</label>'+
    '   </div>'+
    '<span id="result-container"></span>'+
    '</div>';
    return option;
}

function add_track() {
    $('#input-container').append(get_option(track_id++));
}

function get_label(value) {
    return '<span class="label label-brand checkbox-inline">'+ value +'</sapn>'
}

function get_result() {
    var tracks = $('#input-container .form-group');
    var norArr = [];
    var comArr = [];
    let index = 0;
    for(var track of tracks) {
        var option = $(track).find('select').val();
        var commentary = $(track).find('div label input').is(':checked');
        var result = commentary? data[option].c: data[option].n;
        if (!commentary) norArr.push({index: ++index, result: result});
        else comArr.push({index: ++index, result: result});
        $(track).find('#result-container').html(get_label(result));
    }
    console.log({norArr, comArr});
    var mkv = [];
    var mka = [];
    
    if ((norArr.length + comArr.length) > 2) {
        if (norArr.length > 0) {
            mkv.push(norArr[0]);
            for(var i = 1; i < norArr.length; ++i) mka.push(norArr[i]);
        }
        for(var com of comArr) mka.push(com);
    } else {
        for(var nor of norArr) mkv.push(nor);
        for(var com of comArr) mkv.push(com);
    }
    $('#mkv').html(''); $('#mka').html('');

    for(var item of mkv) $('#mkv').append(get_label('{' + item.index + ': ' + item.result + '}'));
    for(var item of mka) $('#mka').append(get_label('{' + item.index + ': ' + item.result + '}'));
    
    $('#group-container-container').show();
    
    if (mkv.length > 0) $('.mkv-container').show(); else $('.mkv-container').hide();
    if (mka.length > 0) $('.mka-container').show(); else $('.mka-container').hide();
    
    console.log({mkv, mka});
}