/// <reference path="../typings/globals/jquery/index.d.ts" />
interface INode {
    name: string;
    n: string;
    c: string;
}

interface IData<T> {
    [key: string]: T;
}

let track_id: number = 0;
let data: IData<INode> = {
    '':      {name: '',          n: 'nil',  c: 'nil' },
    PCM:     {name: 'PCM',       n: 'flac', c: 'aac' },
    TrueHD:  {name: 'True-HD',   n: 'flac', c: 'aac' },
    DTSHDMA: {name: 'DTS-HD MA', n: 'flac', c: 'aac' },
    DTS:     {name: 'DTS',       n: 'DTS',  c: 'DTS' },
    AC3:     {name: 'AC-3',      n: 'AC-3', c: 'AC-3'},
    FLAC:    {name: 'flac',      n: 'flac', c: 'flac'},
    MP3:     {name: 'mp3',       n: 'mp3',  c: 'mp3' }
}

function get_option(id: number): string {
    let selector_id: string = 'ui_track_' + id + '_select';
    let option_id: string   = 'ui_checkbox_' + id + '_';
    let option: string =
    `<div class="form-group form-group-label margin-left">`+
    `    <label class="floating-label" for="${selector_id}">Type</label>`+
    `    <select class="form-control form-control-inline" id="${selector_id}">`;
    for(let item in data) {
        option +=
    `       <option value="${item}">${data[item].name}</option>`;
    }
    option +=
    `   </select>`+
    `   <div class="checkbox checkbox-inline checkbox-adv margin-left">`+
    `       <label for="${option_id}">`+
    `           <input class="access-hide" id="${option_id}" name="${option_id}" type="checkbox">`+
    `           Commentary`+
    `           <span class="checkbox-circle"></span>`+
    `           <span class="checkbox-circle-check"></span>`+
    `           <span class="checkbox-circle-icon icon">done</span>`+
    `       </label>`+
    `   </div>`+
    `<span id="result-container"></span>`+
    `</div>`;
    return option;
}

function add_track(): void {
    $('#input-container').append(get_option(track_id++));
}

function remove_track(): void {
    if($('#input-container .form-group').length <= 1) return;
    $('#input-container .form-group:last-child').remove();
}

function get_label(value: string): string {
    return `<span class="label label-brand checkbox-inline">${value}</span>`;
}

class Result {
    readonly index: number;
    readonly result: string;
    constructor(index: number, result: string) {
        this.index = index;
        this.result = result;
    }

    public toString(): string {
        return '{' + this.index + ': ' + this.result + '}'
    }
}

function get_result(): void {
    let norArr: Array<Result> = [];
    let comArr: Array<Result> = [];
    let index: number = 0;
    $.each($('#input-container .form-group'), function(_, track) {
        let option: string      = $(track).find('select').val();
        let commentary: boolean = $(track).find('div label input').is(':checked');
        let result: string = commentary? data[option].c: data[option].n;
        if (!commentary) norArr.push(new Result(++index, result));
        else comArr.push(new Result(++index, result));
        $(track).find('#result-container').html(get_label(result));
    });
    //console.log({norArr, comArr});
    let mkv: Array<Result> = [];
    let mka: Array<Result> = [];

    if (norArr.length >= 2) {
        mkv.push(norArr[0]);
        for(let i = 1; i < norArr.length; ++i) mka.push(norArr[i]);
    } else {
        norArr.forEach(nor => mkv.push(nor));
    }
    comArr.forEach(com => mkv.push(com));
    $('#mkv').html(''); $('#mka').html('');

    mkv.forEach(item => $('#mkv').append(get_label(item.toString())));
    mka.forEach(item => $('#mka').append(get_label(item.toString())));

    $('#group-container-container').show();

    if (mkv.length > 0) $('.mkv-container').show(); else $('.mkv-container').hide();
    if (mka.length > 0) $('.mka-container').show(); else $('.mka-container').hide();

    //console.log({mkv, mka});
}
