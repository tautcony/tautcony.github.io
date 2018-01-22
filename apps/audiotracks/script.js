var AudioTrackCount;
(function (AudioTrackCount) {
    var trackID = 0;
    var data = {
        "": { name: "", n: "nil", c: "nil" },
        "PCM": { name: "PCM", n: "flac", c: "aac" },
        "TrueHD": { name: "True-HD", n: "flac", c: "aac" },
        "DTSHDMA": { name: "DTS-HD MA", n: "flac", c: "aac" },
        "DTS": { name: "DTS", n: "DTS", c: "DTS" },
        "AC3": { name: "AC-3", n: "AC-3", c: "AC-3" },
        "FLAC": { name: "flac", n: "flac", c: "flac" },
        "MP3": { name: "mp3", n: "mp3", c: "mp3" }
    };
    function get_option(id) {
        var selectorID = "ui_track_" + id + "_select";
        var optionID = "ui_checkbox_" + id + "_";
        var option = "<div class=\"form-group form-group-label margin-left\">" +
            ("    <label class=\"floating-label\" for=\"" + selectorID + "\">Type</label>") +
            ("    <select class=\"form-control form-control-inline\" id=\"" + selectorID + "\">");
        for (var item in data) {
            if (data.hasOwnProperty(item)) {
                option += "       <option value=\"" + item + "\">" + data[item].name + "</option>";
            }
        }
        option +=
            "   </select>" +
                "   <div class=\"checkbox checkbox-inline checkbox-adv margin-left\">" +
                ("       <label for=\"" + optionID + "\">") +
                ("           <input class=\"access-hide\" id=\"" + optionID + "\" name=\"" + optionID + "\" type=\"checkbox\">") +
                "           Commentary" +
                "           <span class=\"checkbox-circle\"></span>" +
                "           <span class=\"checkbox-circle-check\"></span>" +
                "           <span class=\"checkbox-circle-icon icon\">done</span>" +
                "       </label>" +
                "   </div>" +
                "<span id=\"result-container\"></span>" +
                "</div>";
        return option;
    }
    function add_track() {
        $("#input-container").append(get_option(trackID++));
    }
    AudioTrackCount.add_track = add_track;
    function remove_track() {
        if ($("#input-container .form-group").length <= 1) {
            return;
        }
        $("#input-container .form-group:last-child").remove();
    }
    AudioTrackCount.remove_track = remove_track;
    function get_label(value) {
        return "<span class=\"label label-brand checkbox-inline\">" + value + "</span>";
    }
    var Result = /** @class */ (function () {
        function Result(index, result) {
            this.index = index;
            this.result = result;
        }
        Result.prototype.toString = function () {
            return "{" + this.index + ": " + this.result + "}";
        };
        return Result;
    }());
    function get_result() {
        var norArr = [];
        var comArr = [];
        var index = 0;
        $.each($("#input-container .form-group"), function (_, track) {
            var option = $(track).find("select").val();
            var commentary = $(track).find("div label input").is(":checked");
            var result = commentary ? data[option].c : data[option].n;
            if (!commentary) {
                norArr.push(new Result(++index, result));
            }
            else {
                comArr.push(new Result(++index, result));
            }
            $(track).find("#result-container").html(get_label(result));
        });
        //console.log({norArr, comArr});
        var mkv = [];
        var mka = [];
        if (norArr.length >= 2) {
            mkv.push(norArr[0]);
            for (var i = 1; i < norArr.length; ++i) {
                mka.push(norArr[i]);
            }
        }
        else {
            norArr.forEach(function (nor) { return mkv.push(nor); });
        }
        comArr.forEach(function (com) { return mkv.push(com); });
        $("#mkv").html("");
        $("#mka").html("");
        mkv.forEach(function (item) { return $("#mkv").append(get_label(item.toString())); });
        mka.forEach(function (item) { return $("#mka").append(get_label(item.toString())); });
        $("#group-container-container").show();
        if (mkv.length > 0) {
            $(".mkv-container").show();
        }
        else {
            $(".mkv-container").hide();
        }
        if (mka.length > 0) {
            $(".mka-container").show();
        }
        else {
            $(".mka-container").hide();
        }
        //console.log({mkv, mka});
    }
    AudioTrackCount.get_result = get_result;
})(AudioTrackCount || (AudioTrackCount = {}));
