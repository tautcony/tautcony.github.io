namespace AudioTrackCount {
    interface INode {
        name: string;
        n: string;
        c: string;
    }

    interface IData<T> {
        [key: string]: T;
    }

    let trackID: number = 0;
    const data: IData<INode> = {
        "": { name: "", n: "nil", c: "nil" },
        "PCM": { name: "PCM", n: "flac", c: "aac" },
        "TrueHD": { name: "True-HD", n: "flac", c: "aac" },
        "DTSHDMA": { name: "DTS-HD MA", n: "flac", c: "aac" },
        "DTS": { name: "DTS", n: "DTS", c: "DTS" },
        "AC3": { name: "AC-3", n: "AC-3", c: "AC-3" },
        "FLAC": { name: "flac", n: "flac", c: "flac" },
        "MP3": { name: "mp3", n: "mp3", c: "mp3" }
    };

    function get_option(id: number): string {
        const selectorID = `ui_track_${id}_select`;
        const optionID = `ui_checkbox_${id}_`;
        let option = `<div class="form-group form-group-label margin-left">` +
                      `    <label class="floating-label" for="${selectorID}">Type</label>` +
                      `    <select class="form-control form-control-inline" id="${selectorID}">`;
        for (const item in data) {
            if (data.hasOwnProperty(item)) {
                option += `       <option value="${item}">${data[item].name}</option>`;
            }
        }
        option +=
            `   </select>` +
            `   <div class="checkbox checkbox-inline checkbox-adv margin-left">` +
            `       <label for="${optionID}">` +
            `           <input class="access-hide" id="${optionID}" name="${optionID}" type="checkbox">` +
            `           Commentary` +
            `           <span class="checkbox-circle"></span>` +
            `           <span class="checkbox-circle-check"></span>` +
            `           <span class="checkbox-circle-icon icon">done</span>` +
            `       </label>` +
            `   </div>` +
            `<span id="result-container"></span>` +
            `</div>`;
        return option;
    }

    export function add_track(): void {
        $("#input-container").append(get_option(trackID++));
    }

    export function remove_track(): void {
        if ($("#input-container .form-group").length <= 1) {
            return;
        }
        $("#input-container .form-group:last-child").remove();
    }

    function get_label(value: string): string {
        return `<span class="label label-brand checkbox-inline">${value}</span>`;
    }

    class Result {
        public readonly index: number;
        public readonly result: string;
        constructor(index: number, result: string) {
            this.index = index;
            this.result = result;
        }

        public toString(): string {
            return `{${this.index}: ${this.result}}`;
        }
    }

    export function get_result(): void {
        const norArr: Result[] = [];
        const comArr: Result[] = [];
        let index: number = 0;
        $.each($("#input-container .form-group"), (_, track) => {
            const option: string = $(track).find("select").val() as string;
            const commentary = $(track).find("div label input").is(":checked");
            const result = commentary ? data[option].c : data[option].n;
            if (!commentary) {
                norArr.push(new Result(++index, result));
            } else {
                comArr.push(new Result(++index, result));
            }
            $(track).find("#result-container").html(get_label(result));
        });
        //console.log({norArr, comArr});
        const mkv: Result[] = [];
        const mka: Result[] = [];

        if (norArr.length >= 2) {
            mkv.push(norArr[0]);
            for (let i = 1; i < norArr.length; ++i) {
                mka.push(norArr[i]);
            }
        } else {
            norArr.forEach(nor => mkv.push(nor));
        }
        comArr.forEach(com => mkv.push(com));
        $("#mkv").html(""); $("#mka").html("");

        mkv.forEach(item => $("#mkv").append(get_label(item.toString())));
        mka.forEach(item => $("#mka").append(get_label(item.toString())));

        $("#group-container-container").show();

        if (mkv.length > 0) {
            $(".mkv-container").show();
        } else {
            $(".mkv-container").hide();
        }
        if (mka.length > 0) {
            $(".mka-container").show();
        } else {
            $(".mka-container").hide();
        }

        //console.log({mkv, mka});
    }
}
