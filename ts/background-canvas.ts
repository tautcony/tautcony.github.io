(($) => {
    $(window).ready(() => {
        const $html = $("container");
        if (isCanvasSupported()) {
            const $canvas = $("<canvas id=\"canvas-background\" />").appendTo("body");
            $canvas.css({
                "position": "absolute",
                "top": 0,
                "left": 0,
                "z-index": 0,
                "margin-top": 0,
            });
            const canvas = $canvas[0] as HTMLCanvasElement;
            const resizeCanvas = () => {
                canvas.width = $html.width();
                canvas.height = $html.height();
            };
            resizeCanvas();
            $(window).resize(resizeCanvas);
            if ($html.width() > 1024) {
                const context = canvas.getContext("2d");
                const colors = [
                    [ 50,   3.4, 34.1],
                    [ 22,  18.1, 62.2],
                    [  0, 100  , 90.4],
                    [  8,  87.2, 69.4],
                    [ 39, 100  , 70.8],
                    [ 51, 100  , 75.1],
                    [ 62,  73.1, 73.7],
                    [ 95,  46.8, 69  ],
                    [172,  63.9, 85.9],
                    [192,  85.7, 86.3],
                    [209,  50.4, 73.1],
                    [249,  25.2, 69.6],
                ];

                $canvas.click((e) => {
                    const radius = Math.ceil(Math.random() * 20);
                    const color = Math.ceil(Math.random() * 11);
                    context.fillStyle = `hsl(${colors[color][0]},${colors[color][1]}%,${(colors[color][2] + 100) / 2}%)`;
                    let r = 0;
                    context.beginPath();

                    function drawFrame() {
                        context.arc(e.pageX, e.pageY, radius + r, 0, Math.PI * 2);
                        context.fill();
                        r += 2;
                        if (r < 10) {
                            setTimeout(drawFrame, 20);
                        }
                    }
                    drawFrame();
                });
            }
        }

        function isCanvasSupported() {
            const detectElement = document.createElement("canvas");
            return !!(detectElement.getContext && detectElement.getContext("2d"));
        }
    });
})(jQuery);
